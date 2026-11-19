import { CHANNELS, type Channel, type FeeRule } from "./fees";
import { parseNum } from "./num";

export const EXPENSE_CATEGORIES = {
  filamento: "Filamento",
  manutencao: "Peças e manutenção",
  embalagem: "Embalagem",
  energia: "Energia",
  ferramentas: "Ferramentas",
  outros: "Outros",
} as const;
export type ExpenseCategory = keyof typeof EXPENSE_CATEGORIES;

type SaleInput = { partId?: string | null; description?: string; qty: string; unitPrice: string; unitCost?: string; channel: string; soldOn: string };
type PartSnap = { id: string; name: string; unitCost: number; printMinutes: number } | null;

const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s + "T12:00:00Z"));

export type SaleInsert = { part_id: string | null; description: string; qty: number; unit_price: number; unit_cost: number; print_minutes: number; channel: Channel; sold_on: string; unit_fee?: number };
export type ExpenseInsert = { description: string; category: ExpenseCategory; amount: number; spent_on: string };

/** Taxa por unidade no preço dado, arredondada em centavos. */
export function unitFee(rule: FeeRule, price: number): number {
  const { pct, fixed } = rule.at(price);
  return Math.round((pct * price + fixed) * 100) / 100;
}

export function buildSale(i: SaleInput, part: PartSnap, fees?: Record<Channel, FeeRule>): SaleInsert | { error: string } {
  const r = buildSaleBase(i, part);
  if ("error" in r || !fees) return r;
  return { ...r, unit_fee: unitFee(fees[r.channel], r.unit_price) };
}

function buildSaleBase(i: SaleInput, part: PartSnap): SaleInsert | { error: string } {
  const qty = parseNum(i.qty);
  const price = parseNum(i.unitPrice);
  if (qty === null || !Number.isInteger(qty) || qty < 1) return { error: "Quantidade precisa ser um número inteiro (1, 2, 3…)." };
  if (price === null || price < 0) return { error: "Informe o preço de venda." };
  if (!CHANNELS.includes(i.channel as Channel)) return { error: "Escolha onde vendeu." };
  if (!isDate(i.soldOn)) return { error: "Data inválida." };
  if (i.partId) {
    if (!part || part.id !== i.partId) return { error: "Peça não encontrada." };
    return { part_id: part.id, description: part.name, qty, unit_price: price, unit_cost: part.unitCost, print_minutes: part.printMinutes, channel: i.channel as Channel, sold_on: i.soldOn };
  }
  const description = (i.description ?? "").trim().slice(0, 80);
  if (!description) return { error: "Escolha uma peça ou descreva o que vendeu." };
  const cost = i.unitCost ? parseNum(i.unitCost) : 0;
  if (cost === null || cost < 0) return { error: "Custo inválido." };
  return { part_id: null, description, qty, unit_price: price, unit_cost: cost, print_minutes: 0, channel: i.channel as Channel, sold_on: i.soldOn };
}

export function buildExpense(i: { description: string; category: string; amount: string; spentOn: string }): ExpenseInsert | { error: string } {
  const description = i.description.trim().slice(0, 80);
  const amount = parseNum(i.amount);
  if (!description) return { error: "Descreva a despesa." };
  if (!(i.category in EXPENSE_CATEGORIES)) return { error: "Escolha a categoria." };
  if (amount === null || amount < 0) return { error: "Informe o valor." };
  if (!isDate(i.spentOn)) return { error: "Data inválida." };
  return { description, category: i.category as ExpenseCategory, amount, spent_on: i.spentOn };
}
