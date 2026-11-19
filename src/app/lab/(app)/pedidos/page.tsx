import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ActionForm, { Input } from "@/components/lab/ActionForm";
import { IWhats } from "@/components/lab/LabIcons";
import { getUser } from "@/lib/lab/data";
import { isStoreOwner } from "@/lib/shop/owner";
import { asaas, asaasConfigured, asaasEnv } from "@/lib/shop/asaas";
import { listOrders, type StoreOrder } from "@/lib/shop/orders-data";
import { STATUS_LABEL, type OrderStatus } from "@/lib/shop/order";
import { STORE, brl } from "@/lib/config";
import { shipOrder, syncToLab } from "./actions";

export const metadata: Metadata = { title: "Pedidos da loja" };
export const dynamic = "force-dynamic";

const TABS: { id: string; label: string; statuses: OrderStatus[] | null }[] = [
  { id: "pagos", label: "Pagos (produzir)", statuses: ["pago"] },
  { id: "pendentes", label: "Aguardando pagamento", statuses: ["pendente"] },
  { id: "enviados", label: "Enviados", statuses: ["enviado"] },
  { id: "todos", label: "Todos", statuses: null },
];
const BADGE: Record<OrderStatus, string> = {
  pago: "bg-mint/15 text-mint",
  pendente: "bg-brand/10 text-brand",
  enviado: "bg-lab-soft text-lab-muted",
  cancelado: "bg-lab-soft text-lab-muted",
  expirado: "bg-lab-soft text-lab-muted",
  estornado: "bg-coral/10 text-coral",
  erro: "bg-coral/10 text-coral",
};
const when = (iso: string) => new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
const fmtCpf = (c: string) => c.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
const fmtCep = (c: string) => c.replace(/^(\d{5})(\d{3})$/, "$1-$2");

async function asaasCheck(): Promise<string | null> {
  if (!asaasConfigured()) return null;
  try {
    await asaas("/customers?limit=1");
    return "ok";
  } catch (e) {
    return e instanceof Error ? e.message : "erro";
  }
}

export default async function PedidosPage({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const user = await getUser();
  if (!isStoreOwner(user?.email)) notFound();
  const { f } = await searchParams;
  const tab = TABS.find((t) => t.id === f) ?? TABS[0];
  const [orders, check] = await Promise.all([listOrders(tab.statuses), asaasCheck()]);
  const env = asaasEnv();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">Pedidos da loja</h1>
        <p className="text-lab-muted mt-1">Pedidos pagos no site pelo Asaas. Só você vê esta tela.</p>
      </header>

      <Setup check={check} env={env} />

      <nav className="flex flex-wrap gap-2" aria-label="Filtro">
        {TABS.map((t) => (
          <Link key={t.id} href={`/lab/pedidos?f=${t.id}`} className={`h-9 inline-flex items-center rounded-full px-4 text-sm font-semibold ${t.id === tab.id ? "bg-brand text-white" : "bg-lab-soft text-lab-muted hover:text-lab-text"}`}>
            {t.label}
          </Link>
        ))}
      </nav>

      {!orders.length ? (
        <p className="rounded-3xl border border-dashed border-lab-line p-6 text-center text-lab-muted">Nenhum pedido aqui.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => (
            <OrderCard key={o.id} o={o} />
          ))}
        </ul>
      )}
    </div>
  );
}

