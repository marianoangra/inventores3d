import { after, NextResponse, type NextRequest } from "next/server";
import { connectionStatus, mlConfigured } from "@/lib/ml/client";
import { orderIdFromNotification } from "@/lib/ml/orders";
import { syncMlOrder } from "@/lib/ml/order-sync";

export const dynamic = "force-dynamic";

// URL de notificações do app no devcenter do ML: https://inventores3d.com.br/api/ml/notificacoes (tópico Orders).
// O ML não assina a notificação: por isso ela só serve de "gatilho" — o pedido é sempre buscado na API com o nosso token.
// Tem que responder 200 rápido (senão o ML reenvia), então o trabalho roda depois da resposta.
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { application_id?: unknown; user_id?: unknown } | null;
  const orderId = orderIdFromNotification(body);
  if (orderId && mlConfigured() && String(body?.application_id) === process.env.ML_CLIENT_ID) {
    after(async () => {
      try {
        const conn = await connectionStatus();
        if (!conn || String(conn.ml_user_id) !== String(body?.user_id)) return;
        const r = await syncMlOrder(orderId);
        console.log("[ml notificacao]", orderId, r.result, r.detail);
      } catch (e) {
        console.error("[ml notificacao]", orderId, e instanceof Error ? e.message : e);
      }
    });
  }
  return new NextResponse(null, { status: 200 });
}
