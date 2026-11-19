import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderLine, OrderStatus } from "./order";

export type StoreOrder = {
  id: string;
  code: string;
  env: "sandbox" | "producao";
  status: OrderStatus;
  items: OrderLine[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  payMethod: "pix" | "cartao";
  installments: number;
  customerName: string;
  cpf: string;
  email: string;
  whatsapp: string;
  cep: string;
  street: string;
  number: string;
  complement: string | null;
  district: string | null;
  city: string;
  uf: string;
  notes: string | null;
  invoiceUrl: string | null;
  error: string | null;
  trackingCode: string | null;
  paidAt: string | null;
  shippedAt: string | null;
  labSyncedAt: string | null;
  createdAt: string;
};

type Row = Record<string, unknown>;
const s = (v: unknown) => (v === null || v === undefined ? null : String(v));

export const toOrder = (r: Row): StoreOrder => ({
  id: String(r.id),
  code: String(r.code),
  env: r.env as StoreOrder["env"],
  status: r.status as OrderStatus,
  items: Array.isArray(r.items) ? (r.items as OrderLine[]) : [],
  subtotal: Number(r.subtotal),
  discount: Number(r.discount),
  shipping: Number(r.shipping),
  total: Number(r.total),
  payMethod: r.pay_method as StoreOrder["payMethod"],
  installments: Number(r.installments),
  customerName: String(r.customer_name),
  cpf: String(r.cpf),
  email: String(r.email),
  whatsapp: String(r.whatsapp),
  cep: String(r.cep),
  street: String(r.street),
  number: String(r.number),
  complement: s(r.complement),
  district: s(r.district),
  city: String(r.city),
  uf: String(r.uf),
  notes: s(r.notes),
  invoiceUrl: s(r.invoice_url),
  error: s(r.error),
  trackingCode: s(r.tracking_code),
  paidAt: s(r.paid_at),
  shippedAt: s(r.shipped_at),
  labSyncedAt: s(r.lab_synced_at),
  createdAt: String(r.created_at),
});

export async function getOrderByCode(code: string): Promise<StoreOrder | null> {
  const { data } = await createAdminClient().from("store_orders").select("*").eq("code", code).maybeSingle();
  return data ? toOrder(data) : null;
}

export async function getOrderById(id: string): Promise<StoreOrder | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await createAdminClient().from("store_orders").select("*").eq("id", id).maybeSingle();
  return data ? toOrder(data) : null;
}

export async function listOrders(statuses: OrderStatus[] | null): Promise<StoreOrder[]> {
  let q = createAdminClient().from("store_orders").select("*").order("created_at", { ascending: false }).limit(200);
  if (statuses) q = q.in("status", statuses);
  const { data } = await q;
  return (data ?? []).map(toOrder);
}
