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
    <section className="flex flex-col items-center bg-background px-4 md:px-8 lg:px-[120px] py-10 md:py-[60px] w-full">
      
      {/* Header Container */}
      <div className="flex flex-col items-center justify-center w-full max-w-[1038px] mb-8">
        <h2 className="font-signature font-normal text-3xl md:text-4xl leading-tight md:leading-[45px] text-center text-primary">
          New Arrivals
        </h2>
        <p className="font-inria italic font-normal text-base md:text-xl leading-snug md:leading-[24px] text-center text-primary mt-2">
          Timeless silhouettes. Refined details. Effortless confidence.
        </p>
      </div>

      {/* Explore More Link */}
      <div className="flex justify-end items-center w-full max-w-[1038px]">
        <Link 
          href="/shop" 
          className="flex items-center justify-center gap-[10px] pb-1 border-b border-primary"
        >
          <span className="font-signature font-normal text-sm md:text-base leading-[22px] text-primary">
            Explore more
          </span>
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
