import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { PRODUCTS, CATEGORIES, getProduct } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import AddToCart from "./AddToCart";
import { STORE } from "@/lib/config";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return {};
  return {
    title: p.name,
    description: `${p.short} ${p.description}`.slice(0, 160),
    alternates: { canonical: `/produto/${p.slug}` },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) notFound();
  const cat = CATEGORIES.find((c) => c.id === p.category)!;
  const same = PRODUCTS.filter((x) => x.slug !== p.slug && x.category === p.category);
  const related = [...same, ...PRODUCTS.filter((x) => x.slug !== p.slug && x.category !== p.category && x.bestseller)].slice(0, 4);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    brand: { "@type": "Brand", name: STORE.name },
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: p.price.toFixed(2),
      availability: "https://schema.org/PreOrder",
      url: `${STORE.url}/produto/${p.slug}`,
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-5 sm:pt-8 pb-28 lg:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="text-sm text-muted flex items-center gap-1.5 mb-5" aria-label="Você está em">
        <Link href="/" className="hover:text-ink">Início</Link>
        <span>/</span>
        <Link href={`/produtos?c=${cat.id}`} className="hover:text-ink">{cat.label}</Link>
        <span>/</span>
        <span className="text-ink truncate">{p.name}</span>
      </nav>
      <AddToCart product={p} />
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-3xl font-bold tracking-tight mb-6">Você também vai curtir</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {related.map((r, i) => (
              <ProductCard key={r.slug} p={r} i={i + 1} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
