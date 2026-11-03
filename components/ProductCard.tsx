"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { getEffectivePrice } from "@/lib/pricing";
import { useRouter } from "next/navigation";
import { Product } from "@/types/product";
import { useCartStore } from "@/store/useCartStore";
import { useAddToCart } from "@/hooks/useCart";
import { PLACEHOLDER_IMAGE } from "@/lib/placeholder";

interface ProductCardProps {
  product?: Product;
  imageUrl?: string;
  priority?: boolean;
}

export default function ProductCard({ product, imageUrl = PLACEHOLDER_IMAGE, priority = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showVariantSelector, setShowVariantSelector] = useState(false);
  
  const uniqueSizes = product?.variants 
    ? Array.from(new Set(product.variants.map((v: any) => v.size).filter(Boolean))).slice(0, 4) as string[]
    : [];
  const uniqueColors = product?.variants
    ? Array.from(new Set(product.variants.map((v: any) => v.color).filter(Boolean))) as string[]
    : [];
    
  const [selectedSize, setSelectedSize] = useState<string | null>(uniqueSizes.length === 1 ? uniqueSizes[0] : null);
  const [selectedColor, setSelectedColor] = useState<string | null>(uniqueColors.length === 1 ? uniqueColors[0] : null);

  const router = useRouter();
  const sessionId = useCartStore((state) => state.sessionId);
  const openDrawer = useCartStore((state) => state.openDrawer);
  const addToCart = useAddToCart(sessionId);

  const defaultVariant = product?.variants?.[0];
  const inStock = product?.variants?.some((v: any) => v.stockStatus === 'instock') ?? true;
  
  let allImages: string[] = [];
  if (product?.variants) {
    for (const v of product.variants) {
      if (v.featuredImage) allImages.push(v.featuredImage);
      if (v.gallery) allImages.push(...v.gallery);
    }
  }
  
  const deduplicateImages = (urls: string[]) => {
    const seen = new Set();
    const result = [];
    for (const url of urls) {
      if (!url) continue;
      try {
        const parsed = new URL(url);
        const filename = parsed.pathname.split('/').pop() || "";
        let baseFilename = filename;
        const match = filename.match(/^\d{13}-(.+)$/);
        if (match) baseFilename = match[1];
        if (!seen.has(baseFilename)) {
          seen.add(baseFilename);
          result.push(url);
        }
      } catch (e) {
        if (!seen.has(url)) {
          seen.add(url);
          result.push(url);
        }
      }
    }
    return result;
  };

  allImages = deduplicateImages(allImages);
  
  const displayImage = allImages[0] || imageUrl;
  const hoverImage = allImages.length > 1 ? allImages[1] : displayImage;
  const title = product?.name || "Product Name";
  const productUrl = product?.slug ? `/products/${product.slug}` : "#";
  
  const basePrice = defaultVariant?.price || 0;
  let effectivePrice = getEffectivePrice(defaultVariant);

  const currentPriceObj = effectivePrice;
  const originalPriceObj = basePrice;
  
  const discountPercentage = basePrice > effectivePrice 
    ? Math.round(((basePrice - effectivePrice) / basePrice) * 100)
    : 0;

  const currentPrice = currentPriceObj.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const oldPrice = basePrice > 0 ? originalPriceObj.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00";
  const installment = (currentPriceObj / 3).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const displaySizes = uniqueSizes;
  
  const inStockVariants = product?.variants?.filter((v: any) => v.stockStatus === 'instock') || [];
  const inStockSizes = new Set(inStockVariants.map((v: any) => v.size));
  const inStockColors = new Set(inStockVariants.map((v: any) => v.color));

  const needsSelection = (uniqueSizes.length > 1 && !selectedSize) || (uniqueColors.length > 1 && !selectedColor);

  return (
    <div 
      className="group flex flex-col w-full max-w-[245px] rounded-2xl cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        background: "rgba(255, 252, 244, 0.62)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.75)",
        boxShadow: "0 8px 30px rgba(32, 60, 43, 0.06), inset 0 1px 1px rgba(255, 255, 255, 0.8)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Image Container */}
      <div 
        className="relative w-full aspect-[221/270] flex flex-col justify-between overflow-hidden"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(240,235,225,0.25) 100%)",
        }}
      >
        
        {/* Default Image */}
        <Link href={productUrl} className="absolute inset-0 z-0">
          <Image
            src={displayImage}
            alt={title}
            fill
            priority={priority}
            sizes="(max-width: 768px) 50vw, 250px"
            className={`object-cover transition-opacity duration-300 ${isHovered && allImages.length > 1 ? 'opacity-0' : 'opacity-100'}`}
          />
          {/* Hover Image */}
          {allImages.length > 1 && (
            <Image
              src={hoverImage}
              alt={`${title} - Back View`}
              fill
              sizes="(max-width: 768px) 50vw, 250px"
              className={`object-cover transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            />
          )}
        </Link>
        
        {/* Discount Tag */}
        {discountPercentage > 0 && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <div className="flex justify-center items-center px-2 py-0.5 bg-[#203C2B]/85 backdrop-blur-md shadow-sm rounded-full">
              <span className="font-poppins font-medium text-[9px] tracking-[0.1em] text-[#FFFCF4] uppercase">
                {discountPercentage}% off
              </span>
            </div>
          </div>
        )}
        
        {/* Bottom Overlays */}
        <div className="absolute bottom-0 w-full flex flex-col z-20 pointer-events-none">
          {/* Variant Selector (Hover or Active) */}
          {(displaySizes.length > 0 || uniqueColors.length > 0) && (
            <div 
              className={`flex flex-col items-center justify-center min-h-[36px] py-2 w-full bg-black/40 backdrop-blur-md transition-all duration-300 pointer-events-auto gap-2 ${
                (isHovered || showVariantSelector) ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
              }`}
            >
              {/* Colors */}
              {uniqueColors.length > 0 && (
                <div className="flex flex-wrap justify-center gap-[6px] px-2 w-full">
                  {uniqueColors.map((color: string) => {
                    const isAvailable = inStockColors.has(color);
                    const isSelected = selectedColor === color;
                    return (
                      <div 
                        key={color} 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          e.preventDefault();
                          if (isAvailable) setSelectedColor(color); 
                        }} 
                        className={`w-[18px] h-[18px] rounded-full transition-all flex items-center justify-center ${
                          !isAvailable ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                        } ${isSelected ? 'ring-2 ring-white ring-offset-1 ring-offset-black/50' : 'ring-1 ring-white/50 hover:ring-white'}`}
                        style={{ backgroundColor: color.toLowerCase() }}
                        title={color}
                      />
                    );
                  })}
                </div>
              )}

              {/* Sizes */}
              {displaySizes.length > 0 && (
                <div className="flex flex-wrap justify-center gap-[4px] px-2 w-full">
                  {displaySizes.map((size: string) => {
                    // Check if this size is available for the selected color (if any)
                    const isAvailableForColor = selectedColor 
                      ? inStockVariants.some((v: any) => v.size === size && v.color === selectedColor)
                      : inStockSizes.has(size);
                    
                    const isSelected = selectedSize === size;
                    return (
                      <div 
                        key={size} 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          e.preventDefault();
                          if (isAvailableForColor) setSelectedSize(size); 
                        }} 
                        className={`flex justify-center items-center px-1.5 min-w-[28px] h-[20px] rounded-full transition-colors ${
                          !isAvailableForColor ? 'bg-black/50 border border-white/10 cursor-not-allowed opacity-50' : 
                          isSelected ? 'bg-white border border-white cursor-pointer' : 'bg-black/80 border border-white/20 cursor-pointer hover:bg-black'
                        }`}
                      >
                        <span className={`font-inter font-bold text-[10px] truncate max-w-[50px] ${
                          isSelected ? 'text-black' : 'text-white'
                        }`}>{size}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          
          {/* Add to Cart Button (Always Visible) */}
          <button 
            disabled={!inStock || addToCart.isPending}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              
              if (needsSelection) {
                setShowVariantSelector(true);
                return;
              }

              const variantToAdd = (selectedSize || selectedColor) 
                ? product?.variants?.find((v: any) => 
                    (!uniqueSizes.length || v.size === selectedSize) && 
                    (!uniqueColors.length || v.color === selectedColor) &&
                    v.stockStatus === 'instock'
                  ) 
                : defaultVariant;

              if (inStock && variantToAdd) {
                addToCart.mutate(
                  { variantId: variantToAdd.id, quantity: 1 },
                  {
                    onSuccess: () => {
                       setShowVariantSelector(false);
                       openDrawer();
                    }
                  }
                );
              }
            }}
            className={`flex justify-center items-center w-full py-2.5 transition-all duration-300 pointer-events-auto ${
              inStock 
                ? (needsSelection && showVariantSelector ? 'bg-[#71865B] text-white hover:bg-[#62695A]' : 'bg-[#203C2B] text-[#FFFCF4] hover:bg-[#16281D]') 
                : 'bg-stone-300 text-stone-500 cursor-not-allowed'
            }`}
          >
            <span className="font-poppins font-medium text-[11px] uppercase tracking-[0.12em]">
              {addToCart.isPending ? 'Adding...' : !inStock ? 'Out of stock' : (needsSelection && showVariantSelector) ? 'Select Options' : 'Add to cart'}
            </span>
          </button>
        </div>
      </div>

      {/* Product Details Container */}
      <div className="flex flex-col items-center gap-1.5 w-full p-4 pt-3">
        
        {/* Pricing & Title Block */}
        <div className="flex flex-col items-center justify-center w-full">
          <Link href={productUrl} className="hover:text-[#71865B] transition-colors">
            <h3 className="font-inria font-normal text-[15px] text-[#203C2B] text-center tracking-tight mb-1 line-clamp-1">
              {title}
            </h3>
          </Link>
          
          <div className="flex items-center gap-2">
            {discountPercentage > 0 ? (
              <>
                {/* Old Price */}
                <span className="font-poppins font-light text-[11px] line-through text-[#62695A]/70">
                  Rs. {oldPrice}
                </span>
                {/* New Price */}
                <span className="font-poppins font-medium text-[13px] text-[#71865B]">
                  Rs. {currentPrice}
                </span>
              </>
            ) : (
              <span className="font-poppins font-medium text-[13px] text-[#203C2B]">
                Rs. {currentPrice}
              </span>
            )}
          </div>
        </div>

        {/* Payment Integrations */}
        <div className="flex flex-col items-center justify-center w-full mt-1 border-t border-[#71865B]/15 pt-2.5">
          <div className="flex items-center gap-1.5 flex-wrap justify-center opacity-75 group-hover:opacity-100 transition-opacity">
            <span className="font-poppins font-light text-[10px] text-[#62695A] tracking-tight">
              3 X Rs. {installment} with
            </span>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center justify-center w-[36px] h-[12px] relative">
                <Image src="/payment-methods/koko.png" alt="koko" fill sizes="36px" className="object-contain" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Area Spacer */}
        <div className="h-[4px]"></div>
        
      </div>
    </div>
  );
}
