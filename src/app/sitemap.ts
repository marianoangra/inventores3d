import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/lib/products";
import { STORE } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: STORE.url, priority: 1 },
    { url: `${STORE.url}/produtos`, priority: 0.9 },
    ...PRODUCTS.map((p) => ({ url: `${STORE.url}/produto/${p.slug}`, priority: 0.8 })),
    { url: `${STORE.url}/sobre`, priority: 0.3 },
  ];
}
