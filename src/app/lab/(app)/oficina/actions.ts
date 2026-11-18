"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { parseNum } from "@/lib/lab/num";
import type { FeeOverride } from "@/lib/lab/fees";
import type { FormState } from "@/components/lab/ActionForm";

const n = (f: FormData, k: string) => parseNum(String(f.get(k) ?? ""));
const done = (ok: string): FormState => (revalidatePath("/lab", "layout"), { ok });

export async function saveSettings(_: FormState, f: FormData): Promise<FormState> {
  const v = { kwh_price: n(f, "kwh"), labor_hourly: n(f, "labor"), loss_pct: n(f, "loss"), packaging: n(f, "packaging"), margin_pct: n(f, "margin") };
  if (Object.values(v).some((x) => x === null || x < 0)) return { error: "Preencha todos os campos com números (ex.: 0,95)." };
  if (v.loss_pct! > 100) return { error: "Perdas vão de 0 a 100%." };
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: "Sessão expirou. Entre de novo." };
  const { error } = await supabase.from("workshop_settings").upsert({ user_id: data.user.id, ...v, reviewed_at: new Date().toISOString() }, { onConflict: "user_id" });
  return error ? { error: "Não deu pra salvar." } : done("Salvo!");
}

export async function savePrinter(_: FormState, f: FormData): Promise<FormState> {
  const id = String(f.get("id") ?? "") || null;
  const name = String(f.get("name") ?? "").trim().slice(0, 60);
  const v = { price: n(f, "price"), life_hours: n(f, "life"), watts: n(f, "watts") };
  if (!name) return { error: "Dê um nome pra impressora." };
  if (v.price === null || v.price < 0 || !v.life_hours || v.life_hours <= 0 || v.watts === null || v.watts < 0) return { error: "Confira preço, vida útil (maior que zero) e consumo." };
  const supabase = await createClient();
  const { error } = id ? await supabase.from("printers").update({ name, ...v }).eq("id", id) : await supabase.from("printers").insert({ name, ...v });
  return error ? { error: "Não deu pra salvar." } : done(id ? "Salvo!" : "Impressora adicionada!");
}

export async function deletePrinter(_: FormState, f: FormData): Promise<FormState> {
  const supabase = await createClient();
  const { count } = await supabase.from("printers").select("id", { count: "exact", head: true });
  if ((count ?? 0) <= 1) return { error: "Você precisa de pelo menos uma impressora." };
  const { error } = await supabase.from("printers").delete().eq("id", String(f.get("id")));
  return error ? { error: "Não deu pra excluir." } : done("Excluída.");
}

export async function saveFilament(_: FormState, f: FormData): Promise<FormState> {
  const id = String(f.get("id") ?? "") || null;
  const type = String(f.get("type") ?? "").trim().slice(0, 30);
  const color = String(f.get("color") ?? "").trim().slice(0, 30) || null;
  const v = { spool_price: n(f, "price"), spool_grams: n(f, "grams") };
  if (!type) return { error: "Qual o tipo? (PLA, PETG…)" };
  if (v.spool_price === null || v.spool_price < 0 || !v.spool_grams || v.spool_grams <= 0) return { error: "Confira o preço e o peso do rolo (maior que zero)." };
  const supabase = await createClient();
  const { error } = id ? await supabase.from("filaments").update({ type, color, ...v }).eq("id", id) : await supabase.from("filaments").insert({ type, color, ...v });
  return error ? { error: "Não deu pra salvar." } : done(id ? "Salvo!" : "Filamento adicionado!");
}

export async function deleteFilament(_: FormState, f: FormData): Promise<FormState> {
  const supabase = await createClient();
  const { count } = await supabase.from("filaments").select("id", { count: "exact", head: true });
  if ((count ?? 0) <= 1) return { error: "Você precisa de pelo menos um filamento." };
  const { error } = await supabase.from("filaments").delete().eq("id", String(f.get("id")));
  return error ? { error: "Não deu pra excluir." } : done("Excluído.");
}

export async function saveFees(_: FormState, f: FormData): Promise<FormState> {
  const o: FeeOverride = {};
  for (const ch of ["shopee", "ml"] as const) {
    const pct = String(f.get(`${ch}_pct`) ?? "").trim();
    const fixed = String(f.get(`${ch}_fixed`) ?? "").trim();
    const p = pct ? parseNum(pct) : undefined;
    const x = fixed ? parseNum(fixed) : undefined;
    if (p === null || x === null || (p !== undefined && (p < 0 || p >= 100)) || (x !== undefined && x < 0)) return { error: "Taxas: percentual de 0 a 99 e valor fixo positivo." };
    if (p !== undefined || x !== undefined) o[ch] = { ...(p !== undefined ? { pct: p / 100 } : {}), ...(x !== undefined ? { fixed: x } : {}) };
  }
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: "Sessão expirou. Entre de novo." };
  const { error } = await supabase.from("workshop_settings").upsert({ user_id: data.user.id, fee_overrides: o }, { onConflict: "user_id" });
  return error ? { error: "Não deu pra salvar." } : done(Object.keys(o).length ? "Taxas personalizadas salvas!" : "Voltou pras taxas padrão.");
}
