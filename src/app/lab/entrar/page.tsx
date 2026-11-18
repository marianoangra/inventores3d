import type { Metadata } from "next";
import Link from "next/link";
import Edy from "@/components/lab/Edy";
import { LabLogo } from "@/components/lab/LabShell";
import { safeNext } from "@/lib/lab/safe-next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Lab Inventores 3D: calculadora de preço, vendas, despesas e resultados grátis para quem está começando na impressão 3D.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/lab/entrar" },
};

const PERKS = ["Quanto cobrar em cada peça, já com taxa da Shopee e do ML", "Lucro por hora de máquina", "Vendas, despesas e resultado do mês", "Grátis. Sem cartão."];

export default async function EntrarPage({ searchParams }: { searchParams: Promise<{ next?: string; erro?: string; conta?: string }> }) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  return (
    <div className="min-h-dvh bg-lab-bg text-lab-text grid lg:grid-cols-2">
      <section className="hidden lg:flex flex-col justify-between bg-ink text-white p-12">
        <Link href="/" className="font-display text-xl font-bold">inventores<span className="text-lime">3d</span></Link>
        <div>
          <Edy size={150} mood="oi" />
          <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight tracking-tight">O laboratório de quem está começando a vender impressão 3D.</h1>
          <ul className="mt-6 space-y-2.5 text-white/80">
            {PERKS.map((p) => (
              <li key={p} className="flex gap-2.5"><span className="text-lime">✦</span>{p}</li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-white/50">Feito pela Inventores 3D, uma oficina de invenções impressas em 3D.</p>
      </section>

      <section className="flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex flex-col items-center text-center mb-8">
            <LabLogo />
            <Edy size={96} mood="oi" className="mt-6" />
            <h1 className="mt-3 font-display text-2xl font-extrabold">O laboratório de quem está começando na impressão 3D</h1>
            <p className="mt-2 text-sm text-lab-muted">Calculadora de preço, vendas e resultados. Grátis.</p>
          </div>
          <h2 className="hidden lg:block font-display text-3xl font-extrabold mb-6">Entrar no Lab</h2>
          {sp.erro === "link" && <p className="mb-4 rounded-xl bg-coral/10 border border-coral/30 p-3 text-sm">O link expirou ou já foi usado. Peça um código novo.</p>}
          {sp.conta === "excluida" && <p className="mb-4 rounded-xl bg-lab-soft p-3 text-sm">Sua conta e seus dados foram excluídos.</p>}
          <LoginForm next={next} google={process.env.NEXT_PUBLIC_LAB_GOOGLE === "1"} />
          <p className="mt-8 text-center text-xs text-lab-muted">
            Ao entrar você concorda com a <Link href="/lab/privacidade" className="underline">política de privacidade</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
