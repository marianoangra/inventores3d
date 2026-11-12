import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import Header from "@/components/Header";
import Footer, { WhatsFloat } from "@/components/Footer";
import CartDrawer, { CartToast } from "@/components/CartDrawer";
import { STORE } from "@/lib/config";
import type { Viewport } from "next";

export const viewport: Viewport = { themeColor: "#fbfaf7" };

const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(STORE.url),
  title: { default: "Inventores 3D — Brinquedos articulados impressos em 3D", template: "%s | Inventores 3D" },
  description:
    "Dragão articulado, dino, axolote, fidgets, chaveiros e lembrancinhas de festa impressos em 3D sob encomenda. Frete grátis acima de R$199 e 5% off no Pix.",
  keywords: ["dragão articulado", "brinquedo impressão 3d", "chaveiro articulado", "fidget 3d", "lembrancinha festa infantil", "axolote articulado"],
  openGraph: { type: "website", locale: "pt_BR", siteName: STORE.name, url: STORE.url },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${bricolage.variable} ${inter.variable} antialiased`}>
        <CartProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
          <CartToast />
          <WhatsFloat />
        </CartProvider>
      </body>
    </html>
  );
}
