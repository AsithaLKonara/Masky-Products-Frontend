"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCategories } from "@/hooks/useCategories";
import { Category } from "@/types/category";

const FALLBACK_CATEGORIES: Category[] = [
  { id: "cat-fresh", name: "Fresh mushrooms product", slug: "fresh-mushrooms-product" } as Category,
  { id: "cat-dehydrated", name: "Dehydrated product", slug: "dehydrated-product" } as Category,
  { id: "cat-ready", name: "Redy to eat product", slug: "redy-to-eat-product" } as Category,
  { id: "cat-frozen", name: "Frezon product", slug: "frezon-product" } as Category,
];

export default function CategoryBar() {
  const pathname = usePathname();
  const { data: response } = useCategories();
  const categories = response?.data && response.data.length > 0 ? response.data : FALLBACK_CATEGORIES;

  return (
    <nav aria-label="Category Navigation" className="w-full bg-[#F8F5EB]/90 backdrop-blur-md border-b border-[#DCDCCB]/70 sticky top-[76px] z-30 transition-colors">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto no-scrollbar py-2.5">
          <Link 
            href="/shop" 
            className={`px-4 py-1.5 rounded-full text-[11px] font-poppins tracking-[0.14em] uppercase transition-all duration-300 whitespace-nowrap cursor-pointer ${
              pathname === "/shop" 
                ? "bg-[#203C2B] text-[#FFFCF4] shadow-sm font-semibold" 
                : "text-[#203C2B]/75 hover:text-[#203C2B] hover:bg-white/80 hover:shadow-xs"
            }`}
          >
            All Products
          </Link>
          {categories.map((cat: Category) => {
            const isActive = pathname === `/categories/${cat.slug}`;
            return (
              <Link 
                key={cat.id} 
                href={`/categories/${cat.slug}`} 
                className={`px-4 py-1.5 rounded-full text-[11px] font-poppins tracking-[0.14em] uppercase transition-all duration-300 whitespace-nowrap cursor-pointer ${
                  isActive 
                    ? "bg-[#203C2B] text-[#FFFCF4] shadow-sm font-semibold" 
                    : "text-[#203C2B]/75 hover:text-[#203C2B] hover:bg-white/80 hover:shadow-xs"
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
