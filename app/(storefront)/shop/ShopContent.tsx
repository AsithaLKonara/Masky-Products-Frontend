"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import FilterSidebar from "@/components/FilterSidebar";
import ProductCard from "@/components/ProductCard";
import CategoryBar from "@/components/CategoryBar";
import { SlidersHorizontal, ChevronLeft, ChevronRight, Sparkles, PackageSearch, X, RotateCcw } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { Product } from "@/types/product";
import { PaginatedResponse } from "@/types/api";

export default function ShopContent({ initialData }: { initialData?: PaginatedResponse<Product> }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  const searchParams = useSearchParams();
  const search = searchParams.get("search") || undefined;
  const color = searchParams.get("color") || undefined;
  const size = searchParams.get("size") || undefined;
  const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;

  // Pagination logic
  const skip = (currentPage - 1) * itemsPerPage;
  const filters = { skip, take: itemsPerPage, search, color, size, minPrice, maxPrice };
  const hasFilters = Boolean(search || color || size || minPrice !== undefined || maxPrice !== undefined);
  
  const { data: response, isLoading } = useProducts(filters, (skip === 0 && !hasFilters) ? initialData : undefined);
  
  const products = response?.data || [];
  const totalItems = response?.meta?.total || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const endIndex = Math.min(skip + itemsPerPage, totalItems);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const clearFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <main className="relative flex flex-col w-full min-h-screen bg-transparent pt-[76px]">
      <h1 className="sr-only">Shop All Products - MASKY PRODUCT</h1>
      
      {/* Category Pills Bar */}
      <CategoryBar />

      {/* Editorial Page Banner matching Landing Page */}
      <section className="w-full border-b border-[#DCDCCB]/70 bg-gradient-to-b from-[#F8F5EB]/60 to-[#F2EEDF]/40 py-8 md:py-12 px-4 sm:px-6 lg:px-12 xl:px-[100px]">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex flex-col gap-2 max-w-2xl">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-poppins text-[#62695A] tracking-wider uppercase mb-1">
              <Link href="/" className="hover:text-[#203C2B] transition-colors">Home</Link>
              <span>/</span>
              <span className="text-[#203C2B] font-semibold">The Shop</span>
            </nav>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#71865B]/15 border border-[#71865B]/30 w-fit text-[#203C2B]">
              <Sparkles size={12} className="text-[#71865B]" />
              <span className="font-poppins text-[10px] font-semibold tracking-[0.18em] uppercase">
                Gourmet Mushroom Collection
              </span>
            </div>

            <h2 className="font-signature font-bold text-3xl sm:text-4xl md:text-5xl text-[#203C2B] tracking-tight">
              All Creations
            </h2>
            <p className="font-poppins text-xs sm:text-sm text-[#62695A] leading-relaxed max-w-xl">
              Artisan-harvested mushrooms, gently low-temperature dehydrated to lock in intense earthy umami, vital nutrients, and culinary perfection.
            </p>
          </div>

          {/* Right: Count Badge & Mobile Filter Toggle */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="px-4 py-2 rounded-full bg-white/80 border border-[#DCDCCB] backdrop-blur-md shadow-2xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#71865B] animate-pulse" />
              <span className="font-poppins text-xs text-[#203C2B] font-medium">
                {totalItems} {totalItems === 1 ? 'Piece' : 'Pieces'} Available
              </span>
            </div>

            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-full bg-[#203C2B] text-[#FFFCF4] font-poppins text-xs tracking-wider uppercase font-medium shadow-sm hover:bg-[#2d523c] transition-all cursor-pointer"
            >
              <SlidersHorizontal size={14} />
              <span>Filters</span>
              {hasFilters && (
                <span className="w-2 h-2 rounded-full bg-[#D9C99B]" />
              )}
            </button>
          </div>
        </div>

        {/* Active Filter Tags Bar */}
        {hasFilters && (
          <div className="max-w-[1440px] mx-auto mt-6 pt-4 border-t border-[#DCDCCB]/50 flex flex-wrap items-center gap-2">
            <span className="font-poppins text-[11px] uppercase tracking-wider text-[#62695A] mr-1">
              Active Filters:
            </span>

            {search && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-[#DCDCCB] text-[#203C2B] text-xs font-poppins">
                Search: &quot;{search}&quot;
                <button onClick={() => clearFilter('search')} className="hover:text-red-500 cursor-pointer">
                  <X size={12} />
                </button>
              </span>
            )}

            {color && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-[#DCDCCB] text-[#203C2B] text-xs font-poppins">
                Color: {color}
                <button onClick={() => clearFilter('color')} className="hover:text-red-500 cursor-pointer">
                  <X size={12} />
                </button>
              </span>
            )}

            {size && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-[#DCDCCB] text-[#203C2B] text-xs font-poppins">
                Size: {size}
                <button onClick={() => clearFilter('size')} className="hover:text-red-500 cursor-pointer">
                  <X size={12} />
                </button>
              </span>
            )}

            {(minPrice !== undefined || maxPrice !== undefined) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-[#DCDCCB] text-[#203C2B] text-xs font-poppins">
                Price: Rs. {minPrice ?? 0} – Rs. {maxPrice ?? 'Max'}
                <button onClick={() => {
                  const p = new URLSearchParams(searchParams.toString());
                  p.delete('minPrice');
                  p.delete('maxPrice');
                  router.push(`${pathname}?${p.toString()}`);
                }} className="hover:text-red-500 cursor-pointer">
                  <X size={12} />
                </button>
              </span>
            )}

            <button
              onClick={() => router.push(pathname)}
              className="text-xs font-poppins text-[#71865B] hover:text-[#203C2B] underline underline-offset-4 ml-2 transition-colors cursor-pointer"
            >
              Clear All
            </button>
          </div>
        )}
      </section>

      {/* Main Catalog Section */}
      <div className="flex flex-col lg:flex-row w-full min-h-screen relative max-w-[1600px] mx-auto">
        
        {/* Mobile Filter Overlay & Drawer */}
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
          
          {/* Status Row */}
          <div className="w-full flex justify-between items-center mb-6">
            <span className="font-poppins text-xs text-[#62695A] tracking-wider uppercase">
              Showing {totalItems > 0 ? skip + 1 : 0}–{endIndex} of {totalItems} pieces
            </span>
          </div>

          {/* Grid or Empty State */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full">
              {Array.from({ length: itemsPerPage }).map((_, i) => (
                <div key={i} className="flex justify-center w-full">
                  <div className="w-full max-w-[250px] aspect-[221/340] bg-white/40 border border-[#DCDCCB]/60 animate-pulse rounded-2xl shadow-xs" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="w-full py-16 px-4 flex flex-col items-center justify-center text-center rounded-3xl bg-white/60 backdrop-blur-md border border-[#DCDCCB]/80 shadow-sm my-6">
              <div className="w-16 h-16 rounded-full bg-[#71865B]/15 text-[#203C2B] flex items-center justify-center mb-4">
                <PackageSearch size={28} />
              </div>
              <h3 className="font-signature font-bold text-2xl text-[#203C2B] mb-2">
                No matching harvests found
              </h3>
              <p className="font-poppins text-xs sm:text-sm text-[#62695A] max-w-md mb-6">
                We couldn&apos;t find any mushroom products matching your selected filters. Try broadening your criteria or reset filters to view our full collection.
              </p>
              <button
                onClick={() => router.push(pathname)}
                className="px-6 py-2.5 rounded-full bg-[#203C2B] text-[#FFFCF4] font-poppins text-xs tracking-wider uppercase font-medium hover:bg-[#2d523c] transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw size={14} /> Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full">
              {products.map((product: Product) => (
                <div key={product.id} className="flex justify-center w-full animate-in fade-in zoom-in-95 duration-300">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-row justify-center items-center w-full mt-12 mb-8 gap-2">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
                className="flex justify-center items-center w-10 h-10 rounded-full border border-[#DCDCCB] bg-white/80 text-[#203C2B] hover:bg-[#203C2B] hover:text-[#FFFCF4] disabled:opacity-30 disabled:pointer-events-none transition-all duration-200 shadow-2xs cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
              
              {getPageNumbers().map((page, index) => (
                <button 
                  key={index}
                  onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
                  disabled={typeof page !== 'number'}
                  className={`flex justify-center items-center w-10 h-10 rounded-full font-poppins text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    currentPage === page 
                      ? "bg-[#203C2B] text-[#FFFCF4] shadow-sm" 
                      : typeof page === 'number' 
                        ? "bg-white/80 border border-[#DCDCCB] text-[#203C2B] hover:bg-white hover:border-[#203C2B]" 
                        : "text-[#858777] cursor-default"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
                className="flex justify-center items-center w-10 h-10 rounded-full border border-[#DCDCCB] bg-white/80 text-[#203C2B] hover:bg-[#203C2B] hover:text-[#FFFCF4] disabled:opacity-30 disabled:pointer-events-none transition-all duration-200 shadow-2xs cursor-pointer"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

        </div>

      </div>
    </main>
  );
}
