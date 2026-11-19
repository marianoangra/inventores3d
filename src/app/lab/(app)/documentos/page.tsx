import type { Metadata } from "next";
import Link from "next/link";
import { listQuotes } from "@/lib/lab/ops-data";
import { listParts } from "@/lib/lab/parts-data";
import { KIND_LABEL, quoteCode, quoteTotals } from "@/lib/lab/quote";
import { brl } from "@/lib/config";
import QuoteForm from "./QuoteForm";

export const metadata: Metadata = { title: "Documentos" };

const day = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", timeZone: "America/Sao_Paulo" });

export default async function DocumentosPage() {
  const [quotes, parts] = await Promise.all([listQuotes(), listParts()]);
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">Documentos</h1>
        <p className="text-lab-muted mt-1">Orçamento e recibo com a sua marca. Salve em PDF ou mande direto no WhatsApp do cliente.</p>
      </header>
      <QuoteForm parts={parts.map((p) => ({ id: p.id, name: p.name, price: p.prices.direto }))} />
      <section aria-label="Documentos emitidos" className="space-y-2">
        <h2 className="font-display text-lg font-extrabold">Emitidos</h2>
        {!quotes.length ? (
          <p className="rounded-3xl border border-dashed border-lab-line p-5 text-center text-sm text-lab-muted">Nenhum documento ainda.</p>
        ) : (
          <ul className="divide-y divide-lab-line rounded-3xl border border-lab-line bg-lab-card">
            {quotes.map((q) => (
              <li key={q.id}>
                <Link href={`/lab/documentos/${q.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-lab-soft rounded-3xl">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">
                      {quoteCode(q)} · {q.customerName}
                    </p>
                    <p className="text-xs text-lab-muted">
                      {KIND_LABEL[q.kind]} · {day(q.createdAt)}
                      {q.convertedAt && " · virou venda"}
                    </p>
                  </div>
                  <p className="font-semibold tabular-nums">{brl(quoteTotals(q).total)}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
