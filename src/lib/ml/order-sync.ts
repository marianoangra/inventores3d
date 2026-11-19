import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { toPart } from "@/lib/lab/parts-data";
import { getProduct } from "@/lib/products";
import { mlFetch } from "./client";
import { orderEntries, soldOnBR, type MlOrder, type PartLite } from "./orders";

export type SyncResult = { result: "lancado" | "ja_lancado" | "ignorado" | "cancelado"; detail: string };

type Db = ReturnType<typeof createAdminClient>;

/** Conta do Lab que recebe as vendas: quem conectou o ML; senão o e-mail de STORE_OWNER_EMAIL. */
async function ownerUserId(db: Db): Promise<string> {
  const { data } = await db.from("ml_tokens").select("owner_user_id").eq("id", 1).maybeSingle();
  if (data?.owner_user_id) return data.owner_user_id as string;
  const email = (process.env.STORE_OWNER_EMAIL || process.env.ML_ADMIN_EMAIL || "").split(",")[0].trim().toLowerCase();
  if (email) {
    const { data: list } = await db.auth.admin.listUsers({ perPage: 1000 });
    const u = list?.users.find((x) => x.email?.toLowerCase() === email);
    if (u) return u.id;
  }
  throw new Error("Dono da loja não encontrado (conecte o ML pelo Lab ou defina STORE_OWNER_EMAIL).");
}

const now = () => new Date().toISOString();

