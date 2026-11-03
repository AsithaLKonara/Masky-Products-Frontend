"use client";

import { useState, use, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, LayoutGrid, Info, ArrowLeftRight, Heart, Ruler, Send, MessageCircle } from "lucide-react";
import CategoryBar from "@/components/CategoryBar";
import ProductGallery from "@/components/ProductGallery";
import { getEffectivePrice } from "@/lib/pricing";
import ProductTabs from "@/components/ProductTabs";
import SizeGuideModal from "@/components/SizeGuideModal";
import ProductCard from "@/components/ProductCard";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useProductBySlug, useProducts } from "@/hooks/useProducts";
import { Product } from "@/types/product";
import { useCartStore } from "@/store/useCartStore";
import { useAddToCart } from "@/hooks/useCart";
import { useCart } from "@/components/CartProvider";
import { useAddToWishlist } from "@/hooks/useWishlist";

import { PaginatedResponse } from "@/types/api";
import { useStockSocket } from "@/hooks/useStockSocket";
import { PLACEHOLDER_IMAGE } from "@/lib/placeholder";

const COLOR_MAP: Record<string, string> = {
  black: '#000000', white: '#FFFFFF', red: '#EF4444', blue: '#3B82F6', green: '#22C55E',
  yellow: '#EAB308', purple: '#A855F7', pink: '#EC4899', orange: '#F97316', gray: '#6B7280',
  grey: '#6B7280', brown: '#8B4513', navy: '#1E3A8A', teal: '#14B8A6', maroon: '#7F1D1D',
  olive: '#4D7C0F', silver: '#D1D5DB', gold: '#F59E0B', beige: '#F5F5DC', mustard: '#EAB308',
  burgundy: '#800020', ash: '#B2BEB5', 'serene green': '#98FB98', 'hot pink': '#FF69B4'
};

const getHexColor = (colorName: string) => {
  if (!colorName) return '#CCCCCC';
  const normalized = colorName.toLowerCase().replace(/ /g, '');
  if (COLOR_MAP[normalized]) return COLOR_MAP[normalized];
  for (const [key, hex] of Object.entries(COLOR_MAP)) {
    if (normalized.includes(key)) return hex;
  }
  return '#CCCCCC'; // fallback
};

