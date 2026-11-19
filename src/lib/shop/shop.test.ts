import { describe, expect, it } from "vitest";
import { isValidCpf, maskCpf } from "./cpf";
import { shippingFor, ufFromCity } from "./shipping";
import { buildOrder, isOrderCode, nextStatus, orderCode, type OrderInput } from "./order";

const OPTS = { pixDiscount: 0.05, freeShippingFrom: 199 };
const CPF = "529.982.247-25"; // CPF de teste válido (gerador público)

const base = (o: Partial<OrderInput> = {}): OrderInput => ({
  items: [{ slug: "snap-pong", color: "candy", note: "", qty: 1 }],
  pay: "pix",
  installments: 1,
  customer: { name: "Ana Souza", cpf: CPF, email: "Ana@Exemplo.com", phone: "(11) 98765-4321" },
  address: { cep: "01310-100", street: "Av. Paulista", number: "1000", complement: "", district: "Bela Vista", city: "São Paulo/SP", uf: "SP" },
  notes: "",
  ...o,
});

describe("cpf", () => {
  it("valida dígitos", () => {
    expect(isValidCpf(CPF)).toBe(true);
    expect(isValidCpf("52998224724")).toBe(false);
    expect(isValidCpf("111.111.111-11")).toBe(false);
    expect(isValidCpf("123")).toBe(false);
  });
  it("máscara", () => expect(maskCpf("52998224725")).toBe(CPF));
});

describe("frete", () => {
  it("por região e grátis acima do mínimo", () => {
    expect(shippingFor(50, "SP", 199)).toBe(14.9);
    expect(shippingFor(50, "rj", 199)).toBe(19.9);
    expect(shippingFor(50, "AM", 199)).toBe(34.9);
    expect(shippingFor(199, "AM", 199)).toBe(0);
    expect(shippingFor(50, null, 199)).toBeNull();
    expect(shippingFor(50, "XX", 199)).toBeNull();
  });
  it("UF a partir da cidade", () => {
    expect(ufFromCity("São Paulo/SP")).toBe("SP");
    expect(ufFromCity("Recife - pe")).toBe("PE");
    expect(ufFromCity("Campinas")).toBeNull();
  });
});

