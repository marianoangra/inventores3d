// Rota de pedido + webhook com Asaas e banco simulados: confere o que é enviado pro Asaas
// e como o pedido muda de status. Nada sai pra internet.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));

// banco em memória que imita o pedaço do supabase-js usado pelas rotas
type Row = Record<string, unknown>;
const db: { rows: Row[] } = { rows: [] };
function table() {
  let filters: [string, string, unknown][] = [];
  let op: "select" | "insert" | "update" = "select";
  let payload: Row = {};
  let head = false;
  const match = (r: Row) =>
    filters.every(([k, how, v]) => (how === "eq" ? r[k] === v : how === "gte" ? String(r[k]) >= String(v) : how === "is" ? (r[k] ?? null) === v : true));
  const run = () => {
    if (op === "insert") {
      const row = { id: crypto.randomUUID(), status: "pendente", created_at: new Date().toISOString(), ...payload };
      db.rows.push(row);
      return { data: row, error: null };
    }
    const hit = db.rows.filter(match);
    if (op === "update") hit.forEach((r) => Object.assign(r, payload));
    return { data: hit, error: null, count: hit.length };
  };
  const q = {
    select: (_c?: string, o?: { head?: boolean }) => ((head = !!o?.head), q),
    insert: (p: Row) => ((op = "insert"), (payload = p), q),
    update: (p: Row) => ((op = "update"), (payload = p), q),
    eq: (k: string, v: unknown) => (filters.push([k, "eq", v]), q),
    gte: (k: string, v: unknown) => (filters.push([k, "gte", v]), q),
    is: (k: string, v: unknown) => (filters.push([k, "is", v]), q),
    single: async () => run(),
    maybeSingle: async () => {
      const r = run();
      return { data: Array.isArray(r.data) ? (r.data[0] ?? null) : r.data, error: null };
    },
    then: (res: (v: unknown) => void) => {
      const r = run();
      res(head ? { count: r.count, error: null } : r);
    },
  };
  filters = [];
  return q;
}
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ from: () => table() }) }));

// Asaas + ViaCEP simulados
const calls: { url: string; body: Row | null }[] = [];
let failPayment = false;
beforeEach(() => {
  db.rows = [];
  calls.length = 0;
  failPayment = false;
  process.env.ASAAS_ENV = "sandbox";
  process.env.ASAAS_API_KEY = "chave-de-teste";
  process.env.ASAAS_WEBHOOK_TOKEN = "token-de-teste-bem-comprido";
  vi.stubGlobal("fetch", async (url: string, init?: RequestInit) => {
    const body = init?.body ? JSON.parse(String(init.body)) : null;
    calls.push({ url, body });
    const json = (j: unknown, status = 200) => new Response(JSON.stringify(j), { status });
    if (url.includes("viacep")) return json({ uf: "RJ" });
    if (url.includes("/customers?")) return json({ data: [] });
    if (url.endsWith("/customers")) return json({ id: "cus_1" });
    if (url.endsWith("/payments")) return failPayment ? json({ errors: [{ description: "Cliente sem CPF" }] }, 400) : json({ id: "pay_1", invoiceUrl: "https://sandbox.asaas.com/i/pay_1", status: "PENDING" });
    return json({}, 404);
  });
});
afterEach(() => vi.unstubAllGlobals());

const order = (o: Row = {}) => ({
  items: [{ slug: "snap-pong", color: "candy", note: "", qty: 2, unit: 0.01 }],
  pay: "pix",
  customer: { name: "Ana Souza", cpf: "529.982.247-25", email: "ana@exemplo.com", phone: "(21) 98765-4321" },
  address: { cep: "20040-020", street: "Rua X", number: "10", city: "Rio de Janeiro/SP", uf: "SP" },
  ...o,
});
const post = (body: unknown) => new NextRequest("https://inventores3d.com.br/api/pedido", { method: "POST", body: JSON.stringify(body), headers: { "x-forwarded-for": "1.2.3.4" } });

