import { brl } from "@/lib/config";
import type { MonthSummary } from "@/lib/lab/results";

export default function MonthCards({ s }: { s: MonthSummary }) {
  const cards: { label: string; value: string; hint?: string; strong?: boolean }[] = [
    { label: "Vendeu", value: brl(s.revenue) },
    { label: "Lucro", value: brl(s.profit), hint: "depois de custos, taxas e despesas", strong: true },
    { label: "Lucro / hora de máquina", value: s.profitPerMachineHour === null ? "—" : brl(s.profitPerMachineHour), hint: `${s.machineHours.toLocaleString("pt-BR")} h imprimindo` },
    { label: "Despesas", value: brl(s.expenses) },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => (
        <div key={c.label} className={`rounded-3xl p-4 sm:p-5 ${c.strong ? (s.profit < 0 ? "bg-coral text-white" : "bg-lime text-ink") : "border border-lab-line bg-lab-card"}`}>
          <p className={`text-xs font-medium ${c.strong ? "" : "text-lab-muted"}`}>{c.label}</p>
          <p className="mt-1 font-display text-xl sm:text-2xl font-extrabold tabular-nums">{c.value}</p>
          {c.hint && <p className={`mt-0.5 text-[11px] ${c.strong ? "opacity-80" : "text-lab-muted"}`}>{c.hint}</p>}
        </div>
      ))}
    </div>
  );
}
