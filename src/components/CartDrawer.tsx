"use client";

import Link from "next/link";
import { useCart, unitPrice } from "./CartProvider";
import { getProduct, colorOf } from "@/lib/products";
import { STORE, brl } from "@/lib/config";
import ProductArt from "./ProductArt";

export default function CartDrawer() {
  const { items, open, setOpen, setQty, remove, subtotal } = useCart();
  const falta = STORE.freeShippingFrom - subtotal;
  const pct = Math.min(100, (subtotal / STORE.freeShippingFrom) * 100);

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div onClick={() => setOpen(false)} className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} />
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-display text-xl font-bold">Seu carrinho</h2>
          <button onClick={() => setOpen(false)} className="w-9 h-9 rounded-full hover:bg-black/5 text-xl" aria-label="Fechar">×</button>
        </div>

        {items.length > 0 && (
          <div className="px-4 pt-3">
            <p className="text-sm font-semibold">
              {falta > 0 ? <>Faltam <span className="text-brand">{brl(falta)}</span> pro frete grátis</> : <>🎉 Você ganhou frete grátis!</>}
            </p>
            <div className="h-2 mt-2 rounded-full bg-black/5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-brand to-pop transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 && (
            <div className="text-center py-16 text-ink/60">
              <p className="text-5xl mb-3">🐉</p>
              <p>Seu carrinho está vazio.</p>
              <Link href="/produtos" onClick={() => setOpen(false)} className="inline-block mt-4 font-bold text-brand">Ver produtos →</Link>
            </div>
          )}
          {items.map((i) => {
            const p = getProduct(i.slug)!;
            return (
              <div key={i.key} className="flex gap-3">
                <div className="w-20 h-20 rounded-xl bg-cream shrink-0 p-1">
                  <ProductArt art={p.art} color={i.color} id={`c-${i.key}`} className="w-full h-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold leading-tight">{p.name}</p>
                  <p className="text-xs text-ink/60">Cor: {colorOf(i.color).label}</p>
                  {i.note && <p className="text-xs text-ink/60 truncate">Obs: {i.note}</p>}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border rounded-full">
                      <button className="w-8 h-8" onClick={() => setQty(i.key, i.qty - 1)} aria-label="Diminuir">−</button>
                      <span className="w-6 text-center text-sm font-bold">{i.qty}</span>
                      <button className="w-8 h-8" onClick={() => setQty(i.key, i.qty + 1)} aria-label="Aumentar">+</button>
                    </div>
                    <span className="font-bold">{brl(unitPrice(i.slug, i.color) * i.qty)}</span>
                  </div>
                  <button onClick={() => remove(i.key)} className="text-xs text-ink/50 hover:text-red-600 mt-1">remover</button>
                </div>
              </div>
            );
          })}
        </div>

        {items.length > 0 && (
          <div className="border-t p-4 space-y-3">
            <div className="flex justify-between font-bold text-lg">
              <span>Subtotal</span>
              <span>{brl(subtotal)}</span>
            </div>
            <p className="text-sm text-green-700 font-semibold">No Pix: {brl(subtotal * (1 - STORE.pixDiscount))}</p>
            <Link
              href="/checkout"
              onClick={() => setOpen(false)}
              className="block text-center rounded-full bg-brand hover:bg-brand-dark text-white font-bold py-3.5 transition"
            >
              Finalizar pedido
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
