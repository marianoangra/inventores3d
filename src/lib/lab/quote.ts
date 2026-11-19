import { parseNum } from "./num";
import { normalizeWhatsapp } from "./phone";

export type QuoteKind = "orcamento" | "recibo";
export const KIND_LABEL: Record<QuoteKind, string> = { orcamento: "Orçamento", recibo: "Recibo" };

export type QuoteItem = { partId: string | null; description: string; qty: number; unitPrice: number };
export type Quote = {
  id: string;
  number: number;
  kind: QuoteKind;
  customerName: string;
  customerPhone: string | null;
  items: QuoteItem[];
  discount: number;
  shipping: number;
  notes: string | null;
  validDays: number;
  convertedAt: string | null;
  createdAt: string;
};

export const quoteTotals = (q: Pick<Quote, "items" | "discount" | "shipping">) => {
  const subtotal = Math.round(q.items.reduce((s, i) => s + i.qty * i.unitPrice, 0) * 100) / 100;
  const total = Math.max(0, Math.round((subtotal - q.discount + q.shipping) * 100) / 100);
  return { subtotal, total };
};

export const quoteCode = (q: Pick<Quote, "kind" | "number">) => `${q.kind === "orcamento" ? "ORC" : "REC"}-${String(q.number).padStart(4, "0")}`;

type RawItem = { partId?: unknown; description?: unknown; qty?: unknown; unitPrice?: unknown };
type QuoteInput = { kind: string; customerName: string; customerPhone: string; items: RawItem[]; discount: string; shipping: string; notes: string; validDays: string };
export type QuoteInsert = { kind: QuoteKind; customer_name: string; customer_phone: string | null; items: QuoteItem[]; discount: number; shipping: number; notes: string | null; valid_days: number };

export function buildQuote(i: QuoteInput): QuoteInsert | { error: string } {
  if (i.kind !== "orcamento" && i.kind !== "recibo") return { error: "Escolha orçamento ou recibo." };
  const customer_name = i.customerName.trim().slice(0, 80);
  if (!customer_name) return { error: "Nome do cliente." };
  const phone = normalizeWhatsapp(i.customerPhone);
  if (phone === "invalid") return { error: "WhatsApp do cliente inválido (DDD + número)." };
  const items: QuoteItem[] = [];
  for (const r of i.items) {
    const description = String(r.description ?? "").trim().slice(0, 80);
    const qty = parseNum(String(r.qty ?? ""));
    const unitPrice = parseNum(String(r.unitPrice ?? ""));
    if (!description && !unitPrice) continue; // linha vazia
    if (!description) return { error: "Toda linha precisa de descrição." };
    if (qty === null || !Number.isInteger(qty) || qty < 1) return { error: `Quantidade inválida em "${description}".` };
    if (unitPrice === null || unitPrice < 0) return { error: `Preço inválido em "${description}".` };
    const partId = typeof r.partId === "string" && /^[0-9a-f-]{36}$/i.test(r.partId) ? r.partId : null;
    items.push({ partId, description, qty, unitPrice });
  }
  if (!items.length) return { error: "Adicione pelo menos um item." };
  if (items.length > 30) return { error: "Máximo de 30 itens." };
  const discount = i.discount.trim() ? parseNum(i.discount) : 0;
  const shipping = i.shipping.trim() ? parseNum(i.shipping) : 0;
  if (discount === null || discount < 0 || shipping === null || shipping < 0) return { error: "Desconto e frete: números positivos." };
  const validDays = i.validDays.trim() ? parseNum(i.validDays) : 7;
  if (validDays === null || !Number.isInteger(validDays) || validDays < 1 || validDays > 90) return { error: "Validade: de 1 a 90 dias." };
  const notes = i.notes.trim().slice(0, 500) || null;
  return { kind: i.kind, customer_name, customer_phone: phone, items, discount, shipping, notes, valid_days: validDays };
}

const money = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Texto pronto pro WhatsApp. */
export function quoteMessage(q: Quote, business: string): string {
  const { subtotal, total } = quoteTotals(q);
  const first = q.customerName.split(" ")[0];
  const lines = [
    q.kind === "orcamento" ? `Oi, ${first}! Segue o orçamento ${quoteCode(q)} da ${business}:` : `Oi, ${first}! Segue o recibo ${quoteCode(q)} da ${business}:`,
    "",
    ...q.items.map((i) => `• ${i.qty}× ${i.description} — ${money(i.qty * i.unitPrice)}`),
    "",
  ];
  if (q.discount || q.shipping) lines.push(`Subtotal: ${money(subtotal)}`);
  if (q.discount) lines.push(`Desconto: −${money(q.discount)}`);
  if (q.shipping) lines.push(`Frete: ${money(q.shipping)}`);
  lines.push(`*Total: ${money(total)}*`);
  if (q.kind === "orcamento") lines.push("", `Válido por ${q.validDays} dias.`);
  else lines.push("", "Pagamento recebido. Obrigado pela compra!");
  if (q.notes) lines.push("", q.notes);
  return lines.join("\n");
}

export const waLink = (phone: string | null, text: string) => `https://wa.me/${phone ?? ""}?text=${encodeURIComponent(text)}`;
