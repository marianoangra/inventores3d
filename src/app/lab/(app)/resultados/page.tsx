import type { Metadata } from "next";
import HowTo from "@/components/lab/HowTo";
import MonthPicker from "@/components/lab/MonthPicker";
import MonthCards from "@/components/lab/MonthCards";
import Edy from "@/components/lab/Edy";
import { getMonth } from "@/lib/lab/month-data";
import { CHANNEL_LABEL, CHANNELS } from "@/lib/lab/fees";
import { brl } from "@/lib/config";

export const metadata: Metadata = { title: "Resultados" };

export default async function ResultadosPage({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const { m } = await searchParams;
  const { key, label, summary: s } = await getMonth(m);
  const maxCh = Math.max(1, ...CHANNELS.map((c) => s.byChannel[c]));
  const rows: [string, number, string?][] = [
    ["Vendeu", s.revenue],
    ["Taxas dos marketplaces", -s.fees],
    ["Custo das peças vendidas", -s.costOfGoods, "filamento, energia, desgaste, acabamento e embalagem"],
    ["Despesas do mês", -s.expenses],
  ];
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">Resultados</h1>
          <HowTo screen="resultados" />
        </div>
        <MonthPicker path="/lab/resultados" monthKey={key} label={label} />
      </header>

      <MonthCards s={s} />

      {s.revenue === 0 && s.expenses === 0 ? (
        <div className="rounded-3xl border border-dashed border-lab-line p-8 text-center">
          <Edy size={96} mood="pensando" className="mx-auto" />
          <p className="mt-3 font-semibold">Nada lançado em {label.toLowerCase()}.</p>
          <p className="text-sm text-lab-muted">Lance vendas e despesas que o Edy monta o resultado.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-3xl border border-lab-line bg-lab-card p-5 sm:p-6" aria-label="Conta do mês">
            <h2 className="font-display text-lg font-extrabold mb-3">A conta do mês</h2>
            <ul className="space-y-2 text-sm">
              {rows.map(([k, v, hint]) => (
                <li key={k} className="flex justify-between gap-3">
                  <span>
                    {k}
                    {hint && <span className="block text-[11px] text-lab-muted">{hint}</span>}
                  </span>
                  <span className={`tabular-nums font-medium ${v < 0 ? "text-coral" : ""}`}>{v < 0 ? `− ${brl(-v)}` : brl(v)}</span>
                </li>
              ))}
              <li className="flex justify-between gap-3 border-t border-lab-line pt-2 font-bold">
                <span>Lucro</span>
                <span className={`tabular-nums ${s.profit < 0 ? "text-coral" : ""}`}>{brl(s.profit)}</span>
              </li>
            </ul>
          </section>

          <section className="rounded-3xl border border-lab-line bg-lab-card p-5 sm:p-6" aria-label="Vendas por canal">
            <h2 className="font-display text-lg font-extrabold mb-3">Onde você vendeu</h2>
            <ul className="space-y-3">
              {CHANNELS.map((c) => (
                <li key={c}>
                  <div className="flex justify-between text-sm">
                    <span>{CHANNEL_LABEL[c]}</span>
                    <span className="tabular-nums font-medium">{brl(s.byChannel[c])}</span>
                  </div>
                  <div className="mt-1 h-2.5 rounded-full bg-lab-soft overflow-hidden">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${(s.byChannel[c] / maxCh) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {s.topParts.length > 0 && (
            <section className="rounded-3xl border border-lab-line bg-lab-card p-5 sm:p-6 lg:col-span-2" aria-label="Mais vendidas">
              <h2 className="font-display text-lg font-extrabold mb-3">O que mais vendeu</h2>
              <ol className="divide-y divide-lab-line">
                {s.topParts.map((p, i) => (
                  <li key={p.description} className="flex items-center gap-3 py-2.5 text-sm">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-lab-soft text-xs font-bold">{i + 1}</span>
                    <span className="flex-1 truncate font-medium">{p.description}</span>
                    <span className="text-lab-muted">{p.qty} un.</span>
                    <span className="tabular-nums font-semibold w-24 text-right">{brl(p.revenue)}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
