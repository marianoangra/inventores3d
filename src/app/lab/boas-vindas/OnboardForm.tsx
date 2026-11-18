"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { completeOnboarding, type OnboardState } from "./actions";
import { PRINTER_MODELS } from "@/lib/lab/defaults";

const input = "h-12 w-full rounded-xl border bg-lab-card px-4 text-[15px] text-lab-text outline-none focus:border-brand";

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export default function OnboardForm({ defaultName }: { defaultName: string }) {
  const [state, action, pending] = useActionState<OnboardState, FormData>(completeOnboarding, {});
  const [phone, setPhone] = useState("");
  const e = state.errors ?? {};
  const err = (k: keyof NonNullable<OnboardState["errors"]>) => (e[k] ? <p className="mt-1 text-xs text-coral">{e[k]}</p> : null);

  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1.5">Seu nome</label>
        <input id="name" name="name" defaultValue={defaultName} autoComplete="given-name" className={`${input} ${e.name ? "border-coral" : "border-lab-line"}`} />
        {err("name")}
      </div>
      <fieldset>
        <legend className="block text-sm font-medium mb-1.5">Qual impressora você tem?</legend>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PRINTER_MODELS.map((m) => (
            <label key={m.id} className="relative">
              <input type="radio" name="printer" value={m.id} className="peer sr-only" />
              <span className="flex h-12 items-center justify-center rounded-xl border border-lab-line bg-lab-card px-2 text-center text-[13px] font-medium cursor-pointer peer-checked:border-brand peer-checked:bg-brand peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-brand">
                {m.label}
              </span>
            </label>
          ))}
        </div>
        {err("printer")}
      </fieldset>
      <div>
        <label htmlFor="whatsapp" className="block text-sm font-medium mb-1.5">
          WhatsApp <span className="font-normal text-lab-muted">(opcional)</span>
        </label>
        <input
          id="whatsapp"
          name="whatsapp"
          inputMode="tel"
          autoComplete="tel-national"
          value={phone}
          onChange={(ev) => setPhone(maskPhone(ev.target.value))}
          placeholder="(11) 91234-5678"
          className={`${input} ${e.whatsapp ? "border-coral" : "border-lab-line"}`}
        />
        {err("whatsapp") ?? <p className="mt-1 text-xs text-lab-muted">Pra te chamar pro grupo e avisar de aulas novas. Ninguém mais vê seu número.</p>}
      </div>
      <div>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="privacy" className="mt-0.5 h-5 w-5 accent-[#6d4aff]" />
          <span>
            Li e aceito a <Link href="/lab/privacidade" target="_blank" className="underline">política de privacidade</Link>.
          </span>
        </label>
        {err("privacy")}
      </div>
      {e.form && <p role="alert" className="text-sm text-coral">{e.form}</p>}
      <button disabled={pending} className="h-12 w-full rounded-full bg-brand text-white font-semibold hover:bg-brand-dark disabled:opacity-60">
        {pending ? "Montando sua oficina…" : "Montar minha oficina"}
      </button>
    </form>
  );
}
