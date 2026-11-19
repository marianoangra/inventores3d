import { describe, expect, it } from "vitest";
import { deductStock, fmtMinutes, forecastQueue, type Job } from "./production";

const now = new Date("2026-11-19T12:00:00-03:00");
const job = (id: string, o: Partial<Job>): Job => ({
  id, saleId: null, partId: null, filamentId: null, description: id, qty: 1, printMinutes: 60, grams: 10, plates: 1,
  status: "fila", dueOn: null, notes: null, startedAt: null, finishedAt: null, deliveredAt: null, createdAt: "2026-11-19T10:00:00Z", ...o,
});

describe("forecastQueue", () => {
  it("uma impressora 24h: ordens em sequência", () => {
    const f = forecastQueue([job("a", { createdAt: "2026-11-19T10:00:00Z" }), job("b", { createdAt: "2026-11-19T11:00:00Z", printMinutes: 120 })], { printers: 1, hoursPerDay: 24, now });
    expect(f.get("a")!.finishAt.getTime() - now.getTime()).toBe(60 * 60000);
    expect(f.get("b")!.finishAt.getTime() - now.getTime()).toBe(180 * 60000);
  });

  it("duas impressoras dividem a fila", () => {
    const f = forecastQueue([job("a", {}), job("b", { createdAt: "2026-11-19T10:30:00Z" })], { printers: 2, hoursPerDay: 24, now });
    expect(f.get("b")!.finishAt.getTime() - now.getTime()).toBe(60 * 60000);
  });

  it("imprimindo vem antes e desconta o tempo passado", () => {
    const f = forecastQueue(
      [job("fila", { createdAt: "2026-11-19T09:00:00Z" }), job("imp", { status: "imprimindo", startedAt: new Date(now.getTime() - 40 * 60000).toISOString() })],
      { printers: 1, hoursPerDay: 24, now },
    );
    expect(f.get("imp")!.finishAt.getTime() - now.getTime()).toBe(20 * 60000);
    expect(f.get("fila")!.finishAt.getTime() - now.getTime()).toBe(80 * 60000);
  });

  it("12h por dia dobra o tempo de relógio", () => {
    const f = forecastQueue([job("a", {})], { printers: 1, hoursPerDay: 12, now });
    expect(f.get("a")!.finishAt.getTime() - now.getTime()).toBe(120 * 60000);
  });

  it("marca atraso pelo prazo", () => {
    const f = forecastQueue([job("a", { printMinutes: 60 * 30, dueOn: "2026-11-19" }), job("b", { dueOn: "2026-11-25", createdAt: "2026-11-19T11:00:00Z" })], { printers: 1, hoursPerDay: 24, now });
    expect(f.get("a")!.late).toBe(true);
    expect(f.get("b")!.late).toBe(false);
  });

  it("ignora pronto/entregue e aceita 0 impressoras", () => {
    const f = forecastQueue([job("p", { status: "pronto" }), job("a", {})], { printers: 0, hoursPerDay: 24, now });
    expect(f.has("p")).toBe(false);
    expect(f.has("a")).toBe(true);
  });
});

describe("helpers", () => {
  it("fmtMinutes", () => {
    expect(fmtMinutes(45)).toBe("45 min");
    expect(fmtMinutes(200)).toBe("3h20");
    expect(fmtMinutes(120)).toBe("2h");
    expect(fmtMinutes(60 * 28)).toBe("1d 4h");
  });
  it("deductStock", () => {
    expect(deductStock(null, 50)).toBeNull();
    expect(deductStock(100, 30.25)).toBe(69.8);
    expect(deductStock(10, 50)).toBe(0);
  });
});
