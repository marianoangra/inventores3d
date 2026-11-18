import Link from "next/link";
import { lessonFor } from "@/lib/lab/lessons";
import { IPlay } from "./LabIcons";

/** Link "Como usar esta tela" → vídeo-aula da tela (ou "em breve"). */
export default function HowTo({ screen }: { screen: string }) {
  const l = lessonFor(screen);
  if (!l) return null;
  if (!l.youtubeId)
    return (
      <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-lab-muted">
        <IPlay size={14} /> Vídeo-aula desta tela: em breve
      </p>
    );
  return (
    <Link href={`/lab/aprenda#${l.slug}`} className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
      <IPlay size={16} /> Como usar esta tela
    </Link>
  );
}
