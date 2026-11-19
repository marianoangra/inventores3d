"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { buildExpense, buildSale } from "@/lib/lab/entries";
import { getPart } from "@/lib/lab/parts-data";
import { getWorkshop } from "@/lib/lab/data";
import { resolveFees } from "@/lib/lab/fees";
import type { FormState } from "@/components/lab/ActionForm";

const s = (f: FormData, k: string) => String(f.get(k) ?? "");

export async function addSale(_: FormState, f: FormData): Promise<FormState> {
  const partId = s(f, "partId") || null;
  const [part, { settings }] = await Promise.all([partId ? getPart(partId) : null, getWorkshop()]);
  const row = buildSale(
    { partId, description: s(f, "description"), qty: s(f, "qty"), unitPrice: s(f, "unitPrice"), unitCost: s(f, "unitCost"), channel: s(f, "channel"), soldOn: s(f, "soldOn") },
    part ? { id: part.id, name: part.name, unitCost: part.unitCost, printMinutes: part.printMinutes } : null,
    resolveFees(settings.feeOverrides),
  );
  if ("error" in row) return { error: row.error };
  const supabase = await createClient();
  const { data: sale, error } = await supabase.from("sales").insert(row).select("id").single();
  if (error || !sale) return { error: "Não deu pra salvar a venda." };
  let ok = "Venda lançada!";
  if (part && f.get("toQueue") === "on") {
    const { error: e2 } = await supabase.from("production_jobs").insert({
      sale_id: sale.id,
      part_id: part.id,
      filament_id: part.filamentId,
      description: part.name,
      qty: row.qty,
      print_minutes: part.printMinutes * row.qty,
      grams: Math.round(part.grams * row.qty * 10) / 10,
    });
    ok = e2 ? "Venda lançada, mas não entrou na fila — crie a ordem em Produção." : "Venda lançada e na fila de produção!";
  }
  revalidatePath("/lab", "layout");
  return { ok };
}

export async function deleteSale(_: FormState, f: FormData): Promise<FormState> {
  const supabase = await createClient();
  const { error } = await supabase.from("sales").delete().eq("id", s(f, "id"));
  if (error) return { error: "Não deu pra excluir." };
  revalidatePath("/lab", "layout");
  return { ok: "Excluída." };
}

export async function addExpense(_: FormState, f: FormData): Promise<FormState> {
  const row = buildExpense({ description: s(f, "description"), category: s(f, "category"), amount: s(f, "amount"), spentOn: s(f, "spentOn") });
  if ("error" in row) return { error: row.error };
  const supabase = await createClient();
  const { error } = await supabase.from("expenses").insert(row);
  if (error) return { error: "Não deu pra salvar a despesa." };
  revalidatePath("/lab", "layout");
  return { ok: "Despesa lançada!" };
}

export async function deleteExpense(_: FormState, f: FormData): Promise<FormState> {
  const supabase = await createClient();
  const { error } = await supabase.from("expenses").delete().eq("id", s(f, "id"));
  if (error) return { error: "Não deu pra excluir." };
  revalidatePath("/lab", "layout");
  return { ok: "Excluída." };
}
