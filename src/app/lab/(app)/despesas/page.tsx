import type { Metadata } from "next";
import HowTo from "@/components/lab/HowTo";
import MonthPicker from "@/components/lab/MonthPicker";
import ActionForm, { Input } from "@/components/lab/ActionForm";
import { getMonth, todayBR } from "@/lib/lab/month-data";
import { EXPENSE_CATEGORIES, type ExpenseCategory } from "@/lib/lab/entries";
import { brl } from "@/lib/config";
import { addExpense, deleteExpense } from "../vendas/actions";

export const metadata: Metadata = { title: "Despesas" };

const day = (d: string) => new Date(d + "T12:00:00Z").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", timeZone: "UTC" });
const field = "h-11 w-full rounded-xl border border-lab-line bg-lab-card px-3 text-[15px] text-lab-text outline-none focus:border-brand";

export default async function DespesasPage({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const { m } = await searchParams;
  const month = await getMonth(m);
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">Despesas</h1>
        <p className="text-lab-muted mt-1">Tudo que sai do bolso pra manter a oficina rodando.</p>
        <HowTo screen="despesas" />
      </header>
      <section className="rounded-3xl border border-lab-line bg-lab-card p-5 sm:p-6">
        <h2 className="font-display text-lg font-extrabold mb-4">Lançar despesa</h2>
        <ActionForm action={addExpense} submit="Lançar despesa" className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Descrição" name="description" type="text" />
            <label className="block">
              <span className="block text-[13px] font-medium text-lab-muted mb-1.5">Categoria</span>
              <select name="category" defaultValue="filamento" className={field}>
                {Object.entries(EXPENSE_CATEGORIES).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </label>
            <Input label="Valor" name="amount" prefix="R$" />
            <label className="block">
              <span className="block text-[13px] font-medium text-lab-muted mb-1.5">Data</span>
              <input name="spentOn" type="date" defaultValue={todayBR()} className={field} />
            </label>
          </div>
        </ActionForm>
      </section>
      <section className="space-y-3" aria-label="Despesas do mês">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <MonthPicker path="/lab/despesas" monthKey={month.key} label={month.label} />
          <p className="text-sm">Total: <b className="tabular-nums">{brl(month.summary.expenses)}</b></p>
        </div>
        {!month.expenses.length ? (
          <p className="rounded-3xl border border-dashed border-lab-line p-6 text-center text-lab-muted">Nenhuma despesa neste mês.</p>
        ) : (
          <ul className="divide-y divide-lab-line rounded-3xl border border-lab-line bg-lab-card">
            {month.expenses.map((e) => (
              <li key={e.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{e.description}</p>
                  <p className="text-xs text-lab-muted">{day(e.spentOn)} · {EXPENSE_CATEGORIES[e.category as ExpenseCategory] ?? e.category}</p>
                </div>
                <p className="font-semibold tabular-nums">{brl(e.amount)}</p>
                <ActionForm action={deleteExpense} submit="Excluir" variant="danger">
                  <input type="hidden" name="id" value={e.id} />
                </ActionForm>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