describe("buildOrder", () => {
  it("calcula no servidor: Pix com 5% sobre os itens + frete da região", () => {
    const r = buildOrder(base(), OPTS);
    if ("error" in r) throw new Error(r.error);
    expect(r.subtotal).toBe(89.9);
    expect(r.discount).toBe(4.5); // 4,495 arredondado em centavos
    expect(r.shipping).toBe(14.9);
    expect(r.total).toBe(100.3);
    expect(r.customer).toEqual({ name: "Ana Souza", cpf: "52998224725", email: "ana@exemplo.com", phone: "11987654321" });
    expect(r.address.city).toBe("São Paulo");
    expect(r.lines[0]).toMatchObject({ name: "Snap-Pong — Pong de Lata", colorLabel: "Candy (multicolor)", unit: 89.9 });
  });

  it("ignora preço vindo do navegador e cobra o acréscimo da cor", () => {
    const r = buildOrder(base({ items: [{ slug: "dragao-articulado-cristal", color: "arcoiris", qty: 2, unit: 1, price: 1 }], pay: "cartao" }), OPTS);
    if ("error" in r) throw new Error(r.error);
    expect(r.lines[0].unit).toBe(59.9);
    expect(r.subtotal).toBe(119.8);
    expect(r.discount).toBe(0);
  });

  it("frete grátis a partir de R$ 199 e UF do CEP manda", () => {
    const r = buildOrder(base({ items: [{ slug: "snap-pong", color: "candy", qty: 3 }], address: { ...base().address, uf: "SP" } }), { ...OPTS, ufFromCep: "AM" });
    if ("error" in r) throw new Error(r.error);
    expect(r.shipping).toBe(0);
    expect(r.address.uf).toBe("AM");
  });

  it("parcelas: só no cartão, até 3x, parcela mínima R$ 5", () => {
    const pix = buildOrder(base({ installments: 3 }), OPTS);
    expect(!("error" in pix) && pix.installments).toBe(1);
    const card = buildOrder(base({ pay: "cartao", installments: 3 }), OPTS);
    expect(!("error" in card) && card.installments).toBe(3);
    expect(buildOrder(base({ pay: "cartao", installments: 4 }), OPTS)).toHaveProperty("error");
    // item mais barato + frete ainda fica acima da parcela mínima em 3x
    const tiny = buildOrder(base({ pay: "cartao", installments: 3, items: [{ slug: "chaveiro-articulado", color: "galaxy", qty: 1, note: "Dino" }] }), OPTS);
    if ("error" in tiny) throw new Error(tiny.error);
    expect(tiny.total).toBe(29.8);
    expect(tiny.lines[0].note).toBe("Dino");
  });

  it("recusa o que não pode", () => {
    const bad = (o: Partial<OrderInput>, ufFromCep?: string) => buildOrder(base(o), { ...OPTS, ufFromCep });
    expect(bad({ items: [] })).toHaveProperty("error");
    expect(bad({ items: [{ slug: "nao-existe", color: "galaxy", qty: 1 }] })).toHaveProperty("error");
    expect(bad({ items: [{ slug: "rok-cooler", color: "espacial", qty: 1 }] })).toMatchObject({ error: expect.stringContaining("WhatsApp") });
    expect(bad({ items: [{ slug: "snap-pong", color: "galaxy", qty: 1 }] })).toHaveProperty("error"); // cor fora da lista
    expect(bad({ items: [{ slug: "snap-pong", color: "candy", qty: 1.5 }] })).toHaveProperty("error");
    expect(bad({ items: [{ slug: "chaveiro-com-nome", color: "galaxy", qty: 1, note: "" }] })).toHaveProperty("error");
    expect(bad({ pay: "boleto" })).toHaveProperty("error");
    expect(bad({ customer: { ...base().customer, cpf: "123.456.789-00" } })).toHaveProperty("error");
    expect(bad({ customer: { ...base().customer, name: "Ana" } })).toHaveProperty("error");
    expect(bad({ customer: { ...base().customer, email: "ana@" } })).toHaveProperty("error");
    expect(bad({ address: { ...base().address, cep: "123" } })).toHaveProperty("error");
    expect(bad({ address: { ...base().address, uf: "", city: "Lugar" } })).toHaveProperty("error");
  });
});

describe("código e status", () => {
  it("código do pedido", () => {
    const c = orderCode();
    expect(isOrderCode(c)).toBe(true);
    expect(isOrderCode("I3D-ABCDEFG0")).toBe(false);
    expect(isOrderCode("I3D-abcdefgh")).toBe(false);
    // bytes altos são descartados (sem viés)
    const fixed = orderCode(() => new Uint8Array([255, 0, 1, 2, 3, 4, 5, 6, 7, 250, 249, 248, 8, 9, 10, 11]));
    expect(fixed).toBe("I3D-ABCDEFGH");
  });

  it("transições do webhook", () => {
    expect(nextStatus("pendente", "PAYMENT_RECEIVED")).toBe("pago");
    expect(nextStatus("expirado", "PAYMENT_CONFIRMED")).toBe("pago");
    expect(nextStatus("pago", "PAYMENT_RECEIVED")).toBeNull();
    expect(nextStatus("enviado", "PAYMENT_CONFIRMED")).toBeNull();
    expect(nextStatus("pendente", "PAYMENT_OVERDUE")).toBe("expirado");
    expect(nextStatus("pago", "PAYMENT_OVERDUE")).toBeNull();
    expect(nextStatus("pendente", "PAYMENT_DELETED")).toBe("cancelado");
    expect(nextStatus("enviado", "PAYMENT_REFUNDED")).toBe("estornado");
    expect(nextStatus("pago", "PAYMENT_CREATED")).toBeNull();
  });
});
