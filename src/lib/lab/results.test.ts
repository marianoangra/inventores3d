import { expect, test } from "vitest";
import { monthSummary, type SaleRow } from "./results";
import { resolveFees } from "./fees";

const fees = resolveFees();
const sale = (o: Partial<SaleRow>): SaleRow => ({ description: "Dragão", qty: 1, unitPrice: 30, unitCost: 10, printMinutes: 120, channel: "direto", partId: "p1", ...o });

test("mês vazio: tudo zero e lucro/hora null", () => {
  const s = monthSummary([], [], fees);
  expect(s).toMatchObject({ revenue: 0, fees: 0, costOfGoods: 0, expenses: 0, profit: 0, machineHours: 0, profitPerMachineHour: null, topParts: [] });
  expect(s.byChannel).toEqual({ direto: 0, shopee: 0, ml: 0 });
});

test("venda direta soma receita, custo e horas", () => {
  const s = monthSummary([sale({ qty: 2 })], [], fees);
  expect(s.revenue).toBe(60);
  expect(s.costOfGoods).toBe(20);
  expect(s.fees).toBe(0);
  expect(s.profit).toBe(40);
  expect(s.machineHours).toBe(4);
  expect(s.profitPerMachineHour).toBe(10);
});

test("taxa do canal entra por unidade", () => {
  const s = monthSummary([sale({ channel: "shopee", qty: 2, unitPrice: 50 })], [], resolveFees({ shopee: { pct: 0.2, fixed: 4 } }));
  expect(s.fees).toBeCloseTo(28); // (10 + 4) × 2
  expect(s.byChannel.shopee).toBe(100);
});

test("despesa entra só no lucro, não no lucro por hora", () => {
  const s = monthSummary([sale({})], [{ amount: 15 }], fees);
  expect(s.expenses).toBe(15);
  expect(s.profit).toBe(5);
  expect(s.profitPerMachineHour).toBe(10);
});

test("mesma descrição soma em topParts, ordenado por quantidade", () => {
  const s = monthSummary([sale({ qty: 1 }), sale({ qty: 3 }), sale({ description: "Chaveiro", qty: 2 })], [], fees);
  expect(s.topParts[0]).toEqual({ description: "Dragão", qty: 4, revenue: 120 });
  expect(s.topParts[1].description).toBe("Chaveiro");
});

test("venda de peça excluída (partId null) conta normalmente", () => {
  const s = monthSummary([sale({ partId: null })], [], fees);
  expect(s.revenue).toBe(30);
  expect(s.topParts).toHaveLength(1);
});

test("topParts limita a 5", () => {
  const many = Array.from({ length: 8 }, (_, i) => sale({ description: `P${i}`, qty: i + 1 }));
  expect(monthSummary(many, [], fees).topParts).toHaveLength(5);
});