/** Busca o pedido no ML e, se pago, lança venda + ordem de produção (uma vez só). Cancelado tira da fila o que ainda não começou. */
export async function syncMlOrder(orderId: number): Promise<SyncResult> {
  const db = createAdminClient();
  const o = await mlFetch<MlOrder>(`/orders/${orderId}`);
  const total = o.order_items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  const { data: existing } = await db.from("ml_orders").select("*").eq("ml_order_id", o.id).maybeSingle();

  if (o.status === "cancelled" || o.status === "invalid") {
    if (existing?.processed_at && !existing.cancelled_at) {
      const jobIds = (existing.job_ids as string[]) ?? [];
      const { data: removed } = jobIds.length ? await db.from("production_jobs").delete().in("id", jobIds).eq("status", "fila").select("id") : { data: [] };
      const saleIds = (existing.sale_ids as string[]) ?? [];
      if (saleIds.length) await db.from("sales").delete().in("id", saleIds);
      await db.from("ml_orders").update({ status: o.status, cancelled_at: now(), updated_at: now() }).eq("ml_order_id", o.id);
      const kept = jobIds.length - (removed?.length ?? 0);
      return { result: "cancelado", detail: `Venda cancelada no ML: saiu de Vendas${kept ? `; ${kept} ordem(ns) já começada(s) ficaram na Produção` : " e da fila"}.` };
    }
    await db.from("ml_orders").upsert({ ml_order_id: o.id, status: o.status, total, buyer: o.buyer?.nickname ?? null, updated_at: now() });
    return { result: "ignorado", detail: `Pedido ${o.status}.` };
  }

  if (o.status !== "paid") {
    if (!existing?.processed_at) await db.from("ml_orders").upsert({ ml_order_id: o.id, status: o.status, total, buyer: o.buyer?.nickname ?? null, updated_at: now() });
    return { result: "ignorado", detail: `Ainda não pago (${o.status}).` };
  }

  // trava: só um processo lança o pedido (notificações repetidas chegam juntas)
  const base = { ml_order_id: o.id, status: o.status, total, buyer: o.buyer?.nickname ?? null, processed_at: now(), updated_at: now() };
  const ins = await db.from("ml_orders").insert(base);
  if (ins.error) {
    if (ins.error.code !== "23505") throw new Error(`ml_orders: ${ins.error.message}`);
    const { data: got } = await db.from("ml_orders").update(base).eq("ml_order_id", o.id).is("processed_at", null).select("ml_order_id");
    if (!got?.length) return { result: "ja_lancado", detail: "Já estava na fila." };
  }

  const saleIds: string[] = [];
  const jobIds: string[] = [];
  try {
    const owner = await ownerUserId(db);
    const [{ data: partRows }, { data: links }] = await Promise.all([
      db.from("parts").select("*").eq("user_id", owner),
      db.from("ml_listings").select("slug, ml_item_id").in("ml_item_id", o.order_items.map((i) => i.item.id)),
    ]);
    const parts: PartLite[] = (partRows ?? []).map(toPart).map((p) => ({ id: p.id, name: p.name, unitCost: p.unitCost, printMinutes: p.printMinutes, grams: p.grams, filamentId: p.filamentId }));
    const slugOf = new Map((links ?? []).map((l) => [String(l.ml_item_id), String(l.slug)]));
    const entries = orderEntries(o, { listingName: (id) => getProduct(slugOf.get(id) ?? "")?.name, parts });
    const soldOn = soldOnBR(o.date_closed ?? o.date_created);

    for (const e of entries) {
      const { data: sale, error } = await db
        .from("sales")
        .insert({
          user_id: owner,
          part_id: e.part?.id ?? null,
          description: e.description,
          qty: e.qty,
          unit_price: e.unitPrice,
          unit_cost: e.part?.unitCost ?? 0,
          print_minutes: e.part?.printMinutes ?? 0,
          channel: "ml",
          sold_on: soldOn,
          unit_fee: e.unitFee,
        })
        .select("id")
        .single();
      if (error || !sale) throw new Error(`venda: ${error?.message}`);
      saleIds.push(sale.id);
      const { data: job, error: e2 } = await db
        .from("production_jobs")
        .insert({
          user_id: owner,
          sale_id: sale.id,
          part_id: e.part?.id ?? null,
          filament_id: e.part?.filamentId ?? null,
          description: e.description,
          qty: e.qty,
          print_minutes: e.part ? e.part.printMinutes * e.qty : 0,
          grams: e.part ? Math.round(e.part.grams * e.qty * 10) / 10 : 0,
          notes: e.notes,
        })
        .select("id")
        .single();
      if (e2 || !job) throw new Error(`ordem: ${e2?.message}`);
      jobIds.push(job.id);
    }
    await db.from("ml_orders").update({ sale_ids: saleIds, job_ids: jobIds, updated_at: now() }).eq("ml_order_id", o.id);
    const miss = entries.filter((e) => !e.part).length;
    return { result: "lancado", detail: `${entries.length} item(ns) na fila${miss ? ` (${miss} sem peça cadastrada: entrou sem tempo/custo)` : ""}.` };
  } catch (err) {
    // desfaz pra próxima notificação tentar de novo
    if (jobIds.length) await db.from("production_jobs").delete().in("id", jobIds);
    if (saleIds.length) await db.from("sales").delete().in("id", saleIds);
    await db.from("ml_orders").update({ processed_at: null, updated_at: now() }).eq("ml_order_id", o.id);
    throw err;
  }
}

/** Puxa as vendas pagas dos últimos `days` dias (complementa as notificações). */
export async function importRecentMlOrders(days = 14): Promise<SyncResult[]> {
  const db = createAdminClient();
  const { data: tok } = await db.from("ml_tokens").select("ml_user_id").eq("id", 1).maybeSingle();
  if (!tok) throw new Error("Mercado Livre não conectado.");
  const from = new Date(Date.now() - days * 86400e3).toISOString();
  const res = await mlFetch<{ results: { id: number }[] }>(
    `/orders/search?seller=${tok.ml_user_id}&order.status=paid&order.date_created.from=${encodeURIComponent(from)}&sort=date_desc&limit=50`,
  );
  const out: SyncResult[] = [];
  for (const r of res.results ?? []) out.push(await syncMlOrder(r.id));
  return out;
}

export async function recentMlOrders(limit = 10) {
  const { data } = await createAdminClient().from("ml_orders").select("ml_order_id, status, buyer, total, processed_at, cancelled_at, created_at").order("created_at", { ascending: false }).limit(limit);
  return data ?? [];
}
