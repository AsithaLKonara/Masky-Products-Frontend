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
    <main className="min-h-screen bg-[#FAFAF9] pt-[100px] pb-24">
      {/* Header Container */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 lg:px-[120px] pt-6 pb-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-poppins text-stone-500 uppercase tracking-widest">
            <Link href="/" className="hover:text-stone-900 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-stone-900 font-semibold">Shopping Cart</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-2">
            <div>
              <h1 className="font-poppins text-3xl md:text-4xl text-stone-900 font-normal tracking-tight">
                Your Shopping Bag
              </h1>
              <p className="font-poppins text-xs text-stone-500 mt-1">
                Review and modify the pieces selected for your wardrobe.
              </p>
            </div>

            {items.length > 0 && (
              <button
                onClick={() => clearCart.mutate()}
                disabled={clearCart.isPending}
                className="text-xs font-poppins text-stone-400 hover:text-red-600 transition-colors self-start md:self-auto disabled:opacity-50"
              >
                Clear Cart ({itemCount} items)
              </button>
            )}
          </div>
        </div>

        {/* Free Shipping Alert Bar */}
        {items.length > 0 && (
          <div className="mt-8 bg-white border border-stone-200 p-4 md:p-5 rounded-lg shadow-2xs">
            <div className="flex items-center justify-between text-xs font-poppins mb-2">
              {isFreeShipping ? (
                <span className="text-emerald-700 font-medium flex items-center gap-2">
                  <Sparkles size={16} className="text-emerald-600" /> Congratulations! You unlocked <strong className="font-bold">FREE Islandwide Shipping</strong>.
                </span>
              ) : (
                <span className="text-stone-700">
                  Add <strong className="text-stone-900 font-semibold">Rs. {amountNeeded.toLocaleString()}</strong> more to qualify for <strong className="font-semibold text-stone-900">FREE Islandwide Shipping</strong>.
                </span>
              )}
              <span className="text-stone-400 font-semibold">{freeShippingProgress}%</span>
            </div>
            <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  isFreeShipping ? 'bg-emerald-600' : 'bg-stone-900'
                }`}
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Main Content */}
        {isPending ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 text-stone-400">
            <Loader2 size={32} className="animate-spin text-stone-800" />
            <p className="font-poppins text-sm">Loading your cart items...</p>
          </div>
        ) : items.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-stone-200 rounded-xl p-12 md:p-16 my-8 text-center flex flex-col items-center justify-center max-w-2xl mx-auto shadow-2xs">
            <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center text-stone-300 mb-6">
              <ShoppingBag size={48} strokeWidth={1.2} />
            </div>
            <h2 className="font-poppins text-2xl font-normal text-stone-900 mb-2">
              Your bag is currently empty
            </h2>
            <p className="font-poppins text-sm text-stone-500 max-w-md mb-8">
              Looks like you haven't added any luxury pieces yet. Explore our latest arrivals or timeless silhouettes.
            </p>
            <Link
              href="/shop"
              className="px-8 py-4 bg-stone-900 hover:bg-black text-white font-poppins font-medium text-xs uppercase tracking-widest transition-all rounded-sm shadow-md hover:shadow-lg inline-flex items-center gap-2"
            >
              <span>Explore Collection</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          /* Two Column Grid Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-8 items-start">
            
            {/* Left: Items List */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-2xs">
                
                {/* Table Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-stone-50/75 border-b border-stone-200 text-xs font-poppins font-semibold uppercase tracking-wider text-stone-500">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>

                {/* Items */}
                <div className="divide-y divide-stone-100 p-4 md:p-6">
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
                            className="w-20 h-24 bg-stone-100 shrink-0 relative rounded-sm overflow-hidden group"
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
                              className="font-poppins font-medium text-stone-900 text-sm hover:text-stone-600 transition-colors line-clamp-1"
                            >
                              {product?.name || "Product"}
                            </Link>

                            <div className="flex flex-wrap items-center gap-2 mt-0.5">
                              {variant?.name && (
                                <span className="text-[11px] font-poppins text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                                  {variant.name}
                                </span>
                              )}
                              {variant?.size && (
                                <span className="text-[11px] font-poppins text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                                  Size: {variant.size}
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => removeItem.mutate(item.id)}
                              disabled={removeItem.isPending}
                              className="text-xs text-stone-400 hover:text-red-600 transition-colors mt-2 text-left flex items-center gap-1 w-fit disabled:opacity-50"
                            >
                              <Trash2 size={13} />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>

                        {/* Unit Price */}
                        <div className="md:col-span-2 text-left md:text-center font-poppins text-sm text-stone-700">
                          <span className="md:hidden text-xs text-stone-400 mr-2">Price:</span>
                          Rs. {unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>

                        {/* Quantity Controls */}
                        <div className="md:col-span-2 flex items-center md:justify-center">
                          <div className="flex items-center border border-stone-200 rounded-sm bg-white overflow-hidden shadow-2xs">
                            <button
                              onClick={() => {
                                if (item.quantity > 1) {
                                  updateItem.mutate({ itemId: item.id, quantity: item.quantity - 1 });
                                } else {
                                  removeItem.mutate(item.id);
                                }
                              }}
                              disabled={updateItem.isPending || removeItem.isPending}
                              className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors disabled:opacity-40"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="font-poppins text-xs font-medium w-8 text-center text-stone-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                              disabled={updateItem.isPending}
                              className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors disabled:opacity-40"
                              aria-label="Increase quantity"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Total Price */}
                        <div className="md:col-span-2 text-left md:text-right font-poppins font-semibold text-sm text-stone-900">
                          <span className="md:hidden text-xs text-stone-400 mr-2">Total:</span>
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
                  className="font-poppins text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors inline-flex items-center gap-2 uppercase tracking-wider"
                >
                  <ArrowLeft size={14} />
                  <span>Continue Shopping</span>
                </Link>

                <button
                  onClick={() => setIsNoteOpen(!isNoteOpen)}
                  className="font-poppins text-xs text-stone-500 hover:text-stone-900 transition-colors inline-flex items-center gap-1.5 underline underline-offset-4"
                >
                  <FileText size={14} />
                  <span>{isNoteOpen ? "Hide special instructions" : "Add special order instructions"}</span>
                </button>
              </div>

              {/* Note Textarea */}
              {isNoteOpen && (
                <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-2xs">
                  <label htmlFor="orderNote" className="font-poppins text-xs font-medium text-stone-700 block mb-2">
                    Special Instructions for your order
                  </label>
                  <textarea
                    id="orderNote"
                    rows={3}
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    placeholder="e.g. Please ring the doorbell upon delivery or leave at the front door."
                    className="w-full text-xs font-poppins p-3 border border-stone-200 rounded outline-none focus:border-stone-900 transition-colors text-stone-800"
                  />
                </div>
              )}
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-4 sticky top-[100px]">
              <div className="bg-white border border-stone-200 rounded-xl p-6 md:p-8 shadow-2xs flex flex-col gap-6">
                <h3 className="font-poppins font-medium text-lg text-stone-900 border-b border-stone-100 pb-4">
                  Order Summary
                </h3>

                {/* Subtotals */}
                <div className="flex flex-col gap-3 font-poppins text-sm">
                  <div className="flex justify-between items-center text-stone-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-stone-900">
                      Rs. {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-stone-600">
                    <span className="flex items-center gap-1.5">
                      Shipping Estimate
                    </span>
                    <span className={`font-medium ${isFreeShipping ? 'text-emerald-700' : 'text-stone-900'}`}>
                      {isFreeShipping ? 'FREE' : `Rs. ${shippingEstimate.toLocaleString()}`}
                    </span>
                  </div>

                  <div className="border-t border-stone-100 pt-4 mt-2 flex justify-between items-baseline">
                    <span className="font-poppins font-semibold text-base text-stone-900">Estimated Total</span>
                    <div className="text-right">
                      <span className="font-poppins font-bold text-xl text-stone-900">
                        Rs. {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <p className="text-[10px] text-stone-400 font-poppins mt-0.5">
                        Taxes & promotions finalized at checkout
                      </p>
                    </div>
                  </div>
                </div>

                {/* Checkout Action Button */}
                <div className="flex flex-col gap-3 pt-2">
                  <Link href="/checkout" className="w-full">
                    <button className="w-full py-4 bg-stone-900 hover:bg-black text-white font-poppins font-medium text-xs uppercase tracking-widest transition-all rounded-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                      <span>Proceed to Checkout</span>
                      <ArrowRight size={15} />
                    </button>
                  </Link>

                  <div className="flex items-center justify-center gap-4 text-stone-400 text-xs font-poppins pt-2">
                    <span className="flex items-center gap-1">
                      <ShieldCheck size={14} className="text-emerald-600" /> Secure Checkout
                    </span>
                    <span className="flex items-center gap-1">
                      <Truck size={14} className="text-stone-600" /> Islandwide Delivery
                    </span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="bg-stone-50 p-4 rounded-lg border border-stone-100 flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 text-xs font-poppins text-stone-700 font-medium">
                    <RotateCcw size={14} className="text-stone-900 shrink-0" />
                    <span>Hassle-free 7-day returns & exchanges</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-poppins text-stone-700 font-medium">
                    <Truck size={14} className="text-stone-900 shrink-0" />
                    <span>Express dispatch within 24-48 business hours</span>
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
