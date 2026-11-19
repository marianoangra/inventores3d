"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Enquanto aguarda o pagamento, confere o status a cada 5 s (por até 15 min) e recarrega quando mudar. */
export default function StatusPoller({ code }: { code: string }) {
  const router = useRouter();
  useEffect(() => {
    const started = Date.now();
    const t = setInterval(async () => {
      if (Date.now() - started > 15 * 60e3) return clearInterval(t);
      try {
        const r = await fetch(`/api/pedido/${code}`, { cache: "no-store" });
        const j = (await r.json()) as { status?: string };
        if (j.status && j.status !== "pendente") {
          clearInterval(t);
          router.refresh();
        }
      } catch {}
    }, 5000);
    return () => clearInterval(t);
  }, [code, router]);
  return <p className="mt-3 text-center text-xs text-muted">Esperando a confirmação do pagamento…</p>;
}
