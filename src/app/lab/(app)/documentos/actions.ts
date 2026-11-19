"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buildQuote } from "@/lib/lab/quote";
import { getQuote } from "@/lib/lab/ops-data";
import { listParts } from "@/lib/lab/parts-data";
import { getWorkshop } from "@/lib/lab/data";
import { resolveFees } from "@/lib/lab/fees";
import { unitFee } from "@/lib/lab/entries";
import { todayBR } from "@/lib/lab/results";
import type { FormState } from "@/components/lab/ActionForm";

const s = (f: FormData, k: string) => String(f.get(k) ?? "");

export async function createQuote(_: FormState, f: FormData): Promise<FormState> {
  let items: unknown[] = [];
  try {
    items = JSON.parse(s(f, "items"));
  } catch {}
  const q = buildQuote({
    kind: s(f, "kind"),
    customerName: s(f, "customerName"),
    customerPhone: s(f, "customerPhone"),
    items: Array.isArray(items) ? (items as Record<string, unknown>[]) : [],
    discount: s(f, "discount"),
    shipping: s(f, "shipping"),
    notes: s(f, "notes"),
    validDays: s(f, "validDays"),
  });
  if ("error" in q) return { error: q.error };
  const supabase = await createClient();
  // número sequencial por pessoa; a constraint unique segura corrida (tenta de novo)
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: last } = await supabase.from("quotes").select("number").order("number", { ascending: false }).limit(1).maybeSingle();
    const { data, error } = await supabase.from("quotes").insert({ ...q, number: (last?.number ?? 0) + 1 }).select("id").single();
    if (data) {
      revalidatePath("/lab/documentos");
      redirect(`/lab/documentos/${data.id}`);
    }
    if (error?.code !== "23505") break;
  }
  return { error: "Não deu pra salvar o documento." };
}

export async function deleteQuote(_: FormState, f: FormData): Promise<FormState> {
  const supabase = await createClient();
  const { error } = await supabase.from("quotes").delete().eq("id", s(f, "id"));
  if (error) return { error: "Não deu pra excluir." };
  revalidatePath("/lab/documentos");
  redirect("/lab/documentos");
}

/** Orçamento aprovado → lança as vendas (venda direta, hoje) e põe as peças na fila. */
export async function convertQuote(_: FormState, f: FormData): Promise<FormState> {
  const q = await getQuote(s(f, "id"));
  if (!q) return { error: "Documento não encontrado." };
  if (q.convertedAt) return { error: "Esse já virou venda." };
  const supabase = await createClient();
  // trava primeiro: clique duplo não lança duas vezes
  const { data: locked } = await supabase.from("quotes").update({ converted_at: new Date().toISOString() }).eq("id", q.id).is("converted_at", null).select("id");
  if (!locked?.length) return { error: "Esse já virou venda." };

  const [parts, { settings }] = await Promise.all([listParts(), getWorkshop()]);
  const fee = resolveFees(settings.feeOverrides).direto;
  const byId = new Map(parts.map((p) => [p.id, p]));
  // desconto distribuído proporcionalmente no preço de cada item (frete não é receita da peça)
  const subtotal = q.items.reduce((acc, i) => acc + i.qty * i.unitPrice, 0);
  const factor = subtotal > 0 ? Math.max(0, (subtotal - q.discount) / subtotal) : 1;
  const today = todayBR();
  let queued = 0;
  for (const i of q.items) {
    const part = i.partId ? byId.get(i.partId) : undefined;
    const price = Math.round(i.unitPrice * factor * 100) / 100;
    const { data: sale, error } = await supabase
      .from("sales")
      .insert({
        part_id: part?.id ?? null,
        description: part?.name ?? i.description,
        qty: i.qty,
        unit_price: price,
        unit_cost: part?.unitCost ?? 0,
        print_minutes: part?.printMinutes ?? 0,
        channel: "direto",
        sold_on: today,
        unit_fee: unitFee(fee, price),
      })
      .select("id")
      .single();
    if (error || !sale) {
      await supabase.from("quotes").update({ converted_at: null }).eq("id", q.id);
      return { error: "Não deu pra lançar as vendas. Confira em Vendas antes de tentar de novo." };
    }
    if (part) {
      await supabase.from("production_jobs").insert({
        sale_id: sale.id,
        part_id: part.id,
        filament_id: part.filamentId,
        description: part.name,
        qty: i.qty,
        print_minutes: part.printMinutes * i.qty,
        grams: Math.round(part.grams * i.qty * 10) / 10,
        notes: `Pedido de ${q.customerName}`.slice(0, 200),
      });
      queued++;
    }
  }
  revalidatePath("/lab", "layout");
  return { ok: `Vendas lançadas${queued ? ` e ${queued} ordem(ns) na fila de produção` : ""}!` };
}
