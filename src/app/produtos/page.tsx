import type { Metadata } from "next";
import { Suspense } from "react";
import Catalog from "./Catalog";

export const metadata: Metadata = {
  title: "Produtos",
  description: "Brinquedos articulados, fidgets, chaveiros, personalizados e kits de festa impressos em 3D sob encomenda.",
  alternates: { canonical: "/produtos" },
};

export default function Produtos() {
  return (
    <Suspense>
      <Catalog />
    </Suspense>
  );
}
