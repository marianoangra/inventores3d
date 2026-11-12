"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useCart, unitPrice } from "./CartProvider";
import { getProduct, colorOf } from "@/lib/products";
import { STORE, brl } from "@/lib/config";
import ProductArt from "./ProductArt";
import { IconBag, IconMinus, IconPlus, IconTruck, IconX, IconArrow } from "./Icons";

const UPSELL = ["chaveiro-articulado", "fidget-slider-click", "polvo-articulado", "fidget-engrenagem"];

export function CartToast() {
  const { toast, setOpen } = useCart();
  if (!toast) return null;
  const p = getProduct(toast.slug)!;
  return (
    <div key={toast.n} role="status" className="pop-in fixed z-50 left-1/2 -translate-x-1/2 bottom-5 sm:bottom-auto sm:top-24 sm:left-auto sm:right-6 sm:translate-x-0 flex items-center gap-3 rounded-2xl bg-ink text-white pl-2 pr-3 py-2 shadow-2xl w-[calc(100%-2rem)] max-w-sm">
      <div className="w-12 h-12 rounded-xl bg-white/10 shrink-0">
        <ProductArt art={p.art} color={toast.color} id="toast" shadow={false} className="w-full h-full" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-lime font-semibold">Adicionado à sacola</p>
        <p className="text-sm truncate">{p.name}</p>
      </div>
      <button onClick={() => setOpen(true)} className="rounded-full bg-white text-ink text-xs font-bold px-3 py-2">Ver</button>
    </div>
  );
}

export default function CartDrawer() {
  const { items, open, setOpen, setQty, remove, subtotal, add } = useCart();
  const falta = STORE.freeShippingFrom - subtotal;
  const pct = Math.min(100, (subtotal / STORE.freeShippingFrom) * 100);
  const inCart = new Set(items.map((i) => i.slug));
  const ups = UPSELL.filter((s) => !inCart.has(s)).slice(0, 3).map((s) => getProduct(s)!).filter(Boolean);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  return (
    <div className={`fixed inset-0 z-[70] ${open ? "" : "pointer-events-none"}`} inert={!open}>
      <div onClick={() => setOpen(false)} className={`absolute inset-0 bg-ink/40 backdrop-blur-[2px] transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} />
      <aside
        role="dialog"
        aria-label="Sacola"
        className={`absolute right-0 top-0 h-full w-full sm:max-w-[440px] bg-paper shadow-2xl flex flex-col transition-transform duration-300 ease-out ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 h-16 border-b border-line">
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            Sacola <span className="text-muted text-base font-medium">({items.reduce((s, i) => s + i.qty, 0)})</span>
          </h2>
          <button onClick={() => setOpen(false)} className="grid place-items-center w-10 h-10 rounded-full hover:bg-black/5" aria-label="Fechar sacola">
            <IconX />
          </button>
        </div>

        {items.length > 0 && (
          <div className="px-5 py-3.5 bg-white border-b border-line">
            <p className="text-sm flex items-center gap-2">
              <IconTruck size={18} className="text-brand" />
              {falta > 0 ? (
                <span>
                  Faltam <b>{brl(falta)}</b> pro <b>frete grátis</b>
                </span>
              ) : (
                <b className="text-mint-ink">Frete grátis garantido!</b>
              )}
            </p>
            <div className="h-1.5 mt-2.5 rounded-full bg-line overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-brand to-coral transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center text-center px-8 py-16">
              <div className="grid place-items-center w-20 h-20 rounded-full bg-brand-soft text-brand">
                <IconBag size={34} />
              </div>
              <p className="font-display text-xl font-bold mt-5">Sua sacola está vazia</p>
              <p className="text-muted text-sm mt-1">Que tal começar pelo dragão, o mais pedido da loja?</p>
              <Link href="/produto/dragao-articulado-cristal" onClick={() => setOpen(false)} className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink text-white font-semibold px-6 h-12">
                Ver o dragão <IconArrow size={18} />
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-line px-5">
              {items.map((i) => {
                const p = getProduct(i.slug)!;
                return (
                  <li key={i.key} className="flex gap-3.5 py-4">
                    <Link href={`/produto/${p.slug}`} onClick={() => setOpen(false)} className="w-[84px] h-[84px] rounded-2xl bg-white border border-line shrink-0 p-1.5">
                      <ProductArt art={p.art} color={i.color} id={`c-${i.key}`} shadow={false} className="w-full h-full" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <p className="font-semibold leading-tight">{p.name}</p>
                        <button onClick={() => remove(i.key)} className="text-muted hover:text-coral shrink-0 -mt-0.5" aria-label={`Remover ${p.name}`}>
                          <IconX size={16} />
                        </button>
                      </div>
                      <p className="text-xs text-muted mt-0.5 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: `linear-gradient(135deg, ${colorOf(i.color).a}, ${colorOf(i.color).b})` }} />
                        {colorOf(i.color).label}
                      </p>
                      {i.note && <p className="text-xs text-muted truncate mt-0.5">“{i.note}”</p>}
                      <div className="flex items-center justify-between mt-2.5">
                        <div className="flex items-center rounded-full bg-white border border-line h-9">
                          <button className="grid place-items-center w-9 h-9" onClick={() => setQty(i.key, i.qty - 1)} aria-label="Diminuir quantidade">
                            <IconMinus size={14} />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold tabular-nums">{i.qty}</span>
                          <button className="grid place-items-center w-9 h-9" onClick={() => setQty(i.key, i.qty + 1)} aria-label="Aumentar quantidade">
                            <IconPlus size={14} />
                          </button>
                        </div>
                        <span className="font-bold tabular-nums">{brl(unitPrice(i.slug, i.color) * i.qty)}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {items.length > 0 && ups.length > 0 && (
            <div className="px-5 pb-6 pt-2">
              <p className="text-sm font-semibold mb-3">Leve junto</p>
              <div className="grid grid-cols-3 gap-2.5">
                {ups.map((u) => (
                  <button
                    key={u.slug}
                    onClick={() => add(u.slug, u.colors[0], "", 1)}
                    className="group text-left rounded-2xl bg-white border border-line p-2 hover:border-ink/30 transition"
                  >
                    <div className="aspect-square rounded-xl bg-brand-soft/60">
                      <ProductArt art={u.art} color={u.colors[0]} id={`up-${u.slug}`} shadow={false} className="w-full h-full" />
                    </div>
                    <p className="text-[11.5px] font-medium leading-tight mt-1.5 line-clamp-2">{u.name}</p>
                    <p className="text-xs font-bold mt-1 flex items-center justify-between">
                      {brl(u.price)}
                      <span className="grid place-items-center w-5 h-5 rounded-full bg-ink text-white group-hover:bg-brand">
                        <IconPlus size={12} />
                      </span>
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-line bg-white p-5 space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-muted">Subtotal</span>
              <span className="font-bold text-xl tabular-nums">{brl(subtotal)}</span>
            </div>
            <p className="text-sm text-mint-ink font-semibold text-right -mt-2">ou {brl(subtotal * (1 - STORE.pixDiscount))} no Pix</p>
            <Link
              href="/checkout"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 rounded-full bg-brand hover:bg-brand-dark text-white font-semibold h-14 transition"
            >
              Finalizar pedido <IconArrow size={18} />
            </Link>
            <button onClick={() => setOpen(false)} className="w-full text-sm text-muted hover:text-ink">
              Continuar comprando
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

