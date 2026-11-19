import { expect, test } from "vitest";
import { buildSale, buildExpense } from "./entries";

const part = { id: "p1", name: "Dragão", unitCost: 10, printMinutes: 120 };
const today = "2026-11-18";

test("venda de peça copia nome, custo e tempo da peça", () => {
  expect(buildSale({ partId: "p1", qty: "2", unitPrice: "29,90", channel: "shopee", soldOn: today }, part)).toEqual({
    part_id: "p1", description: "Dragão", qty: 2, unit_price: 29.9, unit_cost: 10, print_minutes: 120, channel: "shopee", sold_on: today,
  });
});

test("venda avulsa exige descrição", () => {
  expect(buildSale({ qty: "1", unitPrice: "10", channel: "direto", soldOn: today }, null)).toHaveProperty("error");
});

test("venda avulsa com custo opcional", () => {
  expect(buildSale({ description: "Encomenda", qty: "1", unitPrice: "50", unitCost: "", channel: "direto", soldOn: today }, null)).toMatchObject({ part_id: null, unit_cost: 0, print_minutes: 0 });
});

test("quantidade zero ou quebrada é erro", () => {
  expect(buildSale({ partId: "p1", qty: "0", unitPrice: "10", channel: "direto", soldOn: today }, part)).toHaveProperty("error");
  expect(buildSale({ partId: "p1", qty: "1,5", unitPrice: "10", channel: "direto", soldOn: today }, part)).toHaveProperty("error");
});

test("canal desconhecido é erro", () => {
  expect(buildSale({ partId: "p1", qty: "1", unitPrice: "10", channel: "olx", soldOn: today }, part)).toHaveProperty("error");
});

test("partId informado mas peça não encontrada é erro", () => {
  expect(buildSale({ partId: "x", qty: "1", unitPrice: "10", channel: "direto", soldOn: today }, null)).toHaveProperty("error");
});

test("data inválida é erro", () => {
  expect(buildSale({ partId: "p1", qty: "1", unitPrice: "10", channel: "direto", soldOn: "18/11" }, part)).toHaveProperty("error");
});

test("despesa válida", () => {
  expect(buildExpense({ description: "Rolo PETG", category: "filamento", amount: "119,90", spentOn: today })).toEqual({ description: "Rolo PETG", category: "filamento", amount: 119.9, spent_on: today });
});

test("despesa com categoria inválida ou valor negativo é erro", () => {
  expect(buildExpense({ description: "x", category: "viagem", amount: "10", spentOn: today })).toHaveProperty("error");
  expect(buildExpense({ description: "x", category: "outros", amount: "-1", spentOn: today })).toHaveProperty("error");
});

test("buildSale com taxas grava a taxa do canal na venda", async () => {
  const { resolveFees } = await import("./fees");
  const { buildSale, unitFee } = await import("./entries");
  const fees = resolveFees({});
  const r = buildSale({ description: "Vaso", qty: "1", unitPrice: "50", channel: "shopee", soldOn: "2026-11-19" }, null, fees);
  expect("error" in r).toBe(false);
  if (!("error" in r)) expect(r.unit_fee).toBe(unitFee(fees.shopee, 50));
  const d = buildSale({ description: "Vaso", qty: "1", unitPrice: "50", channel: "direto", soldOn: "2026-11-19" }, null, fees);
  if (!("error" in d)) expect(d.unit_fee).toBe(unitFee(fees.direto, 50));
});
