"use client";

import { useState, use, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ChevronLeft, ChevronRight, LayoutGrid, Info, ArrowLeftRight, Heart, 
  Ruler, Send, MessageCircle, Sparkles, ShieldCheck, Truck, RotateCcw, 
  Share2, Check 
} from "lucide-react";
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
import { ProductDetailSkeleton } from "@/components/ui/Skeleton";

const COLOR_MAP: Record<string, string> = {
  black: '#000000', white: '#FFFFFF', red: '#EF4444', blue: '#3B82F6', green: '#22C55E',
  yellow: '#EAB308', purple: '#A855F7', pink: '#EC4899', orange: '#F97316', gray: '#6B7280',
  grey: '#6B7280', brown: '#8B4513', navy: '#1E3A8A', teal: '#14B8A6', maroon: '#7F1D1D',
  olive: '#4D7C0F', silver: '#D1D5DB', gold: '#F59E0B', beige: '#F5F5DC', mustard: '#EAB308',
  burgundy: '#800020', ash: '#B2BEB5', 'serene green': '#98FB98', 'hot pink': '#FF69B4',
  'cognac brown': '#723B1E', 'matte black': '#1A1A1A', 'emerald green': '#1C4A38', 'champagne': '#E5D9C3'
};

const getHexColor = (colorName: string) => {
  if (!colorName) return '#CCCCCC';
  const normalized = colorName.toLowerCase().trim();
  if (COLOR_MAP[normalized]) return COLOR_MAP[normalized];
  for (const [key, hex] of Object.entries(COLOR_MAP)) {
    if (normalized.includes(key)) return hex;
  }
  return '#C8BEAE'; // warm fallback
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
    [Autoplay({ delay: 3500, stopOnInteraction: true })]
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
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <main className="relative flex flex-col w-full min-h-screen bg-[#FEF6E4] pt-[120px] items-center justify-center px-4">
        <div className="bg-[#FFFCF4]/80 backdrop-blur-md rounded-3xl border border-[#DCDCCB] p-10 max-w-md w-full text-center shadow-xs">
          <h1 className="font-signature font-bold text-3xl text-[#203C2B] mb-3">Piece Not Found</h1>
          <p className="font-poppins text-xs text-[#62695A] mb-6 leading-relaxed">
            The silhouette you are seeking may be archived or unavailable.
          </p>
          <Link 
            href="/shop" 
            className="inline-flex px-7 py-3 rounded-full bg-[#203C2B] text-[#FFFCF4] font-poppins text-xs uppercase tracking-widest hover:bg-[#2d523c] transition-all shadow-sm"
          >
            Explore All Creations
          </Link>
        </div>
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

  const handleAddToCart = () => {
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
  };

  return (
    <main className="relative flex flex-col w-full min-h-screen bg-[#FEF6E4] pt-[84px]">
      
      {/* Sub Navbar */}
      <CategoryBar />

      {/* Editorial Breadcrumbs */}
      <div className="w-full max-w-7xl mx-auto py-5 px-4 sm:px-6 lg:px-12 flex justify-between items-center">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-poppins text-[#62695A] tracking-wider uppercase">
          <Link href="/" className="hover:text-[#203C2B] transition-colors">Home</Link>
          <span className="text-[#A2A69A]">/</span>
          <Link href="/shop" className="hover:text-[#203C2B] transition-colors">Shop</Link>
          {product.category?.name && (
            <>
              <span className="text-[#A2A69A]">/</span>
              <Link href={`/categories/${product.category.slug}`} className="hover:text-[#203C2B] transition-colors">
                {product.category.name}
              </Link>
            </>
          )}
          <span className="text-[#A2A69A]">/</span>
          <span className="text-[#203C2B] font-semibold truncate max-w-[180px] sm:max-w-xs">{product.name}</span>
        </nav>

        <div className="hidden md:flex items-center gap-3 text-[#203C2B]">
          <Link 
            href="/shop" 
            className="p-2 rounded-full hover:bg-white/80 border border-transparent hover:border-[#DCDCCB] transition-all"
            title="Browse all products"
          >
            <LayoutGrid size={16} strokeWidth={1.5} />
          </Link>
        </div>
      </div>

      {/* Top Section: Gallery & Info */}
      <div className="flex flex-col lg:flex-row w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 gap-10 lg:gap-14 pb-12 lg:pb-20">
        
        {/* Left: Gallery */}
        <div className="flex-shrink-0 flex justify-center lg:justify-start w-full lg:w-auto">
          <ProductGallery images={images} productName={product.name} discountPercentage={discountPercentage} />
        </div>

        {/* Right: Product Info */}
        <div className="flex flex-col flex-1 w-full gap-6">
          
          {/* Header & Pricing */}
          <div className="flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#71865B]/15 border border-[#71865B]/30 text-[#203C2B] w-fit">
              <Sparkles size={11} className="text-[#71865B]" />
              <span className="font-poppins text-[10px] font-semibold tracking-[0.18em] uppercase">
                {product.category?.name || "Bespoke Collection"}
              </span>
            </div>

            <h1 className="font-signature font-bold text-3xl sm:text-4xl lg:text-[42px] text-[#203C2B] leading-[1.15] tracking-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mt-1">
              {discountPercentage > 0 ? (
                <div className="flex items-center gap-3">
                  <span className="font-poppins text-lg text-[#8F9489] line-through">
                    Rs. {originalPriceObj.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className="font-signature font-bold text-3xl sm:text-4xl text-[#203C2B]">
                    Rs. {currentPrice}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#71865B]/20 text-[#203C2B] font-poppins text-xs font-semibold">
                    Save {discountPercentage}%
                  </span>
                </div>
              ) : (
                <span className="font-signature font-bold text-3xl sm:text-4xl text-[#203C2B]">
                  Rs. {currentPrice}
                </span>
              )}
              {!inStock && (
                <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-600 font-poppins text-xs font-medium">
                  Sold Out
                </span>
              )}
            </div>
          </div>

          {/* Koko Installment Banner */}
          <div className="bg-[#FFFCF4]/80 backdrop-blur-md border border-[#DCDCCB] rounded-2xl p-4 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#555E4E] font-poppins flex-wrap">
              <span>Pay in 3 interest-free installments of</span>
              <strong className="text-[#203C2B] font-semibold">Rs. {installment}</strong>
              <span>with</span>
              <div className="w-[50px] h-[18px] relative inline-block align-middle">
                <Image src="/payment-methods/koko.png" alt="Koko Pay" fill sizes="50px" className="object-contain" />
              </div>
            </div>
            <Info size={16} className="text-[#71865B] shrink-0" />
          </div>

          {/* Selections */}
          <div className="flex flex-col gap-5 pt-2">
            
            {/* Color Select */}
            {uniqueColors.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-poppins text-xs uppercase tracking-wider text-[#62695A] font-semibold">
                    Color:
                  </span>
                  <span className="font-poppins text-xs text-[#203C2B] font-medium capitalize">
                    {selectedColor}
                  </span>
                </div>
                <div className="flex gap-3 flex-wrap items-center">
                  {uniqueColors.map(color => {
                    const isSelected = selectedColor === color.toLowerCase();
                    return (
                      <button 
                        key={color}
                        onClick={() => setSelectedColor(color.toLowerCase())}
                        title={color}
                        className={`relative w-8 h-8 rounded-full transition-all cursor-pointer ${
                          isSelected 
                            ? 'ring-2 ring-[#203C2B] ring-offset-2 ring-offset-[#FEF6E4] scale-110 shadow-sm' 
                            : 'border border-[#DCDCCB] hover:scale-105'
                        }`}
                        style={{ backgroundColor: getHexColor(color) }}
                      >
                        {isSelected && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <Check size={14} className={['white', 'beige', 'champagne'].includes(color.toLowerCase()) ? "text-[#203C2B]" : "text-white"} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Select */}
            {uniqueSizes.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-poppins text-xs uppercase tracking-wider text-[#62695A] font-semibold">
                      Size:
                    </span>
                    <span className="font-poppins text-xs text-[#203C2B] font-semibold">
                      {selectedSize}
                    </span>
                  </div>
                  <button 
                    onClick={() => setIsSizeGuideOpen(true)} 
                    className="flex items-center gap-1.5 font-poppins text-xs text-[#71865B] hover:text-[#203C2B] transition-colors cursor-pointer"
                  >
                    <Ruler size={13} strokeWidth={1.7} /> Size Guide
                  </button>
                </div>

                <div className="flex gap-2.5 flex-wrap">
                  {uniqueSizes.map((size) => {
                    const variantForSize = variants.find(v => {
                      const vSizeSanitized = v.size?.includes(',') ? v.size.split(',').pop()?.trim() : v.size;
                      return vSizeSanitized === size && 
                             v.color?.toLowerCase() === selectedColor?.toLowerCase();
                    });
                    
                    const isSizeInStock = variantForSize ? getVariantStockStatus(variantForSize) === "instock" : false;
                    const isSelected = selectedSize === size;

                    return (
                      <button 
                        key={size}
                        onClick={() => isSizeInStock && setSelectedSize(size)}
                        disabled={!isSizeInStock}
                        className={`h-10 px-5 rounded-full flex items-center justify-center font-poppins text-xs tracking-wider uppercase transition-all border cursor-pointer ${
                          !isSizeInStock
                            ? 'border-[#DCDCCB]/50 text-[#A2A69A] bg-white/30 cursor-not-allowed line-through'
                            : isSelected 
                              ? 'border-[#203C2B] text-[#FFFCF4] bg-[#203C2B] shadow-sm font-semibold' 
                              : 'border-[#DCDCCB] text-[#203C2B] hover:border-[#71865B] bg-white/70'
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
            <div id="product-realtime-stock-alert" className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-2.5 text-xs text-red-600">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
              <span className="font-medium">
                {realtimeAlert || "This variant just sold out across our marketplace channels. Checkout is temporarily unavailable."}
              </span>
            </div>
          )}

          {/* Actions: Stepper + Add to Cart */}
          <div className="flex items-center gap-3 w-full pt-2">
            {/* Qty Stepper */}
            <div className={`flex items-center bg-white/80 border border-[#DCDCCB] rounded-full h-12 w-28 shrink-0 px-2 shadow-2xs ${!inStock ? 'opacity-50 pointer-events-none' : ''}`}>
              <button 
                disabled={!inStock} 
                onClick={() => setQty(Math.max(1, qty - 1))} 
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-[#203C2B] hover:bg-[#203C2B]/10 transition-colors cursor-pointer"
              >
                -
              </button>
              <span className="flex-1 font-poppins text-xs font-semibold text-[#203C2B] text-center">
                {qty}
              </span>
              <button 
                disabled={!inStock} 
                onClick={() => setQty(qty + 1)} 
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-[#203C2B] hover:bg-[#203C2B]/10 transition-colors cursor-pointer"
              >
                +
              </button>
            </div>
            
            {/* Add to Cart Primary Button */}
            <button 
              onClick={handleAddToCart}
              disabled={!inStock || addToCart.isPending}
              className={`flex-1 h-12 px-8 rounded-full font-poppins text-xs tracking-[0.16em] uppercase font-semibold text-[#FFFCF4] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                inStock 
                  ? 'bg-[#203C2B] hover:bg-[#2d523c] active:scale-[0.99]' 
                  : 'bg-[#A2A69A] cursor-not-allowed opacity-80'
              }`}
            >
              {addToCart.isPending ? 'Adding to Basket...' : inStock ? 'Add to Cart' : 'Sold Out'}
            </button>

            {/* Wishlist Button */}
            <button 
              onClick={() => {
                if (product) {
                  addToWishlist.mutate(product.id, {
                    onSuccess: () => openWishlist()
                  });
                }
              }}
              disabled={addToWishlist.isPending}
              className="w-12 h-12 rounded-full bg-white/80 border border-[#DCDCCB] flex items-center justify-center text-[#203C2B] hover:bg-[#203C2B] hover:text-[#FFFCF4] transition-all shrink-0 shadow-2xs cursor-pointer"
              title="Add to Wishlist"
            >
              <Heart size={18} strokeWidth={1.6} className={addToWishlist.isPending ? "animate-pulse fill-[#203C2B]" : ""} />
            </button>
          </div>

          {/* Value Proposition Micro-cards */}
          <div className="grid grid-cols-3 gap-2.5 pt-4">
            <div className="p-3 rounded-2xl bg-[#FFFCF4]/70 border border-[#DCDCCB]/70 flex flex-col items-center text-center gap-1.5">
              <Sparkles size={16} className="text-[#71865B]" />
              <span className="font-poppins text-[10px] font-semibold text-[#203C2B] uppercase tracking-wider">Artisan Harvest</span>
              <span className="font-poppins text-[9px] text-[#62695A] hidden sm:inline">100% Pure Organic</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#FFFCF4]/70 border border-[#DCDCCB]/70 flex flex-col items-center text-center gap-1.5">
              <Truck size={16} className="text-[#71865B]" />
              <span className="font-poppins text-[10px] font-semibold text-[#203C2B] uppercase tracking-wider">Island Courier</span>
              <span className="font-poppins text-[9px] text-[#62695A] hidden sm:inline">2–4 business days</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#FFFCF4]/70 border border-[#DCDCCB]/70 flex flex-col items-center text-center gap-1.5">
              <RotateCcw size={16} className="text-[#71865B]" />
              <span className="font-poppins text-[10px] font-semibold text-[#203C2B] uppercase tracking-wider">Quality First</span>
              <span className="font-poppins text-[9px] text-[#62695A] hidden sm:inline">Safe sealed packaging</span>
            </div>
          </div>

          {/* Meta Information */}
          <div className="pt-4 border-t border-[#DCDCCB]/70 flex flex-col gap-2 font-poppins text-xs text-[#62695A]">
            <p><span className="font-semibold text-[#203C2B]">SKU:</span> {selectedVariant?.sku || "N/A"}</p>
            <p><span className="font-semibold text-[#203C2B]">Availability:</span> {inStock ? "Ready to Dispatch" : "Temporarily Sold Out"}</p>
          </div>
          
        </div>
      </div>

      {/* Tabs Section */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <ProductTabs description={product.description} excerpt={product.excerpt} productId={product.id} />
      </div>

      {/* Related Products Carousel */}
      <div className="flex flex-col items-center w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16 md:py-24">
        <div className="text-center mb-10">
          <span className="font-poppins text-[10px] font-semibold tracking-[0.2em] text-[#71865B] uppercase block mb-2">
            Curated Complements
          </span>
          <h2 className="font-signature font-bold text-3xl sm:text-4xl text-[#203C2B]">
            Complete the Gourmet Harvest
          </h2>
        </div>

        <div className="w-full overflow-hidden" ref={relatedProducts.length > 4 ? emblaRef : undefined}>
          <div className={`flex ${relatedProducts.length > 4 ? '-ml-5' : 'justify-center flex-wrap gap-6'}`}>
            {relatedProducts.length === 0 ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex-[0_0_260px] min-w-[260px] pl-5">
                  <div className="w-full aspect-[221/340] bg-white/50 animate-pulse rounded-2xl border border-[#DCDCCB]"></div>
                </div>
              ))
            ) : relatedProducts.slice(0, 8).map((p: Product) => (
              <div key={p.id} className={relatedProducts.length > 4 ? "flex-[0_0_260px] min-w-[260px] pl-5" : "flex justify-center w-full max-w-[260px]"}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>

        <Link 
          href="/shop" 
          className="mt-10 font-poppins text-xs font-semibold uppercase tracking-[0.18em] text-[#203C2B] px-8 py-3.5 rounded-full border border-[#203C2B] hover:bg-[#203C2B] hover:text-[#FFFCF4] transition-all shadow-xs"
        >
          View Full Catalog
        </Link>
      </div>

      <SizeGuideModal 
        isOpen={isSizeGuideOpen} 
        onClose={() => setIsSizeGuideOpen(false)} 
        sizeGuideContent={product.sizeGuideContent} 
        sizeGuideImageUrl={product.sizeGuideImageUrl} 
      />

      {/* Floating WhatsApp Widget */}
      <div className="fixed bottom-20 lg:bottom-6 right-6 flex items-center gap-2 z-40">
        <div className="bg-[#FFFCF4]/90 backdrop-blur-md border border-[#DCDCCB] shadow-md rounded-full px-4 py-2 flex items-center justify-center font-poppins text-xs text-[#203C2B] font-medium hidden sm:flex">
          Concierge Support
        </div>
        <button 
          className="w-12 h-12 bg-[#203C2B] text-[#FFFCF4] rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          title="Chat with Concierge"
        >
          <MessageCircle size={22} />
        </button>
      </div>

      {/* Mobile Sticky Add to Cart Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#FFFCF4]/95 backdrop-blur-md border-t border-[#DCDCCB] px-4 py-3 flex items-center justify-between gap-3 lg:hidden shadow-[0_-4px_16px_rgba(32,60,43,0.06)]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl overflow-hidden relative shrink-0 border border-[#DCDCCB] bg-white">
            <Image src={images[0] || PLACEHOLDER_IMAGE} alt={product.name} fill sizes="40px" className="object-cover" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-signature font-bold text-sm text-[#203C2B] truncate">{product.name}</span>
            <span className="font-poppins font-semibold text-xs text-[#203C2B]">Rs. {currentPrice}</span>
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!inStock || addToCart.isPending}
          className={`h-10 px-5 rounded-full font-poppins text-xs font-semibold tracking-wider uppercase whitespace-nowrap shadow-sm transition-all ${
            inStock 
              ? 'bg-[#203C2B] text-[#FFFCF4] active:scale-[0.98]' 
              : 'bg-[#A2A69A] text-white opacity-60 cursor-not-allowed'
          }`}
        >
          {addToCart.isPending ? 'Adding...' : inStock ? 'Add to Cart' : 'Sold Out'}
        </button>
      </div>

    </main>
  );
}
