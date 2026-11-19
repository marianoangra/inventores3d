import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MlOrder } from "./orders";

vi.mock("server-only", () => ({}));

// banco em memória com o pedaço do supabase-js que o sincronizador usa
type Row = Record<string, unknown>;
const tables: Record<string, Row[]> = {};
const KEY: Record<string, string> = { ml_orders: "ml_order_id", ml_tokens: "id" };
function from(name: string) {
  tables[name] ??= [];
  const rows = tables[name];
  const filters: ((r: Row) => boolean)[] = [];
  let op: "select" | "insert" | "update" | "delete" | "upsert" = "select";
  let payload: Row = {};
  let returning = false;
  const run = (): { data: unknown; error: { code?: string; message: string } | null } => {
    const hit = rows.filter((r) => filters.every((f) => f(r)));
    if (op === "insert") {
      const k = KEY[name];
      if (k && rows.some((r) => r[k] === payload[k])) return { data: null, error: { code: "23505", message: "duplicate" } };
      const row = { id: crypto.randomUUID(), ...(name === "production_jobs" ? { status: "fila" } : {}), ...payload }; // default do banco
      rows.push(row);
      return { data: row, error: null };
    }
    if (op === "upsert") {
      const k = KEY[name];
      const cur = rows.find((r) => r[k] === payload[k]);
      if (cur) Object.assign(cur, payload);
      else rows.push({ ...payload });
      return { data: null, error: null };
    }
    if (op === "update") hit.forEach((r) => Object.assign(r, payload));
    if (op === "delete") hit.forEach((r) => rows.splice(rows.indexOf(r), 1));
    return { data: op === "select" || returning ? hit : null, error: null };
  };
  const q = {
    select: () => ((returning = true), q),
    insert: (p: Row) => ((op = "insert"), (payload = p), q),
    upsert: (p: Row) => ((op = "upsert"), (payload = p), q),
    update: (p: Row) => ((op = "update"), (payload = p), q),
    delete: () => ((op = "delete"), q),
    eq: (k: string, v: unknown) => (filters.push((r) => r[k] === v), q),
    is: (k: string, v: unknown) => (filters.push((r) => (r[k] ?? null) === v), q),
    in: (k: string, v: unknown[]) => (filters.push((r) => v.includes(r[k])), q),
    order: () => q,
    limit: () => q,
    single: async () => run(),
    maybeSingle: async () => {
      const r = run();
      return { data: Array.isArray(r.data) ? (r.data[0] ?? null) : r.data, error: r.error };
    },
    then: (res: (v: unknown) => void) => res(run()),
  };
  return q;
}
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ from, auth: { admin: { listUsers: async () => ({ data: { users: [] } }) } } }) }));

let order: MlOrder;
vi.mock("./client", () => ({ mlFetch: async () => structuredClone(order) }));

const OWNER = "11111111-1111-1111-1111-111111111111";
beforeEach(() => {
  for (const k of Object.keys(tables)) delete tables[k];
  tables.ml_tokens = [{ id: 1, ml_user_id: 99, owner_user_id: OWNER }];
  tables.parts = [{ id: "p1", user_id: OWNER, name: "Suporte de Mesa para Headset", grams: 90, print_minutes: 300, labor_minutes: 0, packaging: 0, printer_id: null, filament_id: "f1", margin_pct: 80, unit_cost: 12, prices: {} }];
  tables.ml_listings = [{ slug: "suporte-headset", ml_item_id: "MLB111" }];
  order = {
    id: 2000000000001,
    status: "paid",
    date_created: "2026-11-20T10:00:00.000-03:00",
    buyer: { nickname: "FULANO" },
    order_items: [{ item: { id: "MLB111", title: "Suporte Para Headset Gamer" }, quantity: 2, unit_price: 59.9, sale_fee: 8.39 }],
  };
});

describe("syncMlOrder", () => {
  it("venda paga entra em Vendas (canal ML, com tarifa) e na fila, na conta do dono", async () => {
    const { syncMlOrder } = await import("./order-sync");
    const r = await syncMlOrder(order.id);
    expect(r.result).toBe("lancado");
    expect(tables.sales).toHaveLength(1);
    expect(tables.sales[0]).toMatchObject({ user_id: OWNER, part_id: "p1", channel: "ml", qty: 2, unit_price: 59.9, unit_fee: 8.39, unit_cost: 12, sold_on: "2026-11-20" });
    expect(tables.production_jobs[0]).toMatchObject({ user_id: OWNER, sale_id: tables.sales[0].id, part_id: "p1", filament_id: "f1", qty: 2, print_minutes: 600, grams: 180, notes: "ML #2000000000001 — FULANO" });
    expect(tables.ml_orders[0]).toMatchObject({ processed_at: expect.any(String), job_ids: [tables.production_jobs[0].id] });
  });

  it("notificação repetida não duplica", async () => {
    const { syncMlOrder } = await import("./order-sync");
    await syncMlOrder(order.id);
    const again = await syncMlOrder(order.id);
    expect(again.result).toBe("ja_lancado");
    expect(tables.sales).toHaveLength(1);
    expect(tables.production_jobs).toHaveLength(1);
  });

  it("não pago ainda: não lança; quando pagar, lança", async () => {
    const { syncMlOrder } = await import("./order-sync");
    order.status = "payment_in_process";
    expect((await syncMlOrder(order.id)).result).toBe("ignorado");
    expect(tables.sales ?? []).toHaveLength(0);
    order.status = "paid";
    expect((await syncMlOrder(order.id)).result).toBe("lancado");
  });

  it("cancelada: tira da fila e de Vendas o que não começou", async () => {
    const { syncMlOrder } = await import("./order-sync");
    await syncMlOrder(order.id);
    order.status = "cancelled";
    const r = await syncMlOrder(order.id);
    expect(r.result).toBe("cancelado");
    expect(tables.production_jobs).toHaveLength(0);
    expect(tables.sales).toHaveLength(0);
  });

  it("cancelada depois de começar a imprimir: a ordem fica (vira estoque)", async () => {
    const { syncMlOrder } = await import("./order-sync");
    await syncMlOrder(order.id);
    tables.production_jobs[0].status = "imprimindo";
    order.status = "cancelled";
    const r = await syncMlOrder(order.id);
    expect(r.detail).toContain("1 ordem(ns) já começada(s)");
    expect(tables.production_jobs).toHaveLength(1);
  });
});
