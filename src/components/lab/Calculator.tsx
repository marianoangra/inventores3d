"use client";

import { useMemo, useState } from "react";
import Field from "./Field";
import { parseNum } from "@/lib/lab/num";
import { computeCost, quote, type ChannelQuote, type CostBreakdown } from "@/lib/lab/pricing";
import { CHANNEL_LABEL, FEE_NOTES, FEES_CHECKED_AT, resolveFees } from "@/lib/lab/fees";
import { DEFAULT_FILAMENT, DEFAULT_WORKSHOP, PRINTER_MODELS } from "@/lib/lab/defaults";
import type { Filament, PartDraft, Printer, WorkshopSettings } from "@/lib/lab/types";
import { brl } from "@/lib/config";

const FALLBACK_WORKSHOP: WorkshopSettings = { ...DEFAULT_WORKSHOP, feeOverrides: {} };
const FALLBACK_PRINTERS: Printer[] = PRINTER_MODELS.filter((m) => m.id !== "outra").map((m) => ({
  id: m.id,
  name: m.label,
  price: m.price,
  lifeHours: DEFAULT_WORKSHOP.printerLifeHours,
  watts: m.watts,
}));
const FALLBACK_FILAMENTS: Filament[] = [{ id: "pla", type: DEFAULT_FILAMENT.type, color: DEFAULT_FILAMENT.color, spoolPrice: DEFAULT_FILAMENT.spoolPrice, spoolGrams: DEFAULT_FILAMENT.spoolGrams }];

const str = (n: number | null | undefined) => (n === null || n === undefined ? "" : String(n).replace(".", ","));

type Props = {
  workshop?: WorkshopSettings;
  printers?: Printer[];
  filaments?: Filament[];
  initial?: PartDraft;
  onSave?: (p: PartDraft) => Promise<{ error?: string } | void>;
};

