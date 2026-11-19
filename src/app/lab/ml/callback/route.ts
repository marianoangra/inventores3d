import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exchangeCode, isMlAdmin } from "@/lib/ml/client";

// Volta do ML: confere state, troca code por token e guarda no banco.
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isMlAdmin(user?.email)) return new NextResponse("Não encontrado", { status: 404 });

  const to = request.nextUrl.clone();
  to.pathname = "/lab/mercado-livre";
  to.search = "";

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const [savedState, verifier] = (request.cookies.get("ml_oauth")?.value ?? "").split(".");

  if (!code || !state || !savedState || state !== savedState || !verifier) {
    to.searchParams.set("erro", "Autorização inválida ou expirada. Tente conectar de novo.");
  } else {
    try {
      await exchangeCode(code, request.nextUrl.origin, verifier);
      to.searchParams.set("ok", "1");
    } catch (e) {
      console.error("[ml callback]", e);
      to.searchParams.set("erro", "O Mercado Livre recusou a troca do código. Veja os logs.");
    }
  }
  const res = NextResponse.redirect(to);
  res.cookies.delete({ name: "ml_oauth", path: "/lab/ml" });
  return res;
}
