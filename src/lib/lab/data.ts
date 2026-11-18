import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Filament, Printer, WorkshopSettings } from "./types";
import type { FeeOverride } from "./fees";

export type Profile = {
  id: string;
  name: string;
  printerModel: string | null;
  whatsapp: string | null;
  joinedGroup: boolean;
  onboardedAt: string | null;
};

type Row = Record<string, unknown>;
const num = (v: unknown) => Number(v ?? 0);

export const toPrinter = (r: Row): Printer => ({ id: String(r.id), name: String(r.name), price: num(r.price), lifeHours: num(r.life_hours), watts: num(r.watts) });
export const toFilament = (r: Row): Filament => ({
  id: String(r.id),
  type: String(r.type),
  color: (r.color as string | null) ?? null,
  spoolPrice: num(r.spool_price),
  spoolGrams: num(r.spool_grams),
});
export const toWorkshop = (r: Row): WorkshopSettings => ({
  kwhPrice: num(r.kwh_price),
  laborHourly: num(r.labor_hourly),
  lossPct: num(r.loss_pct),
  packaging: num(r.packaging),
  marginPct: num(r.margin_pct),
  feeOverrides: (r.fee_overrides as FeeOverride) ?? {},
});

/** Usuário logado (uma chamada por request). */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
});

export const getProfile = cache(async (): Promise<Profile | null> => {
  const user = await getUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    name: data.name ?? "",
    printerModel: data.printer_model,
    whatsapp: data.whatsapp,
    joinedGroup: !!data.joined_group,
    onboardedAt: data.onboarded_at,
  };
});

/** Para páginas do Lab: exige login e boas-vindas concluída. */
export async function requireOnboarded(): Promise<Profile> {
  const user = await getUser();
  if (!user) redirect("/lab/entrar");
  const profile = await getProfile();
  if (!profile?.onboardedAt) redirect("/lab/boas-vindas");
  return profile;
}

export const getWorkshop = cache(async (): Promise<{ settings: WorkshopSettings; printers: Printer[]; filaments: Filament[]; reviewed: boolean }> => {
  const supabase = await createClient();
  const [s, p, f] = await Promise.all([
    supabase.from("workshop_settings").select("*").maybeSingle(),
    supabase.from("printers").select("*").order("created_at"),
    supabase.from("filaments").select("*").order("created_at"),
  ]);
  return {
    settings: s.data ? toWorkshop(s.data) : { kwhPrice: 0.95, laborHourly: 20, lossPct: 5, packaging: 2, marginPct: 80, feeOverrides: {} },
    printers: (p.data ?? []).map(toPrinter),
    filaments: (f.data ?? []).map(toFilament),
    reviewed: !!s.data?.reviewed_at,
  };
});
