import type { Metadata } from "next";
import { asaasConfigured } from "@/lib/shop/asaas";
import Checkout from "./CheckoutClient";

export const metadata: Metadata = { title: "Finalizar pedido", robots: { index: false } };

// Pagamento no site liga sozinho quando as variáveis do Asaas existem na Vercel (precisa de novo deploy).
export default function CheckoutPage() {
  return <Checkout online={asaasConfigured()} />;
}
