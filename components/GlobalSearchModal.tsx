"use client";

import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="search-modal-title"
      className="fixed inset-0 z-[100] flex flex-col bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      
      {/* Search Header Container */}
      <div className="w-full bg-background pt-8 pb-6 px-4 md:px-12 animate-in slide-in-from-top-4 duration-300 shadow-xl">
        <div className="max-w-[1280px] mx-auto w-full flex flex-col gap-6">
          
          <div className="flex justify-between items-center w-full">
            <h2 className="font-poppins font-medium text-xl text-primary">Search</h2>
            <button 
              onClick={onClose}
              className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-stone-200 transition-colors text-stone-500 hover:text-primary"
            >
              <X size={24} />
            </button>
          </div>

          <div className="relative w-full h-[60px]">
            <input 
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products, categories..."
              className="w-full h-full border-b-2 border-stone-300 bg-transparent font-poppins text-xl md:text-2xl text-primary outline-none focus:border-accent transition-colors pl-0 pr-12 placeholder:text-stone-400"
            />
            <button className="absolute right-0 top-1/2 -translate-y-1/2 text-stone-400 hover:text-accent transition-colors">
              <Search size={28} />
            </button>
          </div>
          
          {/* Popular Suggestions */}
          {!searchQuery && (
            <div className="flex flex-col gap-4 mt-4">
              <span className="font-urbanist font-medium text-xs text-stone-500 uppercase tracking-widest">Popular Searches</span>
              <div className="flex flex-wrap gap-3">
                {["Linen Shirts", "Summer Collection", "Maxi Dresses", "Accessories"].map((term) => (
                  <button 
                    key={term}
                    onClick={() => setSearchQuery(term)}
                    className="px-4 py-2 bg-stone-100 rounded-full font-poppins text-sm text-stone-600 hover:bg-stone-200 hover:text-primary transition-colors border border-stone-200"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dummy Results */}
          {searchQuery && (
            <div className="flex flex-col mt-4">
              <span className="font-urbanist font-medium text-xs text-stone-500 uppercase tracking-widest mb-6">Products</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((item) => (
                  <Link href="/products/vesper-long-sleeve-top" onClick={onClose} key={item} className="flex flex-col group cursor-pointer">
                    <div className="relative w-full aspect-[3/4] bg-stone-200 mb-3 overflow-hidden rounded-md">
                      <Image 
                        src={`/products/product_${item}.jpg`} 
                        alt="Vesper Long Sleeve Top" 
                        fill 
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <h4 className="font-poppins font-medium text-sm text-primary group-hover:text-accent transition-colors">Vesper Long Sleeve Top</h4>
                    <span className="font-poppins text-sm text-stone-500">Rs. 5190.00</span>
                  </Link>
                ))}
              </div>
              <Link 
                href={`/search?q=${searchQuery}`} 
                onClick={onClose}
                className="mt-8 font-poppins text-sm text-primary border-b border-primary self-start hover:text-accent hover:border-accent transition-colors pb-1"
              >
                View all results for "{searchQuery}"
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
