"use client";

import { useState } from "react";
import ActionForm from "@/components/lab/ActionForm";
import { addJob } from "./actions";

const field = "h-11 w-full rounded-xl border border-lab-line bg-lab-card px-3 text-[15px] text-lab-text outline-none focus:border-brand";
const lbl = "block text-[13px] font-medium text-lab-muted mb-1.5";

export default function JobForm({ parts }: { parts: { id: string; name: string }[] }) {
  const [partId, setPartId] = useState(parts[0]?.id ?? "");
  return (
    <details className="rounded-3xl border border-lab-line bg-lab-card p-5 sm:p-6">
      <summary className="cursor-pointer font-display text-lg font-extrabold">+ Nova ordem de produção</summary>
      <p className="text-sm text-lab-muted mt-1">Pra estoque ou encomenda. Venda lançada em Vendas já entra aqui sozinha.</p>
      <ActionForm action={addJob} submit="Pôr na fila" resetOnOk className="mt-4 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="j-part" className={lbl}>O que vai imprimir</label>
            <select id="j-part" name="partId" value={partId} onChange={(e) => setPartId(e.target.value)} className={field}>
              {parts.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
              <option value="">Outra coisa (avulsa)</option>
            </select>
          </div>
          {!partId && (
            <>
              <div className="sm:col-span-2">
                <label htmlFor="j-desc" className={lbl}>Descrição</label>
                <input id="j-desc" name="description" className={field} placeholder="Ex.: Protótipo do suporte" />
              </div>
              <div>
                <label htmlFor="j-h" className={lbl}>Horas de impressão (total)</label>
                <input id="j-h" name="hours" inputMode="decimal" className={field} placeholder="Ex.: 2,5" />
              </div>
              <div>
                <label htmlFor="j-g" className={lbl}>Filamento (g, total)</label>
                <input id="j-g" name="grams" inputMode="decimal" className={field} placeholder="Opcional" />
              </div>
            </>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="j-q" className={lbl}>Quantidade</label>
              <input id="j-q" name="qty" inputMode="numeric" defaultValue="1" className={field} />
            </div>
            <div>
              <label htmlFor="j-p" className={lbl}>Placas</label>
              <input id="j-p" name="plates" inputMode="numeric" defaultValue="1" className={field} />
            </div>
          </div>
          <div>
            <label htmlFor="j-due" className={lbl}>Prazo (opcional)</label>
            <input id="j-due" name="dueOn" type="date" className={field} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="j-n" className={lbl}>Observação (cor, nome, cliente…)</label>
            <input id="j-n" name="notes" className={field} />
          </div>
        </div>
      </ActionForm>
    </details>
  );
}
