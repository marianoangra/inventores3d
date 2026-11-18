import { expect, test } from "vitest";
import { monthRange } from "./results";

test("mês informado", () => expect(monthRange("2026-11")).toMatchObject({ key: "2026-11", start: "2026-11-01", end: "2026-12-01" }));
test("dezembro vira o ano", () => expect(monthRange("2026-12").end).toBe("2027-01-01"));
test("inválido usa o mês atual de Brasília", () => {
  // 01/12 às 01h UTC ainda é 30/11 em Brasília
  expect(monthRange("abc", new Date("2026-12-01T01:00:00Z")).key).toBe("2026-11");
});
test("rótulo em português", () => expect(monthRange("2026-03").label).toMatch(/^Março de 2026$/i));

test("hoje em Brasília (01h UTC ainda é o dia anterior)", async () => {
  const { todayBR } = await import("./results");
  expect(todayBR(new Date("2026-12-01T01:00:00Z"))).toBe("2026-11-30");
  expect(todayBR(new Date("2026-11-18T15:00:00Z"))).toBe("2026-11-18");
});
