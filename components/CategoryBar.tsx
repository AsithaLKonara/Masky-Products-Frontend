"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCategories } from "@/hooks/useCategories";

import { Category } from "@/types/category";

export default function CategoryBar() {
  const pathname = usePathname();
  const { data: response } = useCategories();
  const categories = response?.data || [];

  return (
    <div className="w-full bg-stone-500 hidden md:block">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-center gap-8 overflow-x-auto custom-scrollbar py-3">
          <Link 
            href="/shop" 
            className={`text-sm transition-colors whitespace-nowrap ${
              pathname === "/shop" 
                ? "text-stone-50 font-bold underline underline-offset-4" 
                : "font-medium text-stone-200 hover:text-stone-50"
            }`}
          >
            All
          </Link>
          {categories.map((cat: Category) => {
            const isActive = pathname === `/categories/${cat.slug}`;
            return (
              <Link 
                key={cat.id} 
                href={`/categories/${cat.slug}`} 
                className={`text-sm transition-colors whitespace-nowrap ${
                  isActive 
                    ? "text-stone-50 font-bold underline underline-offset-4" 
                    : "font-medium text-stone-200 hover:text-stone-50"
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
