"use server";

import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { safeNext } from "@/lib/lab/safe-next";
import { STORE } from "@/lib/config";

/**
 * Envia o código/link por e-mail SEM PKCE: o link do e-mail funciona em qualquer navegador
 * (app do Gmail, celular), não só no navegador onde o código foi pedido.
 */
export async function sendLoginEmail(emailRaw: string, nextRaw: string): Promise<{ error?: string }> {
  const email = String(emailRaw ?? "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 200) return { error: "Digite um e-mail válido." };
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const origin = /^(localhost(:\d+)?|inventores3d\.com\.br|www\.inventores3d\.com\.br|[a-z0-9-]+-gasomax\.vercel\.app)$/.test(host) ? `${proto}://${host}` : STORE.url;

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { flowType: "implicit", persistSession: false, autoRefreshToken: false },
  });
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true, emailRedirectTo: `${origin}/lab/auth/confirmar?next=${encodeURIComponent(safeNext(nextRaw))}` },
  });
  if (error) {
    console.error("[lab/entrar] signInWithOtp", error.status, error.code, error.message);
    if (error.status === 429 || error.code === "over_email_send_rate_limit") return { error: "Limite de e-mails atingido. Espere alguns minutos e tente de novo." };
    return { error: "Não deu pra enviar o e-mail. Tente de novo." };
  }
  return {};
}
