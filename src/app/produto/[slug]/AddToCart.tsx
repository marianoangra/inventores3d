"use client";

import { useState } from "react";
import type { Product } from "@/lib/products";
import { colorOf } from "@/lib/products";
import { useCart } from "@/components/CartProvider";
import ProductArt from "@/components/ProductArt";
import { STORE, brl } from "@/lib/config";

export default function AddToCart({ product: p }: { product: Product }) {
  const [color, setColor] = useState(p.colors[0]);
  const [note, setNote] = useState("");
  const [qty, setQty] = useState(1);
  const { add } = useCart();
  const unit = p.price + (colorOf(color).extra ?? 0);
  const needsNote = !!p.personalize;

  return (
    <div className="grid md:grid-cols-2 gap-10 items-start">
      <div className="relative rounded-[2rem] bg-cream aspect-square p-10">
        {p.badge && <span className="absolute top-5 left-5 rounded-full bg-pop text-white text-sm font-bold px-3 py-1">{p.badge}</span>}
        <ProductArt art={p.art} color={color} id={`pdp-${p.slug}`} className="w-full h-full" />
      </div>
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight">{p.name}</h1>
        <p className="text-ink/70 mt-3">{p.short}</p>
        <div className="mt-5 flex items-baseline gap-3">
          <span className="text-3xl font-extrabold">{brl(unit)}</span>
          {p.compareAt && <span className="text-ink/40 line-through">{brl(p.compareAt)}</span>}
        </div>
        <p className="text-green-700 font-semibold">{brl(unit * (1 - STORE.pixDiscount))} no Pix · ou parcelado no cartão</p>

        {p.colors.length > 1 && (
          <div className="mt-6">
            <p className="font-bold text-sm">Cor: <span className="font-normal">{colorOf(color).label}{colorOf(color).extra ? ` (+${brl(colorOf(color).extra!)})` : ""}</span></p>
            <div className="flex flex-wrap gap-2 mt-2">
              {p.colors.map((id) => {
                const c = colorOf(id);
                return (
                  <button
                    key={id}
                    onClick={() => setColor(id)}
                    title={c.label}
                    aria-label={c.label}
                    className={`w-10 h-10 rounded-full border-4 transition ${color === id ? "border-ink scale-110" : "border-white shadow"}`}
                    style={{ background: `linear-gradient(135deg, ${c.a}, ${c.b})` }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {needsNote && (
          <label className="block mt-6">
            <span className="font-bold text-sm">{p.personalize}</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={140}
              className="mt-2 w-full rounded-xl border px-4 py-3 focus:outline-brand"
              placeholder="Escreva aqui"
            />
          </label>
        )}

        <div className="flex gap-3 mt-6">
          <div className="flex items-center border rounded-full">
            <button className="w-11 h-12 text-lg" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Diminuir">−</button>
            <span className="w-8 text-center font-bold">{qty}</span>
            <button className="w-11 h-12 text-lg" onClick={() => setQty(qty + 1)} aria-label="Aumentar">+</button>
          </div>
          <button
            disabled={needsNote && !note.trim()}
            onClick={() => add(p.slug, color, note, qty)}
            className="flex-1 rounded-full bg-brand hover:bg-brand-dark disabled:opacity-40 text-white font-bold transition"
          >
            {needsNote && !note.trim() ? "Preencha a personalização" : "Adicionar ao carrinho"}
          </button>
        </div>

        <ul className="mt-6 text-sm text-ink/70 space-y-1.5">
          <li>🖨️ Impresso sob encomenda — pronto em até {STORE.productionDays} dias úteis</li>
          <li>🚚 Frete grátis acima de {brl(STORE.freeShippingFrom)}</li>
          <li>🔁 Chegou com defeito? A gente reimprime e reenvia sem custo</li>
        </ul>
      </div>
    </div>
  );
}
