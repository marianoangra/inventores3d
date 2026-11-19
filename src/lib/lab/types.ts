import type { FeeOverride } from "./fees";

export type WorkshopSettings = {
  kwhPrice: number;
  laborHourly: number;
  lossPct: number;
  packaging: number;
  marginPct: number;
  feeOverrides: FeeOverride;
  printHoursPerDay?: number;
  businessName?: string | null;
};
export type Printer = { id: string; name: string; price: number; lifeHours: number; watts: number };
export type Filament = { id: string; type: string; color: string | null; spoolPrice: number; spoolGrams: number; gramsLeft?: number | null };
export type PartDraft = {
  id?: string;
  name: string;
  photoUrl?: string | null;
  grams: number;
  printMinutes: number;
  laborMinutes: number;
  packaging: number;
  printerId: string | null;
  filamentId: string | null;
  marginPct: number;
};
