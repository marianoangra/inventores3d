import { COLORS, getProduct } from "@/lib/products";
import { isValidCpf } from "./cpf";
import { isUf, shippingFor } from "./shipping";

export type PayMethod = "pix" | "cartao";
export const MAX_INSTALLMENTS = 3;
const MIN_INSTALLMENT = 5; // Asaas não aceita parcela abaixo de R$ 5

export type OrderStatus = "pendente" | "pago" | "enviado" | "cancelado" | "expirado" | "estornado" | "erro";
export const STATUS_LABEL: Record<OrderStatus, string> = {
  pendente: "Aguardando pagamento",
  pago: "Pago — produzir",
  enviado: "Enviado",
  cancelado: "Cancelado",
  expirado: "Pagamento venceu",
  estornado: "Estornado",
  erro: "Erro na cobrança",
};

export type OrderLine = { slug: string; name: string; color: string; colorLabel: string; note: string; qty: number; unit: number };

export type OrderInput = {
  items?: unknown;
  pay?: unknown;
  installments?: unknown;
  customer?: { name?: unknown; cpf?: unknown; email?: unknown; phone?: unknown };
  address?: { cep?: unknown; street?: unknown; number?: unknown; complement?: unknown; district?: unknown; city?: unknown; uf?: unknown };
  notes?: unknown;
};

export type OrderDraft = {
  lines: OrderLine[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  pay: PayMethod;
  installments: number;
  customer: { name: string; cpf: string; email: string; phone: string };
  address: { cep: string; street: string; number: string; complement: string | null; district: string | null; city: string; uf: string };
  notes: string | null;
};

const txt = (v: unknown, max: number) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ").slice(0, max) : "");
const cents = (v: number) => Math.round(v * 100);
const reais = (c: number) => c / 100;

/**
 * Valida o pedido e calcula tudo no servidor. Preço, desconto e frete vêm do catálogo e da config,
 * nunca do navegador. `ufFromCep` (consultada no ViaCEP pelo servidor) tem prioridade sobre a UF digitada.
 */
export function buildOrder(i: OrderInput, opts: { pixDiscount: number; freeShippingFrom: number; ufFromCep?: string | null }): OrderDraft | { error: string } {
  if (!Array.isArray(i.items) || !i.items.length) return { error: "Sua sacola está vazia." };
  if (i.items.length > 20) return { error: "Máximo de 20 itens diferentes por pedido." };

  const lines: OrderLine[] = [];
  for (const raw of i.items as Record<string, unknown>[]) {
    const p = getProduct(String(raw?.slug ?? ""));
    if (!p) return { error: "Um item da sacola não existe mais. Atualize a página." };
    if (p.quoteOnly) return { error: `"${p.name}" é feito sob encomenda: finalize esse pelo WhatsApp.` };
    const color = String(raw.color ?? "");
    if (!p.colors.includes(color) || !COLORS[color]) return { error: `Cor indisponível em "${p.name}".` };
    const qty = Number(raw.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > 50) return { error: `Quantidade inválida em "${p.name}".` };
    const note = txt(raw.note, 140);
    if (p.personalize && !note) return { error: `Falta a personalização de "${p.name}".` };
    lines.push({ slug: p.slug, name: p.name, color, colorLabel: COLORS[color].label, note, qty, unit: reais(cents(p.price + (COLORS[color].extra ?? 0))) });
  }
  if (lines.reduce((s, l) => s + l.qty, 0) > 100) return { error: "Pedido grande demais pro site: fale com a gente no WhatsApp." };

  const pay = i.pay === "pix" || i.pay === "cartao" ? i.pay : null;
  if (!pay) return { error: "Escolha Pix ou cartão." };

  const c = i.customer ?? {};
  const name = txt(c.name, 100);
  const cpf = String(c.cpf ?? "").replace(/\D/g, "");
  const email = txt(c.email, 120).toLowerCase();
  const phone = String(c.phone ?? "").replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
  if (name.length < 3 || !name.includes(" ")) return { error: "Informe nome e sobrenome." };
  if (!isValidCpf(cpf)) return { error: "CPF inválido." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { error: "E-mail inválido." };
  if (phone.length < 10 || phone.length > 11) return { error: "WhatsApp com DDD." };

  const a = i.address ?? {};
  const cep = String(a.cep ?? "").replace(/\D/g, "");
  const street = txt(a.street, 120);
  const number = txt(a.number, 20);
  const city = txt(a.city, 80).replace(/\s*\/\s*[A-Za-z]{2}$/, "");
  const typedUf = txt(a.uf, 2).toUpperCase();
  const uf = opts.ufFromCep && isUf(opts.ufFromCep) ? opts.ufFromCep : typedUf;
  if (cep.length !== 8) return { error: "CEP com 8 números." };
  if (!street || !number || !city) return { error: "Complete o endereço (rua, número e cidade)." };
  if (!isUf(uf)) return { error: "Não reconheci o estado do CEP. Confira o CEP." };

  const subC = lines.reduce((s, l) => s + cents(l.unit) * l.qty, 0);
  const discC = pay === "pix" ? Math.round(subC * opts.pixDiscount) : 0;
  const ship = shippingFor(reais(subC), uf, opts.freeShippingFrom);
  if (ship === null) return { error: "Não deu pra calcular o frete. Confira o CEP." };
  const totalC = subC - discC + cents(ship);

  const installments = pay === "pix" ? 1 : Number(i.installments ?? 1);
  if (!Number.isInteger(installments) || installments < 1 || installments > MAX_INSTALLMENTS) return { error: `Parcelamento de 1 a ${MAX_INSTALLMENTS}x.` };
  if (installments > 1 && totalC / installments < MIN_INSTALLMENT * 100) return { error: `Parcela mínima de R$ ${MIN_INSTALLMENT}.` };

  return {
    lines,
    subtotal: reais(subC),
    discount: reais(discC),
    shipping: ship,
    total: reais(totalC),
    pay,
    installments,
    customer: { name, cpf, email, phone },
    address: { cep, street, number, complement: txt(a.complement, 60) || null, district: txt(a.district, 60) || null, city, uf },
    notes: txt(i.notes, 300) || null,
  };
}

// Código público do pedido: sem 0/O/1/I/L pra não confundir quando ditado no WhatsApp.
const ALPHA = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export function orderCode(rand: (n: number) => Uint8Array = (n) => crypto.getRandomValues(new Uint8Array(n))): string {
  const bytes = rand(16);
  let out = "";
  for (const b of bytes) {
    if (b >= 248) continue; // 248 = 8 × 31: evita viés do módulo
    out += ALPHA[b % ALPHA.length];
    if (out.length === 8) break;
  }
  return out.length === 8 ? `I3D-${out}` : orderCode(rand);
}
export const isOrderCode = (s: string) => /^I3D-[A-HJ-KM-NP-Z2-9]{8}$/.test(s);

/** Evento do webhook do Asaas → novo status do pedido (null = não muda). */
export function nextStatus(current: OrderStatus, event: string): OrderStatus | null {
  switch (event) {
    case "PAYMENT_CONFIRMED":
    case "PAYMENT_RECEIVED":
      return ["pendente", "expirado", "cancelado", "erro"].includes(current) ? "pago" : null;
    case "PAYMENT_OVERDUE":
      return current === "pendente" ? "expirado" : null;
    case "PAYMENT_DELETED":
      return current === "pendente" ? "cancelado" : null;
    case "PAYMENT_REFUNDED":
    case "PAYMENT_CHARGEBACK_REQUESTED":
      return current === "estornado" ? null : "estornado";
    default:
      return null;
  }
}
