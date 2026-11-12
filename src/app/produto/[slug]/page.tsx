import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PRODUCTS, getProduct } from "@/lib/products";
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
  const related = PRODUCTS.filter((x) => x.slug !== p.slug && x.category === p.category).slice(0, 3);
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
    <div className="mx-auto max-w-6xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <AddToCart product={p} />
      <section className="grid md:grid-cols-2 gap-10 mt-14">
        <div>
          <h2 className="font-display text-2xl font-bold">Sobre o produto</h2>
          <p className="text-ink/70 mt-3 leading-relaxed">{p.description}</p>
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold">Especificações</h2>
          <ul className="mt-3 space-y-2">
            {p.specs.map((s) => (
              <li key={s} className="flex gap-2 text-ink/80"><span className="text-brand">●</span>{s}</li>
            ))}
            {p.age && <li className="flex gap-2 text-ink/80"><span className="text-brand">●</span>Idade recomendada: {p.age}</li>}
          </ul>
        </div>
      </section>
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold mb-6">Combina com</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {related.map((r) => (
              <ProductCard key={r.slug} p={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
