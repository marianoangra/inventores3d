import { describe, expect, it } from "vitest";
import { orderEntries, orderIdFromNotification, soldOnBR, type MlOrder, type PartLite } from "./orders";

const parts: PartLite[] = [
  { id: "p1", name: "Suporte de Mesa para Headset", unitCost: 12, printMinutes: 300, grams: 90, filamentId: "f1" },
  { id: "p2", name: "Dragão Articulado Cristal", unitCost: 8, printMinutes: 120, grams: 35, filamentId: null },
];
const order: MlOrder = {
  id: 2000012345678,
  status: "paid",
  date_created: "2026-11-20T01:30:00.000-03:00",
  pack_id: null,
  buyer: { nickname: "COMPRADOR123" },
  order_items: [
    { item: { id: "MLB111", title: "Suporte Para Headset Fone De Ouvido Gamer De Mesa", variation_attributes: [{ name: "Cor", value_name: "Roxo" }] }, quantity: 2, unit_price: 59.9, sale_fee: 8.39 },
    { item: { id: "MLB222", title: "Dragão Articulado Cristal" }, quantity: 1, unit_price: 49.9, sale_fee: 13.64 },
    { item: { id: "MLB333", title: "Coisa sem peça cadastrada" }, quantity: 1, unit_price: 20, sale_fee: null },
  ],
};

describe("notificação", () => {
  it("pega o id só do tópico de pedidos", () => {
    expect(orderIdFromNotification({ topic: "orders_v2", resource: "/orders/2000012345678" })).toBe(2000012345678);
    expect(orderIdFromNotification({ topic: "items", resource: "/items/MLB1" })).toBeNull();
    expect(orderIdFromNotification({ topic: "orders_v2", resource: "/orders/abc" })).toBeNull();
    expect(orderIdFromNotification(null)).toBeNull();
  });
});

describe("orderEntries", () => {
  const entries = orderEntries(order, { listingName: (id) => (id === "MLB111" ? "Suporte de Mesa para Headset" : undefined), parts });

  it("acha a peça pelo anúncio vinculado e mantém a variação", () => {
    expect(entries[0]).toMatchObject({ part: { id: "p1" }, description: "Suporte de Mesa para Headset (Cor: Roxo)", qty: 2, unitPrice: 59.9, unitFee: 8.39 });
  });
  it("sem vínculo, acha pelo título igual ao nome (ignora acento e caixa)", () => {
    expect(entries[1].part?.id).toBe("p2");
  });
  it("sem peça: entra com o título e tarifa zero quando o ML não manda", () => {
    expect(entries[2]).toMatchObject({ part: null, description: "Coisa sem peça cadastrada", unitFee: 0 });
  });
  it("anota o pedido e o comprador", () => {
    expect(entries[0].notes).toBe("ML #2000012345678 — COMPRADOR123");
  });
  it("data no horário de Brasília", () => {
    expect(soldOnBR("2026-11-20T01:30:00.000-03:00")).toBe("2026-11-20");
    expect(soldOnBR("2026-11-20T02:30:00.000Z")).toBe("2026-11-19");
  });
});
