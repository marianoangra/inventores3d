export type Channel = "direto" | "shopee" | "ml";
export const CHANNELS: Channel[] = ["direto", "shopee", "ml"];
export const CHANNEL_LABEL: Record<Channel, string> = {
  direto: "Venda direta / Instagram",
  shopee: "Shopee",
  ml: "Mercado Livre",
};

/** Taxa do canal no preço P: percentual (0–1) + valor fixo por item. Pode variar por faixa de preço. */
export type FeeRule = { at: (price: number) => { pct: number; fixed: number } };
export type FeeOverride = Partial<Record<Channel, { pct?: number; fixed?: number }>>;

/** Data em que as taxas padrão foram conferidas (fontes de terceiros; oficial = Central do Vendedor). */
export const FEES_CHECKED_AT = "2026-11-18";

export const FEE_NOTES: Record<Channel, string> = {
  direto: "Sem taxa de plataforma.",
  shopee: "Comissão por faixa: até R$79,99 = 20% + R$4,50; R$80–99,99 = 14% + R$16; R$100–199,99 = 14% + R$20; acima = 14% + R$26.",
  ml: "Anúncio Clássico ~14% (varia 10–14% por categoria) + custo fixo abaixo de R$79: R$6,25 até R$18,99; R$6,65 até R$48,99; R$7,75 até R$78,99. Frete não incluso.",
};

export const DEFAULT_FEES: Record<Channel, FeeRule> = {
  direto: { at: () => ({ pct: 0, fixed: 0 }) },
  shopee: {
    at: (p) =>
      p < 80 ? { pct: 0.2, fixed: 4.5 } : p < 100 ? { pct: 0.14, fixed: 16 } : p < 200 ? { pct: 0.14, fixed: 20 } : { pct: 0.14, fixed: 26 },
  },
  ml: {
    at: (p) => ({ pct: 0.14, fixed: p < 19 ? 6.25 : p < 49 ? 6.65 : p < 79 ? 7.75 : 0 }),
  },
};

/** Aplica o que o usuário sobrescreveu na oficina. Campo sobrescrito vale para qualquer preço. */
export function resolveFees(o?: FeeOverride | null): Record<Channel, FeeRule> {
  const out = { ...DEFAULT_FEES };
  if (!o) return out;
  for (const ch of Object.keys(o) as Channel[]) {
    const ov = o[ch];
    if (!ov || !DEFAULT_FEES[ch]) continue;
    const base = DEFAULT_FEES[ch];
    out[ch] = {
      at: (p) => {
        const b = base.at(p);
        return { pct: ov.pct ?? b.pct, fixed: ov.fixed ?? b.fixed };
      },
    };
  }
  return out;
}
