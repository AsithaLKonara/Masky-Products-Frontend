"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useState, useMemo, useEffect } from "react";

export default function VariantSelectionModal({ product, onClose, onAdd, allowOutOfStock = false }: { product: any, onClose: () => void, onAdd?: (product: any, variant: any, qty: number) => void, allowOutOfStock?: boolean }) {
  const variants = product?.variants || [];
  
  // Extract unique colors and sizes
  const availableColors = useMemo(() => {
    const colors = variants.map((v: any) => v.color).filter(Boolean);
    return Array.from(new Set(colors)) as string[];
  }, [variants]);

  const [selectedColor, setSelectedColor] = useState(availableColors[0] || "");
  
  // Get sizes for selected color
  const availableSizes = useMemo(() => {
    return variants
      .filter((v: any) => !selectedColor || v.color === selectedColor)
      .map((v: any) => v.size)
      .filter(Boolean);
  }, [variants, selectedColor]);

  // Remove duplicate sizes
  const uniqueSizes = Array.from(new Set(availableSizes)) as string[];

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id || "");
  
  // Automatically select the first size when color changes
  useEffect(() => {
    if (uniqueSizes.length > 0 && !uniqueSizes.includes(selectedSize)) {
      setSelectedSize(uniqueSizes[0]);
    }
  }, [selectedColor, uniqueSizes]);

  const [qty, setQty] = useState(1);

  if (!product) return null;

  const hasColors = availableColors.length > 0;
  const hasSizes = uniqueSizes.length > 0;
  const showDirectVariants = !hasColors && !hasSizes && variants.length > 1;

  const selectedVariant = useMemo(() => {
    if (showDirectVariants) {
      return variants.find((v: any) => v.id === selectedVariantId) || variants[0];
    }
    return variants.find((v: any) => 
      (!selectedColor || v.color === selectedColor) && 
      (!selectedSize || v.size === selectedSize)
    ) || variants[0];
  }, [variants, selectedColor, selectedSize, showDirectVariants, selectedVariantId]);

  const price = selectedVariant?.price || 0;
  const inStock = selectedVariant?.stockStatus === 'instock';

  // Gather image logic similar to storefront
  let imageUrl = "/placeholder.png";
  if (selectedVariant?.featuredImage) imageUrl = selectedVariant.featuredImage;
  else if (selectedVariant?.gallery && selectedVariant.gallery.length > 0) imageUrl = selectedVariant.gallery[0];
  else if (variants.length > 0) {
    const firstWithImg = variants.find((v: any) => v.featuredImage || (v.gallery && v.gallery.length > 0));
    if (firstWithImg) imageUrl = firstWithImg.featuredImage || firstWithImg.gallery[0];
  }

  const handleAdd = () => {
    if (onAdd && selectedVariant) {
      onAdd(product, selectedVariant, qty);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-[500px] bg-background shadow-2xl rounded-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-border bg-surface">
          <h3 className="font-inter font-bold text-lg text-foreground">Select Options</h3>
          <button onClick={onClose} className="p-2 text-muted hover:text-foreground hover:bg-background rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-6 overflow-y-auto">
          
          {/* Product Summary */}
          <div className="flex gap-4">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-border">
              <Image src={imageUrl} alt={product.name} fill sizes="100px" className="object-cover" />
            </div>
            <div className="flex flex-col justify-center">
              <h4 className="font-inter font-bold text-foreground leading-snug">{product.name}</h4>
              <div className="flex items-center gap-3 mt-1">
                <span className="font-inter font-bold text-primary text-lg">Rs. {price.toFixed(2)}</span>
                <span className={`font-inter text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded border ${
                  (inStock || allowOutOfStock) ? "text-muted bg-background border-border" : "text-error bg-error/10 border-error/20"
                }`}>
                  {inStock ? "In Stock" : (allowOutOfStock ? "Pre-Sold" : "Out of Stock")}
                </span>
              </div>
            </div>
          </div>

          <div className="w-full h-[1px] bg-border"></div>

          {/* Color Selection */}
          {hasColors && (
            <div className="flex flex-col gap-3">
              <label className="font-inter font-semibold text-sm text-foreground">Color: {selectedColor}</label>
              <div className="flex gap-3 flex-wrap">
                {availableColors.map(color => (
                  <button 
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-lg font-inter font-semibold text-sm transition-colors border ${
                      selectedColor === color 
                        ? 'border-primary text-primary bg-primary-soft' 
                        : 'border-border text-foreground hover:border-muted bg-surface'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {hasSizes && (
            <div className="flex flex-col gap-3">
              <label className="font-inter font-semibold text-sm text-foreground">Size: {selectedSize}</label>
              <div className="flex gap-2 flex-wrap">
                {uniqueSizes.map(size => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[50px] h-[40px] px-4 rounded-lg flex items-center justify-center font-inter font-semibold text-sm transition-colors border ${
                      selectedSize === size 
                        ? 'border-primary text-primary bg-primary-soft' 
                        : 'border-border text-foreground hover:border-muted bg-surface'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Direct Variant Selection (Fallback) */}
          {showDirectVariants && (
            <div className="flex flex-col gap-3">
              <label className="font-inter font-semibold text-sm text-foreground">Variant</label>
              <div className="flex gap-2 flex-wrap">
                {variants.map((v: any) => (
                  <button 
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`px-4 py-2 rounded-lg font-inter font-semibold text-sm transition-colors border ${
                      selectedVariantId === v.id 
                        ? 'border-primary text-primary bg-primary-soft' 
                        : 'border-border text-foreground hover:border-muted bg-surface'
                    }`}
                  >
                    {v.name || v.sku || 'Variant'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex flex-col gap-3">
            <label className="font-inter font-semibold text-sm text-foreground">Quantity</label>
            <div className={`flex items-center border border-border rounded-lg h-[44px] w-[140px] bg-surface overflow-hidden ${(!inStock && !allowOutOfStock) ? 'opacity-50 pointer-events-none' : ''}`}>
              <button disabled={!inStock && !allowOutOfStock} onClick={() => setQty(Math.max(1, qty - 1))} className="flex-1 text-lg text-muted border-r border-border h-full hover:bg-background">-</button>
              <span className="flex-1 font-inter font-bold text-primary flex items-center justify-center h-full bg-background">{qty}</span>
              <button disabled={!inStock && !allowOutOfStock} onClick={() => setQty(qty + 1)} className="flex-1 text-lg text-muted border-l border-border h-full hover:bg-background">+</button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-surface flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-6 py-2 rounded-lg font-inter font-semibold text-sm text-foreground hover:bg-background border border-border transition-colors">
            Cancel
          </button>
          <button 
            disabled={!inStock && !allowOutOfStock}
            onClick={handleAdd} 
            className={`px-8 py-2 rounded-lg font-inter font-bold text-sm text-white transition-colors shadow-md ${
              (inStock || allowOutOfStock) ? 'bg-primary hover:bg-primary-hover' : 'bg-stone-400 cursor-not-allowed'
            }`}
          >
            Add to Order
          </button>
        </div>

      </div>
    </div>
  );
}
