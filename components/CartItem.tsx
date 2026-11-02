import Image from "next/image";
import { X, Plus, Minus, ShoppingBag } from "lucide-react";

export interface CartItemProps {
  id: number | string;
  name: string;
  size: string;
  quantity: number;
  price: string;
  image: string;
  mode?: "cart" | "wishlist";
  onRemove?: (id: number | string) => void;
  onAddToCart?: (id: number | string) => void;
  onUpdateQuantity?: (id: number | string, newQuantity: number) => void;
}

export default function CartItem({ 
  id, 
  name, 
  size, 
  quantity, 
  price, 
  image, 
  mode = "cart",
  onRemove,
  onAddToCart,
  onUpdateQuantity
}: CartItemProps) {
  return (
    <div className="group flex items-start gap-4 p-3 bg-white w-full border-b border-stone-100 last:border-b-0 hover:bg-stone-50 transition-colors duration-300">
      
      {/* Product Image */}
      <div className="relative w-20 h-24 bg-stone-100 flex-shrink-0 overflow-hidden cursor-pointer">
        <Image 
          src={image} 
          alt={name} 
          fill 
          sizes="100px"
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
        />
      </div>

      {/* Product Details */}
      <div className="flex flex-col justify-between h-24 flex-1 py-0.5">
        
        {/* Top: Title & Remove */}
        <div className="flex justify-between items-start w-full">
          <div className="flex flex-col gap-1 pr-2">
            <h3 className="font-poppins font-normal text-xs text-stone-900 line-clamp-1 cursor-pointer hover:text-stone-500 transition-colors">
              {name}
            </h3>
            <span className="font-inter font-light text-[11px] text-stone-500">
              {size}
            </span>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.(id);
            }}
            className="flex justify-center items-center p-1 -mr-1 -mt-1 text-stone-400 hover:text-stone-900 transition-colors"
          >
            <X className="w-3.5 h-3.5 stroke-[1.5]" />
          </button>
        </div>
        
        {/* Bottom: Price & Actions */}
        <div className="flex items-center justify-between w-full mt-auto">
          <span className="font-inter font-medium text-xs text-stone-900">
            Rs. {price}
          </span>

          {/* Mode-specific actions */}
          {mode === "cart" ? (
            <div className="flex items-center gap-3 border border-stone-200 rounded-sm px-2 py-1 bg-white">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (quantity > 1) onUpdateQuantity?.(id, quantity - 1);
                }}
                className="text-stone-400 hover:text-stone-900 transition-colors disabled:opacity-50"
                disabled={quantity <= 1}
              >
                <Minus className="w-3 h-3 stroke-[1.5]" />
              </button>
              <span className="font-poppins font-light text-[11px] w-3 text-center text-stone-900">{quantity}</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateQuantity?.(id, quantity + 1);
                }}
                className="text-stone-400 hover:text-stone-900 transition-colors"
              >
                <Plus className="w-3 h-3 stroke-[1.5]" />
              </button>
            </div>
          ) : (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart?.(id);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-white transition-colors"
            >
              <ShoppingBag className="w-3 h-3 stroke-[1.5]" />
              <span className="font-poppins font-medium text-[10px] uppercase tracking-wider">Add</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
