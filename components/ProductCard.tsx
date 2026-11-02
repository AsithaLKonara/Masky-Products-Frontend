"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { getEffectivePrice } from "@/lib/pricing";
import { useRouter } from "next/navigation";
import { Product } from "@/types/product";
import { useCartStore } from "@/store/useCartStore";
import { useAddToCart } from "@/hooks/useCart";

interface ProductCardProps {
  product?: Product;
  imageUrl?: string;
  priority?: boolean;
}

export default function ProductCard({ product, imageUrl = "/products/default.jpg", priority = false }: ProductCardProps) {
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
      className="group flex flex-col w-full max-w-[245px] bg-white rounded-lg cursor-pointer overflow-hidden border border-stone-100 hover:shadow-md transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Image Container */}
      <div className="relative w-full aspect-[221/281] bg-stone-100 flex flex-col justify-between overflow-hidden">
        
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
          <div className="absolute top-2 right-2 z-10">
            <div className="flex justify-center items-center px-2 py-1 bg-white/95 backdrop-blur-sm shadow-sm rounded">
              <span className="font-poppins font-medium text-[9px] tracking-[0.1em] text-red-500 uppercase">
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
            className={`flex justify-center items-center w-full py-2.5 transition-colors pointer-events-auto ${
              inStock 
                ? (needsSelection && showVariantSelector ? 'bg-accent hover:bg-accent/90' : 'bg-stone-900 hover:bg-black') 
                : 'bg-stone-400 cursor-not-allowed'
            }`}
          >
            <span className="font-poppins font-medium text-[11px] text-white uppercase tracking-[0.1em]">
              {addToCart.isPending ? 'Adding...' : !inStock ? 'Out of stock' : (needsSelection && showVariantSelector) ? 'Select Options' : 'Add to cart'}
            </span>
          </button>
        </div>
      </div>

      {/* Product Details Container */}
      <div className="flex flex-col items-center gap-2 w-full p-4 pt-3">
        
        {/* Pricing & Title Block */}
        <div className="flex flex-col items-center justify-center w-full">
          <Link href={productUrl} className="hover:text-stone-500 transition-colors">
            <h3 className="font-poppins font-bold text-sm text-stone-900 text-center tracking-wide mb-1.5 line-clamp-1">
              {title}
            </h3>
          </Link>
          
          <div className="flex items-center gap-2.5">
            {discountPercentage > 0 ? (
              <>
                {/* Old Price */}
                <span className="font-inter font-medium text-[12px] line-through text-stone-400">
                  Rs. {oldPrice}
                </span>
                {/* New Price */}
                <span className="font-inter font-black text-[14px] text-red-500">
                  Rs. {currentPrice}
                </span>
              </>
            ) : (
              <span className="font-inter font-black text-[14px] text-stone-900">
                Rs. {currentPrice}
              </span>
            )}
          </div>
        </div>

        {/* Payment Integrations */}
        <div className="flex flex-col items-center justify-center w-full mt-1.5 border-t border-stone-100 pt-3">
          <div className="flex items-center gap-1.5 flex-wrap justify-center opacity-70 group-hover:opacity-100 transition-opacity">
            <span className="font-inter font-medium text-[10px] text-stone-500 tracking-tight">
              3 X Rs. {installment} with
            </span>
            <div className="flex items-center gap-1">
              <div className="flex items-center justify-center w-[28px] h-[10px] relative">
                <Image src="/payment-methods/koko.png" alt="koko" fill sizes="28px" className="object-contain" />
              </div>
              <div className="flex items-center justify-center w-[28px] h-[10px] relative">
                <Image src="/payment-methods/mintpay-pill.png" alt="mintpay" fill sizes="28px" className="object-contain" />
              </div>
              <div className="flex items-center justify-center w-[28px] h-[10px] relative">
                <Image src="/payment-methods/payzy.png" alt="payzy" fill sizes="28px" className="object-contain" />
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
