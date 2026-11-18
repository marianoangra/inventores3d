import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/lab/safe-next";

// Volta do Google (?code=) ou do link do e-mail (?code= ou ?token_hash=&type=).
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const next = safeNext(sp.get("next"));
  const supabase = await createClient();
  const code = sp.get("code");
  const tokenHash = sp.get("token_hash");
  const type = sp.get("type") as EmailOtpType | null;

  let ok = false;
  let reason = sp.get("error_code") || sp.get("error") || "";
  if (code) {
    const r = await supabase.auth.exchangeCodeForSession(code);
    ok = !r.error;
    if (r.error) reason = `code:${r.error.code ?? r.error.message}`;
  } else if (tokenHash && type) {
    const r = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    ok = !r.error;
    if (r.error) reason = `token_hash:${r.error.code ?? r.error.message}`;
  } else if (!reason) reason = "sem_parametros";
  if (!ok) console.warn("[lab/callback] falhou:", reason);

  const to = request.nextUrl.clone();
  to.search = "";
  if (ok) {
    to.pathname = next.split("?")[0];
    const q = next.split("?")[1];
    if (q) to.search = "?" + q;
  } else {
    to.pathname = "/lab/entrar";
    to.searchParams.set("erro", "link");
  }
  return NextResponse.redirect(to);
}
