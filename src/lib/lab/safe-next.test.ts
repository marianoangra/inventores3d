import { expect, test } from "vitest";
import { safeNext } from "./safe-next";

test("rota do Lab passa", () => expect(safeNext("/lab/vendas?m=2026-11")).toBe("/lab/vendas?m=2026-11"));
test("site externo cai no /lab", () => expect(safeNext("https://evil.com")).toBe("/lab"));
test("protocolo relativo cai no /lab", () => expect(safeNext("//evil.com")).toBe("/lab"));
test("rota da loja cai no /lab", () => expect(safeNext("/checkout")).toBe("/lab"));
test("vazio cai no /lab", () => expect(safeNext(null)).toBe("/lab"));
