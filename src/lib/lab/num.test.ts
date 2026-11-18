import { expect, test } from "vitest";
import { parseNum } from "./num";

test("vírgula decimal", () => expect(parseNum("1,5")).toBe(1.5));
test("prefixo R$", () => expect(parseNum("R$ 2,00")).toBe(2));
test("milhar com ponto e vírgula decimal", () => expect(parseNum("1.299,90")).toBe(1299.9));
test("vazio é null", () => expect(parseNum("")).toBeNull());
test("texto é null", () => expect(parseNum("abc")).toBeNull());
test("número passa direto", () => expect(parseNum(3)).toBe(3));
test("null/undefined", () => { expect(parseNum(null)).toBeNull(); expect(parseNum(undefined)).toBeNull(); });
