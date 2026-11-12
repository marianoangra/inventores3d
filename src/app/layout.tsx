import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { STORE } from "@/lib/config";

const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["latin"], weight: ["500", "600", "700"] });
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(STORE.url),
  title: { default: "Investores 3D — Brinquedos articulados impressos em 3D", template: "%s | Investores 3D" },
  description:
    "Dragão articulado, dino, axolote, fidgets, chaveiros e lembrancinhas de festa impressos em 3D sob encomenda. Frete grátis acima de R$199 e 5% off no Pix.",
  keywords: ["dragão articulado", "brinquedo impressão 3d", "chaveiro articulado", "fidget 3d", "lembrancinha festa infantil", "axolote articulado"],
  openGraph: { type: "website", locale: "pt_BR", siteName: STORE.name, url: STORE.url },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${fredoka.variable} ${nunito.variable} antialiased`}>
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
