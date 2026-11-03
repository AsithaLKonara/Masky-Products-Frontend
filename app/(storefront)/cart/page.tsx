"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ShoppingBag, 
  Trash2, 
  Minus, 
  Plus, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  FileText,
  Loader2
} from "lucide-react";
import CategoryBar from "@/components/CategoryBar";
import { useCartStore } from "@/store/useCartStore";
import { getEffectivePrice } from "@/lib/pricing";
import { useCart, useUpdateCartItem, useRemoveCartItem, useClearCart } from "@/hooks/useCart";
import { PLACEHOLDER_IMAGE } from "@/lib/placeholder";

const FREE_SHIPPING_THRESHOLD = 15000;

export default function CartPage() {
  const { sessionId, initSession } = useCartStore();
  const [orderNote, setOrderNote] = useState("");
  const [isNoteOpen, setIsNoteOpen] = useState(false);

  useEffect(() => {
    initSession();
  }, [initSession]);

  const { data: cart, isPending } = useCart(sessionId);
  const updateItem = useUpdateCartItem(sessionId);
  const removeItem = useRemoveCartItem(sessionId);
  const clearCart = useClearCart(sessionId);

  const items = cart?.items ?? [];
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * getEffectivePrice(item.variant),
    0
  );

  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingEstimate = items.length === 0 ? 0 : (isFreeShipping ? 0 : 400);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const amountNeeded = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const total = subtotal + shippingEstimate;

  return (
    <main className="min-h-screen bg-[#FEF6E4] pt-[84px] pb-24 text-[#203C2B]">
      {/* Sub Navbar */}
      <CategoryBar />

      {/* Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-8 pb-6">
        <div className="flex flex-col gap-2">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-poppins text-[#62695A] uppercase tracking-wider">
            <Link href="/" className="hover:text-[#203C2B] transition-colors">Home</Link>
            <span className="text-[#A2A69A]">/</span>
            <span className="text-[#203C2B] font-semibold">Shopping Bag</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-3">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#71865B]/15 border border-[#71865B]/30 text-[#203C2B] w-fit mb-2">
                <Sparkles size={11} className="text-[#71865B]" />
                <span className="font-poppins text-[10px] font-semibold tracking-[0.18em] uppercase">
                  Curated Selections
                </span>
              </div>
              <h1 className="font-signature font-bold text-3xl sm:text-4xl md:text-5xl text-[#203C2B] tracking-tight">
                Your Gourmet Harvest Bag
              </h1>
              <p className="font-poppins text-xs sm:text-sm text-[#62695A] mt-1">
                Review and refine the artisanal mushroom creations chosen for your kitchen and table.
              </p>
            </div>

            {items.length > 0 && (
              <button
                onClick={() => clearCart.mutate()}
                disabled={clearCart.isPending}
                className="text-xs font-poppins text-[#62695A] hover:text-red-600 transition-colors self-start md:self-auto disabled:opacity-50 cursor-pointer"
              >
                Clear Bag ({itemCount} {itemCount === 1 ? 'piece' : 'pieces'})
              </button>
            )}
          </div>
        </div>

        {/* Free Shipping Alert Bar */}
        {items.length > 0 && (
          <div className="mt-8 bg-[#FFFCF4]/80 backdrop-blur-md border border-[#DCDCCB] p-5 rounded-2xl shadow-2xs">
            <div className="flex items-center justify-between text-xs font-poppins mb-2.5">
              {isFreeShipping ? (
                <span className="text-[#203C2B] font-medium flex items-center gap-2">
                  <Sparkles size={16} className="text-[#71865B]" /> You have unlocked <strong className="font-bold text-[#71865B]">Complimentary Islandwide Delivery</strong>.
                </span>
              ) : (
                <span className="text-[#62695A]">
                  Add <strong className="text-[#203C2B] font-semibold">Rs. {amountNeeded.toLocaleString()}</strong> more to qualify for <strong className="font-semibold text-[#203C2B]">Free Delivery</strong>.
                </span>
              )}
              <span className="text-[#71865B] font-semibold">{freeShippingProgress}%</span>
            </div>
            <div className="w-full bg-[#EAE8DD] h-2 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-500 rounded-full bg-[#71865B]"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Main Content */}
        {isPending ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 text-[#62695A]">
            <Loader2 size={32} className="animate-spin text-[#203C2B]" />
            <p className="font-poppins text-xs uppercase tracking-wider">Accessing your harvest bag...</p>
          </div>
        ) : items.length === 0 ? (
          /* Empty State */
          <div className="bg-[#FFFCF4]/80 backdrop-blur-md border border-[#DCDCCB] rounded-3xl p-12 md:p-16 my-10 text-center flex flex-col items-center justify-center max-w-xl mx-auto shadow-xs">
            <div className="w-20 h-20 bg-[#71865B]/10 border border-[#71865B]/20 rounded-full flex items-center justify-center text-[#203C2B] mb-5">
              <ShoppingBag size={36} strokeWidth={1.4} />
            </div>
            <h2 className="font-signature font-bold text-2xl sm:text-3xl text-[#203C2B] mb-2">
              Your bag is currently empty
            </h2>
            <p className="font-poppins text-xs sm:text-sm text-[#62695A] max-w-md mb-8 leading-relaxed">
              No mushroom products have been selected yet. Explore our dehydrated selections or fresh seasonal harvests.
            </p>
            <Link
              href="/shop"
              className="px-8 py-3.5 bg-[#203C2B] hover:bg-[#2d523c] text-[#FFFCF4] font-poppins font-semibold text-xs uppercase tracking-widest transition-all rounded-full shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Explore All Creations</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          /* Two Column Grid Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-8 items-start">
            
            {/* Left: Items List */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="bg-[#FFFCF4]/80 backdrop-blur-md border border-[#DCDCCB] rounded-3xl overflow-hidden shadow-xs">
                
                {/* Table Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-white/50 border-b border-[#DCDCCB]/70 text-xs font-poppins font-semibold uppercase tracking-wider text-[#62695A]">
                  <div className="col-span-6">Harvest Product</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>

                {/* Items */}
                <div className="divide-y divide-[#DCDCCB]/50 p-4 md:p-6">
                  {items.map((item) => {
                    const variant = item.variant;
                    const product = variant?.product;
                    const unitPrice = getEffectivePrice(variant);
                    const itemTotal = unitPrice * item.quantity;

                    let imgUrl = PLACEHOLDER_IMAGE;
                    if (variant?.featuredImage) {
                      imgUrl = variant.featuredImage;
                    } else if (variant?.gallery && variant.gallery.length > 0) {
                      imgUrl = variant.gallery[0];
                    } else if (product?.variants) {
                      for (const v of product.variants) {
                        if (v.featuredImage) {
                          imgUrl = v.featuredImage;
                          break;
                        }
                        if (v.gallery && v.gallery.length > 0) {
                          imgUrl = v.gallery[0];
                          break;
                        }
                      }
                    }

                    const isPending = (updateItem.isPending && (updateItem.variables as any)?.itemId === item.id) ||
                                      (removeItem.isPending && (removeItem.variables as any) === item.id);

                    return (
                      <div 
                        key={item.id} 
                        className={`py-5 first:pt-0 last:pb-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center transition-opacity ${isPending ? 'opacity-50' : 'opacity-100'}`}
                      >
                        {/* Product Info */}
                        <div className="md:col-span-6 flex gap-4 items-center">
                          <Link 
                            href={product?.slug ? `/products/${product.slug}` : "/shop"}
                            className="w-20 h-24 bg-white/70 shrink-0 relative rounded-2xl overflow-hidden border border-[#DCDCCB] group"
                          >
                            <Image 
                              src={imgUrl} 
                              alt={product?.name || "Product"} 
                              fill 
                              className="object-cover object-top group-hover:scale-105 transition-transform duration-500" 
                            />
                          </Link>
                          
                          <div className="flex flex-col gap-1 pr-2">
                            <Link 
                              href={product?.slug ? `/products/${product.slug}` : "/shop"}
                              className="font-signature font-bold text-[#203C2B] text-base hover:text-[#71865B] transition-colors line-clamp-1"
                            >
                              {product?.name || "Product"}
                            </Link>

                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                              {variant?.color && (
                                <span className="text-[11px] font-poppins text-[#62695A] bg-white/90 border border-[#DCDCCB] px-2.5 py-0.5 rounded-full">
                                  {variant.color}
                                </span>
                              )}
                              {variant?.size && (
                                <span className="text-[11px] font-poppins text-[#62695A] bg-white/90 border border-[#DCDCCB] px-2.5 py-0.5 rounded-full">
                                  Size: {variant.size}
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => removeItem.mutate(item.id)}
                              disabled={removeItem.isPending}
                              className="text-xs text-[#8F9489] hover:text-red-600 transition-colors mt-2 text-left flex items-center gap-1 w-fit disabled:opacity-50 cursor-pointer"
                            >
                              <Trash2 size={13} />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>

                        {/* Unit Price */}
                        <div className="md:col-span-2 text-left md:text-center font-poppins text-sm text-[#203C2B]">
                          <span className="md:hidden text-xs text-[#8F9489] mr-2">Price:</span>
                          Rs. {unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>

                        {/* Quantity Stepper */}
                        <div className="md:col-span-2 flex items-center md:justify-center">
                          <div className="flex items-center border border-[#DCDCCB] rounded-full bg-white/90 overflow-hidden shadow-2xs">
                            <button
                              onClick={() => {
                                if (item.quantity > 1) {
                                  updateItem.mutate({ itemId: item.id, quantity: item.quantity - 1 });
                                } else {
                                  removeItem.mutate(item.id);
                                }
                              }}
                              disabled={updateItem.isPending || removeItem.isPending}
                              className="w-8 h-8 flex items-center justify-center text-[#203C2B] hover:bg-[#203C2B]/10 transition-colors disabled:opacity-40 cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="font-poppins text-xs font-semibold w-8 text-center text-[#203C2B]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                              disabled={updateItem.isPending}
                              className="w-8 h-8 flex items-center justify-center text-[#203C2B] hover:bg-[#203C2B]/10 transition-colors disabled:opacity-40 cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Total Price */}
                        <div className="md:col-span-2 text-left md:text-right font-signature font-bold text-base text-[#203C2B]">
                          <span className="md:hidden text-xs font-poppins font-normal text-[#8F9489] mr-2">Total:</span>
                          Rs. {itemTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Notes & Actions Row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                <Link
                  href="/shop"
                  className="font-poppins text-xs font-semibold text-[#203C2B] hover:text-[#71865B] transition-colors inline-flex items-center gap-2 uppercase tracking-wider"
                >
                  <ArrowLeft size={14} />
                  <span>Continue Shopping</span>
                </Link>

                <button
                  onClick={() => setIsNoteOpen(!isNoteOpen)}
                  className="font-poppins text-xs text-[#62695A] hover:text-[#203C2B] transition-colors inline-flex items-center gap-1.5 underline underline-offset-4 cursor-pointer"
                >
                  <FileText size={14} />
                  <span>{isNoteOpen ? "Hide special instructions" : "Add special order instructions"}</span>
                </button>
              </div>

              {/* Note Textarea */}
              {isNoteOpen && (
                <div className="bg-[#FFFCF4]/80 backdrop-blur-md border border-[#DCDCCB] rounded-2xl p-4 shadow-2xs">
                  <label htmlFor="orderNote" className="font-poppins text-xs font-semibold text-[#203C2B] block mb-2">
                    Special Packaging or Delivery Instructions
                  </label>
                  <textarea
                    id="orderNote"
                    rows={3}
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    placeholder="e.g. Leave with concierge or specify special gift note..."
                    className="w-full text-xs font-poppins p-3 border border-[#DCDCCB] rounded-xl outline-none focus:border-[#203C2B] transition-colors text-[#203C2B] bg-white/80"
                  />
                </div>
              )}
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-4 sticky top-[100px]">
              <div className="bg-[#FFFCF4]/90 backdrop-blur-md border border-[#DCDCCB] rounded-3xl p-6 md:p-8 shadow-xs flex flex-col gap-6">
                <h3 className="font-signature font-bold text-2xl text-[#203C2B] border-b border-[#DCDCCB]/70 pb-4">
                  Order Summary
                </h3>

                {/* Subtotals */}
                <div className="flex flex-col gap-3 font-poppins text-sm">
                  <div className="flex justify-between items-center text-[#62695A]">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#203C2B]">
                      Rs. {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[#62695A]">
                    <span className="flex items-center gap-1.5">
                      Shipping Estimate
                    </span>
                    <span className={`font-semibold ${isFreeShipping ? 'text-[#71865B]' : 'text-[#203C2B]'}`}>
                      {isFreeShipping ? 'FREE' : `Rs. ${shippingEstimate.toLocaleString()}`}
                    </span>
                  </div>

                  <div className="border-t border-[#DCDCCB]/70 pt-4 mt-2 flex justify-between items-baseline">
                    <span className="font-signature font-bold text-lg text-[#203C2B]">Estimated Total</span>
                    <div className="text-right">
                      <span className="font-signature font-bold text-2xl text-[#203C2B]">
                        Rs. {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <p className="text-[10px] text-[#8F9489] font-poppins mt-0.5">
                        Taxes & promotions finalized at checkout
                      </p>
                    </div>
                  </div>
                </div>

                {/* Checkout Action Button */}
                <div className="flex flex-col gap-3 pt-2">
                  <Link href="/checkout" className="w-full">
                    <button className="w-full py-4 bg-[#203C2B] hover:bg-[#2d523c] text-[#FFFCF4] font-poppins font-semibold text-xs uppercase tracking-widest transition-all rounded-full shadow-md flex items-center justify-center gap-2 cursor-pointer">
                      <span>Proceed to Checkout</span>
                      <ArrowRight size={15} />
                    </button>
                  </Link>

                  <div className="flex items-center justify-center gap-4 text-[#62695A] text-xs font-poppins pt-2">
                    <span className="flex items-center gap-1">
                      <ShieldCheck size={14} className="text-[#71865B]" /> Secure Checkout
                    </span>
                    <span className="flex items-center gap-1">
                      <Truck size={14} className="text-[#71865B]" /> Islandwide Delivery
                    </span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="bg-white/60 p-4 rounded-2xl border border-[#DCDCCB]/70 flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 text-xs font-poppins text-[#62695A]">
                    <RotateCcw size={14} className="text-[#203C2B] shrink-0" />
                    <span>Hassle-free 7-day returns & exchanges</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-poppins text-[#62695A]">
                    <Truck size={14} className="text-[#203C2B] shrink-0" />
                    <span>Express dispatch within 24–48 business hours</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}
