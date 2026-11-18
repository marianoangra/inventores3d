import Link from "next/link";

type Step = { done: boolean; title: string; text: string; href: string; cta: string };

export default function FirstSteps({ reviewed, hasPart, hasSale }: { reviewed: boolean; hasPart: boolean; hasSale: boolean }) {
  const steps: Step[] = [
    { done: reviewed, title: "Confira sua oficina", text: "Preço da impressora, do filamento e da energia.", href: "/lab/oficina", cta: "Abrir oficina" },
    { done: hasPart, title: "Calcule sua primeira peça", text: "Descubra quanto cobrar e salve a peça.", href: "/lab/calculadora", cta: "Calcular" },
    { done: hasSale, title: "Lance sua primeira venda", text: "Assim o Lab mostra seu lucro do mês.", href: "/lab/vendas", cta: "Lançar venda" },
  ];
  if (steps.every((s) => s.done)) return null;
  const n = steps.filter((s) => s.done).length;
  return (
    <section className="rounded-3xl border border-lab-line bg-lab-card p-5 sm:p-6" aria-label="Primeiros passos">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-xl font-extrabold">Primeiros passos</h2>
        <p className="text-sm text-lab-muted">{n} de 3</p>
      </div>
      <div className="mt-2 h-2 rounded-full bg-lab-soft overflow-hidden">
        <div className="h-full bg-brand rounded-full" style={{ width: `${(n / 3) * 100}%` }} />
      </div>
      <ol className="mt-4 space-y-2.5">
        {steps.map((s, i) => (
          <li key={s.href} className={`flex items-center gap-3 rounded-2xl p-3 ${s.done ? "opacity-60" : "bg-lab-soft"}`}>
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${s.done ? "bg-mint text-white" : "bg-lab-card"}`}>{s.done ? "✓" : i + 1}</span>
            <div className="min-w-0 flex-1">
              <p className={`font-semibold text-[15px] ${s.done ? "line-through" : ""}`}>{s.title}</p>
              <p className="text-xs text-lab-muted">{s.text}</p>
            </div>
            {!s.done && (
              <Link href={s.href} className="shrink-0 rounded-full bg-brand px-4 h-9 inline-flex items-center text-sm font-semibold text-white">
                {s.cta}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
