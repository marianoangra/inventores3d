import type { Metadata } from "next";
import Link from "next/link";
import Edy from "@/components/lab/Edy";
import GroupCard from "@/components/lab/GroupCard";
import FirstSteps from "@/components/lab/FirstSteps";
import MonthCards from "@/components/lab/MonthCards";
import { getWorkshop, requireOnboarded } from "@/lib/lab/data";
import { getMonth } from "@/lib/lab/month-data";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Início" };

export default async function LabHome() {
  const profile = await requireOnboarded(); // layout e página rodam em paralelo: a página também precisa redirecionar
  const supabase = await createClient();
  const [{ reviewed }, parts, month] = await Promise.all([
    getWorkshop(),
    supabase.from("parts").select("id", { count: "exact", head: true }),
    getMonth(),
  ]);
  const { count: anySales } = await supabase.from("sales").select("id", { count: "exact", head: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Edy size={72} mood={month.summary.profit > 0 ? "festa" : "oi"} className="shrink-0" />
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">Oi, {profile.name.split(" ")[0]}!</h1>
          <p className="text-lab-muted">Bem-vindo ao seu laboratório.</p>
        </div>
      </div>
      <GroupCard joined={profile.joinedGroup} />
      <FirstSteps reviewed={reviewed} hasPart={!!parts.count} hasSale={!!anySales} />
      <section aria-label="Resumo do mês">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display text-xl font-extrabold">{month.label}</h2>
          <Link href="/lab/resultados" className="text-sm font-semibold text-brand">Ver resultados</Link>
        </div>
        <MonthCards s={month.summary} />
      </section>
    </div>
  );
}
