import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Job, JobStatus } from "./production";
import type { Quote, QuoteItem, QuoteKind } from "./quote";

type Row = Record<string, unknown>;
const str = (v: unknown) => (v === null || v === undefined ? null : String(v));

export const toJob = (r: Row): Job => ({
  id: String(r.id),
  saleId: str(r.sale_id),
  partId: str(r.part_id),
  filamentId: str(r.filament_id),
  description: String(r.description),
  qty: Number(r.qty),
  printMinutes: Number(r.print_minutes),
  grams: Number(r.grams),
  plates: Number(r.plates),
  status: r.status as JobStatus,
  dueOn: str(r.due_on),
  notes: str(r.notes),
  startedAt: str(r.started_at),
  finishedAt: str(r.finished_at),
  deliveredAt: str(r.delivered_at),
  createdAt: String(r.created_at),
});

/** Ordens abertas + entregues dos últimos 30 dias. */
export async function listJobs(): Promise<Job[]> {
  const supabase = await createClient();
  const since = new Date(Date.now() - 30 * 86400000).toISOString();
  const { data } = await supabase.from("production_jobs").select("*").or(`status.neq.entregue,delivered_at.gte.${since}`).order("created_at");
  return (data ?? []).map(toJob);
}

const toItems = (v: unknown): QuoteItem[] =>
  Array.isArray(v)
    ? v.map((i: Row) => ({ partId: str(i.partId), description: String(i.description ?? ""), qty: Number(i.qty) || 0, unitPrice: Number(i.unitPrice) || 0 }))
    : [];

export const toQuote = (r: Row): Quote => ({
  id: String(r.id),
  number: Number(r.number),
  kind: r.kind as QuoteKind,
  customerName: String(r.customer_name),
  customerPhone: str(r.customer_phone),
  items: toItems(r.items),
  discount: Number(r.discount),
  shipping: Number(r.shipping),
  notes: str(r.notes),
  validDays: Number(r.valid_days),
  convertedAt: str(r.converted_at),
  createdAt: String(r.created_at),
});

export async function listQuotes(): Promise<Quote[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("quotes").select("*").order("created_at", { ascending: false }).limit(100);
  return (data ?? []).map(toQuote);
}

export async function getQuote(id: string): Promise<Quote | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("quotes").select("*").eq("id", id).maybeSingle();
  return data ? toQuote(data) : null;
}
