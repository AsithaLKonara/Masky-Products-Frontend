"use client";
import Link from "next/link";
import CategoryCard from "./CategoryCard";
import { useCategories } from "@/hooks/useCategories";

import { PaginatedResponse } from "@/types/api";
import { Category } from "@/types/category";
import { PLACEHOLDER_IMAGE } from "@/lib/placeholder";

const FALLBACK_CATEGORIES: Category[] = [
  { id: "cat-fresh", name: "Fresh mushrooms product", slug: "fresh-mushrooms-product", imageUrl: "/isolated-oyster-mushroom-cutout-on-white-background-free-png.webp" } as Category,
  { id: "cat-dehydrated", name: "Dehydrated product", slug: "dehydrated-product", imageUrl: "/hero-image/Product1.png" } as Category,
  { id: "cat-ready", name: "Redy to eat product", slug: "redy-to-eat-product", imageUrl: "/hero-image/Product2.png" } as Category,
  { id: "cat-frozen", name: "Frezon product", slug: "frezon-product", imageUrl: "/hero-image/Product3.png" } as Category,
];

export default function CollectionsSection({ initialData }: { initialData?: PaginatedResponse<Category> }) {
  const { data: response } = useCategories();
  const rawCategories = response?.data || initialData?.data || [];
  const categories = rawCategories.length > 0 ? rawCategories : FALLBACK_CATEGORIES;

  // Use blank white placeholder image for categories without custom cover
  const placeholderImages = [PLACEHOLDER_IMAGE];

  return (
    <section
      aria-label="Shop by Category Collections"
      className="relative w-full overflow-hidden px-4 md:px-8 lg:px-[120px] py-14 md:py-20 m-0"
      style={{
        background: "linear-gradient(180deg, #182C20 0%, #112017 100%)",
      }}
    >
      {/* Subtle organic green glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 15%, rgba(113,134,91,0.28) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 w-full h-full flex flex-col max-w-[1280px] mx-auto">

        {/* Header Area */}
        <div className="flex flex-col items-center text-center mb-8 w-full">
          <span className="font-poppins uppercase tracking-[0.24em] text-[10px] font-medium text-[#A8B995] mb-2">
            GOURMET CATALOG
          </span>
          <h2 className="font-inria font-normal text-3xl md:text-5xl text-[#FFFCF4] tracking-tight mb-2">
            Product Categories
          </h2>
          <p className="font-inria italic font-light text-base md:text-xl text-[#DDE5CC]/80">
            Fresh harvest, artisanal sun-dried umami, ready-to-eat snacks, and frozen delicacies.
          </p>
        </div>

        {/* Explore More */}
        <div className="flex justify-end w-full mb-4">
          <Link
            href="/shop"
            className="group flex items-center gap-2 pb-1 border-b border-[#A8B995]/40 hover:border-[#FFFCF4] transition-all"
          >
            <span className="font-poppins font-medium text-xs md:text-sm tracking-wider uppercase text-[#FFFCF4]">
              Explore all collections
            </span>
            <span className="transition-transform duration-300 group-hover:translate-x-1 text-[#FFFCF4]">→</span>
          </Link>
        </div>

        {/* Single Row of Category Cards - Always 1 Line Responsively */}
        <div className="flex flex-nowrap items-stretch justify-start md:justify-between gap-2.5 sm:gap-3 md:gap-4 lg:gap-5 w-full mt-4 md:mt-8 overflow-x-auto md:overflow-x-visible no-scrollbar pb-2 md:pb-0">
          {categories.slice(0, 6).map((category: Category, idx: number) => {
            const imageUrl = category.imageUrl || placeholderImages[idx % placeholderImages.length];
            return (
              <div key={category.id} className="flex-shrink-0 w-[112px] sm:w-[130px] md:flex-1 md:w-auto min-w-0">
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
