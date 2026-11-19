import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { asaasConfigured, asaasEnv, createPayment, findOrCreateCustomer } from "@/lib/shop/asaas";
import { buildOrder, orderCode, type OrderInput } from "@/lib/shop/order";
import { isUf } from "@/lib/shop/shipping";
import { STORE } from "@/lib/config";

export const dynamic = "force-dynamic";

const MAX_PER_IP_HOUR = 6;
const MAX_PENDING_PER_CPF = 3;

const fail = (erro: string, status = 400) => NextResponse.json({ erro }, { status });

/** UF pelo CEP no ViaCEP (o frete depende dela; não confiamos na UF digitada). */
async function ufOfCep(cep: string): Promise<string | null> {
  try {
    const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal: AbortSignal.timeout(3500), cache: "no-store" });
    const j = (await r.json()) as { uf?: string; erro?: unknown };
    return !j.erro && j.uf && isUf(j.uf) ? j.uf : null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const env = asaasEnv();
  if (!asaasConfigured() || !env) return fail("Pagamento online indisponível. Finalize pelo WhatsApp.", 503);
  if (Number(req.headers.get("content-length") ?? 0) > 20_000) return fail("Pedido grande demais.");

  let input: OrderInput;
  try {
    input = (await req.json()) as OrderInput;
  } catch {
    return fail("Pedido inválido.");
  }
  const cep = String(input.address?.cep ?? "").replace(/\D/g, "");
  const order = buildOrder(input, { pixDiscount: STORE.pixDiscount, freeShippingFrom: STORE.freeShippingFrom, ufFromCep: cep.length === 8 ? await ufOfCep(cep) : null });
  if ("error" in order) return fail(order.error);

  const db = createAdminClient();
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || req.headers.get("x-real-ip") || null;
  const hourAgo = new Date(Date.now() - 3600e3).toISOString();
  const [byIp, byCpf] = await Promise.all([
    ip ? db.from("store_orders").select("id", { count: "exact", head: true }).eq("ip", ip).gte("created_at", hourAgo) : Promise.resolve({ count: 0 }),
    db.from("store_orders").select("id", { count: "exact", head: true }).eq("cpf", order.customer.cpf).eq("status", "pendente"),
  ]);
  if ((byIp.count ?? 0) >= MAX_PER_IP_HOUR) return fail("Muitos pedidos seguidos. Espere um pouco ou fale com a gente no WhatsApp.", 429);
  if ((byCpf.count ?? 0) >= MAX_PENDING_PER_CPF) return fail("Você já tem pedidos aguardando pagamento. Pague um deles ou fale com a gente no WhatsApp.", 429);

  // grava antes de cobrar: se o Asaas falhar, o pedido fica marcado como erro (nada se perde)
  let row: { id: string; code: string } | null = null;
  for (let attempt = 0; attempt < 3 && !row; attempt++) {
    const { data, error } = await db
      .from("store_orders")
      .insert({
        code: orderCode(),
        env,
        items: order.lines,
        subtotal: order.subtotal,
        discount: order.discount,
        shipping: order.shipping,
        total: order.total,
        pay_method: order.pay,
        installments: order.installments,
        customer_name: order.customer.name,
        cpf: order.customer.cpf,
        email: order.customer.email,
        whatsapp: order.customer.phone,
        cep: order.address.cep,
        street: order.address.street,
        number: order.address.number,
        complement: order.address.complement,
        district: order.address.district,
        city: order.address.city,
        uf: order.address.uf,
        notes: order.notes,
        ip,
      })
      .select("id, code")
      .single();
    if (data) row = data;
    else if (error?.code !== "23505") break; // 23505 = código repetido, tenta outro
  }
  if (!row) return fail("Não deu pra registrar o pedido. Tente de novo.", 500);

  try {
    const customer = await findOrCreateCustomer({ ...order.customer, cep: order.address.cep, number: order.address.number, ref: row.code });
    const n = order.lines.reduce((s, l) => s + l.qty, 0);
    const payment = await createPayment({
      customer,
      method: order.pay,
      total: order.total,
      installments: order.installments,
      description: `Pedido ${row.code} — ${STORE.name}: ${n} ${n === 1 ? "peça" : "peças"} impressas em 3D (${order.lines.map((l) => `${l.qty}x ${l.name}`).join(", ")})`,
      ref: row.id,
      successUrl: process.env.ASAAS_REDIRECT === "1" ? `${STORE.url}/pedido/${row.code}` : undefined,
    });
    await db.from("store_orders").update({ asaas_customer: customer, asaas_payment: payment.id, invoice_url: payment.invoiceUrl, updated_at: new Date().toISOString() }).eq("id", row.id);
    return NextResponse.json({ ok: true, code: row.code, url: payment.invoiceUrl });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[pedido] Asaas falhou", row.code, msg);
    await db.from("store_orders").update({ status: "erro", error: msg.slice(0, 300), updated_at: new Date().toISOString() }).eq("id", row.id);
    return fail("O sistema de pagamento não respondeu. Tente de novo em instantes ou finalize pelo WhatsApp.", 502);
  }
}
