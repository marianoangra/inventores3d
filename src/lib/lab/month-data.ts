import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getWorkshop } from "./data";
import { resolveFees, type Channel } from "./fees";
import { monthRange, monthSummary, type MonthSummary, type SaleRow } from "./results";

export type SaleItem = SaleRow & { id: string; soldOn: string };
export type ExpenseItem = { id: string; description: string; category: string; amount: number; spentOn: string };

export async function getMonth(m?: string | null): Promise<{ key: string; label: string; summary: MonthSummary; sales: SaleItem[]; expenses: ExpenseItem[] }> {
  const range = monthRange(m);
  const supabase = await createClient();
  const [{ settings }, s, e] = await Promise.all([
    getWorkshop(),
    supabase.from("sales").select("*").gte("sold_on", range.start).lt("sold_on", range.end).order("sold_on", { ascending: false }).order("created_at", { ascending: false }),
    supabase.from("expenses").select("*").gte("spent_on", range.start).lt("spent_on", range.end).order("spent_on", { ascending: false }).order("created_at", { ascending: false }),
  ]);
  const sales: SaleItem[] = (s.data ?? []).map((r) => ({
    id: r.id,
    partId: r.part_id,
    description: r.description,
    qty: Number(r.qty),
    unitPrice: Number(r.unit_price),
    unitCost: Number(r.unit_cost),
    printMinutes: Number(r.print_minutes),
    channel: r.channel as Channel,
    soldOn: r.sold_on,
  }));
  const expenses: ExpenseItem[] = (e.data ?? []).map((r) => ({ id: r.id, description: r.description, category: r.category, amount: Number(r.amount), spentOn: r.spent_on }));
  return { key: range.key, label: range.label, summary: monthSummary(sales, expenses, resolveFees(settings.feeOverrides)), sales, expenses };
}

export { todayBR } from "./results";
