"use client";
import Link from "next/link";
import CategoryCard from "./CategoryCard";
import { useCategories } from "@/hooks/useCategories";

import { PaginatedResponse } from "@/types/api";
import { Category } from "@/types/category";

export default function CollectionsSection({ initialData }: { initialData?: PaginatedResponse<Category> }) {
  const { data: response } = useCategories();
  const categories = response?.data || initialData?.data || [];
  
  // Use a mix of aesthetic placeholder images for categories
  const placeholderImages = [
    "/hero-image/hero-1.jpeg",
    "/hero-image/hero-2.jpeg",
    "/hero-image/hero-3.jpeg",
  ];

  return (
    <section className="relative w-full h-auto px-4 md:px-8 lg:px-[120px] py-10 md:py-[60px] bg-background">
      <div className="relative z-10 w-full h-full flex flex-col max-w-[1280px] mx-auto">
      
      {/* Header Area */}
      <div className="flex flex-col items-center text-center mb-6 w-full">
        <span className="text-sm md:text-base font-poppins text-stone-500 block mb-2 uppercase tracking-widest">
          Shop by Category
        </span>
        <h2 className="text-3xl md:text-4xl font-signature text-stone-900 tracking-wide mb-2">
          Collections
        </h2>
        <p className="text-sm md:text-base font-inria text-stone-600 italic">
          Pieces edited for quiet luxury — cut clean, worn easy.
        </p>
      </div>

      {/* Explore More */}
      <div className="flex justify-end w-full mb-6">
        <Link 
          href="/shop" 
          className="text-sm md:text-base font-signature text-stone-900 hover:text-stone-500 transition-colors tracking-wider border-b border-stone-900 pb-0.5"
        >
          Explore more
        </Link>
      </div>

      {/* Cards Row */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-[20px] w-full mt-4 md:mt-8">
          {categories.slice(0, 6).map((category: Category, idx: number) => {
            const imageUrl = category.imageUrl || placeholderImages[idx % placeholderImages.length];
            return (
              <div key={category.id} className="flex justify-center w-full max-w-[245px]">
                <CategoryCard
                  title={category.name}
                  imageUrl={imageUrl}
                  href={`/categories/${category.slug}`}
                  priority={idx < 6}
                />
              </div>
            );
          })}
        </div>
      
      </div>
    </section>
  );
}
