"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, SlidersHorizontal, Check, Filter, Search as SearchIcon, RotateCcw, X } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useProductFilters } from "@/hooks/useProducts";
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import * as Slider from "@radix-ui/react-slider";

interface FilterSidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function FilterSidebar({ isOpen = true, onToggle }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    categories: true,
    price: true,
    colors: true,
    size: true,
  });

  const selectedColor = searchParams.get("color") || "";
  const selectedSize = searchParams.get("size") || "";
  const searchQuery = searchParams.get("search") || "";
  const [localSearch, setLocalSearch] = useState(searchQuery);
  
  const minPriceParam = searchParams.get("minPrice");
  const maxPriceParam = searchParams.get("maxPrice");
  
  const [priceRange, setPriceRange] = useState([
    minPriceParam ? parseInt(minPriceParam) : 0, 
    maxPriceParam ? parseInt(maxPriceParam) : 15000
  ]);

  useEffect(() => {
    setPriceRange([
      minPriceParam ? parseInt(minPriceParam) : 0, 
      maxPriceParam ? parseInt(maxPriceParam) : 15000
    ]);
  }, [minPriceParam, maxPriceParam]);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (localSearch.trim()) {
      params.set("search", localSearch.trim());
    } else {
      params.delete("search");
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const commitPriceRange = (values: number[]) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("minPrice", values[0].toString());
    params.set("maxPrice", values[1].toString());
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const { data: response } = useCategories();
  const rawCategories = response?.data || [];
  const categories = rawCategories.length > 0 ? rawCategories : [
    { id: "cat-fresh", name: "Fresh mushrooms product", slug: "fresh-mushrooms-product" },
    { id: "cat-dehydrated", name: "Dehydrated product", slug: "dehydrated-product" },
    { id: "cat-ready", name: "Redy to eat product", slug: "redy-to-eat-product" },
    { id: "cat-frozen", name: "Frezon product", slug: "frezon-product" },
  ];
  
  const { data: filters } = useProductFilters();
  
  const COLOR_MAP: Record<string, string> = {
    black: '#000000', white: '#FFFFFF', red: '#EF4444', blue: '#3B82F6', green: '#22C55E',
    yellow: '#EAB308', purple: '#A855F7', pink: '#EC4899', orange: '#F97316', gray: '#6B7280',
    grey: '#6B7280', brown: '#8B4513', navy: '#1E3A8A', teal: '#14B8A6', maroon: '#7F1D1D',
    olive: '#4D7C0F', silver: '#D1D5DB', gold: '#F59E0B', beige: '#F5F5DC', mustard: '#EAB308',
    burgundy: '#800020', ash: '#B2BEB5'
  };

  const getHexColor = (colorName: string) => {
    const normalized = colorName.toLowerCase().replace(/ /g, '');
    if (COLOR_MAP[normalized]) return COLOR_MAP[normalized];
    for (const [key, hex] of Object.entries(COLOR_MAP)) {
      if (normalized.includes(key)) return hex;
    }
    return null;
  };
  
  const rawColors = filters?.colors?.filter((color: string) => !color.includes(',') && isNaN(Number(color))) || [];
  
  const colors = rawColors
    .map((color: string) => {
      const hex = getHexColor(color);
      if (!hex) return null;
      return {
        id: color,
        hex,
        border: hex === '#FFFFFF' || hex.toLowerCase() === '#f5f5dc'
      };
    })
    .filter(Boolean)
    .slice(0, 14) as { id: string; hex: string; border: boolean }[];

  const allowedSizes = ["S", "M", "L", "XL", "UK 08", "UK 10", "UK 12", "Free Size"];
  const sizes = allowedSizes.filter(size => filters?.sizes?.includes(size) || ["S", "M", "L", "XL"].includes(size));

  const hasActiveFilters = Boolean(selectedColor || selectedSize || searchQuery || minPriceParam || maxPriceParam);

  if (!isOpen) {
    return (
      <aside aria-label="Filters collapsed" className="flex flex-col items-center w-full h-full bg-[#FFFCF4]/60 backdrop-blur-md border-r border-[#DCDCCB]/60 py-6 shadow-xs">
        <button 
          onClick={onToggle}
          className="p-3 rounded-full bg-white/80 border border-[#DCDCCB] text-[#203C2B] hover:bg-[#203C2B] hover:text-[#FFFCF4] transition-all duration-300 shadow-xs"
          title="Show Filters"
        >
          <SlidersHorizontal size={18} />
        </button>
      </aside>
    );
  }

  return (
    <aside 
      aria-label="Product Filters"
      className="flex flex-col w-full h-full bg-[#FFFCF4]/95 lg:bg-[#FFFCF4]/75 backdrop-blur-md border-r border-[#DCDCCB]/60 pt-20 pb-8 px-5 lg:py-6 md:pl-8 md:pr-6 gap-6 overflow-y-auto no-scrollbar shadow-[0_4px_24px_rgba(32,60,43,0.02)]"
    >
      {/* Header */}
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#71865B]/15 flex items-center justify-center text-[#203C2B]">
            <Filter size={15} />
          </div>
          <h2 className="font-signature font-bold text-xl text-[#203C2B] tracking-wide">
            Filter Pieces
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button 
              onClick={() => router.push(pathname)}
              className="font-poppins text-[11px] font-semibold text-[#71865B] hover:text-[#203C2B] transition-colors flex items-center gap-1 uppercase tracking-wider"
            >
              <RotateCcw size={11} /> Reset
            </button>
          )}
          <button 
            onClick={onToggle}
            className="p-1.5 rounded-full hover:bg-[#203C2B]/10 text-[#203C2B] transition-colors cursor-pointer"
            title="Close or Toggle Filters"
          >
            <span className="lg:hidden"><X size={18} /></span>
            <span className="hidden lg:inline"><SlidersHorizontal size={18} /></span>
          </button>
        </div>
      </div>

      <div className="w-full h-px bg-[#DCDCCB]/70" />

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="flex flex-col w-full gap-2">
        <label className="font-poppins font-semibold text-[11px] uppercase tracking-[0.16em] text-[#62695A]">
          Search Piece
        </label>
        <div className="relative w-full">
          <input 
            type="text" 
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search catalog..." 
            className="w-full h-10 pl-10 pr-4 bg-white/80 border border-[#DCDCCB] rounded-full font-poppins text-xs text-[#203C2B] placeholder:text-[#858777] focus:outline-none focus:ring-2 focus:ring-[#71865B]/30 focus:border-[#71865B] transition-all shadow-xs"
          />
          <SearchIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#858777]" />
        </div>
      </form>

      <div className="w-full h-px bg-[#DCDCCB]/70" />

      {/* Categories Section */}
      <div className="flex flex-col w-full gap-3">
        <div 
          className="flex justify-between items-center cursor-pointer group"
          onClick={() => toggleSection("categories")}
        >
          <h3 className="font-poppins font-semibold text-[11px] uppercase tracking-[0.16em] text-[#62695A] group-hover:text-[#203C2B] transition-colors">
            Categories
          </h3>
          {openSections.categories ? <ChevronUp size={16} className="text-[#62695A]" /> : <ChevronDown size={16} className="text-[#62695A]" />}
        </div>
        
        {openSections.categories && (
          <div className="flex flex-col w-full gap-2 pt-1">
            {categories.map((cat: any) => (
              <Link 
                key={cat.id} 
                href={`/categories/${cat.slug}`} 
                className="flex justify-between items-center py-1.5 px-2.5 rounded-lg hover:bg-white/70 transition-all group"
              >
                <span className="font-poppins text-xs text-[#203C2B]/85 group-hover:text-[#203C2B] group-hover:translate-x-0.5 transition-all">
                  {cat.name}
                </span>
                <ChevronDown size={13} className="text-[#858777] -rotate-90 group-hover:text-[#203C2B] group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="w-full h-px bg-[#DCDCCB]/70" />

      {/* Price Section */}
      <div className="flex flex-col w-full gap-3">
        <div 
          className="flex justify-between items-center cursor-pointer group"
          onClick={() => toggleSection("price")}
        >
          <h3 className="font-poppins font-semibold text-[11px] uppercase tracking-[0.16em] text-[#62695A] group-hover:text-[#203C2B] transition-colors">
            Price Range
          </h3>
          {openSections.price ? <ChevronUp size={16} className="text-[#62695A]" /> : <ChevronDown size={16} className="text-[#62695A]" />}
        </div>
        
        {openSections.price && (
          <div className="flex flex-col gap-4 w-full px-1 pt-1">
            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-5 mt-1"
              value={priceRange}
              max={25000}
              step={500}
              onValueChange={setPriceRange}
              onValueCommit={commitPriceRange}
            >
              <Slider.Track className="bg-[#DCDCCB] relative grow rounded-full h-[5px]">
                <Slider.Range className="absolute bg-[#203C2B] rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb
                className="block w-4 h-4 bg-[#203C2B] shadow-sm rounded-full ring-2 ring-white hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#71865B] cursor-grab active:cursor-grabbing transition-transform"
                aria-label="Min Price"
              />
              <Slider.Thumb
                className="block w-4 h-4 bg-[#203C2B] shadow-sm rounded-full ring-2 ring-white hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#71865B] cursor-grab active:cursor-grabbing transition-transform"
                aria-label="Max Price"
              />
            </Slider.Root>
            <div className="flex justify-between items-center w-full">
              <span className="font-poppins font-medium text-[11px] text-[#203C2B] bg-white/90 px-2.5 py-1 rounded-full border border-[#DCDCCB]/70 shadow-2xs">
                Rs. {priceRange[0].toLocaleString()}
              </span>
              <span className="font-poppins font-medium text-[11px] text-[#203C2B] bg-white/90 px-2.5 py-1 rounded-full border border-[#DCDCCB]/70 shadow-2xs">
                Rs. {priceRange[1].toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="w-full h-px bg-[#DCDCCB]/70" />

      {/* Colors Section */}
      <div className="flex flex-col w-full gap-3">
        <div 
          className="flex justify-between items-center cursor-pointer group"
          onClick={() => toggleSection("colors")}
        >
          <h3 className="font-poppins font-semibold text-[11px] uppercase tracking-[0.16em] text-[#62695A] group-hover:text-[#203C2B] transition-colors">
            Color Palette
          </h3>
          {openSections.colors ? <ChevronUp size={16} className="text-[#62695A]" /> : <ChevronDown size={16} className="text-[#62695A]" />}
        </div>
        
        {openSections.colors && (
          <div className="flex flex-wrap gap-2.5 w-full pt-1">
            {colors.map((color) => (
              <button
                key={color.id}
                onClick={() => updateParam("color", color.id)}
                className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer shadow-2xs ${
                  color.border ? "border border-[#DCDCCB]" : ""
                } ${selectedColor === color.id ? "ring-2 ring-offset-2 ring-[#203C2B]" : "hover:ring-1 hover:ring-[#71865B]/60"}`}
                style={{ backgroundColor: color.hex }}
                title={color.id}
              >
                {selectedColor === color.id && (
                  <Check size={14} className={color.id === "white" ? "text-[#203C2B]" : "text-white"} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-full h-px bg-[#DCDCCB]/70" />

      {/* Size Section */}
      <div className="flex flex-col w-full gap-3">
        <div 
          className="flex justify-between items-center cursor-pointer group"
          onClick={() => toggleSection("size")}
        >
          <h3 className="font-poppins font-semibold text-[11px] uppercase tracking-[0.16em] text-[#62695A] group-hover:text-[#203C2B] transition-colors">
            Available Sizes
          </h3>
          {openSections.size ? <ChevronUp size={16} className="text-[#62695A]" /> : <ChevronDown size={16} className="text-[#62695A]" />}
        </div>
        
        {openSections.size && (
          <div className="flex flex-wrap gap-2 w-full pt-1">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => updateParam("size", size)}
                className={`flex justify-center items-center px-3.5 py-1.5 rounded-full text-xs font-poppins transition-all duration-200 cursor-pointer ${
                  selectedSize === size
                    ? "bg-[#203C2B] text-[#FFFCF4] shadow-sm font-semibold"
                    : "bg-white/80 border border-[#DCDCCB] text-[#62695A] hover:border-[#203C2B] hover:text-[#203C2B]"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Reset Action */}
      <div className="mt-auto pt-6 pb-2 w-full">
        <button 
          onClick={() => router.push(pathname)}
          disabled={!hasActiveFilters}
          className="w-full py-2.5 bg-[#203C2B] text-[#FFFCF4] font-poppins font-medium text-xs tracking-wider uppercase rounded-full hover:bg-[#2d523c] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-1.5"
        >
          <RotateCcw size={12} /> Clear Filters
        </button>
      </div>
    </aside>
  );
}
