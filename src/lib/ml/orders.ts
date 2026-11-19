// Venda do Mercado Livre → lançamentos do Lab (venda + ordem na fila). Lógica pura, testável.

export type MlOrderItem = {
  item: { id: string; title: string; variation_attributes?: { name: string; value_name: string | null }[] };
  quantity: number;
  unit_price: number;
  sale_fee?: number | null;
};
export type MlOrder = {
  id: number;
  status: string; // paid | confirmed | payment_required | payment_in_process | partially_paid | cancelled | invalid
  date_created: string;
  date_closed?: string | null;
  order_items: MlOrderItem[];
  buyer?: { nickname?: string | null };
  pack_id?: number | null;
};

export type PartLite = { id: string; name: string; unitCost: number; printMinutes: number; grams: number; filamentId: string | null };

export type Entry = {
  itemId: string;
  description: string;
  qty: number;
  unitPrice: number;
  unitFee: number;
  part: PartLite | null;
  notes: string;
};

export const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** Notificação do ML → id do pedido (só tópico de pedidos). */
export function orderIdFromNotification(body: unknown): number | null {
  const b = (body ?? {}) as { topic?: unknown; resource?: unknown };
  if (b.topic !== "orders_v2" && b.topic !== "orders") return null;
  const m = /^\/orders\/(\d{6,20})$/.exec(String(b.resource ?? ""));
  return m ? Number(m[1]) : null;
}

/**
 * Cada item do pedido vira um lançamento. A peça do Lab é achada pelo anúncio vinculado (ml_listings → produto do site)
 * e, se não houver vínculo, pelo título do anúncio igual ao nome da peça.
 */
export function orderEntries(o: MlOrder, ctx: { listingName: (itemId: string) => string | undefined; parts: PartLite[] }): Entry[] {
  const byName = new Map(ctx.parts.map((p) => [norm(p.name), p]));
  return o.order_items.map((it) => {
    const variation = (it.item.variation_attributes ?? [])
      .filter((v) => v.value_name)
      .map((v) => `${v.name}: ${v.value_name}`)
      .join(", ");
    const linked = ctx.listingName(it.item.id);
    const part = (linked && byName.get(norm(linked))) || byName.get(norm(it.item.title)) || null;
    const description = `${part?.name ?? it.item.title}${variation ? ` (${variation})` : ""}`.slice(0, 80);
    return {
      itemId: it.item.id,
      description,
      qty: Math.max(1, Math.round(it.quantity)),
      unitPrice: Math.round(it.unit_price * 100) / 100,
      unitFee: Math.max(0, Math.round(Number(it.sale_fee ?? 0) * 100) / 100), // tarifa de venda do ML por unidade
      part,
      notes: `ML #${o.pack_id ?? o.id}${o.buyer?.nickname ? ` — ${o.buyer.nickname}` : ""}`.slice(0, 200),
    };
  });
}

/** Data da venda no horário de Brasília (YYYY-MM-DD). */
export const soldOnBR = (iso: string) => new Date(Date.parse(iso) - 3 * 3600e3).toISOString().slice(0, 10);
