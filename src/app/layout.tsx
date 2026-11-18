import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";
import { STORE } from "@/lib/config";
import type { Viewport } from "next";

export const viewport: Viewport = { themeColor: "#fbfaf7" };

const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(STORE.url),
  title: { default: "Inventores 3D — Invenções próprias impressas em 3D", template: "%s | Inventores 3D" },
  description:
    "Loja de invenções próprias impressas em 3D: Rok-Cooler foguete, Snap-Pong, colecionáveis, brinquedos articulados e personalizados, feitos sob encomenda. Frete grátis acima de R$199 e 5% off no Pix.",
  keywords: ["invenções impressão 3d", "cooler foguete", "jogo de pong de lata", "boneco colecionável 3d", "dragão articulado", "brinquedo impressão 3d", "chaveiro articulado", "fidget 3d", "lembrancinha festa infantil", "axolote articulado"],
  openGraph: { type: "website", locale: "pt_BR", siteName: STORE.name, url: STORE.url },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${bricolage.variable} ${inter.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Store",
              name: STORE.name,
              url: STORE.url,
              description: STORE.tagline,
              image: `${STORE.url}/opengraph-image`,
              telephone: `+${STORE.whatsapp}`,
              priceRange: "R$",
              currenciesAccepted: "BRL",
              paymentAccepted: "Pix, cartão de crédito",
              sameAs: [`https://instagram.com/${STORE.instagram}`],
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
