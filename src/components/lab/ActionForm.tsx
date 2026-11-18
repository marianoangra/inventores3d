"use client";

import { useActionState } from "react";

export type FormState = { ok?: string; error?: string };
type Action = (prev: FormState, form: FormData) => Promise<FormState>;

/** Formulário com Server Action + mensagem de retorno + botão com estado. */
export default function ActionForm({
  action,
  children,
  submit = "Salvar",
  className = "",
  variant = "primary",
}: {
  action: Action;
  children?: React.ReactNode;
  submit?: string;
  className?: string;
  variant?: "primary" | "ghost" | "danger";
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  const btn =
    variant === "primary"
      ? "h-11 rounded-full bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark"
      : variant === "danger"
        ? "h-9 rounded-full px-3 text-sm font-medium text-coral hover:bg-coral/10"
        : "h-9 rounded-full px-3 text-sm font-medium text-lab-muted hover:bg-lab-soft hover:text-lab-text";
  return (
    <form action={formAction} className={className}>
      {children}
      <div className="flex flex-wrap items-center gap-3">
        <button disabled={pending} className={`${btn} disabled:opacity-60`}>
          {pending ? "…" : submit}
        </button>
        {state.error && <p role="alert" className="text-sm text-coral">{state.error}</p>}
        {state.ok && <p role="status" className="text-sm text-mint">{state.ok}</p>}
      </div>
    </form>
  );
}

export function Input({ label, name, defaultValue, suffix, prefix, hint, type = "decimal", required }: { label: string; name: string; defaultValue?: string | number | null; suffix?: string; prefix?: string; hint?: string; type?: "decimal" | "text"; required?: boolean }) {
  const v = defaultValue === null || defaultValue === undefined ? "" : typeof defaultValue === "number" ? String(defaultValue).replace(".", ",") : defaultValue;
  return (
    <label className="block">
      <span className="block text-[13px] font-medium text-lab-muted mb-1.5">{label}</span>
      <span className="flex items-center h-11 rounded-xl border border-lab-line bg-lab-card px-3 gap-1.5 focus-within:border-brand">
        {prefix && <span className="text-sm text-lab-muted">{prefix}</span>}
        <input name={name} defaultValue={v} required={required} inputMode={type === "decimal" ? "decimal" : "text"} className="min-w-0 flex-1 bg-transparent outline-none text-[15px] text-lab-text" />
        {suffix && <span className="text-sm text-lab-muted">{suffix}</span>}
      </span>
      {hint && <span className="mt-1 block text-xs text-lab-muted">{hint}</span>}
    </label>
  );
}
