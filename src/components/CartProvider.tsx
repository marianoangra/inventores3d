"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { COLORS, getProduct } from "@/lib/products";

export type CartItem = { key: string; slug: string; color: string; note: string; qty: number };

type Ctx = {
  items: CartItem[];
  add: (slug: string, color: string, note: string, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  open: boolean;
  setOpen: (v: boolean) => void;
};

const CartCtx = createContext<Ctx | null>(null);
const STORAGE = "i3d-cart-v1";

export const unitPrice = (slug: string, color: string) => {
  const p = getProduct(slug);
  if (!p) return 0;
  return p.price + (COLORS[color]?.extra ?? 0);
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) setItems((JSON.parse(raw) as CartItem[]).filter((i) => getProduct(i.slug)));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE, JSON.stringify(items));
    } catch {}
  }, [items, loaded]);

  const value = useMemo<Ctx>(() => {
    const add: Ctx["add"] = (slug, color, note, qty = 1) => {
      const key = `${slug}|${color}|${note.trim()}`;
      setItems((cur) => {
        const found = cur.find((i) => i.key === key);
        if (found) return cur.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i));
        return [...cur, { key, slug, color, note: note.trim(), qty }];
      });
      setOpen(true);
    };
    return {
      items,
      add,
      setQty: (key, qty) =>
        setItems((cur) => (qty <= 0 ? cur.filter((i) => i.key !== key) : cur.map((i) => (i.key === key ? { ...i, qty } : i)))),
      remove: (key) => setItems((cur) => cur.filter((i) => i.key !== key)),
      clear: () => setItems([]),
      count: items.reduce((s, i) => s + i.qty, 0),
      subtotal: items.reduce((s, i) => s + unitPrice(i.slug, i.color) * i.qty, 0),
      open,
      setOpen,
    };
  }, [items, open]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export const useCart = () => {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart fora do CartProvider");
  return c;
};
