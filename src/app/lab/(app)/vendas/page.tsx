import type { Metadata } from "next";
import HowTo from "@/components/lab/HowTo";
import MonthPicker from "@/components/lab/MonthPicker";
import ActionForm from "@/components/lab/ActionForm";
import { getMonth, todayBR } from "@/lib/lab/month-data";
import { listParts } from "@/lib/lab/parts-data";
import { CHANNEL_LABEL } from "@/lib/lab/fees";
import { brl } from "@/lib/config";
import SaleForm from "./SaleForm";
import { deleteSale } from "./actions";

export const metadata: Metadata = { title: "Vendas" };

const day = (d: string) => new Date(d + "T12:00:00Z").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" });

export default async function VendasPage({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const { m } = await searchParams;
  const [month, parts] = await Promise.all([getMonth(m), listParts()]);
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">Vendas</h1>
        <p className="text-lab-muted mt-1">Lance cada venda. O Lab calcula as taxas e o lucro sozinho.</p>
        <HowTo screen="vendas" />
      </header>
      <SaleForm parts={parts.map((p) => ({ id: p.id, name: p.name, prices: p.prices }))} today={todayBR()} />
      <section className="space-y-3" aria-label="Vendas do mês">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <MonthPicker path="/lab/vendas" monthKey={month.key} label={month.label} />
          <p className="text-sm">Total: <b className="tabular-nums">{brl(month.summary.revenue)}</b></p>
        </div>
        {!month.sales.length ? (
          <p className="rounded-3xl border border-dashed border-lab-line p-6 text-center text-lab-muted">Nenhuma venda neste mês.</p>
        ) : (
          <ul className="divide-y divide-lab-line rounded-3xl border border-lab-line bg-lab-card">
            {month.sales.map((s) => (
              <li key={s.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{s.qty}× {s.description}</p>
                  <p className="text-xs text-lab-muted">{day(s.soldOn)} · {CHANNEL_LABEL[s.channel]} · {brl(s.unitPrice)} cada</p>
                </div>
                <p className="font-semibold tabular-nums">{brl(s.qty * s.unitPrice)}</p>
                <ActionForm action={deleteSale} submit="Excluir" variant="danger">
                  <input type="hidden" name="id" value={s.id} />
                </ActionForm>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
