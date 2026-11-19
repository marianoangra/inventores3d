import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { nextStatus, type OrderStatus } from "@/lib/shop/order";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function tokenOk(got: string | null): boolean {
  const want = process.env.ASAAS_WEBHOOK_TOKEN;
  if (!want || !got) return false;
  const a = Buffer.from(got);
  const b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Cadastre no Asaas: Integrações > Webhooks > URL https://inventores3d.com.br/api/webhook-asaas
// com o mesmo token de ASAAS_WEBHOOK_TOKEN. Eventos: cobranças (PAYMENT_*).
export async function POST(req: NextRequest) {
  if (!tokenOk(req.headers.get("asaas-access-token"))) return new NextResponse(null, { status: 401 });

  let body: { event?: string; payment?: { id?: string; externalReference?: string } };
  try {
    body = await req.json();
  } catch {
    return new NextResponse(null, { status: 200 });
  }
  const ref = body.payment?.externalReference ?? "";
  const event = body.event ?? "";
  // Responde 200 mesmo pra eventos que não são nossos (ex.: cobranças do Gasomax na mesma conta):
  // o Asaas pausa a fila de webhooks depois de várias respostas de erro seguidas.
  if (!UUID.test(ref)) return new NextResponse(null, { status: 200 });

  const db = createAdminClient();
  const { data: order } = await db.from("store_orders").select("id, status").eq("id", ref).maybeSingle();
  if (!order) return new NextResponse(null, { status: 200 });

  const next = nextStatus(order.status as OrderStatus, event);
  if (next) {
    const now = new Date().toISOString();
    const { error } = await db
      .from("store_orders")
      .update({ status: next, updated_at: now, ...(next === "pago" ? { paid_at: now, error: null } : {}) })
      .eq("id", order.id)
      .eq("status", order.status); // só muda se ninguém mudou antes (eventos repetidos)
    if (error) {
      console.error("[webhook-asaas] update falhou", order.id, error.message);
      return new NextResponse(null, { status: 500 }); // o Asaas reenvia
    }
    console.log("[webhook-asaas]", event, order.id, `${order.status} → ${next}`);
  }
  return new NextResponse(null, { status: 200 });
}
