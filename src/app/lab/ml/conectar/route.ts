import { createHash, randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { authorizeUrl, isMlAdmin, mlConfigured } from "@/lib/ml/client";

// Início do OAuth: gera state + PKCE, guarda em cookie curto e manda pro ML.
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isMlAdmin(user?.email) || !mlConfigured()) return new NextResponse("Não encontrado", { status: 404 });

  const state = randomBytes(16).toString("base64url");
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");

  const res = NextResponse.redirect(authorizeUrl(request.nextUrl.origin, state, challenge));
  res.cookies.set("ml_oauth", `${state}.${verifier}`, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/lab/ml",
    maxAge: 600,
  });
  return res;
}
