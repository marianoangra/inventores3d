import type { Metadata } from "next";
import ActionForm from "@/components/lab/ActionForm";
import { getWorkshop } from "@/lib/lab/data";
import { listParts } from "@/lib/lab/parts-data";
import { listJobs } from "@/lib/lab/ops-data";
import { fmtMinutes, forecastQueue, JOB_STATUS, NEXT_LABEL, type Job, type JobStatus } from "@/lib/lab/production";
import JobForm from "./JobForm";
import { advanceJob, deleteJob } from "./actions";

export const metadata: Metadata = { title: "Produção" };
export const dynamic = "force-dynamic";

const when = (d: Date) => d.toLocaleString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
const day = (s: string) => new Date(s + "T12:00:00Z").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" });

const GROUPS: { status: JobStatus; empty: string }[] = [
  { status: "imprimindo", empty: "Nenhuma impressora rodando." },
  { status: "fila", empty: "Fila vazia. Bom momento pra imprimir estoque." },
  { status: "pronto", empty: "Nada esperando entrega." },
  { status: "entregue", empty: "Nenhuma entrega nos últimos 30 dias." },
];

export default async function ProducaoPage() {
  const [jobs, parts, { settings, printers }] = await Promise.all([listJobs(), listParts(), getWorkshop()]);
  const forecast = forecastQueue(jobs, { printers: printers.length, hoursPerDay: settings.printHoursPerDay ?? 16 });
  const open = jobs.filter((j) => j.status === "fila" || j.status === "imprimindo");
  const queueMin = open.reduce((s, j) => s + j.printMinutes, 0);
  const lastFinish = [...forecast.values()].reduce<Date | null>((m, f) => (!m || f.finishAt > m ? f.finishAt : m), null);
  const late = [...forecast.values()].filter((f) => f.late).length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">Produção</h1>
        <p className="text-lab-muted mt-1">A fila das impressoras. Cada venda vira uma ordem; o Lab prevê quando cada uma fica pronta.</p>
      </header>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3" aria-label="Resumo">
        {[
          ["Na fila + imprimindo", String(open.length)],
          ["Horas de máquina", fmtMinutes(queueMin)],
          ["Fila esvazia", lastFinish ? when(lastFinish) : "—"],
          ["Atrasadas", String(late)],
        ].map(([k, v]) => (
          <div key={k} className={`rounded-2xl border p-4 ${k === "Atrasadas" && late ? "border-coral/50 bg-coral/5" : "border-lab-line bg-lab-card"}`}>
            <p className="text-xs text-lab-muted">{k}</p>
            <p className="font-display text-lg font-extrabold tabular-nums mt-0.5">{v}</p>
          </div>
        ))}
      </section>
      <p className="text-xs text-lab-muted -mt-3">
        Previsão com {printers.length} impressora{printers.length === 1 ? "" : "s"} rodando {settings.printHoursPerDay ?? 16} h por dia. Ajuste em Minha oficina.
      </p>

      <JobForm parts={parts.map((p) => ({ id: p.id, name: p.name }))} />

      {GROUPS.map(({ status, empty }) => {
        const list = jobs.filter((j) => j.status === status);
        if (status === "entregue") list.reverse();
        return (
          <section key={status} aria-label={JOB_STATUS[status]} className="space-y-2">
            <h2 className="font-display text-lg font-extrabold">
              {JOB_STATUS[status]} <span className="text-lab-muted font-medium text-base">({list.length})</span>
            </h2>
            {!list.length ? (
              <p className="rounded-3xl border border-dashed border-lab-line p-5 text-center text-sm text-lab-muted">{empty}</p>
            ) : (
              <ul className="divide-y divide-lab-line rounded-3xl border border-lab-line bg-lab-card">
                {list.map((j) => (
                  <JobRow key={j.id} j={j} f={forecast.get(j.id)} />
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

function JobRow({ j, f }: { j: Job; f?: { finishAt: Date; late: boolean } }) {
  const next = NEXT_LABEL[j.status];
  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="font-semibold">
          {j.qty}× {j.description} {j.saleId && <span className="ml-1 rounded-full bg-lab-soft px-2 py-0.5 text-[11px] font-medium text-lab-muted">venda</span>}
        </p>
        <p className="text-xs text-lab-muted">
          {fmtMinutes(j.printMinutes)} · {j.plates} placa{j.plates > 1 ? "s" : ""}
          {j.grams > 0 && ` · ${j.grams} g`}
          {j.dueOn && ` · prazo ${day(j.dueOn)}`}
          {j.notes && ` · ${j.notes}`}
        </p>
        {f && (
          <p className={`text-xs mt-0.5 font-medium ${f.late ? "text-coral" : "text-mint"}`}>
            {f.late ? "Atrasa: " : "Previsão: "}
            {when(f.finishAt)}
          </p>
        )}
      </div>
      {next && (
        <ActionForm action={advanceJob} submit={next} variant="ghost">
          <input type="hidden" name="id" value={j.id} />
        </ActionForm>
      )}
      {j.status !== "entregue" && (
        <ActionForm action={deleteJob} submit="Excluir" variant="danger">
          <input type="hidden" name="id" value={j.id} />
        </ActionForm>
      )}
    </li>
  );
}
