import { CHANNELS, type Channel, type FeeRule } from "./fees";

/** unitFee: taxa congelada na venda; null/ausente = vendas antigas, calcula com a taxa atual */
export type SaleRow = { description: string; qty: number; unitPrice: number; unitCost: number; printMinutes: number; channel: Channel; partId: string | null; unitFee?: number | null };
export type ExpenseRow = { amount: number };
export type MonthSummary = {
  revenue: number;
  fees: number;
  costOfGoods: number;
  expenses: number;
  profit: number;
  machineHours: number;
  /** lucro das vendas (antes das despesas do mês) por hora de impressão */
  profitPerMachineHour: number | null;
  byChannel: Record<Channel, number>;
  topParts: { description: string; qty: number; revenue: number }[];
};

const r2 = (n: number) => Math.round(n * 100) / 100;

export function monthSummary(sales: SaleRow[], expenses: ExpenseRow[], fees: Record<Channel, FeeRule>): MonthSummary {
  let revenue = 0, fee = 0, cogs = 0, minutes = 0;
  const byChannel = Object.fromEntries(CHANNELS.map((c) => [c, 0])) as Record<Channel, number>;
  const parts = new Map<string, { description: string; qty: number; revenue: number }>();

  for (const s of sales) {
    const rev = s.qty * s.unitPrice;
    const { pct, fixed } = (fees[s.channel] ?? fees.direto).at(s.unitPrice);
    const uf = s.unitFee ?? pct * s.unitPrice + fixed;
    revenue += rev;
    fee += s.qty * uf;
    cogs += s.qty * s.unitCost;
    minutes += s.qty * s.printMinutes;
    byChannel[s.channel] = (byChannel[s.channel] ?? 0) + rev;
    const p = parts.get(s.description) ?? { description: s.description, qty: 0, revenue: 0 };
    p.qty += s.qty;
    p.revenue += rev;
    parts.set(s.description, p);
  }
  const exp = expenses.reduce((a, e) => a + e.amount, 0);
  const gross = revenue - fee - cogs;
  const hours = minutes / 60;
  return {
    revenue: r2(revenue),
    fees: r2(fee),
    costOfGoods: r2(cogs),
    expenses: r2(exp),
    profit: r2(gross - exp),
    machineHours: r2(hours),
    profitPerMachineHour: hours > 0 ? r2(gross / hours) : null,
    byChannel: Object.fromEntries(CHANNELS.map((c) => [c, r2(byChannel[c])])) as Record<Channel, number>,
    topParts: [...parts.values()].sort((a, b) => b.qty - a.qty || b.revenue - a.revenue).slice(0, 5).map((p) => ({ ...p, revenue: r2(p.revenue) })),
  };
}

/** "2026-11" → limites do mês; inválido/ausente → mês atual (horário de Brasília). */
export function monthRange(m?: string | null, now = new Date()): { key: string; start: string; end: string; label: string } {
  const br = new Date(now.getTime() - 3 * 3600 * 1000);
  let y = br.getUTCFullYear(), mo = br.getUTCMonth() + 1;
  const ok = m && /^(\d{4})-(0[1-9]|1[0-2])$/.exec(m);
  if (ok) { y = +ok[1]; mo = +ok[2]; }
  const pad = (n: number) => String(n).padStart(2, "0");
  const ny = mo === 12 ? y + 1 : y, nm = mo === 12 ? 1 : mo + 1;
  const label = new Date(Date.UTC(y, mo - 1, 15)).toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });
  return { key: `${y}-${pad(mo)}`, start: `${y}-${pad(mo)}-01`, end: `${ny}-${pad(nm)}-01`, label: label.charAt(0).toUpperCase() + label.slice(1) };
}

/** Data de hoje (AAAA-MM-DD) no horário de Brasília. */
export function todayBR(now = new Date()): string {
  return new Date(now.getTime() - 3 * 3600 * 1000).toISOString().slice(0, 10);
}
