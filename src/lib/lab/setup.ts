/** O que ainda falta criar na oficina inicial (cada parte é conferida separadamente, pra uma falha não travar a conta). */
export function setupPlan(c: { printers: number; filaments: number; settings: number }) {
  return { printer: c.printers === 0, filament: c.filaments === 0, settings: c.settings === 0 };
}
