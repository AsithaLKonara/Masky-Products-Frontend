"use client";
import Link from "next/link";
import ProductCard from "./ProductCard";
import { useProducts } from "@/hooks/useProducts";

import { PaginatedResponse } from "@/types/api";
import { Product } from "@/types/product";

export default function NewArrivalsSection({ initialData }: { initialData?: PaginatedResponse<Product> }) {
  const { data: response, isLoading } = useProducts(undefined, initialData);
  const products = response?.data || [];

  return (
    <section className="flex flex-col items-center bg-transparent px-4 md:px-8 lg:px-[120px] py-12 md:py-20 w-full">
      
      {/* Header Container */}
      <div className="flex flex-col items-center justify-center w-full max-w-[1038px] mb-8 text-center">
        <span className="font-poppins uppercase tracking-[0.22em] text-[10px] font-medium text-[#71865B] mb-2">
          FRESH BOTANICAL HARVEST
        </span>
        <h2 className="font-inria font-normal text-3xl md:text-5xl text-[#203C2B] tracking-tight">
          New Arrivals
        </h2>
        <p className="font-inria italic font-light text-base md:text-xl text-[#71865B] mt-1.5">
          Timeless silhouettes. Refined details. Effortless confidence.
        </p>
      </div>

      {/* Explore More Link */}
      <div className="flex justify-end items-center w-full max-w-[1040px] mb-4">
        <Link 
          href="/shop" 
          className="group flex items-center gap-2 pb-1 border-b border-[#203C2B]/30 hover:border-[#203C2B] transition-all"
        >
          <span className="font-poppins font-medium text-xs md:text-sm tracking-wider uppercase text-[#203C2B]">
            Explore collection
          </span>
          <span className="transition-transform duration-300 group-hover:translate-x-1 text-[#203C2B]">→</span>
        </Link>
      </div>

      {/* Product Grid */}
      <div className="flex flex-wrap justify-center gap-3 md:gap-[20px] py-8 md:py-[60px] w-full max-w-[1040px]">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex justify-center w-full max-w-[245px]">
              <div className="w-full h-[380px] bg-stone-100 animate-pulse rounded-lg"></div>
            </div>
          ))
        ) : products.slice(0, 8).map((product: Product, idx: number) => (
          <div key={product.id} className="flex justify-center w-full max-w-[245px]">
            <ProductCard product={product} priority={idx < 4} />
          </div>
        ))}
      </div>
      
    </section>
  );
}
