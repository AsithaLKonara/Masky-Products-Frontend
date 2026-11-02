import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/CartProvider";
import PromoBanner from "@/components/PromoBanner";

export const metadata: Metadata = {
  title: "MASKY PRODUCT",
  description: "Pieces edited for quiet luxury — cut clean, worn easy.",
};

export default function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div id="storefront-layout" className="text-stone-900 min-h-screen flex flex-col pt-[34px] transition-[padding] duration-500 relative">
      {/* Fixed whole-web background image (no scroll, pinned to viewport) */}
      <div 
        aria-hidden="true" 
        className="fixed inset-0 pointer-events-none z-0" 
        style={{
          backgroundColor: "#FEF6E4",
          backgroundImage: "url('/hero-image/background-mushroom.png')",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      />
      <CartProvider>
        <div className="fixed top-0 left-0 right-0 z-50">
          <PromoBanner />
          <Navbar />
        </div>
        <main className="flex-1 relative z-10 bg-transparent">
          {children}
        </main>
        <div className="relative z-10">
          <Footer />
        </div>
      </CartProvider>
    </div>
  );
}