export default function Calculator({ workshop = FALLBACK_WORKSHOP, printers = FALLBACK_PRINTERS, filaments = FALLBACK_FILAMENTS, initial, onSave }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [grams, setGrams] = useState(str(initial?.grams));
  const [hours, setHours] = useState(initial ? String(Math.floor(initial.printMinutes / 60)) : "");
  const [mins, setMins] = useState(initial ? String(initial.printMinutes % 60) : "");
  const [labor, setLabor] = useState(str(initial?.laborMinutes ?? 5));
  const [packaging, setPackaging] = useState(str(initial?.packaging ?? workshop.packaging));
  const [margin, setMargin] = useState(str(initial?.marginPct ?? workshop.marginPct));
  const [printerId, setPrinterId] = useState(initial?.printerId ?? printers[0]?.id ?? "");
  const [filamentId, setFilamentId] = useState(initial?.filamentId ?? filaments[0]?.id ?? "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const printer = printers.find((p) => p.id === printerId) ?? printers[0];
  const filament = filaments.find((f) => f.id === filamentId) ?? filaments[0];

  const g = parseNum(grams);
  const h = parseNum(hours || "0");
  const m = parseNum(mins || "0");
  const lab = parseNum(labor || "0");
  const pack = parseNum(packaging || "0");
  const mg = parseNum(margin);
  const printMinutes = h !== null && m !== null ? Math.round(h * 60 + m) : null;

  const errs = {
    grams: grams && g === null ? "Use só números (ex.: 45 ou 45,5)" : null,
    time: (hours && h === null) || (mins && m === null) ? "Tempo inválido" : null,
    margin: margin && mg === null ? "Use só números" : null,
  };
  const missing = g === null || !printMinutes || mg === null;

  type Result = { error: string } | { cost: CostBreakdown; quotes: ChannelQuote[] } | null;
  const result = useMemo((): Result => {
    if (missing || !printer || !filament || lab === null || pack === null) return null;
    const cost = computeCost({
      grams: g!,
      printMinutes: printMinutes!,
      laborMinutes: lab,
      spoolPrice: filament.spoolPrice,
      spoolGrams: filament.spoolGrams,
      printerPrice: printer.price,
      printerLifeHours: printer.lifeHours,
      printerWatts: printer.watts,
      kwhPrice: workshop.kwhPrice,
      laborHourly: workshop.laborHourly,
      lossPct: workshop.lossPct,
      packaging: pack,
    });
    if ("error" in cost) return { error: cost.error };
    return { cost, quotes: quote(cost.total, mg!, printMinutes!, resolveFees(workshop.feeOverrides)) };
  }, [missing, printer, filament, g, printMinutes, lab, pack, mg, workshop]);

  const save = async () => {
    if (!onSave || !name.trim() || missing) {
      setMsg(!name.trim() ? "Dê um nome pra peça antes de salvar." : "Preencha peso e tempo.");
      return;
    }
    setSaving(true);
    setMsg(null);
    const r = await onSave({
      id: initial?.id,
      name: name.trim(),
      grams: g!,
      printMinutes: printMinutes!,
      laborMinutes: lab ?? 0,
      packaging: pack ?? 0,
      printerId: printer?.id ?? null,
      filamentId: filament?.id ?? null,
      marginPct: mg!,
    });
    setSaving(false);
    setMsg(r && r.error ? r.error : "Peça salva!");
  };

  const select = "h-11 w-full rounded-xl border border-lab-line bg-lab-card px-3 text-[15px] text-lab-text outline-none focus:border-brand";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.05fr] items-start">
      <section className="rounded-3xl border border-lab-line bg-lab-card p-5 sm:p-6 space-y-4" aria-label="Dados da peça">
        {onSave && (
          <div>
            <label htmlFor="calc-name" className="block text-[13px] font-medium text-lab-muted mb-1.5">Nome da peça</label>
            <input id="calc-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Dragão articulado 20 cm" className={select} />
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Peso da peça" value={grams} onChange={setGrams} suffix="g" error={errs.grams} hint="Aparece no fatiador (Bambu Studio / Orca)" className="col-span-2 sm:col-span-1" />
          <div className="col-span-2 sm:col-span-1">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Impressão" value={hours} onChange={setHours} suffix="h" decimal={false} error={errs.time} />
              <Field label="Minutos" value={mins} onChange={setMins} suffix="min" decimal={false} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="calc-fil" className="block text-[13px] font-medium text-lab-muted mb-1.5">Filamento</label>
            <select id="calc-fil" value={filamentId} onChange={(e) => setFilamentId(e.target.value)} className={select}>
              {filaments.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.type}{f.color ? ` ${f.color}` : ""} · {brl(f.spoolPrice)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="calc-pr" className="block text-[13px] font-medium text-lab-muted mb-1.5">Impressora</label>
            <select id="calc-pr" value={printerId} onChange={(e) => setPrinterId(e.target.value)} className={select}>
              {printers.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Acabamento" value={labor} onChange={setLabor} suffix="min" hint="Tirar suporte, montar" />
          <Field label="Embalagem" value={packaging} onChange={setPackaging} prefix="R$" />
          <Field label="Lucro sobre o custo" value={margin} onChange={setMargin} suffix="%" error={errs.margin} />
        </div>
        <p className="text-xs text-lab-muted">
          Energia {brl(workshop.kwhPrice)}/kWh · sua hora {brl(workshop.laborHourly)} · perdas {workshop.lossPct}% — ajuste em Minha oficina.
        </p>
        {onSave && (
          <div className="flex items-center gap-3 pt-1">
            <button onClick={save} disabled={saving} className="h-11 rounded-full bg-brand px-6 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
              {saving ? "Salvando…" : initial?.id ? "Salvar alterações" : "Salvar como peça"}
            </button>
            {msg && <p className="text-sm text-lab-muted" role="status">{msg}</p>}
          </div>
        )}
      </section>

      <section className="space-y-4 lg:sticky lg:top-6" aria-label="Resultado" aria-live="polite">
        {!result && (
          <div className="rounded-3xl border border-dashed border-lab-line p-6 text-center text-lab-muted">
            Preencha o <b className="text-lab-text">peso</b> e o <b className="text-lab-text">tempo de impressão</b> pra ver quanto cobrar.
          </div>
        )}
        {result && "error" in result && <div className="rounded-3xl border border-coral/40 bg-coral/10 p-5 text-sm">{result.error}</div>}
        {result && "cost" in result && (
          <>
            <Breakdown cost={result.cost} />
            <div className="grid gap-3">
              {result.quotes.map((q) => (
                <div key={q.channel} className="rounded-3xl border border-lab-line bg-lab-card p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-semibold">{CHANNEL_LABEL[q.channel]}</p>
                    {"price" in q && <p className="font-display text-3xl font-extrabold tabular-nums">{brl(q.price)}</p>}
                  </div>
                  {"error" in q ? (
                    <p className="mt-2 text-sm text-coral">{q.error}</p>
                  ) : (
                    <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-2xl bg-lab-soft p-2.5">
                        <dt className="text-[11px] text-lab-muted">Taxas</dt>
                        <dd className="text-sm font-semibold tabular-nums">{brl(q.fees)}</dd>
                      </div>
                      <div className="rounded-2xl bg-lab-soft p-2.5">
                        <dt className="text-[11px] text-lab-muted">Lucro</dt>
                        <dd className="text-sm font-semibold tabular-nums">{brl(q.profit)}</dd>
                      </div>
                      <div className="rounded-2xl bg-lime p-2.5 text-ink">
                        <dt className="text-[11px] font-medium">Lucro / hora de máquina</dt>
                        <dd className="text-sm font-bold tabular-nums">{q.profitPerMachineHour === null ? "—" : brl(q.profitPerMachineHour)}</dd>
                      </div>
                    </dl>
                  )}
                  <p className="mt-2.5 text-[11.5px] leading-snug text-lab-muted">{FEE_NOTES[q.channel]}</p>
                </div>
              ))}
            </div>
            <p className="text-[11.5px] text-lab-muted">
              Taxas conferidas em {new Date(FEES_CHECKED_AT + "T12:00:00").toLocaleDateString("pt-BR")}. Marketplaces mudam as regras — confira na central do vendedor.
            </p>
          </>
        )}
      </section>
    </div>
  );
}

function Breakdown({ cost }: { cost: CostBreakdown }) {
  const rows: [string, number][] = [
    ["Filamento", cost.filament],
    ["Energia", cost.energy],
    ["Desgaste da impressora", cost.wear],
    ["Perdas e falhas", cost.loss],
    ["Seu tempo de acabamento", cost.labor],
    ["Embalagem", cost.packaging],
  ];
  return (
    <div className="rounded-3xl bg-ink p-5 text-white">
      <div className="flex items-baseline justify-between">
        <p className="text-sm text-white/70">Custo real da peça</p>
        <p className="font-display text-3xl font-extrabold tabular-nums text-lime">{brl(cost.total)}</p>
      </div>
      <ul className="mt-3 space-y-1.5 text-sm">
        {rows.map(([k, v]) => (
          <li key={k} className="flex justify-between gap-3 text-white/80">
            <span>{k}</span>
            <span className="tabular-nums">{brl(v)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
