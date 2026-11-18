"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getWorkshop } from "@/lib/lab/data";
import { buildPart } from "@/lib/lab/part";
import type { PartDraft } from "@/lib/lab/types";
import type { FormState } from "@/components/lab/ActionForm";

const clean = (d: PartDraft): PartDraft => ({
  id: d.id || undefined,
  name: String(d.name ?? "").trim().slice(0, 80),
  photoUrl: null,
  grams: Number(d.grams),
  printMinutes: Math.round(Number(d.printMinutes)),
  laborMinutes: Math.round(Number(d.laborMinutes) || 0),
  packaging: Number(d.packaging) || 0,
  printerId: d.printerId,
  filamentId: d.filamentId,
  marginPct: Number(d.marginPct),
});

export async function savePart(input: PartDraft): Promise<{ error?: string; id?: string }> {
  const d = clean(input);
  const { settings, printers, filaments } = await getWorkshop();
  const built = buildPart(d, settings, printers.find((p) => p.id === d.printerId) ?? null, filaments.find((f) => f.id === d.filamentId) ?? null);
  if ("error" in built) return { error: built.error };
  const row = {
    name: d.name,
    grams: d.grams,
    print_minutes: d.printMinutes,
    labor_minutes: d.laborMinutes,
    packaging: d.packaging,
    printer_id: d.printerId,
    filament_id: d.filamentId,
    margin_pct: d.marginPct,
    unit_cost: built.unitCost,
    prices: { ...built.prices, pph: built.profitPerHour },
  };
  const supabase = await createClient();
  const r = d.id ? await supabase.from("parts").update(row).eq("id", d.id).select("id").maybeSingle() : await supabase.from("parts").insert(row).select("id").single();
  if (r.error || !r.data) return { error: "Não deu pra salvar a peça." };
  revalidatePath("/lab", "layout");
  return { id: r.data.id };
}

export async function duplicatePart(_: FormState, f: FormData): Promise<FormState> {
  const supabase = await createClient();
  const { data } = await supabase.from("parts").select("*").eq("id", String(f.get("id"))).maybeSingle();
  if (!data) return { error: "Peça não encontrada." };
  const { id: _id, created_at: _c, user_id: _u, ...rest } = data;
  void _id; void _c; void _u;
  const { error } = await supabase.from("parts").insert({ ...rest, name: `${data.name} (cópia)`.slice(0, 80) });
  if (error) return { error: "Não deu pra duplicar." };
  revalidatePath("/lab", "layout");
  return { ok: "Duplicada!" };
}

export async function deletePart(_: FormState, f: FormData): Promise<FormState> {
  const supabase = await createClient();
  const { error } = await supabase.from("parts").delete().eq("id", String(f.get("id")));
  if (error) return { error: "Não deu pra excluir." };
  revalidatePath("/lab", "layout");
  redirect("/lab/pecas");
}
