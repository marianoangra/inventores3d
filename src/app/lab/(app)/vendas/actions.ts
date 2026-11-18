"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { buildExpense, buildSale } from "@/lib/lab/entries";
import { getPart } from "@/lib/lab/parts-data";
import type { FormState } from "@/components/lab/ActionForm";

const s = (f: FormData, k: string) => String(f.get(k) ?? "");

export async function addSale(_: FormState, f: FormData): Promise<FormState> {
  const partId = s(f, "partId") || null;
  const part = partId ? await getPart(partId) : null;
  const row = buildSale(
    { partId, description: s(f, "description"), qty: s(f, "qty"), unitPrice: s(f, "unitPrice"), unitCost: s(f, "unitCost"), channel: s(f, "channel"), soldOn: s(f, "soldOn") },
    part ? { id: part.id, name: part.name, unitCost: part.unitCost, printMinutes: part.printMinutes } : null,
  );
  if ("error" in row) return { error: row.error };
  const supabase = await createClient();
  const { error } = await supabase.from("sales").insert(row);
  if (error) return { error: "Não deu pra salvar a venda." };
  revalidatePath("/lab", "layout");
  return { ok: "Venda lançada!" };
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