function OrderCard({ o }: { o: StoreOrder }) {
  const zap = `https://wa.me/55${o.whatsapp}?text=${encodeURIComponent(
    o.status === "enviado" && o.trackingCode
      ? `Oi, ${o.customerName.split(" ")[0]}! Seu pedido ${o.code} da ${STORE.name} foi enviado. Rastreio: ${o.trackingCode}`
      : `Oi, ${o.customerName.split(" ")[0]}! Aqui é da ${STORE.name}, sobre o pedido ${o.code}.`,
  )}`;
  return (
    <li className="rounded-3xl border border-lab-line bg-lab-card p-5 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-extrabold">
            {o.code} · {o.customerName}
          </p>
          <p className="text-xs text-lab-muted">
            {when(o.createdAt)} · {o.payMethod === "pix" ? "Pix" : `Cartão ${o.installments}x`}
            {o.env === "sandbox" && " · TESTE (sandbox)"}
            {o.paidAt && ` · pago ${when(o.paidAt)}`}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${BADGE[o.status]}`}>{STATUS_LABEL[o.status]}</span>
      </div>

      <ul className="text-sm space-y-1">
        {o.items.map((i, k) => (
          <li key={k} className="flex justify-between gap-4">
            <span>
              <b>{i.qty}×</b> {i.name} · {i.colorLabel}
              {i.note && <span className="ml-1 rounded bg-lime/30 px-1.5 text-ink">{i.note}</span>}
            </span>
            <span className="tabular-nums">{brl(i.unit * i.qty)}</span>
          </li>
        ))}
        <li className="flex justify-between gap-4 border-t border-lab-line pt-1 text-lab-muted">
          <span>
            {o.discount > 0 && `Desconto Pix −${brl(o.discount)} · `}Frete {o.shipping ? brl(o.shipping) : "grátis"}
          </span>
          <b className="tabular-nums text-lab-text">{brl(o.total)}</b>
        </li>
      </ul>

      <div className="grid gap-3 sm:grid-cols-2 text-sm">
        <div className="rounded-2xl bg-lab-soft p-3">
          <p className="text-xs text-lab-muted mb-1">Entrega</p>
          <p>
            {o.street}, {o.number}
            {o.complement && ` — ${o.complement}`}
            <br />
            {o.district && `${o.district} — `}
            {o.city}/{o.uf} · CEP {fmtCep(o.cep)}
          </p>
          {o.notes && <p className="mt-1 text-lab-muted">Obs.: {o.notes}</p>}
        </div>
        <div className="rounded-2xl bg-lab-soft p-3">
          <p className="text-xs text-lab-muted mb-1">Cliente</p>
          <p>CPF {fmtCpf(o.cpf)}</p>
          <p className="break-all">{o.email}</p>
          <a href={zap} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1.5 font-semibold text-mint">
            <IWhats size={16} /> WhatsApp do cliente
          </a>
        </div>
      </div>

      {o.error && <p className="text-sm text-coral">Erro do Asaas: {o.error}</p>}
      {o.trackingCode && <p className="text-sm">Rastreio: <b>{o.trackingCode}</b></p>}

      {(o.status === "pago" || o.status === "enviado") && (
        <div className="flex flex-wrap items-end gap-3 border-t border-lab-line pt-4">
          {o.status === "pago" && (
            <ActionForm action={shipOrder} submit="Marcar como enviado" className="flex flex-wrap items-end gap-3">
              <input type="hidden" name="id" value={o.id} />
              <div className="w-56">
                <Input label="Código de rastreio (opcional)" name="tracking" type="text" />
              </div>
            </ActionForm>
          )}
          {o.labSyncedAt ? (
            <p className="text-sm text-lab-muted">Lançado no Lab (Vendas + Produção).</p>
          ) : (
            <ActionForm action={syncToLab} submit="Lançar em Vendas + Produção" variant="ghost">
              <input type="hidden" name="id" value={o.id} />
            </ActionForm>
          )}
        </div>
      )}
    </li>
  );
}

function Setup({ check, env }: { check: string | null; env: string | null }) {
  const live = check === "ok";
  return (
    <details open={!live} className="rounded-3xl border border-lab-line bg-lab-card p-5 sm:p-6">
      <summary className="cursor-pointer font-display text-lg font-extrabold">
        Pagamento no site: {live ? (env === "producao" ? "ligado (produção)" : "ligado em TESTE (sandbox)") : "desligado"}
      </summary>
      <div className="mt-3 space-y-3 text-sm">
        {check && check !== "ok" && <p className="text-coral">O Asaas recusou a chave: {check}</p>}
        <p className="text-lab-muted">Enquanto estiver desligado, o checkout continua mandando o pedido pelo WhatsApp. Pra ligar:</p>
        <ol className="list-decimal pl-5 space-y-1.5">
          <li>
            Na Vercel (projeto <b>investores3d</b>), crie <code>ASAAS_API_KEY</code> (a chave do Asaas), <code>ASAAS_ENV</code> = <code>sandbox</code> ou <code>producao</code> e{" "}
            <code>ASAAS_WEBHOOK_TOKEN</code> (uma senha longa que você inventa).
          </li>
          <li>
            No Asaas: Integrações → Webhooks → novo webhook com a URL <code>{STORE.url}/api/webhook-asaas</code>, o mesmo token e os eventos de <b>cobrança</b>.
          </li>
          <li>Opcional: cadastre o site em Minha conta no Asaas e crie <code>ASAAS_REDIRECT</code> = <code>1</code> pra o cliente voltar pro site depois de pagar.</li>
          <li>Faça um novo deploy (a Vercel só lê variáveis novas num deploy).</li>
        </ol>
      </div>
    </details>
  );
}