describe("POST /api/pedido", () => {
  it("cria cliente e cobrança Pix com valor do servidor e frete pela UF do CEP", async () => {
    const { POST } = await import("./route");
    const r = await POST(post(order()));
    const j = await r.json();
    expect(r.status).toBe(200);
    expect(j.url).toBe("https://sandbox.asaas.com/i/pay_1");
    expect(j.code).toMatch(/^I3D-/);
    const pay = calls.find((c) => c.url.endsWith("/payments"))!;
    // 2 × 89,90 = 179,80; −5% Pix = 170,81; + frete RJ (19,90, UF do ViaCEP e não a digitada) = 190,71
    expect(pay.body).toMatchObject({ customer: "cus_1", billingType: "PIX", value: 190.71 });
    expect(pay.url.startsWith("https://api-sandbox.asaas.com/v3")).toBe(true);
    const row = db.rows[0];
    expect(row).toMatchObject({ status: "pendente", uf: "RJ", total: 190.71, asaas_payment: "pay_1", env: "sandbox" });
    expect(pay.body?.externalReference).toBe(row.id);
  });

  it("cartão parcelado manda installmentCount + totalValue", async () => {
    const { POST } = await import("./route");
    await POST(post(order({ pay: "cartao", installments: 3 })));
    const pay = calls.find((c) => c.url.endsWith("/payments"))!;
    expect(pay.body).toMatchObject({ billingType: "CREDIT_CARD", installmentCount: 3, totalValue: 199.7 });
    expect(pay.body).not.toHaveProperty("value");
  });

  it("erro do Asaas marca o pedido como erro e não quebra", async () => {
    failPayment = true;
    const { POST } = await import("./route");
    const r = await POST(post(order()));
    expect(r.status).toBe(502);
    expect(db.rows[0]).toMatchObject({ status: "erro", error: "Cliente sem CPF" });
  });

  it("sem Asaas configurado devolve 503 (checkout cai pro WhatsApp)", async () => {
    delete process.env.ASAAS_WEBHOOK_TOKEN;
    const { POST } = await import("./route");
    expect((await POST(post(order()))).status).toBe(503);
    expect(calls).toHaveLength(0);
  });

  it("limita pedidos seguidos do mesmo IP", async () => {
    const { POST } = await import("./route");
    for (let k = 0; k < 6; k++) db.rows.push({ id: String(k), ip: "1.2.3.4", created_at: new Date().toISOString(), cpf: "x", status: "pago" });
    expect((await POST(post(order()))).status).toBe(429);
  });
});

describe("POST /api/webhook-asaas", () => {
  const hook = (event: string, ref: string, token = "token-de-teste-bem-comprido") =>
    new NextRequest("https://inventores3d.com.br/api/webhook-asaas", { method: "POST", body: JSON.stringify({ event, payment: { externalReference: ref } }), headers: { "asaas-access-token": token } });

  it("token errado = 401", async () => {
    const { POST } = await import("../webhook-asaas/route");
    expect((await POST(hook("PAYMENT_RECEIVED", crypto.randomUUID(), "errado"))).status).toBe(401);
  });

  it("pagamento recebido → pago (uma vez só) e evento de outro sistema é ignorado com 200", async () => {
    const { POST } = await import("../webhook-asaas/route");
    const id = crypto.randomUUID();
    db.rows.push({ id, status: "pendente" });
    expect((await POST(hook("PAYMENT_RECEIVED", id))).status).toBe(200);
    expect(db.rows[0].status).toBe("pago");
    const paidAt = db.rows[0].paid_at;
    expect(paidAt).toBeTruthy();
    await POST(hook("PAYMENT_CONFIRMED", id));
    expect(db.rows[0].paid_at).toBe(paidAt);
    expect((await POST(hook("PAYMENT_RECEIVED", "57"))).status).toBe(200); // ref do Gasomax
    expect((await POST(hook("PAYMENT_RECEIVED", crypto.randomUUID()))).status).toBe(200); // uuid desconhecido
  });

  it("vencido só expira se ainda estava pendente", async () => {
    const { POST } = await import("../webhook-asaas/route");
    const a = crypto.randomUUID();
    const b = crypto.randomUUID();
    db.rows.push({ id: a, status: "pendente" }, { id: b, status: "pago" });
    await POST(hook("PAYMENT_OVERDUE", a));
    await POST(hook("PAYMENT_OVERDUE", b));
    expect(db.rows.map((r) => r.status)).toEqual(["expirado", "pago"]);
  });
});
