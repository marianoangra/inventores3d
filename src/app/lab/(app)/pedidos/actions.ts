"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/lab/data";
import { listParts } from "@/lib/lab/parts-data";
import { isStoreOwner } from "@/lib/shop/owner";
import { getOrderById } from "@/lib/shop/orders-data";
import { todayBR } from "@/lib/lab/results";
import type { FormState } from "@/components/lab/ActionForm";

async function owner() {
  const user = await getUser();
  return user && isStoreOwner(user.email) ? user : null;
}
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

export async function shipOrder(_: FormState, f: FormData): Promise<FormState> {
  if (!(await owner())) return { error: "Sem permissão." };
  const tracking = String(f.get("tracking") ?? "").trim().toUpperCase().slice(0, 40) || null;
  const now = new Date().toISOString();
  const { data, error } = await createAdminClient()
    .from("store_orders")
    .update({ status: "enviado", tracking_code: tracking, shipped_at: now, updated_at: now })
    .eq("id", String(f.get("id")))
    .eq("status", "pago")
    .select("id");
  if (error) return { error: "Não deu pra atualizar." };
  if (!data?.length) return { error: "Só pedido pago pode ser marcado como enviado." };
  revalidatePath("/lab/pedidos");
  return { ok: "Marcado como enviado!" };
}

/** Pedido pago → vendas (venda direta) + ordens na fila de produção, na conta do dono (com a sessão dele, RLS normal). */
export async function syncToLab(_: FormState, f: FormData): Promise<FormState> {
  if (!(await owner())) return { error: "Sem permissão." };
  const o = await getOrderById(String(f.get("id")));
  if (!o) return { error: "Pedido não encontrado." };
  if (o.status !== "pago" && o.status !== "enviado") return { error: "Só pedido pago vai pro Lab." };
  const admin = createAdminClient();
  // trava antes: clique duplo não lança duas vezes
  const { data: locked } = await admin.from("store_orders").update({ lab_synced_at: new Date().toISOString() }).eq("id", o.id).is("lab_synced_at", null).select("id");
  if (!locked?.length) return { error: "Esse pedido já foi lançado no Lab." };

  const supabase = await createClient();
  const parts = await listParts();
  const byName = new Map(parts.map((p) => [norm(p.name), p]));
  const factor = o.subtotal > 0 ? (o.subtotal - o.discount) / o.subtotal : 1; // desconto do Pix dividido entre os itens
  const soldOn = (o.paidAt ? new Date(Date.parse(o.paidAt) - 3 * 3600e3).toISOString().slice(0, 10) : todayBR());
  let matched = 0;
  for (const l of o.items) {
    const part = byName.get(norm(l.name));
    if (part) matched++;
    const desc = `${l.name} (${l.colorLabel})${l.note ? ` — ${l.note}` : ""}`.slice(0, 80);
    const { data: sale, error } = await supabase
      .from("sales")
      .insert({
        part_id: part?.id ?? null,
        description: part ? part.name : desc,
        qty: l.qty,
        unit_price: Math.round(l.unit * factor * 100) / 100,
        unit_cost: part?.unitCost ?? 0,
        print_minutes: part?.printMinutes ?? 0,
        channel: "direto",
        sold_on: soldOn,
        unit_fee: 0,
      })
      .select("id")
      .single();
    if (error || !sale) {
      await admin.from("store_orders").update({ lab_synced_at: null }).eq("id", o.id);
      return { error: "Não deu pra lançar as vendas. Confira em Vendas antes de tentar de novo." };
    }
    await supabase.from("production_jobs").insert({
      sale_id: sale.id,
      part_id: part?.id ?? null,
      filament_id: part?.filamentId ?? null,
      description: desc,
      qty: l.qty,
      print_minutes: part ? part.printMinutes * l.qty : 0,
      grams: part ? Math.round(part.grams * l.qty * 10) / 10 : 0,
      notes: `Site ${o.code} — ${o.customerName}`.slice(0, 200),
    });
  }
  revalidatePath("/lab", "layout");
  const miss = o.items.length - matched;
  return { ok: `Lançado em Vendas e na Produção!${miss ? ` ${miss} item(ns) sem peça com o mesmo nome em Minhas peças: entraram sem custo/tempo.` : ""}` };
}
