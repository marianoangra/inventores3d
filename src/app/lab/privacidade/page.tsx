import type { Metadata } from "next";
import Link from "next/link";
import { LabLogo } from "@/components/lab/LabShell";
import { STORE } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privacidade",
  description: "Como o Lab Inventores 3D trata seus dados.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/lab/privacidade" },
};

export default function PrivacidadePage() {
  return (
    <div className="min-h-dvh bg-lab-bg text-lab-text px-4 py-8">
      <article className="mx-auto max-w-2xl space-y-5 leading-relaxed">
        <LabLogo />
        <h1 className="font-display text-3xl font-extrabold">Política de privacidade do Lab</h1>
        <p className="text-sm text-lab-muted">Atualizada em 18/11/2026.</p>
        <p>O Lab Inventores 3D é uma área grátis da {STORE.name} ({STORE.domain}) com ferramentas para quem está começando a vender impressão 3D. Esta página explica, sem juridiquês, o que fazemos com seus dados.</p>
        <h2 className="font-display text-xl font-extrabold">O que guardamos</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Seu e-mail (para você entrar) e, se entrar com Google, o nome que o Google informa.</li>
          <li>Seu nome, sua impressora e, se você quiser, seu WhatsApp.</li>
          <li>O que você digita no Lab: oficina, peças, vendas e despesas.</li>
        </ul>
        <h2 className="font-display text-xl font-extrabold">Para que usamos</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Fazer o Lab funcionar: cálculos, histórico e resultados.</li>
          <li>Se você informou o WhatsApp: convidar você para o grupo da comunidade e avisar de aulas novas. Você pode apagar o número em Conta quando quiser.</li>
        </ul>
        <h2 className="font-display text-xl font-extrabold">O que não fazemos</h2>
        <p>Não vendemos nem compartilhamos seus dados. Cada pessoa só enxerga os próprios lançamentos — nem outros usuários nem a loja usam seus números de vendas.</p>
        <h2 className="font-display text-xl font-extrabold">Onde ficam</h2>
        <p>Em um banco de dados na Supabase, com acesso restrito por conta. A conexão é sempre criptografada (https).</p>
        <h2 className="font-display text-xl font-extrabold">Seus direitos (LGPD)</h2>
        <p>Você pode ver e corrigir seus dados em Conta, e excluir a conta com todos os dados a qualquer momento pelo botão “Excluir minha conta”. Dúvidas: fale com a gente no <a href={`https://wa.me/${STORE.whatsapp}`} className="underline">WhatsApp</a>.</p>
        <p className="pt-4"><Link href="/lab" className="font-semibold text-brand">← Voltar para o Lab</Link></p>
      </article>
    </div>
  );
}
