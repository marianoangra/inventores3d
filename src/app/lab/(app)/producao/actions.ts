"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getPart } from "@/lib/lab/parts-data";
import { parseNum } from "@/lib/lab/num";
import { deductStock, NEXT_STATUS, type JobStatus } from "@/lib/lab/production";
import type { FormState } from "@/components/lab/ActionForm";

const s = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);

export async function addJob(_: FormState, f: FormData): Promise<FormState> {
  const partId = s(f, "partId") || null;
  const qty = parseNum(s(f, "qty"));
  const plates = s(f, "plates") ? parseNum(s(f, "plates")) : 1;
  const due = s(f, "dueOn");
  if (qty === null || !Number.isInteger(qty) || qty < 1) return { error: "Quantidade: número inteiro (1, 2, 3…)." };
  if (plates === null || !Number.isInteger(plates) || plates < 1) return { error: "Placas: número inteiro, mínimo 1." };
  if (due && !isDate(due)) return { error: "Prazo inválido." };
  let row: Record<string, unknown>;
  if (partId) {
    const part = await getPart(partId);
    if (!part) return { error: "Peça não encontrada." };
    row = { part_id: part.id, filament_id: part.filamentId, description: part.name, qty, print_minutes: part.printMinutes * qty, grams: Math.round(part.grams * qty * 10) / 10 };
  } else {
    const description = s(f, "description").slice(0, 80);
    const hours = parseNum(s(f, "hours"));
    const grams = s(f, "grams") ? parseNum(s(f, "grams")) : 0;
    if (!description) return { error: "Escolha uma peça ou descreva o que vai imprimir." };
    if (hours === null || hours < 0) return { error: "Informe as horas de impressão (ex.: 2,5)." };
    if (grams === null || grams < 0) return { error: "Gramas inválidas." };
    row = { part_id: null, description, qty, print_minutes: Math.round(hours * 60), grams };
  }
  const supabase = await createClient();
  const { error } = await supabase.from("production_jobs").insert({ ...row, plates, due_on: due || null, notes: s(f, "notes").slice(0, 200) || null });
  if (error) return { error: "Não deu pra criar a ordem." };
  revalidatePath("/lab", "layout");
  return { ok: "Ordem na fila!" };
}

/** Avança a ordem: fila → imprimindo → pronto (desconta filamento) → entregue. */
export async function advanceJob(_: FormState, f: FormData): Promise<FormState> {
  const supabase = await createClient();
  const { data: job } = await supabase.from("production_jobs").select("id, status, filament_id, grams").eq("id", s(f, "id")).maybeSingle();
  if (!job) return { error: "Ordem não encontrada." };
  const next = NEXT_STATUS[job.status as JobStatus];
  if (!next) return { error: "Essa ordem já foi entregue." };
  const now = new Date().toISOString();
  const stamp = next === "imprimindo" ? { started_at: now } : next === "pronto" ? { finished_at: now } : { delivered_at: now };
  // só avança se ninguém mexeu antes (evita descontar filamento duas vezes com clique duplo)
  const { data: moved, error } = await supabase.from("production_jobs").update({ status: next, ...stamp }).eq("id", job.id).eq("status", job.status).select("id");
  if (error) return { error: "Não deu pra atualizar." };
  if (!moved?.length) return { ok: "Já estava atualizada." };
  let msg = next === "imprimindo" ? "Bora imprimir!" : next === "pronto" ? "Pronto!" : "Entregue!";
  if (next === "pronto" && job.filament_id && Number(job.grams) > 0) {
    const { data: fil } = await supabase.from("filaments").select("grams_left").eq("id", job.filament_id).maybeSingle();
    const left = deductStock(fil?.grams_left === null || fil?.grams_left === undefined ? null : Number(fil.grams_left), Number(job.grams));
    if (left !== null) {
      await supabase.from("filaments").update({ grams_left: left }).eq("id", job.filament_id);
      msg += ` Descontei ${Number(job.grams)} g do rolo (sobram ${left} g).`;
    }
  }
  revalidatePath("/lab", "layout");
  return { ok: msg };
}

export async function deleteJob(_: FormState, f: FormData): Promise<FormState> {
  const supabase = await createClient();
  const { error } = await supabase.from("production_jobs").delete().eq("id", s(f, "id"));
  if (error) return { error: "Não deu pra excluir." };
  revalidatePath("/lab", "layout");
  return { ok: "Excluída." };
}
