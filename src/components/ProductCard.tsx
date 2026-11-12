"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/products";
import { colorOf } from "@/lib/products";
import { STORE, brl } from "@/lib/config";
import ProductArt from "./ProductArt";
import { useCart } from "./CartProvider";
import { IconCheck, IconPlus } from "./Icons";

const TINTS = ["#f1ecff", "#ffeeea", "#eaf7ef", "#fff6dc", "#e8f4fd", "#fbeaf5"];

export default function ProductCard({ p, i = 0 }: { p: Product; i?: number }) {
  const [color, setColor] = useState(p.colors[0]);
  const [added, setAdded] = useState(false);
  const { add } = useCart();
  const quick = !p.personalize;
  const off = p.compareAt ? Math.round((1 - p.price / p.compareAt) * 100) : 0;

  return (
    <div className="group relative flex flex-col rounded-[var(--radius-card)] bg-white border border-line overflow-hidden hover:shadow-[0_18px_40px_-18px_rgba(40,20,90,.35)] transition-shadow">
      <Link href={`/produto/${p.slug}`} className="relative block aspect-square" style={{ background: TINTS[i % TINTS.length] }}>
        <div className="absolute left-3 top-3 flex gap-1.5">
          {p.badge && <span className="rounded-full bg-ink text-white text-[11px] font-semibold px-2.5 py-1">{p.badge}</span>}
          {off > 0 && !p.badge?.includes("%") && <span className="rounded-full bg-coral text-white text-[11px] font-semibold px-2.5 py-1">-{off}%</span>}
        </div>
        <ProductArt art={p.art} color={color} id={`card-${p.slug}`} className="absolute inset-0 m-auto w-[82%] h-[82%] group-hover:scale-[1.06] group-hover:-rotate-2 transition duration-500" />
      </Link>

      <div className="flex flex-col flex-1 p-3.5 sm:p-4">
        {p.colors.length > 1 && (
          <div className="flex items-center gap-1.5 mb-2.5" role="radiogroup" aria-label="Cor">
            {p.colors.slice(0, 5).map((id) => {
              const c = colorOf(id);
              return (
                <button
                  key={id}
                  role="radio"
                  aria-checked={color === id}
                  aria-label={c.label}
                  title={c.label}
                  onClick={() => setColor(id)}
                  className={`w-5 h-5 rounded-full transition ${color === id ? "ring-2 ring-offset-2 ring-ink" : "ring-1 ring-black/10"}`}
                  style={{ background: `linear-gradient(135deg, ${c.a}, ${c.b})` }}
                />
              );
            })}
            {p.colors.length > 5 && <span className="text-xs text-muted">+{p.colors.length - 5}</span>}
          </div>
        )}
        <Link href={`/produto/${p.slug}`} className="font-display font-semibold leading-snug text-[15px] sm:text-base hover:text-brand">
          {p.name}
        </Link>
        <p className="hidden sm:block text-sm text-muted mt-1 line-clamp-2">{p.short}</p>
        <div className="mt-auto pt-3 flex items-end justify-between gap-2">
          <div>
            {p.compareAt && <p className="text-xs text-muted line-through">{brl(p.compareAt)}</p>}
            <p className="font-bold text-[17px] leading-none">{brl(p.price)}</p>
            <p className="text-[11.5px] text-mint font-semibold mt-1">{brl(p.price * (1 - STORE.pixDiscount))} no Pix</p>
          </div>
          {quick ? (
            <button
              onClick={() => {
                add(p.slug, color, "", 1, false);
                setAdded(true);
                setTimeout(() => setAdded(false), 1400);
              }}
              aria-label={`Adicionar ${p.name} à sacola`}
              className={`shrink-0 grid place-items-center w-11 h-11 rounded-full transition ${added ? "bg-mint text-white" : "bg-ink text-white hover:bg-brand"}`}
            >
              {added ? <IconCheck size={18} /> : <IconPlus size={18} />}
            </button>
          ) : (
            <Link href={`/produto/${p.slug}`} className="shrink-0 rounded-full border border-ink/15 px-3 h-11 grid place-items-center text-xs font-semibold hover:border-ink">
              Personalizar
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
