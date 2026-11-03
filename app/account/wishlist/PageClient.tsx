"use client";

import Link from "next/link";
import { Heart, Search, Filter, SlidersHorizontal, ArrowRight, X } from "lucide-react";
import Image from "next/image";
import { PLACEHOLDER_IMAGE } from "@/lib/placeholder";
import { useCartStore } from "@/store/useCartStore";
import { useWishlist, useRemoveFromWishlist } from "@/hooks/useWishlist";
import { useAddToCart } from "@/hooks/useCart";

export default function WishlistPage() {
  const sessionId = useCartStore((state) => state.sessionId);
  const openDrawer = useCartStore((state) => state.openDrawer);
  const { data: wishlist, isLoading } = useWishlist(sessionId);
  const removeFromWishlist = useRemoveFromWishlist(sessionId, wishlist?.id);
  const addToCart = useAddToCart(sessionId);

  const wishlistItems = wishlist?.items || [];

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pb-10">
      {/* Header Area */}
      <div className="flex flex-col gap-2 border-b border-stone-200 pb-6">
        <div className="flex items-center justify-between">
          <h1 className="font-inria text-2xl md:text-3xl text-stone-900 mb-1">Wishlist</h1>
          <span className="font-poppins text-sm text-stone-500 bg-stone-100 px-3 py-1 rounded-full">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'Item' : 'Items'}
          </span>
        </div>
        <p className="font-poppins text-sm text-stone-500 max-w-xl">
          Save your favorite items here. When you're ready, move them to your cart to checkout.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-stone-50 border border-stone-100 rounded-2xl">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mb-4"></div>
          <p className="font-poppins text-stone-500">Loading your wishlist...</p>
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 md:py-32 bg-stone-50 border border-stone-100 rounded-2xl text-center px-4">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
            <Heart className="w-8 h-8 text-stone-300 stroke-[1.5]" />
          </div>
          <h3 className="font-inria text-xl text-stone-900 mb-2">Your wishlist is empty</h3>
          <p className="font-poppins text-sm text-stone-500 max-w-md mb-8">
            You haven't added any items to your wishlist yet. Browse our collections and save your favorites for later!
          </p>
          <Link href="/shop">
            <button className="flex items-center gap-2 bg-stone-900 text-white px-8 py-3.5 rounded-full font-poppins text-sm hover:bg-stone-800 transition-colors group">
              Start Shopping
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      ) : (
        <>
          {/* Action Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input 
                type="text"
                placeholder="Search wishlist..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-stone-200 rounded-lg text-sm font-poppins focus:outline-none focus:ring-1 focus:ring-stone-400 transition-shadow"
              />
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-stone-200 rounded-lg font-poppins text-sm text-stone-700 hover:bg-stone-50 transition-colors">
                <SlidersHorizontal className="w-4 h-4" />
                <span>Sort</span>
              </button>
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-stone-200 rounded-lg font-poppins text-sm text-stone-700 hover:bg-stone-50 transition-colors">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {wishlistItems.map((item) => {
              const product = item.product;
              let imageUrl = PLACEHOLDER_IMAGE;
              const variant = product.variants?.[0];

              if (variant?.featuredImage) imageUrl = variant.featuredImage;
              else if (variant?.gallery?.[0]) imageUrl = variant.gallery[0];
              
              const price = variant?.salePrice || variant?.price || 0;
              const originalPrice = variant?.price || 0;
              const isOnSale = variant?.salePrice != null && variant.salePrice < originalPrice;
              const isOutOfStock = variant?.stockStatus !== 'instock';

              return (
                <div key={item.id} className="group flex flex-col">
                  {/* Image Container */}
                  <div className="relative aspect-[3/4] mb-4 bg-stone-100 rounded-xl overflow-hidden">
                    <Link href={`/products/${product.slug}`}>
                      <Image 
                        src={imageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className={`object-cover object-top transition-transform duration-700 group-hover:scale-105 ${isOutOfStock ? 'opacity-70 grayscale' : ''}`}
                      />
                    </Link>
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {isOutOfStock && (
                        <span className="bg-white/90 backdrop-blur text-stone-900 text-xs font-poppins font-medium px-2.5 py-1 rounded-sm uppercase tracking-wider">
                          Sold Out
                        </span>
                      )}
                      {isOnSale && !isOutOfStock && (
                        <span className="bg-red-500/90 backdrop-blur text-white text-xs font-poppins font-medium px-2.5 py-1 rounded-sm uppercase tracking-wider">
                          Sale
                        </span>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button 
                      onClick={() => removeFromWishlist.mutate(item.productId)}
                      className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-stone-500 hover:text-red-500 hover:bg-white transition-all shadow-sm z-10"
                      title="Remove from wishlist"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    
                    {/* Add to Cart Overlay */}
                    {!isOutOfStock && (
                      <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <button 
                          onClick={() => {
                            if (variant) {
                              addToCart.mutate(
                                { variantId: variant.id, quantity: 1 }, 
                                { onSuccess: () => openDrawer() }
                              );
                            }
                          }}
                          className="w-full bg-stone-900 text-white font-poppins text-sm py-3 rounded-lg hover:bg-black shadow-lg"
                        >
                          Add to Cart
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex flex-col gap-1.5 px-1">
                    <div className="flex justify-between items-start gap-4">
                      <Link href={`/products/${product.slug}`} className="flex-1">
                        <h3 className="font-poppins text-sm text-stone-900 line-clamp-1 group-hover:underline underline-offset-4">
                          {product.name}
                        </h3>
                      </Link>
                    </div>
                    
                    <p className="font-poppins text-xs text-stone-500">
                      Collection
                    </p>
                    
                    <div className="flex items-center gap-2 mt-1">
                      {isOnSale ? (
                        <>
                          <span className="font-poppins font-semibold text-sm text-red-600">
                            Rs. {price.toLocaleString()}
                          </span>
                          <span className="font-poppins text-xs text-stone-400 line-through">
                            Rs. {originalPrice.toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <span className="font-poppins font-medium text-sm text-stone-900">
                          Rs. {price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
