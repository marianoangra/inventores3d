import { NextResponse } from "next/server";
import { isOrderCode } from "@/lib/shop/order";
import { getOrderByCode } from "@/lib/shop/orders-data";

export const dynamic = "force-dynamic";

/** Só o status (a página do pedido consulta enquanto espera o pagamento). */
export async function GET(_: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const o = isOrderCode(code) ? await getOrderByCode(code) : null;
  if (!o) return NextResponse.json({ erro: "Pedido não encontrado." }, { status: 404, headers: { "cache-control": "no-store" } });
  return NextResponse.json({ status: o.status }, { headers: { "cache-control": "no-store" } });
}
