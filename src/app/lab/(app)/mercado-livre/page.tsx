import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { connectionStatus, isMlAdmin, mlConfigured } from "@/lib/ml/client";
import { recentMlOrders } from "@/lib/ml/order-sync";
import ActionForm from "@/components/lab/ActionForm";
import { STORE } from "@/lib/config";
import { importMlOrders } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mercado Livre — Lab" };

export default async function MercadoLivrePage({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isMlAdmin(user?.email)) notFound();

  const { ok, erro } = await searchParams;
  const configured = mlConfigured();
  const status = configured ? await connectionStatus() : null;
  const recent = status ? await recentMlOrders() : [];

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Mercado Livre</h1>

      {ok && <p className="rounded-xl bg-green-100 text-green-900 px-4 py-3">Conta conectada.</p>}
      {erro && <p className="rounded-xl bg-red-100 text-red-900 px-4 py-3">{erro}</p>}

      {!configured ? (
        <p className="text-lab-muted">
          Faltam as variáveis <code>ML_CLIENT_ID</code> e <code>ML_CLIENT_SECRET</code> na Vercel.
        </p>
      ) : status ? (
        <div className="rounded-2xl bg-lab-soft p-5 space-y-1">
          <p>
            Conectado como <strong>{status.nickname ?? status.ml_user_id}</strong>
          </p>
          <p className="text-sm text-lab-muted">Token renovado em {new Date(status.updated_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}</p>
        </div>
      ) : (
        <p className="text-lab-muted">Nenhuma conta conectada ainda.</p>
      )}

      {configured && (
        <a href="/lab/ml/conectar" className="inline-flex h-11 items-center rounded-xl bg-brand px-5 font-medium text-white">
          {status ? "Reconectar conta" : "Conectar conta do Mercado Livre"}
        </a>
      )}

      <section className="rounded-3xl border border-lab-line bg-lab-card p-5 sm:p-6 space-y-3">
        <h2 className="font-display text-lg font-extrabold">Vendas → fila de produção</h2>
        <p className="text-sm text-lab-muted">
          Cada venda paga no ML entra sozinha em Vendas (canal Mercado Livre, com a tarifa) e na fila da Produção. Venda cancelada sai da fila se ainda não começou.
          A peça é achada pelo nome: deixe o nome em Minhas peças igual ao produto do site ou ao título do anúncio.
        </p>
        <p className="text-sm">
          No devcenter do ML, em <b>URL de notificações</b>, use <code>{STORE.url}/api/ml/notificacoes</code> e marque o tópico <b>Orders</b>.
        </p>
        {status && (
          <ActionForm action={importMlOrders} submit="Buscar vendas pagas (últimos 14 dias)" variant="ghost" />
        )}
        {recent.length > 0 && (
          <ul className="divide-y divide-lab-line text-sm">
            {recent.map((r) => (
              <li key={String(r.ml_order_id)} className="flex justify-between gap-3 py-2">
                <span>
                  #{String(r.ml_order_id)} {r.buyer ? `· ${r.buyer}` : ""}
                </span>
                <span className="text-lab-muted">{r.cancelled_at ? "cancelada" : r.processed_at ? "na fila" : r.status}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
