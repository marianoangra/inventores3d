import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isOrderCode, type OrderStatus } from "@/lib/shop/order";
import { getOrderByCode } from "@/lib/shop/orders-data";
import { STORE, brl } from "@/lib/config";
import { IconArrow, IconCheck, IconWhats } from "@/components/Icons";
import StatusPoller from "./StatusPoller";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Meu pedido", robots: { index: false } };

const TITLE: Record<OrderStatus, string> = {
  pendente: "Aguardando o pagamento",
  pago: "Pagamento confirmado!",
  enviado: "Pedido enviado!",
  cancelado: "Pedido cancelado",
  expirado: "O prazo de pagamento venceu",
  estornado: "Pagamento estornado",
  erro: "Não conseguimos gerar a cobrança",
};

export default async function PedidoPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const o = isOrderCode(code) ? await getOrderByCode(code) : null;
  if (!o) notFound();
  const first = o.customerName.split(" ")[0];
  const zap = `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(`Oi! Sou ${first}, pedido ${o.code}.`)}`;
  const done = o.status === "pago" || o.status === "enviado";

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className="text-center">
        {done && (
          <div className="pop-in mx-auto grid place-items-center w-20 h-20 rounded-full bg-mint text-white">
            <IconCheck size={38} />
          </div>
        )}
        <p className="text-sm text-muted mt-6">Pedido {o.code}</p>
        <h1 className="font-display text-4xl font-bold tracking-tight mt-1">{TITLE[o.status]}</h1>
        <p className="text-muted mt-3 leading-relaxed">
          {o.status === "pendente" && "Assim que o pagamento cair, esta página atualiza sozinha."}
          {o.status === "pago" && `Valeu, ${first}! Sua peça entrou na fila da impressora. Fica pronta em até ${STORE.productionDays} dias úteis e o rastreio chega no seu WhatsApp.`}
          {o.status === "enviado" && (o.trackingCode ? `Código de rastreio: ${o.trackingCode}` : "O código de rastreio vai pelo WhatsApp.")}
          {(o.status === "expirado" || o.status === "cancelado" || o.status === "erro") && "Nada foi cobrado. Monte a sacola de novo ou fale com a gente no WhatsApp."}
          {o.status === "estornado" && "O valor volta pelo mesmo meio de pagamento. Dúvidas? Fale com a gente."}
        </p>
      </div>

      {o.status === "pendente" && o.invoiceUrl && (
        <>
          <a href={o.invoiceUrl} className="mt-8 w-full flex items-center justify-center gap-2 rounded-full bg-ink text-white font-semibold h-14">
            Pagar agora ({brl(o.total)}) <IconArrow size={16} />
          </a>
          <StatusPoller code={o.code} />
        </>
      )}

      <ul className="mt-8 rounded-2xl bg-white border border-line p-5 space-y-2 text-sm">
        {o.items.map((i, k) => (
          <li key={k} className="flex justify-between gap-4">
            <span>
              {i.qty}× {i.name} <span className="text-muted">· {i.colorLabel}{i.note ? ` · ${i.note}` : ""}</span>
            </span>
            <span className="tabular-nums font-medium">{brl(i.unit * i.qty)}</span>
          </li>
        ))}
        <li className="flex justify-between border-t border-line pt-2 font-semibold">
          <span>Total {o.payMethod === "pix" ? "no Pix" : o.installments > 1 ? `no cartão (${o.installments}x)` : "no cartão"}</span>
          <span className="tabular-nums">{brl(o.total)}</span>
        </li>
      </ul>

      <div className="mt-8 flex flex-col items-center gap-3">
        <a href={zap} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold text-[#128C7E]">
          <IconWhats size={18} /> Falar sobre o pedido
        </a>
        <Link href="/" className="inline-flex items-center gap-2 font-semibold text-brand">
          Voltar pra loja <IconArrow size={16} />
        </Link>
      </div>
    </div>
  );
}
