"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { useCart } from "./CartProvider";
import { STORE, brl } from "@/lib/config";
import { IconBag, IconSearch, IconX } from "./Icons";

const NAV = [
  { href: "/produtos?c=articulados", label: "Articulados", c: "articulados" },
  { href: "/produtos?c=fidget", label: "Fidget", c: "fidget" },
  { href: "/produtos?c=chaveiros", label: "Chaveiros", c: "chaveiros" },
  { href: "/produtos?c=kits", label: "Festas & Kits", c: "kits" },
  { href: "/produtos?c=personalizados", label: "Personalizados", c: "personalizados" },
];

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 shrink-0" aria-label="Inventores 3D — início">
      <span className="relative grid place-items-center w-9 h-9 rounded-[11px] bg-ink text-lime font-display font-extrabold text-[15px] tracking-tight">
        i3
        <span className="absolute -right-1 -top-1 w-3 h-3 rounded-full bg-coral ring-2 ring-paper" />
      </span>
      <span className="font-display text-[19px] font-bold tracking-tight">
        inventores<span className="text-brand">3d</span>
      </span>
    </Link>
  );
}

function NavLinks() {
  const sp = useSearchParams();
  const path = usePathname();
  const cur = path === "/produtos" ? sp.get("c") : null;
  return (
    <>
      {NAV.map((n) => (
        <Link
          key={n.c}
          href={n.href}
          className={`whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition ${cur === n.c ? "bg-ink text-white" : "text-ink/70 hover:text-ink hover:bg-black/[.04]"}`}
        >
          {n.label}
        </Link>
      ))}
    </>
  );
}

export default function Header() {
  const { count, setOpen } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [bump, setBump] = useState(0);

  useEffect(() => {
    if (searchOpen) input.current?.focus();
  }, [searchOpen]);
  useEffect(() => {
    if (count) setBump((b) => b + 1);
  }, [count]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchOpen(false);
    router.push(`/produtos?q=${encodeURIComponent(q.trim())}`);
  };

  const msgs = [
    `Frete grátis acima de ${brl(STORE.freeShippingFrom)}`,
    `${Math.round(STORE.pixDiscount * 100)}% off no Pix`,
    `Impresso sob encomenda em até ${STORE.productionDays} dias úteis`,
    "PLA atóxico e biodegradável",
    "Chegou com defeito? Reimprimimos grátis",
  ];

  return (
    <>
      <div className="bg-ink text-white/90 text-[12.5px] overflow-hidden h-8 flex items-center" aria-label="Avisos da loja">
        <div className="marquee flex gap-10 whitespace-nowrap pr-10">
          {[...msgs, ...msgs].map((m, i) => (
            <span key={i} className="flex items-center gap-10">
              {m}
              <span className="text-lime">✦</span>
            </span>
          ))}
        </div>
      </div>
      <header className="sticky top-0 z-40 bg-paper/85 backdrop-blur-xl border-b border-line">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center gap-4">
          <Logo />
          <nav className="hidden lg:flex items-center gap-1 mx-auto" aria-label="Categorias">
            <Suspense>
              <NavLinks />
            </Suspense>
          </nav>
          <div className="flex items-center gap-2 ml-auto lg:ml-0">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 h-10 rounded-full border border-line bg-white px-3 sm:pl-3.5 sm:pr-5 text-sm text-muted hover:border-ink/30 transition"
              aria-label="Buscar produtos"
            >
              <IconSearch size={18} />
              <span className="hidden sm:inline">Buscar</span>
            </button>
            <button
              onClick={() => setOpen(true)}
              className="relative flex items-center gap-2 h-10 rounded-full bg-ink text-white pl-3.5 pr-4 text-sm font-semibold hover:bg-brand transition"
              aria-label={`Abrir sacola, ${count} itens`}
            >
              <IconBag size={18} />
              <span className="hidden sm:inline">Sacola</span>
              {count > 0 && (
                <span key={bump} className="pop-in min-w-5 h-5 px-1.5 rounded-full bg-lime text-ink text-[11px] font-bold grid place-items-center">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
        <nav className="lg:hidden flex gap-1 overflow-x-auto no-scrollbar px-3 pb-2.5" aria-label="Categorias">
          <Suspense>
            <NavLinks />
          </Suspense>
        </nav>
      </header>

      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
          <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="mx-auto mt-20 max-w-xl px-4">
            <div className="flex items-center gap-3 rounded-2xl bg-white shadow-2xl px-5 h-16">
              <IconSearch className="text-muted" />
              <input
                ref={input}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Dragão, chaveiro, lembrancinha…"
                className="flex-1 bg-transparent text-lg outline-none"
                aria-label="Buscar"
              />
              <button type="button" onClick={() => setSearchOpen(false)} aria-label="Fechar busca" className="text-muted hover:text-ink">
                <IconX />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {["dragão", "chaveiro", "fidget", "festa", "axolote", "nome"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    router.push(`/produtos?q=${t}`);
                  }}
                  className="rounded-full bg-white/90 px-3.5 py-1.5 text-sm font-medium hover:bg-white"
                >
                  {t}
                </button>
              ))}
            </div>
          </form>
        </div>
      )}
    </>
  );
}
