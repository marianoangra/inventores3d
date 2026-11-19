import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ActionForm from "@/components/lab/ActionForm";
import PrintButton from "@/components/lab/PrintButton";
import { IWhats } from "@/components/lab/LabIcons";
import { getProfile, getWorkshop } from "@/lib/lab/data";
import { getQuote } from "@/lib/lab/ops-data";
import { formatWhatsapp } from "@/lib/lab/phone";
import { KIND_LABEL, quoteCode, quoteMessage, quoteTotals, waLink } from "@/lib/lab/quote";
import { brl } from "@/lib/config";
import { convertQuote, deleteQuote } from "../actions";

export const metadata: Metadata = { title: "Documento" };

const date = (iso: string, plusDays = 0) => new Date(Date.parse(iso) + plusDays * 86400000).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

export default async function DocumentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [q, profile, { settings }] = await Promise.all([getQuote(id), getProfile(), getWorkshop()]);
  if (!q) notFound();
  const business = settings.businessName?.trim() || profile?.name || "Minha oficina 3D";
  const { subtotal, total } = quoteTotals(q);
  const msg = quoteMessage(q, business);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <Link href="/lab/documentos" className="text-sm text-lab-muted hover:text-lab-text mr-auto">← Documentos</Link>
        <PrintButton />
        <a href={waLink(q.customerPhone, msg)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 h-11 rounded-full bg-mint px-5 text-sm font-semibold text-ink">
          <IWhats size={18} /> {q.customerPhone ? "Enviar no WhatsApp" : "Abrir no WhatsApp"}
        </a>
      </div>

      {/* o documento: no papel/PDF só isto aparece */}
      <article className="rounded-3xl border border-lab-line bg-white text-ink p-6 sm:p-10 print:border-0 print:p-0 print:rounded-none">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-ink/10 pb-5">
          <div>
            <p className="font-display text-2xl font-extrabold">{business}</p>
            {profile?.whatsapp && <p className="text-sm text-ink/60">WhatsApp {formatWhatsapp(profile.whatsapp)}</p>}
          </div>
          <div className="text-right">
            <p className="font-display text-xl font-extrabold">{KIND_LABEL[q.kind]}</p>
            <p className="text-sm text-ink/60">{quoteCode(q)} · {date(q.createdAt)}</p>
          </div>
        </header>
        <p className="mt-5 text-sm">
          <span className="text-ink/60">Cliente:</span> <b>{q.customerName}</b>
          {q.customerPhone && <span className="text-ink/60"> · {formatWhatsapp(q.customerPhone)}</span>}
        </p>
        <table className="mt-5 w-full text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-left text-ink/60">
              <th className="py-2 font-medium">Item</th>
              <th className="py-2 font-medium text-right w-14">Qtd</th>
              <th className="py-2 font-medium text-right w-28">Unitário</th>
              <th className="py-2 font-medium text-right w-28">Total</th>
            </tr>
          </thead>
          <tbody>
            {q.items.map((i, k) => (
              <tr key={k} className="border-b border-ink/5">
                <td className="py-2">{i.description}</td>
                <td className="py-2 text-right tabular-nums">{i.qty}</td>
                <td className="py-2 text-right tabular-nums">{brl(i.unitPrice)}</td>
                <td className="py-2 text-right tabular-nums">{brl(i.qty * i.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <dl className="mt-4 ml-auto w-full max-w-xs space-y-1 text-sm">
          {(q.discount > 0 || q.shipping > 0) && (
            <div className="flex justify-between"><dt className="text-ink/60">Subtotal</dt><dd className="tabular-nums">{brl(subtotal)}</dd></div>
          )}
          {q.discount > 0 && (
            <div className="flex justify-between"><dt className="text-ink/60">Desconto</dt><dd className="tabular-nums">−{brl(q.discount)}</dd></div>
          )}
          {q.shipping > 0 && (
            <div className="flex justify-between"><dt className="text-ink/60">Frete</dt><dd className="tabular-nums">{brl(q.shipping)}</dd></div>
          )}
          <div className="flex justify-between border-t border-ink/10 pt-2 text-base font-extrabold"><dt>Total</dt><dd className="tabular-nums">{brl(total)}</dd></div>
        </dl>
        <footer className="mt-8 space-y-1 text-sm text-ink/70">
          {q.kind === "orcamento" ? <p>Orçamento válido até {date(q.createdAt, q.validDays)}.</p> : <p>Recebemos o valor acima referente aos itens listados. Obrigado pela compra!</p>}
          {q.notes && <p>{q.notes}</p>}
        </footer>
      </article>

      <div className="flex flex-wrap items-center gap-3 print:hidden">
        {q.kind === "orcamento" && !q.convertedAt && (
          <ActionForm action={convertQuote} submit="Cliente aprovou: virar venda">
            <input type="hidden" name="id" value={q.id} />
          </ActionForm>
        )}
        {q.convertedAt && <p className="text-sm text-mint font-medium">Virou venda em {date(q.convertedAt)}.</p>}
        <ActionForm action={deleteQuote} submit="Excluir documento" variant="danger" className="ml-auto">
          <input type="hidden" name="id" value={q.id} />
        </ActionForm>
      </div>
      {!settings.businessName && (
        <p className="text-xs text-lab-muted print:hidden">Dica: coloque o nome da sua loja em Minha oficina pra sair no cabeçalho.</p>
      )}
    </div>
  );
}
