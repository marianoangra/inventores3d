import { expect, test } from "vitest";
import { computeCost, quote, type CostBreakdown } from "./pricing";
import { resolveFees } from "./fees";

const base = { grams: 50, printMinutes: 120, laborMinutes: 6, spoolPrice: 100, spoolGrams: 1000,
  printerPrice: 3000, printerLifeHours: 5000, printerWatts: 100, kwhPrice: 1, laborHourly: 20, lossPct: 10, packaging: 2 };

test("custo detalhado", () => {
  const c = computeCost(base) as CostBreakdown;
  expect(c.filament).toBeCloseTo(5);
  expect(c.energy).toBeCloseTo(0.2);
  expect(c.wear).toBeCloseTo(1.2);
  expect(c.loss).toBeCloseTo(0.64);
  expect(c.labor).toBeCloseTo(2);
  expect(c.total).toBeCloseTo(11.04);
});

test("peso do rolo zero vira erro", () => expect(computeCost({ ...base, spoolGrams: 0 })).toHaveProperty("error"));
test("campo negativo vira erro", () => expect(computeCost({ ...base, grams: -1 })).toHaveProperty("error"));
test("NaN vira erro", () => expect(computeCost({ ...base, kwhPrice: NaN })).toHaveProperty("error"));

test("venda direta: margem 100% → 22,08 arredonda 22,90", () => {
  const q = quote(11.04, 100, 120, resolveFees())[0] as any;
  expect(q).toMatchObject({ channel: "direto", price: 22.9 });
  expect(q.profit).toBeCloseTo(11.86);
  expect(q.profitPerMachineHour).toBeCloseTo(5.93);
});

test("preço já em ,90 não sobe", () => {
  const q = quote(11.45, 100, 60, resolveFees())[0] as any; // alvo 22,90
  expect(q.price).toBe(22.9);
});

test("canal com taxa cobre a taxa e termina em ,90", () => {
  const fees = resolveFees({ shopee: { pct: 0.2, fixed: 4 } });
  const q = quote(10, 50, 60, fees).find((x) => x.channel === "shopee") as any;
  expect(q.price - q.fees - 10).toBeGreaterThanOrEqual(5 - 1e-9);
  expect(Math.round((q.price % 1) * 100)).toBe(90);
});

test("todos os canais padrão cobrem o lucro desejado", () => {
  for (const q of quote(30, 80, 180, resolveFees()) as any[]) {
    expect(q.price - q.fees - 30).toBeGreaterThanOrEqual(24 - 1e-9);
  }
});

test("taxa ≥100% vira erro", () => {
  expect(quote(10, 50, 60, resolveFees({ ml: { pct: 1 } })).find((x) => x.channel === "ml")).toHaveProperty("error");
});

test("tempo zero: lucro/hora null", () => {
  expect((quote(10, 50, 0, resolveFees())[0] as any).profitPerMachineHour).toBeNull();
});
