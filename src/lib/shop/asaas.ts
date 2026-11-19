import "server-only";

// Asaas API v3 — mesmo modelo do site do Gasomax: cliente + cobrança, o comprador paga na fatura do Asaas
// e o webhook confirma. Docs: https://docs.asaas.com/reference

export type AsaasEnv = "sandbox" | "producao";

/** ASAAS_ENV precisa ser exatamente "sandbox" ou "producao" — qualquer outra coisa desliga o pagamento no site. */
export function asaasEnv(): AsaasEnv | null {
  const e = process.env.ASAAS_ENV;
  return e === "sandbox" || e === "producao" ? e : null;
}

/** Pagamento no site só liga com as 3 variáveis: sem webhook não daria pra confirmar o pagamento. */
export const asaasConfigured = () => Boolean(asaasEnv() && process.env.ASAAS_API_KEY && process.env.ASAAS_WEBHOOK_TOKEN);

const base = () => (asaasEnv() === "producao" ? "https://api.asaas.com/v3" : "https://api-sandbox.asaas.com/v3");

export class AsaasError extends Error {}

export async function asaas<T = Record<string, unknown>>(path: string, body?: unknown, method = body ? "POST" : "GET"): Promise<T> {
  if (!asaasConfigured()) throw new AsaasError("Pagamento online não configurado.");
  const r = await fetch(base() + path, {
    method,
    headers: { "content-type": "application/json", access_token: process.env.ASAAS_API_KEY!, "user-agent": "inventores3d-loja" },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15000),
    cache: "no-store",
  });
  const j = (await r.json().catch(() => ({}))) as { errors?: { description?: string }[] };
  if (!r.ok) throw new AsaasError(j.errors?.[0]?.description || `Asaas respondeu ${r.status}`);
  return j as T;
}

type Customer = { id: string; deleted?: boolean };

/** Reaproveita o cliente pelo CPF (evita duplicar cadastro a cada pedido). */
export async function findOrCreateCustomer(c: { name: string; cpf: string; email: string; phone: string; cep: string; number: string; ref: string }): Promise<string> {
  const found = await asaas<{ data?: Customer[] }>(`/customers?cpfCnpj=${c.cpf}&limit=1`);
  const alive = found.data?.find((x) => !x.deleted);
  if (alive) return alive.id;
  const created = await asaas<Customer>("/customers", {
    name: c.name,
    cpfCnpj: c.cpf,
    email: c.email,
    mobilePhone: c.phone,
    postalCode: c.cep,
    addressNumber: c.number,
    externalReference: c.ref,
  });
  return created.id;
}

export type AsaasPayment = { id: string; invoiceUrl: string; status: string };

export async function createPayment(p: {
  customer: string;
  method: "pix" | "cartao";
  total: number;
  installments: number;
  description: string;
  ref: string;
  successUrl?: string;
}): Promise<AsaasPayment> {
  const due = new Date(Date.now() - 3 * 3600e3 + 2 * 86400e3).toISOString().slice(0, 10); // 2 dias, horário de Brasília
  const installment = p.method === "cartao" && p.installments > 1 ? { installmentCount: p.installments, totalValue: p.total } : { value: p.total };
  return asaas<AsaasPayment>("/payments", {
    customer: p.customer,
    billingType: p.method === "pix" ? "PIX" : "CREDIT_CARD",
    dueDate: due,
    description: p.description.slice(0, 500),
    externalReference: p.ref,
    ...installment,
    // volta pro site depois de pagar — exige o domínio cadastrado em Minha Conta no Asaas (ASAAS_REDIRECT=1)
    ...(p.successUrl ? { callback: { successUrl: p.successUrl, autoRedirect: true } } : {}),
  });
}
