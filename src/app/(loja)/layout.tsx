import { CartProvider } from "@/components/CartProvider";
import Header from "@/components/Header";
import Footer, { WhatsFloat } from "@/components/Footer";
import CartDrawer, { CartToast } from "@/components/CartDrawer";

export default function LojaLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <CartProvider>
      <Header />
      <main>{children}</main>
      <Footer />
      <CartDrawer />
      <CartToast />
      <WhatsFloat />
    </CartProvider>
  );
}
