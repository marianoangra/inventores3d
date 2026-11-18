"use client";

import { useId } from "react";

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  hint?: string;
  error?: string | null;
  decimal?: boolean;
  placeholder?: string;
  className?: string;
  name?: string;
};

/** Campo numérico que aceita vírgula. Guarda o texto digitado; quem usa converte com parseNum. */
export default function Field({ label, value, onChange, prefix, suffix, hint, error, decimal = true, placeholder, className, name }: Props) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-[13px] font-medium text-lab-muted mb-1.5">
        {label}
      </label>
      <div className={`flex items-center h-11 rounded-xl border bg-lab-card px-3 gap-1.5 focus-within:border-brand transition ${error ? "border-coral" : "border-lab-line"}`}>
        {prefix && <span className="text-sm text-lab-muted">{prefix}</span>}
        <input
          id={id}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode={decimal ? "decimal" : "numeric"}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent outline-none text-[15px] tabular-nums text-lab-text"
          aria-invalid={!!error}
          aria-describedby={hint || error ? `${id}-h` : undefined}
        />
        {suffix && <span className="text-sm text-lab-muted">{suffix}</span>}
      </div>
      {(error || hint) && (
        <p id={`${id}-h`} className={`mt-1 text-xs ${error ? "text-coral" : "text-lab-muted"}`}>
          {error || hint}
        </p>
      )}
    </div>
  );
}
