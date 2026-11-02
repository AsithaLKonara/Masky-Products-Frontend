"use client";

import { useEffect } from "react";
import { X, Heart } from "lucide-react";
import CartItem from "./CartItem";
import { getEffectivePrice } from "@/lib/pricing";
import { useCartStore } from "@/store/useCartStore";
import { useWishlist, useRemoveFromWishlist } from "@/hooks/useWishlist";
import { useAddToCart } from "@/hooks/useCart";
import Link from "next/link";

export default function WishlistSidePanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const sessionId = useCartStore((state) => state.sessionId);
  const { data: wishlist, isLoading } = useWishlist(sessionId);
  const removeFromWishlist = useRemoveFromWishlist(sessionId, wishlist?.id);
  const addToCart = useAddToCart(sessionId);

  // Prevent body scroll when wishlist is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const wishlistItems = wishlist?.items || [];

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-[#F5F5F4]/40 backdrop-blur-[4px] z-[100] transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Side Panel */}
      <div 
        className={`fixed top-0 right-0 h-[100dvh] w-full max-w-[380px] bg-white z-[101] shadow-2xl transition-transform duration-500 ease-in-out transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        
        <div className="flex flex-col flex-1 gap-[1px]">
          {/* Header */}
          <div className="flex items-center justify-between py-6 px-6 border-b border-stone-100 flex-shrink-0">
            <h2 className="font-poppins font-light text-xl text-stone-900 tracking-wide">
              My Wishlist {wishlistItems.length > 0 && `(${wishlistItems.length})`}
            </h2>
            <button 
              onClick={onClose}
              className="flex justify-center items-center p-2 -mr-2 text-stone-400 hover:text-stone-900 transition-colors"
            >
              <X className="w-5 h-5 stroke-[1]" />
            </button>
          </div>

          {/* Scrollable Items Container */}
          <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center text-stone-400 text-sm font-poppins">
                Loading wishlist...
              </div>
            ) : wishlistItems.length > 0 ? (
              wishlistItems.map((item) => {
                const product = item.product;
                let imageUrl = "/products/default.jpg";
                const variant = product.variants?.[0]; // Best effort mapping for simple wishlist

                if (variant?.featuredImage) imageUrl = variant.featuredImage;
                else if (variant?.gallery?.[0]) imageUrl = variant.gallery[0];
                
                const price = getEffectivePrice(variant);

                return (
                  <CartItem
                    key={item.id}
                    id={item.productId}
                    name={product.name}
                    size={variant?.name || "N/A"}
                    quantity={1}
                    price={price.toLocaleString()}
                    image={imageUrl}
                    mode="wishlist"
                    onRemove={(id) => removeFromWishlist.mutate(id as string)}
                    onAddToCart={(id) => {
                      if (variant) {
                        addToCart.mutate({ variantId: variant.id, quantity: 1 });
                      }
                    }}
                  />
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-stone-400">
                <Heart className="w-10 h-10 stroke-[1]" />
                <p className="font-poppins font-light text-sm tracking-wide">Your wishlist is empty</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Area */}
        <div className="flex flex-col w-full flex-shrink-0 bg-stone-50 border-t border-stone-100 px-6 py-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
          <Link href="/shop" onClick={onClose} className="w-full">
            <button className="flex justify-center items-center w-full py-3.5 bg-white border border-stone-200 text-stone-900 hover:border-stone-400 hover:bg-stone-50 transition-all duration-300">
              <span className="font-poppins font-medium text-xs uppercase tracking-[0.15em]">
                Continue Shopping
              </span>
            </button>
          </Link>
          <Link href="/account/wishlist" onClick={onClose} className="w-full mt-3">
            <button className="flex justify-center items-center w-full py-3.5 bg-stone-900 border border-stone-900 text-white hover:bg-black transition-all duration-300">
              <span className="font-poppins font-medium text-xs uppercase tracking-[0.15em]">
                View Full Wishlist
              </span>
            </button>
          </Link>
        </div>

      </div>
    </>
  );
}
