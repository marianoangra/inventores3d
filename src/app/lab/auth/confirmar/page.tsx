"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Edy from "@/components/lab/Edy";
import { createClient } from "@/lib/supabase/browser";
import { parseAuthHash } from "@/lib/lab/auth-hash";
import { safeNext } from "@/lib/lab/safe-next";

const MSG: Record<string, string> = {
  otp_expired: "Esse link venceu ou já foi usado. Peça um novo.",
  sem_token: "O link veio incompleto. Peça um novo.",
};

// Volta do link do e-mail: os tokens chegam no # (só o navegador vê), viram sessão em cookie.
export default function ConfirmarPage() {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const next = safeNext(new URLSearchParams(window.location.search).get("next"));
    const parsed = parseAuthHash(window.location.hash);
    history.replaceState(null, "", window.location.pathname); // tira os tokens da barra de endereço
    if ("error" in parsed) {
      console.warn("[lab/confirmar]", parsed.error);
      setErr(MSG[parsed.error] ?? "Não deu pra entrar com esse link. Peça um novo.");
      return;
    }
    createClient()
      .auth.setSession({ access_token: parsed.accessToken, refresh_token: parsed.refreshToken })
      .then(({ error }) => {
        if (error) {
          console.warn("[lab/confirmar] setSession", error.message);
          setErr("Não deu pra entrar com esse link. Peça um novo.");
          return;
        }
        router.replace(next);
        router.refresh();
      });
  }, [router]);

  return (
    <div className="min-h-dvh bg-lab-bg text-lab-text grid place-items-center px-4">
      <div className="text-center max-w-sm">
        <Edy size={110} mood={err ? "pensando" : "oi"} className="mx-auto" />
        {err ? (
          <>
            <p className="mt-4 font-display text-xl font-extrabold">{err}</p>
            <Link href="/lab/entrar" className="mt-5 inline-flex h-11 items-center rounded-full bg-brand px-6 font-semibold text-white">Pedir novo link</Link>
          </>
        ) : (
          <p className="mt-4 font-display text-xl font-extrabold">Entrando no Lab…</p>
        )}
      </div>
    </div>
  );
}
