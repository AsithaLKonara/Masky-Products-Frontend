"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { useCartStore } from "@/store/useCartStore";
import CartSidePanel from "./CartSidePanel";
import WishlistSidePanel from "./WishlistSidePanel";

interface CartContextType {
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  isWishlistOpen: boolean;
  openWishlist: () => void;
  closeWishlist: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const { isDrawerOpen, openDrawer, closeDrawer } = useCartStore();

  return (
    <CartContext.Provider 
      value={{ 
        isCartOpen: isDrawerOpen, 
        openCart: openDrawer, 
        closeCart: closeDrawer,
        isWishlistOpen,
        openWishlist: () => setIsWishlistOpen(true),
        closeWishlist: () => setIsWishlistOpen(false)
      }}
    >
      {children}
      <CartSidePanel />
      <WishlistSidePanel isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}

