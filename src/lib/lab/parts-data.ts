import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Channel } from "./fees";
import type { PartDraft } from "./types";

export type PartItem = PartDraft & {
  id: string;
  unitCost: number;
  prices: Record<Channel, number | null>;
  pph: Record<Channel, number | null>;
};

type Row = Record<string, unknown> & { prices?: Record<string, unknown> };

export const toPart = (r: Row): PartItem => {
  const p = (r.prices ?? {}) as Record<string, unknown>;
  const pph = (p.pph ?? {}) as Record<string, number | null>;
  const price = (k: Channel) => (typeof p[k] === "number" ? (p[k] as number) : null);
  return {
    id: String(r.id),
    name: String(r.name),
    photoUrl: (r.photo_url as string | null) ?? null,
    grams: Number(r.grams),
    printMinutes: Number(r.print_minutes),
    laborMinutes: Number(r.labor_minutes),
    packaging: Number(r.packaging),
    printerId: (r.printer_id as string | null) ?? null,
    filamentId: (r.filament_id as string | null) ?? null,
    marginPct: Number(r.margin_pct),
    unitCost: Number(r.unit_cost),
    prices: { direto: price("direto"), shopee: price("shopee"), ml: price("ml") },
    pph: { direto: pph.direto ?? null, shopee: pph.shopee ?? null, ml: pph.ml ?? null },
  };
};

export async function listParts(): Promise<PartItem[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("parts").select("*").order("created_at", { ascending: false });
  return (data ?? []).map(toPart);
}

export async function getPart(id: string): Promise<PartItem | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("parts").select("*").eq("id", id).maybeSingle();
  return data ? toPart(data) : null;
}
