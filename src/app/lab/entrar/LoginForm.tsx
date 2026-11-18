"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

const input = "h-12 w-full rounded-xl border border-lab-line bg-lab-card px-4 text-[15px] text-lab-text outline-none focus:border-brand";
const btn = "h-12 w-full rounded-full bg-brand text-white font-semibold hover:bg-brand-dark disabled:opacity-60 transition";

export default function LoginForm({ next, google }: { next: string; google: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const callback = () => `${window.location.origin}/lab/auth/callback?next=${encodeURIComponent(next)}`;

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setErr("Digite um e-mail válido.");
    setBusy(true);
    const { error } = await createClient().auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: true, emailRedirectTo: callback() },
    });
    setBusy(false);
    if (error) return setErr(error.status === 429 ? "Muitas tentativas. Espere um minuto e tente de novo." : "Não deu pra enviar o código. Tente de novo.");
    setStep("code");
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const token = code.replace(/\D/g, "");
    if (token.length < 6) return setErr("O código tem 6 dígitos.");
    setBusy(true);
    const { error } = await createClient().auth.verifyOtp({ email: email.trim().toLowerCase(), token, type: "email" });
    setBusy(false);
    if (error) return setErr("Código errado ou vencido. Confira o e-mail ou peça outro.");
    router.replace(next);
    router.refresh();
  };

  const withGoogle = async () => {
    setErr(null);
    const { error } = await createClient().auth.signInWithOAuth({ provider: "google", options: { redirectTo: callback() } });
    if (error) setErr("Não deu pra abrir o Google. Use o código no e-mail.");
  };

  return (
    <div className="space-y-4">
      {google && step === "email" && (
        <>
          <button onClick={withGoogle} className="h-12 w-full rounded-full border border-lab-line bg-lab-card font-semibold flex items-center justify-center gap-3 hover:border-brand transition">
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
              <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
            </svg>
            Entrar com Google
          </button>
          <div className="flex items-center gap-3 text-xs text-lab-muted">
            <span className="h-px flex-1 bg-lab-line" /> ou receba um código no e-mail <span className="h-px flex-1 bg-lab-line" />
          </div>
        </>
      )}

      {step === "email" ? (
        <form onSubmit={sendCode} className="space-y-3">
          <label htmlFor="email" className="block text-sm font-medium">Seu e-mail</label>
          <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" className={input} />
          <button disabled={busy} className={btn}>{busy ? "Enviando…" : "Receber código"}</button>
          <p className="text-xs text-lab-muted text-center">Sem senha. Se for sua primeira vez, a conta é criada na hora.</p>
        </form>
      ) : (
        <form onSubmit={verify} className="space-y-3">
          <p className="text-sm">
            Mandamos um código de 6 dígitos para <b>{email}</b>. Pode levar um minutinho — olhe também o spam.
          </p>
          <label htmlFor="code" className="block text-sm font-medium">Código</label>
          <input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="000000"
            maxLength={8}
            className={`${input} text-center text-2xl tracking-[.4em] font-display font-bold`}
          />
          <button disabled={busy} className={btn}>{busy ? "Conferindo…" : "Entrar"}</button>
          <button type="button" onClick={() => { setStep("email"); setCode(""); setErr(null); }} className="w-full text-sm text-lab-muted hover:text-lab-text">
            Trocar e-mail ou pedir outro código
          </button>
        </form>
      )}
      {err && <p role="alert" className="text-sm text-coral text-center">{err}</p>}
    </div>
  );
}
