import Link from "next/link";
import Edy from "@/components/lab/Edy";

export default function LabNotFound() {
  return (
    <div className="py-16 text-center">
      <Edy size={110} mood="pensando" className="mx-auto" />
      <h1 className="mt-4 font-display text-2xl font-extrabold">Não achei isso no seu laboratório.</h1>
      <p className="mt-1 text-lab-muted">Pode ter sido excluído — ou o link está errado.</p>
      <Link href="/lab" className="mt-6 inline-flex h-11 items-center rounded-full bg-brand px-6 font-semibold text-white">Voltar ao início</Link>
    </div>
  );
}
