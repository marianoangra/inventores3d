import { expect, test } from "vitest";
import { setupPlan } from "./setup";

test("conta nova cria tudo", () => expect(setupPlan({ printers: 0, filaments: 0, settings: 0 })).toEqual({ printer: true, filament: true, settings: true }));
test("tentativa anterior criou só a impressora: cria o resto", () =>
  expect(setupPlan({ printers: 1, filaments: 0, settings: 0 })).toEqual({ printer: false, filament: true, settings: true }));
test("oficina completa não cria nada", () => expect(setupPlan({ printers: 2, filaments: 1, settings: 1 })).toEqual({ printer: false, filament: false, settings: false }));
