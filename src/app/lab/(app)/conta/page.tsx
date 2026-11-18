import type { Metadata } from "next";
import Link from "next/link";
import ActionForm, { Input } from "@/components/lab/ActionForm";
import GroupCard from "@/components/lab/GroupCard";
import { getProfile, getUser } from "@/lib/lab/data";
import { PRINTER_MODELS } from "@/lib/lab/defaults";
import { formatWhatsapp } from "@/lib/lab/phone";
import { deleteAccount, updateProfile } from "./actions";

export const metadata: Metadata = { title: "Conta" };

const card = "rounded-3xl border border-lab-line bg-lab-card p-5 sm:p-6";
const field = "h-11 w-full rounded-xl border border-lab-line bg-lab-card px-3 text-[15px] text-lab-text outline-none focus:border-brand";

export default async function ContaPage() {
  const [user, profile] = await Promise.all([getUser(), getProfile()]);
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">Conta</h1>
      <GroupCard joined={!!profile?.joinedGroup} compact />
      <section className={card}>
        <p className="text-sm text-lab-muted mb-4">Entrou com <b className="text-lab-text">{user?.email}</b></p>
        <ActionForm action={updateProfile} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Input label="Nome" name="name" type="text" defaultValue={profile?.name} />
            <label className="block">
              <span className="block text-[13px] font-medium text-lab-muted mb-1.5">Impressora principal</span>
              <select name="printer" defaultValue={profile?.printerModel ?? "outra"} className={field}>
                {PRINTER_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </label>
            <Input label="WhatsApp (opcional)" name="whatsapp" type="text" defaultValue={profile?.whatsapp ? formatWhatsapp(profile.whatsapp) : ""} />
          </div>
        </ActionForm>
      </section>
      <section className={card}>
        <form action="/lab/sair" method="post">
          <button className="h-11 rounded-full border border-lab-line px-5 text-sm font-semibold hover:border-brand">Sair do Lab</button>
        </form>
      </section>
      <section className={`${card} border-coral/40`}>
        <h2 className="font-display text-lg font-extrabold text-coral">Excluir minha conta</h2>
        <p className="mt-1 text-sm text-lab-muted">Apaga sua conta e tudo que você lançou no Lab (oficina, peças, vendas e despesas). Não dá pra desfazer.</p>
        <ActionForm action={deleteAccount} submit="Excluir conta e dados" variant="danger" className="mt-4 space-y-3">
          <label className="block max-w-xs">
            <span className="block text-[13px] font-medium text-lab-muted mb-1.5">Digite EXCLUIR pra confirmar</span>
            <input name="confirm" autoComplete="off" className={field} />
          </label>
        </ActionForm>
      </section>
      <p className="text-xs text-lab-muted">
        <Link href="/lab/privacidade" className="underline">Política de privacidade</Link>
      </p>
    </div>
  );
}
