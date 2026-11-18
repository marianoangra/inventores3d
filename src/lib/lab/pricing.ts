import { CHANNELS, type Channel, type FeeRule } from "./fees";

export type CostInput = {
  grams: number; printMinutes: number; laborMinutes: number;
  spoolPrice: number; spoolGrams: number;
  printerPrice: number; printerLifeHours: number; printerWatts: number;
  kwhPrice: number; laborHourly: number; lossPct: number; packaging: number;
};
export type CostBreakdown = { filament: number; energy: number; wear: number; loss: number; labor: number; packaging: number; total: number };
export type ChannelQuote =
  | { channel: Channel; price: number; fees: number; profit: number; profitPerMachineHour: number | null }
  | { channel: Channel; error: string };

export function computeCost(i: CostInput): CostBreakdown | { error: string } {
  const vals = Object.values(i);
  if (vals.some((v) => typeof v !== "number" || !Number.isFinite(v) || v < 0)) return { error: "Preencha todos os campos com números positivos." };
  if (i.spoolGrams <= 0) return { error: "O peso do rolo precisa ser maior que zero." };
  if (i.printerLifeHours <= 0) return { error: "A vida útil da impressora precisa ser maior que zero." };
  const h = i.printMinutes / 60;
  const filament = (i.grams / i.spoolGrams) * i.spoolPrice;
  const energy = (i.printerWatts / 1000) * h * i.kwhPrice;
  const wear = (i.printerPrice / i.printerLifeHours) * h;
  const loss = (filament + energy + wear) * (i.lossPct / 100);
  const labor = (i.laborMinutes / 60) * i.laborHourly;
  const total = filament + energy + wear + loss + labor + i.packaging;
  return { filament, energy, wear, loss, labor, packaging: i.packaging, total };
}

const r2 = (n: number) => Math.round(n * 100) / 100;
/** Arredonda para cima até o próximo ",90" (22,90 fica 22,90). */
export function ceil90(n: number): number {
  const c = Math.round(n * 100);
  const base = Math.floor(c / 100) * 100 + 90;
  return (c <= base ? base : base + 100) / 100;
}

function feesAt(rule: FeeRule, price: number) {
  const { pct, fixed } = rule.at(price);
  return pct * price + fixed;
}

export function quoteAtPrice(cost: number, price: number, printMinutes: number, rule: FeeRule, channel: Channel): ChannelQuote {
  const fees = r2(feesAt(rule, price));
  const profit = r2(price - fees - cost);
  return { channel, price, fees, profit, profitPerMachineHour: printMinutes > 0 ? r2(profit / (printMinutes / 60)) : null };
}

export function quote(cost: number, marginPct: number, printMinutes: number, fees: Record<Channel, FeeRule>): ChannelQuote[] {
  const target = cost * (1 + marginPct / 100); // receita líquida desejada
  return CHANNELS.map((channel) => {
    const rule = fees[channel];
    const net = (p: number) => p - feesAt(rule, p);
    let p = target;
    for (let i = 0; i < 10; i++) {
      const { pct, fixed } = rule.at(p);
      if (pct >= 1) return { channel, error: "Taxa do canal impossível (100% ou mais)." };
      const next = ceil90((target + fixed) / (1 - pct));
      if (next === p) break;
      p = next;
    }
    // faixas de taxa podem fazer o laço oscilar: garante que o lucro desejado é coberto
    let guard = 0;
    while (net(p) < target - 1e-9 && guard++ < 500) p = r2(p + 1);
    if (rule.at(p).pct >= 1 || net(p) < target - 1e-9) return { channel, error: "Taxa do canal impossível (100% ou mais)." };
    return quoteAtPrice(cost, p, printMinutes, rule, channel);
  });
}
