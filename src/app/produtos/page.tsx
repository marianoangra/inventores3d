import Link from "next/link";
import type { Metadata } from "next";
import { PRODUCTS, CATEGORIES, type Category } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export const metadata: Metadata = {
  title: "Produtos",
  description: "Todos os brinquedos articulados, fidgets, chaveiros e kits de festa impressos em 3D.",
  alternates: { canonical: "/produtos" },
};

export default async function Produtos({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const { c } = await searchParams;
  const cat = CATEGORIES.find((x) => x.id === c);
  const list = cat ? PRODUCTS.filter((p) => p.category === (cat.id as Category)) : PRODUCTS;
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-4xl font-bold">{cat ? cat.label : "Todos os produtos"}</h1>
      <p className="text-ink/60 mt-1">{cat ? cat.desc : "Tudo impresso sob encomenda, na cor que você escolher."}</p>
      <div className="flex gap-2 overflow-x-auto mt-6 pb-2">
        <Link href="/produtos" className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold border ${!cat ? "bg-ink text-white" : ""}`}>Todos</Link>
        {CATEGORIES.map((x) => (
          <Link key={x.id} href={`/produtos?c=${x.id}`} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold border ${cat?.id === x.id ? "bg-ink text-white" : ""}`}>
            {x.label}
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {list.map((p) => (
          <ProductCard key={p.slug} p={p} />
        ))}
      </div>
    </div>
  );
}
