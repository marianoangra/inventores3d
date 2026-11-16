import { ogCard, OG_SIZE } from "@/lib/og";
import { STORE } from "@/lib/config";

export const alt = "Inventores 3D — invenções próprias impressas em 3D";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return ogCard({
    kicker: "Impresso em 3D sob encomenda",
    title: "Invenções que você não acha em loja.",
    sub: `Frete grátis acima de R$ ${STORE.freeShippingFrom}`,
    art: "dragon",
    color: "galaxy",
    bg: "#efeaff",
  });
}