export default function ProductPageClient({ 
  params,
  initialProduct,
  initialRelatedProducts,
}: { 
  params: Promise<{ slug: string }>;
  initialProduct?: Product;
  initialRelatedProducts?: PaginatedResponse<Product>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  
  const { data: product, isLoading } = useProductBySlug(slug, initialProduct);
  const { data: relatedResponse } = useProducts({ skip: 0, take: 8 }, initialRelatedProducts);
  const relatedProducts = relatedResponse?.data || [];
  
  const sessionId = useCartStore((state) => state.sessionId);
  const openDrawer = useCartStore((state) => state.openDrawer);
  const addToCart = useAddToCart(sessionId);
  const addToWishlist = useAddToWishlist(sessionId);
  const { openWishlist } = useCart();

  const [emblaRef] = useEmblaCarousel(
    { loop: true, align: "start", dragFree: true },
    [Autoplay({ delay: 3000, stopOnInteraction: true })]
  );
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [stockOverrides, setStockOverrides] = useState<Record<string, { quantity: number; stockStatus: string }>>({});
  const [realtimeAlert, setRealtimeAlert] = useState<string | null>(null);

  const productVariantIds = useMemo(() => {
    return (product?.variants || []).map((v) => v.id);
  }, [product?.variants]);

  useStockSocket({
    variantIds: productVariantIds,
    onStockUpdate: (stock) => {
      setStockOverrides((prev) => ({
        ...prev,
        [stock.variantId]: {
          quantity: stock.quantity,
          stockStatus: stock.quantity <= 0 ? "outofstock" : "instock",
        },
      }));
    },
    onStockDepleted: (data) => {
      setStockOverrides((prev) => ({
        ...prev,
        [data.variantId]: {
          quantity: 0,
          stockStatus: "outofstock",
        },
      }));
      const channelLabel = data.channel ? `across ${data.channel}` : "across our marketplace channels";
      setRealtimeAlert(
        data.reason || (data as any).message || `This item just sold out ${channelLabel} in real-time.`
      );
    },
  });

  useEffect(() => {
    if (product && typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'ViewContent', {
        content_name: product.name,
        content_ids: [product.id],
        content_type: 'product',
        value: product.variants?.[0]?.price || 0,
        currency: 'LKR',
      });
    }
  }, [product]);

  if (isLoading) {
    return (
      <main className="relative flex flex-col w-full min-h-screen bg-background pt-[83px] items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-primary font-poppins">Loading product details...</p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="relative flex flex-col w-full min-h-screen bg-background pt-[83px] items-center justify-center">
        <h1 className="font-poppins text-2xl text-primary">Product not found</h1>
        <Link href="/shop" className="mt-4 underline text-stone-500">Back to Shop</Link>
      </main>
    );
  }

  const variants = product.variants || [];
  
  // Extract unique colors and sizes
  const uniqueColors = Array.from(new Set(variants.map(v => v.color).filter(Boolean))) as string[];
  const uniqueSizes = Array.from(new Set(
    variants.map(v => {
      if (!v.size) return null;
      if (v.size.includes(',')) return v.size.split(',').pop()?.trim();
      return v.size;
    }).filter(Boolean)
  )) as string[];

  // Auto-select first available if none selected
  if (!selectedColor && uniqueColors.length > 0) setSelectedColor(uniqueColors[0].toLowerCase());
  if (!selectedSize && uniqueSizes.length > 0) setSelectedSize(uniqueSizes[0]);

  // Find the selected variant
  const selectedVariant = variants.find(v => {
    const vSizeSanitized = v.size?.includes(',') ? v.size.split(',').pop()?.trim() : v.size;
    return (uniqueColors.length === 0 || v.color?.toLowerCase() === selectedColor?.toLowerCase()) &&
           (uniqueSizes.length === 0 || vSizeSanitized === selectedSize);
  }) || variants[0];

  const basePrice = selectedVariant?.price || 0;
  let effectivePrice = getEffectivePrice(selectedVariant);

  const currentPriceObj = effectivePrice;
  const originalPriceObj = basePrice;
  
  const discountPercentage = basePrice > effectivePrice 
    ? Math.round(((basePrice - effectivePrice) / basePrice) * 100)
    : 0;

  const currentPrice = currentPriceObj.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const installment = (currentPriceObj / 3).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  let variantImages: string[] = [];
  
  if (selectedVariant?.featuredImage) variantImages.push(selectedVariant.featuredImage);
  if (selectedVariant?.gallery) variantImages.push(...selectedVariant.gallery);
  
  if (variantImages.length === 0) {
    const colorVariants = variants.filter(v => v.color?.toLowerCase() === selectedColor?.toLowerCase());
    for (const cv of colorVariants) {
      if (cv.featuredImage) variantImages.push(cv.featuredImage);
      if (cv.gallery) variantImages.push(...cv.gallery);
    }
  }

  if (variantImages.length === 0) {
    for (const v of variants) {
      if (v.featuredImage) variantImages.push(v.featuredImage);
      if (v.gallery) variantImages.push(...v.gallery);
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
        if (match) {
          baseFilename = match[1];
        }
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

  variantImages = deduplicateImages(variantImages);
  const images = variantImages.length > 0 ? variantImages : [PLACEHOLDER_IMAGE];

  const getVariantStockStatus = (v: any) => {
    if (!v) return "outofstock";
    if (stockOverrides[v.id]) {
      return stockOverrides[v.id].stockStatus;
    }
    return v.stockStatus || (v.quantity !== undefined && v.quantity <= 0 ? "outofstock" : "instock");
  };

  const inStock = selectedVariant ? getVariantStockStatus(selectedVariant) === "instock" : true;

  return (
    <main className="relative flex flex-col w-full min-h-screen bg-background pt-[83px]">
      
      {/* Sub Navbar */}
      <CategoryBar />

      {/* Breadcrumbs */}
      <div className="w-full max-w-[1280px] mx-auto py-6 px-4 md:px-[120px] flex justify-between items-center">
        <span className="font-urbanist text-sm text-[#79716B]">
          Home / Shop / <span className="text-primary font-semibold">{product.name}</span>
        </span>
        <div className="hidden md:flex gap-4 text-primary">
          <button className="hover:text-stone-500"><ChevronLeft size={18} strokeWidth={1.5} /></button>
          <Link href="/shop" className="hover:text-stone-500"><LayoutGrid size={18} strokeWidth={1.5} /></Link>
          <button className="hover:text-stone-500"><ChevronRight size={18} strokeWidth={1.5} /></button>
        </div>
      </div>

      {/* Top Section: Gallery & Info */}
      <div className="flex flex-col lg:flex-row w-full max-w-[1280px] mx-auto px-4 md:px-[120px] gap-8 md:gap-[60px] pb-10 md:pb-[60px]">
        
        {/* Left: Gallery */}
        <div className="flex-shrink-0 flex justify-center lg:justify-start w-full lg:w-auto">
          <ProductGallery images={images} discountPercentage={discountPercentage} />
        </div>

        {/* Right: Product Info */}
        <div className="flex flex-col flex-1 w-full gap-[24px]">
          
          {/* Header & Pricing */}
          <div className="flex flex-col gap-2 pb-2">
            <h1 className="font-poppins text-3xl md:text-[36px] font-normal text-primary leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              {discountPercentage > 0 ? (
                <div className="flex items-center gap-3">
                  <span className="font-poppins text-lg text-[#79716B] line-through">Rs {originalPriceObj.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  <span className="font-poppins text-[22px] md:text-[26px] font-bold text-red-500">Rs {currentPrice}</span>
                </div>
              ) : (
                <span className="font-poppins text-[22px] md:text-[26px] font-bold text-primary">Rs {currentPrice}</span>
              )}
              {!inStock && <span className="font-poppins text-sm text-red-500 font-medium">Out of Stock</span>}
            </div>
          </div>

          {/* Installments */}
          <div className="flex flex-col gap-3 w-full border-b border-stone-200 pb-8">
            <div className="flex items-center gap-3 text-base text-[#79716B] font-poppins flex-wrap">
              <span>3 X Rs. {installment} with</span>
              <div className="flex items-center gap-2">
                <div className="w-[50px] h-[18px] relative">
                  <Image src="/payment-methods/koko.png" alt="koko" fill sizes="50px" className="object-contain" />
                </div>
              </div>
              <Info size={16} className="text-primary" fill="currentColor" color="white" />
            </div>
          </div>

          {/* Selections */}
          <div className="flex flex-col gap-6 mt-4">
            
            {/* Color Select */}
            {uniqueColors.length > 0 && (
              <div className="flex items-center gap-4">
                <span className="font-poppins font-bold text-base text-primary w-[50px]">Color:</span>
                <div className="flex gap-3 flex-wrap">
                  {uniqueColors.map(color => (
                    <button 
                      key={color}
                      onClick={() => setSelectedColor(color.toLowerCase())}
                      title={color}
                      className={`w-[34px] h-[34px] rounded-full border-2 transition-all ${
                        selectedColor === color.toLowerCase() 
                          ? 'border-primary scale-110' 
                          : 'border-stone-200 hover:scale-105'
                      }`}
                      style={{ backgroundColor: getHexColor(color) }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Select */}
            {uniqueSizes.length > 0 && (
              <div className="flex items-center gap-4">
                <span className="font-poppins font-bold text-base text-primary w-[50px]">Size:</span>
                <div className="flex gap-3 flex-wrap">
                  {uniqueSizes.map((size) => {
                    const variantForSize = variants.find(v => {
                      const vSizeSanitized = v.size?.includes(',') ? v.size.split(',').pop()?.trim() : v.size;
                      return vSizeSanitized === size && 
                             v.color?.toLowerCase() === selectedColor?.toLowerCase();
                    });
                    
                    const isSizeInStock = variantForSize ? getVariantStockStatus(variantForSize) === "instock" : false;

                    return (
                      <button 
                        key={size}
                        onClick={() => isSizeInStock && setSelectedSize(size)}
                        disabled={!isSizeInStock}
                        className={`h-[34px] px-4 rounded-full flex items-center justify-center font-poppins text-sm transition-colors border ${
                          !isSizeInStock
                            ? 'border-stone-200 text-stone-300 bg-stone-50 cursor-not-allowed line-through'
                            : selectedSize === size 
                              ? 'border-primary text-primary bg-stone-50' 
                              : 'border-stone-200 text-primary hover:border-stone-400 bg-white'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Real-time stock depletion alert banner */}
          {(!inStock || realtimeAlert) && (
            <div id="product-realtime-stock-alert" className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2.5 text-xs text-red-600 dark:text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
              <span className="font-medium">
                {realtimeAlert || "This variant just sold out across our marketplace channels. Checkout is disabled."}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-row flex-wrap items-center gap-4 w-full mt-4 pb-6 border-b border-stone-200">
            {/* Qty Selector */}
            <div className={`flex items-center border border-stone-300 rounded-sm h-[44px] w-[110px] flex-shrink-0 ${!inStock ? 'opacity-50 pointer-events-none' : ''}`}>
              <button disabled={!inStock} onClick={() => setQty(Math.max(1, qty - 1))} className="flex-1 text-lg text-[#79716B] border-r border-stone-300 h-full hover:bg-stone-50">-</button>
              <span className="flex-1 font-poppins text-sm text-primary flex items-center justify-center h-full">{qty}</span>
              <button disabled={!inStock} onClick={() => setQty(qty + 1)} className="flex-1 text-lg text-[#79716B] border-l border-stone-300 h-full hover:bg-stone-50">+</button>
            </div>
            
            {/* Add to Cart */}
            <button 
              onClick={() => {
                if (selectedVariant) {
                  addToCart.mutate(
                    { variantId: selectedVariant.id, quantity: qty },
                    {
                      onSuccess: () => {
                        if (typeof window !== 'undefined' && window.fbq) {
                          window.fbq('track', 'AddToCart', {
                            content_name: product.name,
                            content_ids: [product.id],
                            content_type: 'product',
                            value: currentPriceObj * qty,
                            currency: 'LKR',
                          });
                        }
                        openDrawer();
                      }
                    }
                  );
                }
              }}
              disabled={!inStock || addToCart.isPending}
              className={`flex-1 h-[44px] px-4 sm:px-8 rounded-sm font-poppins font-semibold text-sm text-white transition-colors uppercase tracking-wide whitespace-nowrap ${
                inStock 
                  ? 'bg-primary hover:bg-stone-800' 
                  : 'bg-stone-400 cursor-not-allowed opacity-80'
              }`}
            >
              {addToCart.isPending ? 'Adding...' : inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>

          {/* Secondary Actions */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pb-6">
            <button className="flex items-center gap-2 font-poppins font-medium text-sm text-primary hover:text-accent transition-colors">
              <ArrowLeftRight size={18} strokeWidth={1.5} /> Compare
            </button>
            <button 
              onClick={() => {
                if (product) {
                  addToWishlist.mutate(product.id, {
                    onSuccess: () => openWishlist()
                  });
                }
              }}
              disabled={addToWishlist.isPending}
              className="flex items-center gap-2 font-poppins font-medium text-sm text-primary hover:text-accent transition-colors disabled:opacity-50"
            >
              <Heart size={18} strokeWidth={1.5} className={addToWishlist.isPending ? "animate-pulse fill-primary" : ""} /> 
              {addToWishlist.isPending ? 'Adding...' : 'Add to wishlist'}
            </button>
            <button onClick={() => setIsSizeGuideOpen(true)} className="flex items-center gap-2 font-poppins font-medium text-sm text-primary hover:text-accent transition-colors">
              <Ruler size={18} strokeWidth={1.5} /> Size Guide
            </button>
          </div>
          
          <div className="w-full h-[1px] bg-stone-200 mb-2"></div>

          {/* Meta Data */}
          <div className="flex flex-col gap-4 font-poppins text-sm text-primary">
            <p><span className="font-bold">SKU:</span> <span className="text-[#79716B]">{selectedVariant?.sku || "N/A"}</span></p>
            <p><span className="font-bold">Categories:</span> <span className="text-[#79716B]">New arrivals</span></p>
            <div className="flex items-center gap-3 mt-1">
              <span className="font-bold">Share:</span>
              <div className="flex gap-4 text-stone-600">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="cursor-pointer hover:text-primary"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="cursor-pointer hover:text-primary"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="cursor-pointer hover:text-primary"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                <Send size={16} fill="currentColor" className="cursor-pointer hover:text-primary" />
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Tabs Section */}
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-[120px]">
        <ProductTabs description={product.description} excerpt={product.excerpt} productId={product.id} />
      </div>

      {/* Related Products */}
      <div className="flex flex-col items-center w-full max-w-[1280px] mx-auto px-4 md:px-[120px] py-16 md:py-[80px]">
        <h2 className="font-poppins text-2xl md:text-4xl text-primary mb-8">Related Products</h2>
        <div className="w-full max-w-[1040px] overflow-hidden" ref={relatedProducts.length > 4 ? emblaRef : undefined}>
          <div className={`flex ${relatedProducts.length > 4 ? '-ml-[20px]' : 'justify-center flex-wrap gap-5'}`}>
            {relatedProducts.length === 0 ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex-[0_0_265px] min-w-[265px] pl-[20px]">
                  <div className="w-full h-[380px] bg-stone-100 animate-pulse rounded-lg"></div>
                </div>
              ))
            ) : relatedProducts.slice(0, 8).map((product: Product) => (
              <div key={product.id} className={relatedProducts.length > 4 ? "flex-[0_0_265px] min-w-[265px] pl-[20px]" : "flex justify-center w-full max-w-[245px]"}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
        <Link href="/shop" className="font-poppins text-base text-primary border-b border-primary mt-8 pb-1">
          Explore more
        </Link>
      </div>

      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} sizeGuideContent={product.sizeGuideContent} sizeGuideImageUrl={product.sizeGuideImageUrl} />

      {/* Floating WhatsApp Widget */}
      <div className="fixed bottom-6 right-6 flex items-center gap-2 z-50">
        <div className="bg-white border border-stone-200 shadow-md rounded-full px-4 py-2 flex items-center justify-center font-poppins text-sm text-primary">
          Contact us
        </div>
        <button className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
          <MessageCircle size={32} color="white" />
        </button>
      </div>
    </main>
  );
}
