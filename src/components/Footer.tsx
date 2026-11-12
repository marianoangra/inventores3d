import Link from "next/link";
import { STORE } from "@/lib/config";

export default function Footer() {
  return (
    <footer className="bg-ink text-white/80 mt-24">
      <div className="mx-auto max-w-6xl px-4 py-12 grid gap-8 sm:grid-cols-3">
        <div>
          <p className="font-display text-xl font-bold text-white">Inventores<span className="text-pop">3D</span></p>
          <p className="text-sm mt-2">{STORE.tagline}.</p>
        </div>
        <div className="text-sm space-y-2">
          <p className="font-bold text-white">Loja</p>
          <Link href="/produtos" className="block hover:text-white">Todos os produtos</Link>
          <Link href="/produtos?c=kits" className="block hover:text-white">Lembrancinhas de festa</Link>
          <Link href="/sobre" className="block hover:text-white">Como funciona · Trocas · Privacidade</Link>
        </div>
        <div className="text-sm space-y-2">
          <p className="font-bold text-white">Atendimento</p>
          <a href={`https://wa.me/${STORE.whatsapp}`} target="_blank" rel="noopener" className="block hover:text-white">WhatsApp</a>
          <a href={`https://instagram.com/${STORE.instagram}`} target="_blank" rel="noopener" className="block hover:text-white">Instagram @{STORE.instagram}</a>
        </div>
      </div>
      <p className="text-center text-xs text-white/40 pb-8">© {new Date().getFullYear()} {STORE.name} · Todos os modelos vendidos são originais ou com licença comercial.</p>
    </footer>
  );
}
