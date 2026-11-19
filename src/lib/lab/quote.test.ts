import { describe, expect, it } from "vitest";
import { buildQuote, quoteCode, quoteMessage, quoteTotals, waLink, type Quote } from "./quote";

const base = { kind: "orcamento", customerName: "Ana Souza", customerPhone: "(11) 98765-4321", discount: "", shipping: "", notes: "", validDays: "" };

describe("buildQuote", () => {
  it("monta com vírgula, ignora linha vazia e normaliza telefone", () => {
    const r = buildQuote({ ...base, items: [{ description: "Dragão", qty: "2", unitPrice: "49,90" }, { description: "", qty: "1", unitPrice: "" }], discount: "10", shipping: "15,5" });
    expect(r).toEqual({ kind: "orcamento", customer_name: "Ana Souza", customer_phone: "5511987654321", items: [{ partId: null, description: "Dragão", qty: 2, unitPrice: 49.9 }], discount: 10, shipping: 15.5, notes: null, valid_days: 7 });
  });
  it("recusa sem item, telefone ruim, qtd fracionada", () => {
    expect(buildQuote({ ...base, items: [] })).toHaveProperty("error");
    expect(buildQuote({ ...base, customerPhone: "123", items: [{ description: "x", qty: "1", unitPrice: "1" }] })).toHaveProperty("error");
    expect(buildQuote({ ...base, items: [{ description: "x", qty: "1,5", unitPrice: "1" }] })).toHaveProperty("error");
    expect(buildQuote({ ...base, kind: "x", items: [{ description: "x", qty: "1", unitPrice: "1" }] })).toHaveProperty("error");
  });
  it("telefone é opcional e partId só aceita uuid", () => {
    const r = buildQuote({ ...base, customerPhone: "", items: [{ partId: "lixo", description: "x", qty: "1", unitPrice: "1" }] });
    expect(r).toMatchObject({ customer_phone: null, items: [{ partId: null }] });
  });
});

const q: Quote = {
  id: "1", number: 7, kind: "orcamento", customerName: "Ana Souza", customerPhone: "5511987654321",
  items: [{ partId: null, description: "Dragão", qty: 2, unitPrice: 49.9 }], discount: 10, shipping: 15, notes: null, validDays: 7, convertedAt: null, createdAt: "2026-11-19T12:00:00Z",
};

describe("documento", () => {
  it("totais", () => expect(quoteTotals(q)).toEqual({ subtotal: 99.8, total: 104.8 }));
  it("desconto não deixa negativo", () => expect(quoteTotals({ ...q, discount: 500, shipping: 0 }).total).toBe(0));
  it("código", () => {
    expect(quoteCode(q)).toBe("ORC-0007");
    expect(quoteCode({ kind: "recibo", number: 12 })).toBe("REC-0012");
  });
  it("mensagem do WhatsApp", () => {
    const m = quoteMessage(q, "Inventores 3D");
    expect(m).toContain("Oi, Ana! Segue o orçamento ORC-0007 da Inventores 3D");
    expect(m).toContain("2× Dragão");
    expect(m).toContain("Desconto: −R$");
    expect(m).toContain("*Total: R$");
    expect(m).toContain("Válido por 7 dias.");
    expect(quoteMessage({ ...q, kind: "recibo" }, "X")).toContain("Pagamento recebido");
  });
  it("link wa.me", () => expect(waLink("5511", "a b")).toBe("https://wa.me/5511?text=a%20b"));
});
