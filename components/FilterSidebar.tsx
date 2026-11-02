"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, SlidersHorizontal, Check, Filter } from "lucide-react";
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
    price: true,
    colors: true,
    size: true,
    style: true,
  });

  const selectedColor = searchParams.get("color") || "";
  const selectedSize = searchParams.get("size") || "";
  
  const minPriceParam = searchParams.get("minPrice");
  const maxPriceParam = searchParams.get("maxPrice");
  
  const [priceRange, setPriceRange] = useState([
    minPriceParam ? parseInt(minPriceParam) : 0, 
    maxPriceParam ? parseInt(maxPriceParam) : 10000
  ]);

  useEffect(() => {
    setPriceRange([
      minPriceParam ? parseInt(minPriceParam) : 0, 
      maxPriceParam ? parseInt(maxPriceParam) : 10000
    ]);
  }, [minPriceParam, maxPriceParam]);

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
    // Reset to page 1 on filter change
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


  const { data: response, isLoading } = useCategories();
  const categories = response?.data || [];
  
  const { data: filters } = useProductFilters();
  
  const styles = ["Casual", "Formal", "Party", "Gym"];
  
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
  
  // Use dynamic colors if available, mapping strings to basic objects
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
    .slice(0, 12) as { id: string; hex: string; border: boolean }[];

  const allowedSizes = ["S", "M", "L", "UK 08", "UK 10", "UK 12"];
  const sizes = allowedSizes.filter(size => filters?.sizes?.includes(size)) || [];

  if (!isOpen) {
    return (
      <div className="flex flex-col items-center w-full h-full bg-[#FAFAF9] border-r border-stone-200 py-[20px] shadow-sm">
        <button 
          onClick={onToggle}
          className="p-3 rounded-full hover:bg-stone-200 transition-colors"
          title="Show Filters"
        >
          <SlidersHorizontal size={20} className="text-[#1C1917]" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-[#FAFAF9] border-r border-stone-200 py-[20px] px-[20px] md:pl-[40px] md:pr-[20px] gap-[24px] overflow-y-auto no-scrollbar shadow-sm">
      
      {/* Header */}
      <div className="flex justify-between items-center w-full">
        <h2 className="font-poppins font-bold text-xl text-primary flex items-center gap-2">
          <Filter size={20} /> Filters
        </h2>
        <div className="flex items-center gap-2">
          {(selectedColor || selectedSize || minPriceParam || maxPriceParam) && (
            <button 
              onClick={() => router.push(pathname)}
              className="font-poppins text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors underline underline-offset-2"
            >
              Clear All
            </button>
          )}
          <button 
            onClick={onToggle}
            className="p-2 -mr-2 rounded-full hover:bg-stone-200 transition-colors"
            title="Hide Filters"
          >
            <SlidersHorizontal size={20} className="text-[#1C1917]" />
          </button>
        </div>
      </div>

      <div className="w-full h-[1px] bg-[#44403B]/20" />

      {/* Search */}
      <div className="flex flex-col w-full gap-[12px]">
        <h3 className="font-poppins font-bold text-xl text-primary">Search</h3>
        <div className="relative w-full">
          <input 
            type="text" 
            placeholder="Search products..." 
            className="w-full h-[40px] px-[16px] bg-[#E7E5E4] rounded-full font-urbanist font-light text-sm text-primary placeholder:text-[#44403B] focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="w-full h-[1px] bg-[#44403B]/20" />

      {/* Categories */}
      <div className="flex flex-col w-full gap-[20px]">
        {categories.map((cat: any) => (
          <Link key={cat.id} href={`/categories/${cat.slug}`} className="flex justify-between items-center cursor-pointer group">
            <span className="font-poppins text-base text-[#44403B] group-hover:text-primary transition-colors">{cat.name}</span>
            <ChevronDown size={16} className="text-[#44403B] -rotate-90 group-hover:text-primary transition-transform" />
          </Link>
        ))}
      </div>

      <div className="w-full h-[1px] bg-[#44403B]/20" />

      {/* Price */}
      <div className="flex flex-col w-full gap-[20px]">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection("price")}
        >
          <h3 className="font-poppins font-bold text-xl text-primary">Price</h3>
          {openSections.price ? <ChevronUp size={20} className="text-primary" /> : <ChevronDown size={20} className="text-primary" />}
        </div>
        
        {openSections.price && (
          <div className="flex flex-col gap-[16px] w-full px-2">
            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-5 mt-2"
              value={priceRange}
              max={15000}
              step={500}
              onValueChange={setPriceRange}
              onValueCommit={commitPriceRange}
            >
              <Slider.Track className="bg-[#44403B] relative grow rounded-full h-[6px]">
                <Slider.Range className="absolute bg-primary rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb
                className="block w-5 h-5 bg-primary shadow-md rounded-full hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-black cursor-grab active:cursor-grabbing"
                aria-label="Min Price"
              />
              <Slider.Thumb
                className="block w-5 h-5 bg-primary shadow-md rounded-full hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-black cursor-grab active:cursor-grabbing"
                aria-label="Max Price"
              />
            </Slider.Root>
            <div className="flex justify-between items-center w-full mt-2">
              <span className="font-poppins font-medium text-sm text-primary">Rs. {priceRange[0]}</span>
              <span className="font-poppins font-medium text-sm text-primary">Rs. {priceRange[1]}</span>
            </div>
          </div>
        )}
      </div>

      <div className="w-full h-[1px] bg-[#44403B]/20" />

      {/* Colors */}
      <div className="flex flex-col w-full gap-[20px]">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection("colors")}
        >
          <h3 className="font-poppins font-bold text-xl text-primary">Colors</h3>
          {openSections.colors ? <ChevronUp size={20} className="text-primary" /> : <ChevronDown size={20} className="text-primary" />}
        </div>
        
        {openSections.colors && (
          <div className="flex flex-wrap gap-[16px] w-full">
            {colors.map((color) => (
              <button
                key={color.id}
                onClick={() => updateParam("color", color.id)}
                className={`relative w-[37px] h-[37px] rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                  color.border ? "border border-[#79716B]" : ""
                } ${selectedColor === color.id ? "ring-2 ring-offset-2 ring-[#79716B]" : ""}`}
                style={{ backgroundColor: color.hex }}
              >
                {selectedColor === color.id && (
                  <Check size={16} className={color.id === "white" ? "text-black" : "text-white"} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-full h-[1px] bg-[#44403B]/20" />

      {/* Size */}
      <div className="flex flex-col w-full gap-[20px]">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection("size")}
        >
          <h3 className="font-poppins font-bold text-xl text-primary">Size</h3>
          {openSections.size ? <ChevronUp size={20} className="text-primary" /> : <ChevronDown size={20} className="text-primary" />}
        </div>
        
        {openSections.size && (
          <div className="flex flex-wrap gap-[8px] w-full">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => updateParam("size", size)}
                className={`flex justify-center items-center px-[20px] py-[10px] rounded-[62px] transition-colors ${
                  selectedSize === size
                    ? "bg-primary text-background"
                    : "bg-[#D6D3D1] text-[#44403B] hover:bg-[#c9c5c3]"
                }`}
              >
                <span className={`font-poppins text-sm ${selectedSize === size ? "font-medium" : "font-normal"}`}>
                  {size}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-full h-[1px] bg-[#44403B]/20" />

      {/* Dress Style */}
      <div className="flex flex-col w-full gap-[20px]">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection("style")}
        >
          <h3 className="font-poppins font-bold text-xl text-primary">Dress Style</h3>
          {openSections.style ? <ChevronUp size={20} className="text-primary" /> : <ChevronDown size={20} className="text-primary" />}
        </div>
        
        {openSections.style && (
          <div className="flex flex-col w-full gap-[20px]">
            {styles.map((style) => (
              <div key={style} className="flex justify-between items-center cursor-pointer group">
                <span className="font-poppins text-base text-[#44403B] group-hover:text-primary transition-colors">{style}</span>
                <ChevronDown size={16} className="text-[#44403B] -rotate-90 group-hover:text-primary transition-transform" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Apply Filter Button - Removed for instant filtering */}
      <div className="mt-auto pt-6 pb-2 w-full">
        <button 
          onClick={() => router.push(pathname)}
          disabled={!selectedColor && !selectedSize && !minPriceParam && !maxPriceParam}
          className="w-full py-3 bg-stone-900 text-white font-poppins font-medium text-sm rounded-full hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
