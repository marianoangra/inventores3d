// Frete fixo por região (saindo de SP). Estimativa de Correios PAC/Mini Envios pra pacote pequeno.
// Mude os valores aqui — vale pro site inteiro (checkout, servidor e página Como funciona).
export const SHIPPING_BY_REGION = {
  SP: { label: "Estado de São Paulo", price: 14.9 },
  SE: { label: "RJ, MG e ES", price: 19.9 },
  S: { label: "Sul", price: 22.9 },
  CO: { label: "Centro-Oeste", price: 26.9 },
  NE: { label: "Nordeste", price: 29.9 },
  N: { label: "Norte", price: 34.9 },
} as const;
export type Region = keyof typeof SHIPPING_BY_REGION;

const REGION_OF: Record<string, Region> = {
  SP: "SP",
  RJ: "SE", MG: "SE", ES: "SE",
  PR: "S", SC: "S", RS: "S",
  DF: "CO", GO: "CO", MT: "CO", MS: "CO",
  BA: "NE", SE: "NE", AL: "NE", PE: "NE", PB: "NE", RN: "NE", CE: "NE", PI: "NE", MA: "NE",
  PA: "N", AM: "N", AP: "N", RR: "N", RO: "N", AC: "N", TO: "N",
};
export const UFS = Object.keys(REGION_OF);
export const isUf = (uf: string) => uf in REGION_OF;

/** Frete do pedido. Grátis a partir de `freeFrom`. UF desconhecida → null (pede o CEP). */
export function shippingFor(subtotal: number, uf: string | null | undefined, freeFrom: number): number | null {
  if (subtotal >= freeFrom) return 0;
  const r = uf ? REGION_OF[uf.toUpperCase()] : undefined;
  return r ? SHIPPING_BY_REGION[r].price : null;
}

/** "São Paulo/SP" → "SP" */
export const ufFromCity = (city: string) => {
  const m = city.trim().match(/[/\-\s]([A-Za-z]{2})$/);
  const uf = m?.[1].toUpperCase();
  return uf && isUf(uf) ? uf : null;
};
