"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import FilterSidebar from "@/components/FilterSidebar";
import ProductCard from "@/components/ProductCard";
import CategoryBar from "@/components/CategoryBar";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useProducts } from "@/hooks/useProducts";
import { Product } from "@/types/product";
import { PaginatedResponse } from "@/types/api";
import { Sparkles, SlidersHorizontal, PackageSearch } from "lucide-react";
import Link from "next/link";

export default function CategoryPageClient({ initialData }: { initialData?: PaginatedResponse<Product> }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const params = useParams();
  const slug = params.slug as string;
  const [skip, setSkip] = useState(0);
  const take = 12;

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);
  
  // Format slug to readable name: "womens-tops" -> "Womens Tops"
  const categoryName = slug ? slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Category';

  const { data: response, isLoading } = useProducts({ skip, take, category: slug }, skip === 0 ? initialData : undefined);
  const products = response?.data || [];
  const total = response?.meta?.total || 0;

  const handleLoadMore = () => {
    setSkip(prev => prev + take);
  };

  return (
    <main className="relative flex flex-col w-full min-h-screen bg-[#FEF6E4] pt-[84px]">
      
      {/* Sub Navbar */}
      <CategoryBar />

      {/* Editorial Category Header */}
      <section className="w-full bg-gradient-to-b from-[#FFFDF7] via-[#FEF6E4] to-[#F5ECE0] border-b border-[#DCDCCB]/70 py-12 md:py-16 px-4 sm:px-6 lg:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div className="flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#71865B]/15 border border-[#71865B]/30 text-[#203C2B] w-fit">
              <Sparkles size={12} className="text-[#71865B]" />
              <span className="font-poppins text-[10px] font-semibold tracking-[0.18em] uppercase">
                Curated Category
              </span>
            </div>

            <h1 className="font-signature font-bold text-3xl sm:text-4xl md:text-5xl text-[#203C2B] tracking-tight">
              {categoryName}
            </h1>
            <p className="font-poppins text-xs sm:text-sm text-[#62695A] leading-relaxed max-w-xl">
              Artisan sun-dried umami, farm-fresh harvest, and chef-grade delicacies in {categoryName}.
            </p>
          </div>

          <div className="flex items-center gap-3 justify-between md:justify-end">
            <div className="px-4 py-2 rounded-full bg-white/80 border border-[#DCDCCB] backdrop-blur-md shadow-2xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#71865B] animate-pulse" />
              <span className="font-poppins text-xs text-[#203C2B] font-medium">
                {total} {total === 1 ? 'Piece' : 'Pieces'}
              </span>
            </div>

            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-full bg-[#203C2B] text-[#FFFCF4] font-poppins text-xs tracking-wider uppercase font-medium shadow-sm hover:bg-[#2d523c] transition-all cursor-pointer"
            >
              <SlidersHorizontal size={14} />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </section>

      {/* Tool Bar & Breadcrumbs */}
      <div className="w-full bg-[#FFFCF4]/60 border-b border-[#DCDCCB]/60 backdrop-blur-xs">
        <div className="flex flex-row justify-between items-center w-full max-w-7xl mx-auto h-12 px-4 sm:px-6 lg:px-12">
          <Breadcrumbs items={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
            { label: categoryName }
          ]} />
          
          <span className="font-poppins text-xs text-[#62695A] tracking-wider uppercase">
            Showing {products.length > 0 ? skip + 1 : 0}–{Math.min(skip + take, total)} of {total}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row w-full max-w-[1600px] mx-auto min-h-screen relative">
        
        {/* Mobile Filter Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar Container */}
        <div 
          className={`transition-all duration-300 ease-in-out shrink-0 fixed inset-y-0 left-0 z-50 lg:relative lg:inset-auto lg:z-10 h-full lg:h-auto ${
            isSidebarOpen 
              ? "w-[300px] sm:w-[340px] translate-x-0" 
              : "w-[300px] sm:w-[340px] -translate-x-full lg:w-[72px] lg:translate-x-0"
          }`}
        >
          <FilterSidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        </div>

        {/* Product Grid Area */}
        <div className="flex-1 flex flex-col items-center lg:items-start py-8 md:py-10 px-4 sm:px-6 md:px-8 lg:px-12 w-full overflow-hidden">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex justify-center w-full">
                  <div className="w-full max-w-[250px] aspect-[221/340] bg-white/40 border border-[#DCDCCB]/60 animate-pulse rounded-2xl shadow-xs" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 w-full text-center">
              <div className="w-16 h-16 rounded-full bg-white/80 border border-[#DCDCCB] flex items-center justify-center text-[#71865B] mb-4 shadow-xs">
                <PackageSearch size={28} />
              </div>
              <h3 className="font-signature font-bold text-2xl text-[#203C2B] mb-2">
                No Harvests Found
              </h3>
              <p className="font-poppins text-xs sm:text-sm text-[#62695A] max-w-sm mb-6">
                There are currently no items available in this category. Explore our full catalog to find other organic mushroom harvests.
              </p>
              <Link 
                href="/shop" 
                className="px-6 py-2.5 rounded-full bg-[#203C2B] text-[#FFFCF4] font-poppins text-xs uppercase tracking-widest hover:bg-[#2d523c] transition-all shadow-sm"
              >
                Browse All Harvests
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full">
              {products.map((product: Product) => (
                <div key={product.id} className="flex justify-center w-full animate-in fade-in duration-300">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}

          {skip + take < total && (
            <div className="flex justify-center w-full mt-12 mb-8">
              <button 
                onClick={handleLoadMore} 
                className="h-12 px-10 flex justify-center items-center bg-[#203C2B] hover:bg-[#2d523c] text-[#FFFCF4] transition-all rounded-full font-poppins font-semibold text-xs uppercase tracking-widest shadow-sm cursor-pointer"
              >
                Load More Harvests
              </button>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
