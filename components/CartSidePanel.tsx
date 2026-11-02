"use client";

import { useEffect } from "react";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useCart, useUpdateCartItem, useRemoveCartItem } from "@/hooks/useCart";
import Link from "next/link";
import Image from "next/image";
import { getEffectivePrice } from "@/lib/pricing";

export default function CartSidePanel() {
  const sessionId = useCartStore((state) => state.sessionId);
  const initSession = useCartStore((state) => state.initSession);
  const isDrawerOpen = useCartStore((state) => state.isDrawerOpen);
  const closeDrawer = useCartStore((state) => state.closeDrawer);

  useEffect(() => {
    initSession();
  }, [initSession]);

  const { data: cart, isPending } = useCart(sessionId);
  const updateItem = useUpdateCartItem(sessionId);
  const removeItem = useRemoveCartItem(sessionId);

  // Prevent body scroll when cart is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };

    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDrawerOpen, closeDrawer]);

  const items = cart?.items ?? [];
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * getEffectivePrice(item.variant)), 0);

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-[#F5F5F4]/40 backdrop-blur-[4px] z-[100] transition-opacity duration-300 ${
          isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeDrawer}
      />

      {/* Side Panel */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart"
        className={`fixed top-0 right-0 h-full w-[400px] max-w-[100vw] bg-white shadow-2xl z-[101] transform transition-transform duration-300 ease-in-out flex flex-col ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200 shrink-0">
          <h2 className="font-outfit text-xl tracking-tight text-stone-900 flex items-center gap-2">
            <ShoppingBag size={20} className="text-stone-700" />
            CART {items.length > 0 && <span className="text-stone-400 text-sm font-inter font-medium">({items.length})</span>}
          </h2>
          <button 
            onClick={closeDrawer} 
            className="p-2 text-stone-400 hover:text-stone-900 transition-colors rounded-full hover:bg-stone-100 -mr-2"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {isPending ? (
            <div className="flex-1 flex items-center justify-center text-stone-400 text-sm font-inter">
              Loading cart...
            </div>
          ) : items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 text-stone-500">
              <ShoppingBag size={48} strokeWidth={1} className="text-stone-300" />
              <div>
                <p className="font-outfit text-lg text-stone-900">Your cart is empty</p>
                <p className="font-inter text-sm mt-1">Looks like you haven't added anything yet.</p>
              </div>
              <button 
                onClick={closeDrawer} 
                className="mt-4 px-6 py-2.5 border border-stone-900 text-stone-900 font-inter font-medium text-sm hover:bg-stone-50 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4">
                {/* Image */}
                <div className="w-[88px] h-[110px] bg-[#F5F5F4] overflow-hidden shrink-0 relative">
                  {(() => {
                    let allImages: string[] = [];
                    if (item.variant.product?.variants) {
                      for (const v of item.variant.product.variants) {
                        if (v.featuredImage) allImages.push(v.featuredImage);
                        if (v.gallery) allImages.push(...v.gallery);
                      }
                    } else {
                      if (item.variant.featuredImage) allImages.push(item.variant.featuredImage);
                      if (item.variant.gallery) allImages.push(...item.variant.gallery);
                    }
                    
                    const imgUrl = allImages[0] || "/products/default.jpg";
                    return <Image src={imgUrl} alt={item.variant.product.name} fill sizes="100px" className="object-cover" />;
                  })()}
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h3 className="font-inter font-medium text-stone-900 text-[13px] uppercase tracking-wide">
                      {item.variant.product.name}
                    </h3>
                    <p className="font-inter text-xs text-stone-500 mt-1 uppercase">
                      {item.variant.name}
                    </p>
                  </div>

                  <div className="flex items-end justify-between mt-4">
                    {/* Controls */}
                    <div className="flex items-center gap-4 border border-stone-200 px-2 py-1">
                      <button 
                        onClick={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity - 1 })}
                        disabled={updateItem.isPending}
                        className="text-stone-400 hover:text-stone-900 transition-colors disabled:opacity-50"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-inter text-xs font-medium w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                        disabled={updateItem.isPending}
                        className="text-stone-400 hover:text-stone-900 transition-colors disabled:opacity-50"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <p className="font-inter font-medium text-stone-900 text-sm">
                        Rs. {getEffectivePrice(item.variant).toLocaleString()}
                      </p>
                      <button 
                        onClick={() => removeItem.mutate(item.id)}
                        disabled={removeItem.isPending}
                        className="text-xs text-stone-400 hover:text-red-600 underline underline-offset-2 transition-colors disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-stone-200 bg-stone-50 shrink-0 flex flex-col gap-5">
            <div className="flex items-center justify-between font-inter">
              <span className="text-stone-600 text-sm">Subtotal</span>
              <span className="font-medium text-stone-900 text-lg">Rs. {subtotal.toLocaleString()}</span>
            </div>
            
            <p className="text-xs text-stone-500 text-center font-inter">Shipping and taxes calculated at checkout.</p>
            
            <Link 
              href="/checkout"
              onClick={closeDrawer}
            >
              <button className="w-full py-[18px] bg-[#1C1917] hover:bg-black transition-colors font-inter font-medium text-sm text-white uppercase tracking-widest mt-3">
                Checkout | Rs. {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
