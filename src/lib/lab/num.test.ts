import { expect, test } from "vitest";
import { parseNum } from "./num";

test("vírgula decimal", () => expect(parseNum("1,5")).toBe(1.5));
test("prefixo R$", () => expect(parseNum("R$ 2,00")).toBe(2));
test("milhar com ponto e vírgula decimal", () => expect(parseNum("1.299,90")).toBe(1299.9));
test("vazio é null", () => expect(parseNum("")).toBeNull());
test("texto é null", () => expect(parseNum("abc")).toBeNull());
test("número passa direto", () => expect(parseNum(3)).toBe(3));
test("null/undefined", () => { expect(parseNum(null)).toBeNull(); expect(parseNum(undefined)).toBeNull(); });

test("milhar sem vírgula (2.500) é dois mil e quinhentos", () => expect(parseNum("2.500")).toBe(2500));
test("1.000 g de rolo é mil", () => expect(parseNum("1.000")).toBe(1000));
test("milhões com pontos", () => expect(parseNum("1.250.000")).toBe(1250000));
test("0.95 continua decimal", () => expect(parseNum("0.95")).toBe(0.95));
test("12.5 continua decimal", () => expect(parseNum("12.5")).toBe(12.5));
test("milhar com centavos", () => expect(parseNum("1.500,50")).toBe(1500.5));
