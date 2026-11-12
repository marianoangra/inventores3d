"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { STORE, brl } from "@/lib/config";

export default function Header() {
  const { count, setOpen } = useCart();
  return (
    <>
      <div className="bg-ink text-white text-center text-xs sm:text-sm py-2 px-4">
        🚚 Frete grátis acima de {brl(STORE.freeShippingFrom)} · {Math.round(STORE.pixDiscount * 100)}% off no Pix · Feito sob encomenda em até {STORE.productionDays} dias úteis
      </div>
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-black/5">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-pop text-white text-lg">3D</span>
            <span>Investores<span className="text-brand">3D</span></span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-ink/70">
            <Link href="/produtos?c=articulados" className="hover:text-brand">Articulados</Link>
            <Link href="/produtos?c=fidget" className="hover:text-brand">Fidget</Link>
            <Link href="/produtos?c=chaveiros" className="hover:text-brand">Chaveiros</Link>
            <Link href="/produtos?c=kits" className="hover:text-brand">Festas</Link>
            <Link href="/produtos?c=personalizados" className="hover:text-brand">Personalizados</Link>
          </nav>
          <button
            onClick={() => setOpen(true)}
            className="relative flex items-center gap-2 rounded-full bg-ink text-white px-4 h-10 text-sm font-bold hover:bg-brand transition"
            aria-label="Abrir carrinho"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 6h15l-1.5 9h-12z M6 6 5 3H2 M9 20a1 1 0 1 0 0-.01 M18 20a1 1 0 1 0 0-.01" /></svg>
            <span>Carrinho</span>
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-pop text-white text-xs grid place-items-center">{count}</span>
            )}
          </button>
        </div>
        <nav className="md:hidden flex gap-4 overflow-x-auto px-4 pb-2 text-sm font-semibold text-ink/70">
          <Link href="/produtos?c=articulados">Articulados</Link>
          <Link href="/produtos?c=fidget">Fidget</Link>
          <Link href="/produtos?c=chaveiros">Chaveiros</Link>
          <Link href="/produtos?c=kits">Festas</Link>
          <Link href="/produtos?c=personalizados" className="whitespace-nowrap">Personalizados</Link>
        </nav>
      </header>
    </>
  );
}
