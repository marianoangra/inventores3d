"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { addSale } from "./actions";
import { CHANNEL_LABEL, CHANNELS, type Channel } from "@/lib/lab/fees";
import type { FormState } from "@/components/lab/ActionForm";

type PartOpt = { id: string; name: string; prices: Record<Channel, number | null> };
const field = "h-11 w-full rounded-xl border border-lab-line bg-lab-card px-3 text-[15px] text-lab-text outline-none focus:border-brand";
const lbl = "block text-[13px] font-medium text-lab-muted mb-1.5";
const fmt = (n: number | null) => (n === null ? "" : String(n).replace(".", ","));

export default function SaleForm({ parts, today }: { parts: PartOpt[]; today: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(addSale, {});
  const [partId, setPartId] = useState(parts[0]?.id ?? "");
  const [channel, setChannel] = useState<Channel>("direto");
  const [price, setPrice] = useState("");
  const form = useRef<HTMLFormElement>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const p = parts.find((x) => x.id === partId);
    setPrice(p ? fmt(p.prices[channel]) : "");
  }, [partId, channel, parts]);

  useEffect(() => {
    if (state.ok) {
      form.current?.reset();
      const p = parts.find((x) => x.id === partId);
      setPrice(p ? fmt(p.prices[channel]) : "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form
      ref={form}
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
      className="rounded-3xl border border-lab-line bg-lab-card p-5 sm:p-6 space-y-4">
      <h2 className="font-display text-lg font-extrabold">Lançar venda</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="s-part" className={lbl}>O que vendeu</label>
          <select id="s-part" name="partId" value={partId} onChange={(e) => setPartId(e.target.value)} className={field}>
            {parts.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
            <option value="">Outra coisa (avulsa)</option>
          </select>
        </div>
        {!partId && (
          <>
            <div>
              <label htmlFor="s-desc" className={lbl}>Descrição</label>
              <input id="s-desc" name="description" className={field} placeholder="Ex.: Encomenda de chaveiros" />
            </div>
            <div>
              <label htmlFor="s-cost" className={lbl}>Custo por unidade (opcional)</label>
              <input id="s-cost" name="unitCost" inputMode="decimal" className={field} placeholder="R$" />
            </div>
          </>
        )}
        <div>
          <label htmlFor="s-ch" className={lbl}>Onde vendeu</label>
          <select id="s-ch" name="channel" value={channel} onChange={(e) => setChannel(e.target.value as Channel)} className={field}>
            {CHANNELS.map((c) => (
              <option key={c} value={c}>{CHANNEL_LABEL[c]}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="s-qty" className={lbl}>Quantidade</label>
            <input id="s-qty" name="qty" inputMode="numeric" defaultValue="1" className={field} />
          </div>
          <div>
            <label htmlFor="s-price" className={lbl}>Preço por unidade</label>
            <input id="s-price" name="unitPrice" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} className={field} placeholder="R$" />
          </div>
        </div>
        <div>
          <label htmlFor="s-date" className={lbl}>Data</label>
          <input id="s-date" name="soldOn" type="date" defaultValue={today} className={field} />
        </div>
        {partId && (
          <label className="sm:col-span-2 flex items-center gap-2 text-sm">
            <input type="checkbox" name="toQueue" defaultChecked className="h-4 w-4 accent-[var(--color-brand)]" />
            Colocar na fila de produção (desmarque se já tem em estoque)
          </label>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button disabled={pending} className="h-11 rounded-full bg-brand px-6 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
          {pending ? "Salvando…" : "Lançar venda"}
        </button>
        {state.error && <p role="alert" className="text-sm text-coral">{state.error}</p>}
        {state.ok && <p role="status" className="text-sm text-mint">{state.ok}</p>}
      </div>
    </form>
  );
}
