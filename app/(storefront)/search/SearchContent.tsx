"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import FilterSidebar from "@/components/FilterSidebar";
import ProductCard from "@/components/ProductCard";
import CategoryBar from "@/components/CategoryBar";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Search, Sparkles, SlidersHorizontal, PackageSearch, X } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { Product } from "@/types/product";
import Link from "next/link";

const QUICK_SEARCH_TAGS = ["Silk", "Dresses", "Leather", "Belts", "Casual Shirts", "Trousers"];

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [skip, setSkip] = useState(0);
  const take = 12;

  useEffect(() => {
    setSearchInput(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  const { data: response, isLoading } = useProducts({ search: initialQuery, skip, take });
  const products = response?.data || [];
  const total = response?.meta?.total || 0;
  const hasResults = isLoading || total > 0;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const handleQuickTag = (tag: string) => {
    setSearchInput(tag);
    router.push(`/search?q=${encodeURIComponent(tag)}`);
  };

  const handleLoadMore = () => {
    setSkip(prev => prev + take);
  };

  return (
    <main className="relative flex flex-col w-full min-h-screen bg-[#FEF6E4] pt-[84px]">
      
      {/* Sub Navbar */}
      <CategoryBar />

      {/* Editorial Search Hero Header */}
      <section className="w-full bg-gradient-to-b from-[#FFFDF7] via-[#FEF6E4] to-[#F5ECE0] border-b border-[#DCDCCB]/70 py-12 md:py-16 px-4 sm:px-6 lg:px-12 relative overflow-hidden">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-5 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#71865B]/15 border border-[#71865B]/30 text-[#203C2B]">
            <Sparkles size={12} className="text-[#71865B]" />
            <span className="font-poppins text-[10px] font-semibold tracking-[0.18em] uppercase">
              Curated Discovery
            </span>
          </div>

          <h1 className="font-signature font-bold text-3xl sm:text-4xl md:text-5xl text-[#203C2B] tracking-tight">
            Search The Wardrobe
          </h1>

          {/* Luxury Search Input */}
          <form onSubmit={handleSearchSubmit} className="w-full max-w-xl relative mt-2">
            <div className="relative flex items-center">
              <Search size={18} className="absolute left-5 text-[#71865B] pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by silhouette, textile, or cut..."
                className="w-full h-13 pl-12 pr-12 rounded-full bg-white/90 border border-[#DCDCCB] text-[#203C2B] placeholder:text-[#8F9489] font-poppins text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#203C2B] focus:border-transparent transition-all"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="absolute right-4 p-1.5 rounded-full hover:bg-[#203C2B]/10 text-[#62695A] transition-colors"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </form>

          {/* Quick Filter Tag Pills */}
          <div className="flex items-center gap-2 flex-wrap justify-center pt-2">
            <span className="font-poppins text-xs text-[#62695A] uppercase tracking-wider font-semibold mr-1">
              Suggestions:
            </span>
            {QUICK_SEARCH_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => handleQuickTag(tag)}
                className={`px-3 py-1 rounded-full font-poppins text-xs border transition-all cursor-pointer ${
                  initialQuery.toLowerCase() === tag.toLowerCase()
                    ? "bg-[#203C2B] text-[#FFFCF4] border-[#203C2B] shadow-2xs"
                    : "bg-white/80 border-[#DCDCCB] text-[#203C2B] hover:border-[#71865B] hover:bg-white"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Results Badge */}
          {initialQuery && (
            <div className="mt-2 px-4 py-1.5 rounded-full bg-white/80 border border-[#DCDCCB] backdrop-blur-md shadow-2xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#71865B] animate-pulse" />
              <span className="font-poppins text-xs text-[#203C2B] font-medium">
                {isLoading ? "Searching pieces..." : `${total} ${total === 1 ? 'Piece' : 'Pieces'} found for "${initialQuery}"`}
              </span>
            </div>
          )}

        </div>
      </section>

      {/* Tool Bar & Breadcrumbs */}
      <div className="w-full bg-[#FFFCF4]/60 border-b border-[#DCDCCB]/60 backdrop-blur-xs">
        <div className="flex flex-row justify-between items-center w-full max-w-7xl mx-auto h-12 px-4 sm:px-6 lg:px-12">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
          
          <div className="flex items-center gap-4">
            {hasResults && !isLoading && (
              <span className="font-poppins text-xs text-[#62695A] tracking-wider uppercase">
                Showing {products.length > 0 ? skip + 1 : 0}–{Math.min(skip + take, total)} of {total}
              </span>
            )}
            {hasResults && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#203C2B] text-[#FFFCF4] font-poppins text-xs uppercase tracking-wider"
              >
                <SlidersHorizontal size={12} />
                <span>Filter</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row w-full max-w-[1600px] mx-auto min-h-screen relative">
        
        {/* Mobile Filter Overlay */}
        {hasResults && isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar Container */}
        {hasResults && (
          <div 
            className={`transition-all duration-300 ease-in-out shrink-0 fixed inset-y-0 left-0 z-50 lg:relative lg:inset-auto lg:z-10 h-full lg:h-auto ${
              isSidebarOpen 
                ? "w-[300px] sm:w-[340px] translate-x-0" 
                : "w-[300px] sm:w-[340px] -translate-x-full lg:w-[72px] lg:translate-x-0"
            }`}
          >
            <FilterSidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
          </div>
        )}

        {/* Product Grid Area or Empty State */}
        <div className={`flex-1 flex flex-col py-8 md:py-10 px-4 sm:px-6 md:px-8 lg:px-12 w-full overflow-hidden ${hasResults ? 'items-center lg:items-start' : 'items-center justify-center'}`}>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex justify-center w-full">
                  <div className="w-full max-w-[250px] aspect-[221/340] bg-white/40 border border-[#DCDCCB]/60 animate-pulse rounded-2xl shadow-xs" />
                </div>
              ))}
            </div>
          ) : !hasResults || products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 w-full text-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-white/80 border border-[#DCDCCB] flex items-center justify-center text-[#71865B] mb-4 shadow-xs">
                <PackageSearch size={28} />
              </div>
              <h3 className="font-signature font-bold text-2xl text-[#203C2B] mb-2">
                No Creations Found
              </h3>
              <p className="font-poppins text-xs sm:text-sm text-[#62695A] leading-relaxed mb-6">
                {initialQuery 
                  ? `We couldn't find any creations matching "${initialQuery}". Try adjusting your keywords or explore all wardrobe pieces.`
                  : "Enter a search term above or choose from our suggestions to discover handcrafted garments."
                }
              </p>
              <Link 
                href="/shop" 
                className="px-6 py-2.5 rounded-full bg-[#203C2B] text-[#FFFCF4] font-poppins text-xs uppercase tracking-widest hover:bg-[#2d523c] transition-all shadow-sm"
              >
                Browse All Creations
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

          {hasResults && skip + take < total && (
            <div className="flex justify-center w-full mt-12 mb-8">
              <button 
                onClick={handleLoadMore} 
                className="h-12 px-10 flex justify-center items-center bg-[#203C2B] hover:bg-[#2d523c] text-[#FFFCF4] transition-all rounded-full font-poppins font-semibold text-xs uppercase tracking-widest shadow-sm cursor-pointer"
              >
                Load More Pieces
              </button>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}

export default function SearchContent() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FEF6E4]">
        <div className="w-8 h-8 border-2 border-[#203C2B] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
