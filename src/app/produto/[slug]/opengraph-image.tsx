import { ogCard, OG_SIZE } from "@/lib/og";
import { PRODUCTS, getProduct } from "@/lib/products";
import { brl, STORE } from "@/lib/config";

export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProduct(slug) ?? PRODUCTS[0];
  return ogCard({
    kicker: "Impresso em 3D na sua cor",
    title: p.name,
    sub: p.compareAt ? `de ${brl(p.compareAt)} por ${brl(p.price)}` : `${brl(p.price)} · pronto em ${STORE.productionDays} dias`,
    art: p.art,
    color: p.colors[0],
    bg: "#efeaff",
  });
}
