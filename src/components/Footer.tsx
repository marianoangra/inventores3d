"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { STORE } from "@/lib/config";
import { IconWhats } from "./Icons";

export function WhatsFloat() {
  const path = usePathname();
  if (path.startsWith("/checkout") || path.startsWith("/produto/")) return null;
  return (
    <a
      href={`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent("Oi! Vim pelo site da Inventores 3D e tenho uma dúvida.")}`}
      target="_blank"
      rel="noopener"
      aria-label="Falar no WhatsApp"
      className={`fixed z-30 right-4 bottom-4 sm:right-6 sm:bottom-6 ${path === "/" ? "grid" : "hidden sm:grid"} place-items-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-8px_rgba(37,211,102,.7)] hover:scale-105 transition`}
    >
      <IconWhats size={28} />
    </a>
  );
}

export default function Footer() {
  return (
    <footer className="mt-24 bg-ink text-white/70">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2 max-w-sm">
          <p className="font-display text-2xl font-bold text-white">
            inventores<span className="text-lime">3d</span>
          </p>
          <p className="text-sm mt-3 leading-relaxed">{STORE.tagline}. Cada peça sai da nossa impressora direto pra sua casa.</p>
          <a
            href={`https://wa.me/${STORE.whatsapp}`}
            target="_blank"
            rel="noopener"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/15 text-white text-sm font-semibold px-4 h-11"
          >
            <IconWhats size={18} /> Falar no WhatsApp
          </a>
        </div>
        <div className="text-sm space-y-2.5">
          <p className="font-semibold text-white mb-3">Loja</p>
          <Link href="/produtos" className="block hover:text-white">Todos os produtos</Link>
          <Link href="/produtos?c=articulados" className="block hover:text-white">Articulados</Link>
          <Link href="/produtos?c=kits" className="block hover:text-white">Lembrancinhas de festa</Link>
          <Link href="/produtos?c=personalizados" className="block hover:text-white">Personalizados</Link>
        </div>
        <div className="text-sm space-y-2.5">
          <p className="font-semibold text-white mb-3">Ajuda</p>
          <Link href="/sobre" className="block hover:text-white">Como funciona</Link>
          <Link href="/sobre#trocas" className="block hover:text-white">Trocas e devoluções</Link>
          <Link href="/sobre#privacidade" className="block hover:text-white">Privacidade</Link>
          <a href={`https://instagram.com/${STORE.instagram}`} target="_blank" rel="noopener" className="block hover:text-white">Instagram @{STORE.instagram}</a>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 sm:px-6 py-6 text-xs text-white/60">
          © {new Date().getFullYear()} {STORE.name} · Modelos originais ou com licença comercial · Pagamento via Pix ou cartão
        </p>
      </div>
    </footer>
  );
}
