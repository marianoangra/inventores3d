import { expect, test } from "vitest";
import { buildPart } from "./part";
import type { Filament, PartDraft, Printer, WorkshopSettings } from "./types";

const ws: WorkshopSettings = { kwhPrice: 1, laborHourly: 20, lossPct: 10, packaging: 2, marginPct: 100, feeOverrides: {} };
const pr: Printer = { id: "p", name: "A1", price: 3000, lifeHours: 5000, watts: 100 };
const fi: Filament = { id: "f", type: "PLA", color: null, spoolPrice: 100, spoolGrams: 1000 };
const draft: PartDraft = { name: "Dragão", grams: 50, printMinutes: 120, laborMinutes: 6, packaging: 2, printerId: "p", filamentId: "f", marginPct: 100 };

test("recalcula custo e preços no servidor", () => {
  const r = buildPart(draft, ws, pr, fi);
  if ("error" in r) throw new Error(r.error);
  expect(r.unitCost).toBeCloseTo(11.04);
  expect(r.prices.direto).toBe(22.9);
  expect(r.prices.shopee).toBeGreaterThan(22.9);
  expect(r.prices.ml).toBeGreaterThan(22.9);
});

test("nome vazio é erro", () => expect(buildPart({ ...draft, name: "  " }, ws, pr, fi)).toHaveProperty("error"));
test("sem impressora é erro", () => expect(buildPart(draft, ws, null, fi)).toHaveProperty("error"));
test("tempo zero é erro", () => expect(buildPart({ ...draft, printMinutes: 0 }, ws, pr, fi)).toHaveProperty("error"));
test("canal impossível fica null no preço", () => {
  const r = buildPart(draft, { ...ws, feeOverrides: { ml: { pct: 1 } } }, pr, fi);
  if ("error" in r) throw new Error(r.error);
  expect(r.prices.ml).toBeNull();
});
