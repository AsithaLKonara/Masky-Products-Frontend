"use client";

import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import ProductCard from "./ProductCard";
import { useProducts } from "@/hooks/useProducts";

import { PaginatedResponse } from "@/types/api";
import { Product } from "@/types/product";

export default function OfferCollectionSection({ initialData }: { initialData?: PaginatedResponse<Product> }) {
  const [emblaRef] = useEmblaCarousel(
    { loop: true, align: "start", dragFree: true },
    [Autoplay({ delay: 3000, stopOnInteraction: true })]
  );

  const { data: response, isLoading } = useProducts({ skip: 0, take: 8 }, initialData);
  const products = response?.data || [];

  return (
    <section className="flex flex-col items-center bg-transparent px-4 md:px-8 lg:px-[120px] py-12 md:py-20 w-full">
      
      {/* Header Container */}
      <div className="flex flex-col items-center justify-center w-full max-w-[1038px] mb-8 text-center">
        <span className="font-poppins uppercase tracking-[0.22em] text-[10px] font-medium text-[#71865B] mb-2">
          CURATED ARCHIVE EDITIONS
        </span>
        <h2 className="font-inria font-normal text-3xl md:text-5xl text-[#203C2B] tracking-tight">
          Offer Collection
        </h2>
        <p className="font-inria italic font-light text-base md:text-xl text-[#71865B] mt-1.5">
          Exceptional formulations with special limited release privileges.
        </p>
      </div>

      {/* Explore More Link */}
      <div className="flex justify-end items-center w-full max-w-[1040px] mb-6">
        <Link 
          href="/sale" 
          className="group flex items-center gap-2 pb-1 border-b border-[#203C2B]/30 hover:border-[#203C2B] transition-all"
        >
          <span className="font-poppins font-medium text-xs md:text-sm tracking-wider uppercase text-[#203C2B]">
            Explore archive
          </span>
          <span className="transition-transform duration-300 group-hover:translate-x-1 text-[#203C2B]">→</span>
        </Link>
      </div>

      {/* Product Carousel */}
      <div className="w-full max-w-[1040px] overflow-hidden" ref={products.length > 4 || isLoading ? emblaRef : undefined}>
        <div className={`flex ${products.length > 4 || isLoading ? '-ml-[20px]' : 'justify-center flex-wrap gap-5'}`}>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-[0_0_265px] min-w-[265px] pl-[20px]">
                <div className="w-full h-[380px] bg-stone-100 animate-pulse rounded-lg"></div>
              </div>
            ))
          ) : products.map((product: Product) => (
            <div key={product.id} className={products.length > 4 ? "flex-[0_0_265px] min-w-[265px] pl-[20px]" : "flex justify-center w-full max-w-[245px]"}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
      
    </section>
  );
}
