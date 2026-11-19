import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Calculator from "@/components/lab/Calculator";
import ActionForm, { Input } from "@/components/lab/ActionForm";
import { getWorkshop } from "@/lib/lab/data";
import { getPart } from "@/lib/lab/parts-data";
import { deletePart, savePart, saveStl } from "../actions";

export const metadata: Metadata = { title: "Editar peça" };

export default async function EditPartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [part, { settings, printers, filaments }] = await Promise.all([getPart(id), getWorkshop()]);
  if (!part) notFound();
  return (
    <div className="space-y-5">
      <Link href="/lab/pecas" className="text-sm text-lab-muted hover:text-lab-text">← Minhas peças</Link>
      <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">{part.name}</h1>
      <Calculator key={part.id} workshop={settings} printers={printers} filaments={filaments} initial={part} onSave={savePart} />
      <section className="rounded-3xl border border-lab-line bg-lab-card p-5 sm:p-6">
        <h2 className="font-display text-lg font-extrabold mb-3">Arquivo do modelo</h2>
        <ActionForm action={saveStl} className="space-y-3">
          <input type="hidden" name="id" value={part.id} />
          <Input label="Link do STL / 3MF" name="url" type="text" defaultValue={part.stlUrl ?? ""} hint="Google Drive, Printables, MakerWorld… Fica guardado junto da peça." />
        </ActionForm>
        {part.stlUrl && (
          <a href={part.stlUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-semibold text-brand">Abrir arquivo ↗</a>
        )}
      </section>
      <ActionForm action={deletePart} submit="Excluir esta peça" variant="danger">
        <input type="hidden" name="id" value={part.id} />
      </ActionForm>
    </div>
  );
}
