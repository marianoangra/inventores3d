"use client";

import { useState } from "react";
import ActionForm from "@/components/lab/ActionForm";
import { parseNum } from "@/lib/lab/num";
import { brl } from "@/lib/config";
import { createQuote } from "./actions";

type PartOpt = { id: string; name: string; price: number | null };
type Line = { key: number; partId: string; description: string; qty: string; unitPrice: string };

const field = "h-11 w-full rounded-xl border border-lab-line bg-lab-card px-3 text-[15px] text-lab-text outline-none focus:border-brand";
const lbl = "block text-[13px] font-medium text-lab-muted mb-1.5";
const fmt = (n: number | null) => (n === null ? "" : String(n).replace(".", ","));

let seq = 0;
const blank = (): Line => ({ key: ++seq, partId: "", description: "", qty: "1", unitPrice: "" });

export default function QuoteForm({ parts }: { parts: PartOpt[] }) {
  const [kind, setKind] = useState<"orcamento" | "recibo">("orcamento");
  const [lines, setLines] = useState<Line[]>([blank()]);
  const [discount, setDiscount] = useState("");
  const [shipping, setShipping] = useState("");
  const set = (key: number, patch: Partial<Line>) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  const pick = (key: number, partId: string) => {
    const p = parts.find((x) => x.id === partId);
    set(key, p ? { partId, description: p.name, unitPrice: fmt(p.price) } : { partId: "" });
  };
  const subtotal = lines.reduce((s, l) => s + (parseNum(l.qty) ?? 0) * (parseNum(l.unitPrice) ?? 0), 0);
  const total = Math.max(0, subtotal - (parseNum(discount) ?? 0) + (parseNum(shipping) ?? 0));

  return (
    <ActionForm action={createQuote} submit={kind === "orcamento" ? "Gerar orçamento" : "Gerar recibo"} className="rounded-3xl border border-lab-line bg-lab-card p-5 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-extrabold">Novo documento</h2>
        <div className="inline-flex rounded-full border border-lab-line p-1" role="radiogroup" aria-label="Tipo">
          {(["orcamento", "recibo"] as const).map((k) => (
            <button key={k} type="button" role="radio" aria-checked={kind === k} onClick={() => setKind(k)} className={`h-9 rounded-full px-4 text-sm font-semibold ${kind === k ? "bg-brand text-white" : "text-lab-muted"}`}>
              {k === "orcamento" ? "Orçamento" : "Recibo"}
            </button>
          ))}
        </div>
      </div>
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="items" value={JSON.stringify(lines.map(({ partId, description, qty, unitPrice }) => ({ partId: partId || null, description, qty, unitPrice })))} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="q-name" className={lbl}>Cliente</label>
          <input id="q-name" name="customerName" className={field} />
        </div>
        <div>
          <label htmlFor="q-ph" className={lbl}>WhatsApp do cliente (opcional)</label>
          <input id="q-ph" name="customerPhone" inputMode="tel" className={field} placeholder="(11) 98765-4321" />
        </div>
      </div>

      <div className="space-y-3">
        {lines.map((l, idx) => (
          <div key={l.key} className="rounded-2xl bg-lab-soft p-3 grid gap-2 sm:grid-cols-[1.2fr_1.4fr_5rem_7rem_auto] items-end">
            <div>
              <label className={lbl} htmlFor={`q-p${l.key}`}>Peça</label>
              <select id={`q-p${l.key}`} value={l.partId} onChange={(e) => pick(l.key, e.target.value)} className={field}>
                <option value="">Avulso</option>
                {parts.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={lbl} htmlFor={`q-d${l.key}`}>Descrição</label>
              <input id={`q-d${l.key}`} value={l.description} onChange={(e) => set(l.key, { description: e.target.value })} className={field} />
            </div>
            <div>
              <label className={lbl} htmlFor={`q-q${l.key}`}>Qtd</label>
              <input id={`q-q${l.key}`} value={l.qty} onChange={(e) => set(l.key, { qty: e.target.value })} inputMode="numeric" className={field} />
            </div>
            <div>
              <label className={lbl} htmlFor={`q-u${l.key}`}>Preço un.</label>
              <input id={`q-u${l.key}`} value={l.unitPrice} onChange={(e) => set(l.key, { unitPrice: e.target.value })} inputMode="decimal" className={field} placeholder="R$" />
            </div>
            <button type="button" disabled={lines.length === 1} onClick={() => setLines((ls) => ls.filter((x) => x.key !== l.key))} className="h-11 rounded-full px-3 text-sm text-coral disabled:opacity-30" aria-label={`Remover item ${idx + 1}`}>
              Remover
            </button>
          </div>
        ))}
        <button type="button" onClick={() => setLines((ls) => [...ls, blank()])} className="text-sm font-semibold text-brand">
          + Adicionar item
        </button>
      </div>

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
        <div>
          <label htmlFor="q-dc" className={lbl}>Desconto</label>
          <input id="q-dc" name="discount" value={discount} onChange={(e) => setDiscount(e.target.value)} inputMode="decimal" className={field} placeholder="R$" />
        </div>
        <div>
          <label htmlFor="q-fr" className={lbl}>Frete</label>
          <input id="q-fr" name="shipping" value={shipping} onChange={(e) => setShipping(e.target.value)} inputMode="decimal" className={field} placeholder="R$" />
        </div>
        {kind === "orcamento" && (
          <div>
            <label htmlFor="q-v" className={lbl}>Validade (dias)</label>
            <input id="q-v" name="validDays" defaultValue="7" inputMode="numeric" className={field} />
          </div>
        )}
        <div className="col-span-2 sm:col-span-3">
          <label htmlFor="q-n" className={lbl}>Observações (prazo, forma de pagamento…)</label>
          <input id="q-n" name="notes" className={field} placeholder="Ex.: Pix ou cartão. Pronto em 3 dias úteis." />
        </div>
      </div>
      <p className="text-right text-sm">
        Total: <b className="font-display text-lg tabular-nums">{brl(total)}</b>
      </p>
    </ActionForm>
  );
}
