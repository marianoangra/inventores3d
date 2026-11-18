import type { Metadata } from "next";
import Link from "next/link";
import Edy from "@/components/lab/Edy";
import HowTo from "@/components/lab/HowTo";
import ActionForm from "@/components/lab/ActionForm";
import { listParts } from "@/lib/lab/parts-data";
import { CHANNEL_LABEL, CHANNELS } from "@/lib/lab/fees";
import { brl } from "@/lib/config";
import { duplicatePart } from "./actions";

export const metadata: Metadata = { title: "Minhas peças" };

const hm = (m: number) => `${Math.floor(m / 60)}h${String(m % 60).padStart(2, "0")}`;

export default async function PecasPage() {
  const parts = await listParts();
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">Minhas peças</h1>
          <p className="text-lab-muted mt-1">Seu catálogo com custo e preço de cada canal.</p>
          <HowTo screen="pecas" />
        </div>
        <Link href="/lab/calculadora" className="h-11 inline-flex items-center rounded-full bg-brand px-5 text-sm font-semibold text-white">+ Nova peça</Link>
      </header>

      {!parts.length ? (
        <div className="rounded-3xl border border-dashed border-lab-line p-8 text-center">
          <Edy size={96} mood="pensando" className="mx-auto" />
          <p className="mt-3 font-semibold">Nenhuma peça ainda.</p>
          <p className="text-sm text-lab-muted">Calcule uma peça e toque em “Salvar como peça”.</p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {parts.map((p) => (
            <li key={p.id} className="rounded-3xl border border-lab-line bg-lab-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/lab/pecas/${p.id}`} className="font-display text-lg font-extrabold hover:text-brand">{p.name}</Link>
                  <p className="text-xs text-lab-muted">{p.grams.toLocaleString("pt-BR")} g · {hm(p.printMinutes)} de impressão · custo {brl(p.unitCost)}</p>
                </div>
              </div>
              <table className="mt-3 w-full text-sm">
                <thead>
                  <tr className="text-[11px] text-lab-muted text-left">
                    <th className="font-medium pb-1">Canal</th>
                    <th className="font-medium pb-1 text-right">Preço</th>
                    <th className="font-medium pb-1 text-right">Lucro/h máquina</th>
                  </tr>
                </thead>
                <tbody>
                  {CHANNELS.map((c) => (
                    <tr key={c} className="border-t border-lab-line">
                      <td className="py-1.5">{CHANNEL_LABEL[c]}</td>
                      <td className="py-1.5 text-right tabular-nums font-semibold">{p.prices[c] === null ? "—" : brl(p.prices[c]!)}</td>
                      <td className="py-1.5 text-right tabular-nums">{p.pph[c] === null ? "—" : brl(p.pph[c]!)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Link href={`/lab/pecas/${p.id}`} className="h-9 inline-flex items-center rounded-full px-3 text-sm font-medium text-brand hover:bg-lab-soft">Editar</Link>
                <ActionForm action={duplicatePart} submit="Duplicar" variant="ghost">
                  <input type="hidden" name="id" value={p.id} />
                </ActionForm>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
