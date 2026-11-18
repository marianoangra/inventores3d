import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Edy from "@/components/lab/Edy";
import { LabLogo } from "@/components/lab/LabShell";
import GroupCard from "@/components/lab/GroupCard";
import { getProfile, getUser } from "@/lib/lab/data";
import OnboardForm from "./OnboardForm";

export const metadata: Metadata = { title: "Boas-vindas" };

export default async function BoasVindasPage({ searchParams }: { searchParams: Promise<{ pronto?: string }> }) {
  const user = await getUser();
  if (!user) redirect("/lab/entrar");
  const profile = await getProfile();
  const { pronto } = await searchParams;

  if (profile?.onboardedAt) {
    if (!pronto) redirect("/lab");
    return (
      <div className="min-h-dvh bg-lab-bg text-lab-text flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md text-center space-y-6">
          <Edy size={150} mood="festa" className="mx-auto" />
          <h1 className="font-display text-3xl font-extrabold">Pronto, {profile.name.split(" ")[0]}! Sua oficina está montada.</h1>
          <p className="text-lab-muted">Já deixei sua impressora, um rolo de PLA e os custos básicos cadastrados. Dá pra ajustar tudo em Minha oficina.</p>
          <GroupCard joined={profile.joinedGroup} />
          <Link href="/lab/calculadora" className="inline-flex h-12 items-center rounded-full bg-brand px-7 font-semibold text-white hover:bg-brand-dark">
            Fazer meu primeiro cálculo
          </Link>
        </div>
      </div>
    );
  }

  const guess = (user.user_metadata?.full_name as string | undefined) ?? "";
  return (
    <div className="min-h-dvh bg-lab-bg text-lab-text px-4 py-8">
      <div className="mx-auto w-full max-w-lg">
        <LabLogo />
        <div className="mt-8 flex items-center gap-4">
          <Edy size={84} mood="oi" className="shrink-0" />
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold">Oi! Eu sou o Edy.</h1>
            <p className="text-lab-muted mt-1">Me conta 3 coisinhas e eu monto sua oficina no Lab.</p>
          </div>
        </div>
        <div className="mt-8 rounded-3xl border border-lab-line bg-lab-card p-5 sm:p-6">
          <OnboardForm defaultName={guess} />
        </div>
      </div>
    </div>
  );
}
