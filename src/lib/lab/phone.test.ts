import { expect, test } from "vitest";
import { normalizeWhatsapp, formatWhatsapp } from "./phone";

test("celular com DDD e máscara vira 55+dígitos", () => expect(normalizeWhatsapp("(11) 91234-5678")).toBe("5511912345678"));
test("já com 55 fica igual", () => expect(normalizeWhatsapp("+55 11 91234-5678")).toBe("5511912345678"));
test("vazio é null (campo opcional)", () => expect(normalizeWhatsapp("  ")).toBeNull());
test("curto demais é inválido", () => expect(normalizeWhatsapp("123")).toBe("invalid"));
test("fixo sem 9 é inválido", () => expect(normalizeWhatsapp("(11) 3123-4567")).toBe("invalid"));
test("formata pra exibir", () => expect(formatWhatsapp("5511912345678")).toBe("(11) 91234-5678"));
