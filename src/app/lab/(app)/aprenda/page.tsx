import type { Metadata } from "next";
import Edy from "@/components/lab/Edy";
import { LESSONS } from "@/lib/lab/lessons";

export const metadata: Metadata = { title: "Aprenda" };

export default function AprendaPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <Edy size={72} mood="oi" className="shrink-0" />
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">Aprenda com o Edy</h1>
          <p className="text-lab-muted mt-1">Aulas curtas, uma pra cada tela do Lab.</p>
        </div>
      </header>
      <ol className="grid gap-4 sm:grid-cols-2">
        {LESSONS.map((l, i) => (
          <li key={l.slug} id={l.slug} className="scroll-mt-24 rounded-3xl border border-lab-line bg-lab-card overflow-hidden">
            {l.youtubeId ? (
              <div className="aspect-video bg-ink">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${l.youtubeId}`}
                  title={l.title}
                  loading="lazy"
                  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              </div>
            ) : (
              <div className="aspect-video bg-ink grid place-items-center text-center px-6">
                <div>
                  <p className="font-display text-5xl font-extrabold text-lime">{i + 1}</p>
                  <p className="mt-1 text-sm text-white/70">Aula em gravação</p>
                </div>
              </div>
            )}
            <div className="p-4">
              <p className="font-display font-extrabold">{l.title}</p>
              <p className="text-sm text-lab-muted">{l.summary}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
