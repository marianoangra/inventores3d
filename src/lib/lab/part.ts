import { resolveFees, type Channel } from "./fees";
import { computeCost, quote } from "./pricing";
import type { Filament, PartDraft, Printer, WorkshopSettings } from "./types";

export type BuiltPart = { unitCost: number; prices: Record<Channel, number | null>; profitPerHour: Record<Channel, number | null> };

/** Recalcula a peça a partir dos dados do próprio usuário (o servidor não confia no navegador). */
export function buildPart(d: PartDraft, ws: WorkshopSettings, printer: Printer | null, filament: Filament | null): BuiltPart | { error: string } {
  if (!d.name.trim()) return { error: "Dê um nome pra peça." };
  if (!printer) return { error: "Escolha uma impressora da sua oficina." };
  if (!filament) return { error: "Escolha um filamento da sua oficina." };
  if (!(d.printMinutes > 0)) return { error: "Informe o tempo de impressão." };
  const cost = computeCost({
    grams: d.grams,
    printMinutes: d.printMinutes,
    laborMinutes: d.laborMinutes,
    spoolPrice: filament.spoolPrice,
    spoolGrams: filament.spoolGrams,
    printerPrice: printer.price,
    printerLifeHours: printer.lifeHours,
    printerWatts: printer.watts,
    kwhPrice: ws.kwhPrice,
    laborHourly: ws.laborHourly,
    lossPct: ws.lossPct,
    packaging: d.packaging,
  });
  if ("error" in cost) return cost;
  if (!(d.marginPct >= 0)) return { error: "Informe o lucro desejado." };
  const qs = quote(cost.total, d.marginPct, d.printMinutes, resolveFees(ws.feeOverrides));
  const prices = {} as Record<Channel, number | null>;
  const profitPerHour = {} as Record<Channel, number | null>;
  for (const q of qs) {
    prices[q.channel] = "price" in q ? q.price : null;
    profitPerHour[q.channel] = "price" in q ? q.profitPerMachineHour : null;
  }
  return { unitCost: Math.round(cost.total * 100) / 100, prices, profitPerHour };
}

/** Id a mandar no salvar: a peça em edição, ou a que acabou de ser criada nesta tela (evita duplicar). */
export function draftId(initialId: string | undefined, savedId: string | null): string | undefined {
  return initialId ?? savedId ?? undefined;
}
