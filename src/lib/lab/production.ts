export const JOB_STATUS = {
  fila: "Na fila",
  imprimindo: "Imprimindo",
  pronto: "Pronto pra entregar",
  entregue: "Entregue",
} as const;
export type JobStatus = keyof typeof JOB_STATUS;
export const NEXT_STATUS: Record<JobStatus, JobStatus | null> = { fila: "imprimindo", imprimindo: "pronto", pronto: "entregue", entregue: null };
export const NEXT_LABEL: Record<JobStatus, string | null> = { fila: "Começar", imprimindo: "Ficou pronto", pronto: "Entreguei", entregue: null };

export type Job = {
  id: string;
  saleId: string | null;
  partId: string | null;
  filamentId: string | null;
  description: string;
  qty: number;
  printMinutes: number;
  grams: number;
  plates: number;
  status: JobStatus;
  dueOn: string | null;
  notes: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
};

export type Forecast = { finishAt: Date; late: boolean };

/**
 * Previsão de término de cada ordem aberta (imprimindo + fila).
 * - `printers` máquinas em paralelo; cada ordem vai pra que liberar primeiro
 * - imprimindo vem antes, descontando o tempo já passado desde o início
 * - a impressora roda `hoursPerDay` por dia: 1 min de máquina = 24/hoursPerDay min de relógio
 */
export function forecastQueue(jobs: Job[], opts: { printers: number; hoursPerDay: number; now?: Date }): Map<string, Forecast> {
  const now = opts.now ?? new Date();
  const machines = Array(Math.max(1, Math.floor(opts.printers))).fill(0) as number[];
  const stretch = 24 / Math.min(24, Math.max(1, opts.hoursPerDay));
  const order = [
    ...jobs.filter((j) => j.status === "imprimindo").sort((a, b) => (a.startedAt ?? a.createdAt).localeCompare(b.startedAt ?? b.createdAt)),
    ...jobs.filter((j) => j.status === "fila").sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  ];
  const out = new Map<string, Forecast>();
  for (const j of order) {
    let left = j.printMinutes;
    if (j.status === "imprimindo" && j.startedAt) left = Math.max(0, left - (now.getTime() - Date.parse(j.startedAt)) / 60000);
    const i = machines.indexOf(Math.min(...machines));
    machines[i] += left;
    const finishAt = new Date(now.getTime() + machines[i] * stretch * 60000);
    // atrasada se termina depois do fim do dia do prazo (horário de Brasília)
    const late = !!j.dueOn && finishAt.getTime() > Date.parse(j.dueOn + "T23:59:59-03:00");
    out.set(j.id, { finishAt, late });
  }
  return out;
}

/** "3h20" / "45 min" / "2d 4h" */
export function fmtMinutes(min: number): string {
  const m = Math.round(min);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  return `${h}h${m % 60 ? String(m % 60).padStart(2, "0") : ""}`;
}

/** Desconta do estoque do rolo; null = rolo sem controle de estoque. */
export const deductStock = (gramsLeft: number | null, used: number): number | null => (gramsLeft === null ? null : Math.max(0, Math.round((gramsLeft - used) * 10) / 10));
