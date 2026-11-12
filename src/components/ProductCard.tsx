import Link from "next/link";
import type { Product } from "@/lib/products";
import { STORE, brl } from "@/lib/config";
import ProductArt from "./ProductArt";

export default function ProductCard({ p }: { p: Product }) {
  return (
    <Link href={`/produto/${p.slug}`} className="group block rounded-3xl bg-white border border-black/5 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition">
      <div className="relative aspect-square bg-cream p-6">
        {p.badge && <span className="absolute top-3 left-3 rounded-full bg-pop text-white text-xs font-bold px-3 py-1">{p.badge}</span>}
        <ProductArt art={p.art} color={p.colors[0]} id={`card-${p.slug}`} className="w-full h-full group-hover:scale-105 transition" />
      </div>
      <div className="p-4">
        <h3 className="font-display font-bold leading-tight">{p.name}</h3>
        <p className="text-sm text-ink/60 mt-1 line-clamp-2">{p.short}</p>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-extrabold">{brl(p.price)}</span>
          {p.compareAt && <span className="text-sm text-ink/40 line-through">{brl(p.compareAt)}</span>}
        </div>
        <p className="text-xs text-green-700 font-semibold">{brl(p.price * (1 - STORE.pixDiscount))} no Pix</p>
      </div>
    </Link>
  );
}
