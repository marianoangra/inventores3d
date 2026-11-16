import Image from "next/image";
import type { Product } from "@/lib/products";
import { photosOf } from "@/lib/photos";
import ProductArt from "./ProductArt";

// Miniatura do produto: foto real se existir, senão a ilustração.
export default function Thumb({ p, color, id, sizes = "64px" }: { p: Product; color: string; id: string; sizes?: string }) {
  const photo = photosOf(p.slug)[0];
  if (photo) return <span className="relative block w-full h-full overflow-hidden rounded-[inherit]"><Image src={photo} alt="" fill sizes={sizes} className="object-cover" /></span>;
  return <ProductArt art={p.art} color={color} id={id} shadow={false} className="w-full h-full" />;
}
