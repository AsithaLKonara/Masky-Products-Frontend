import React from "react";

export function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[#203C2B]/10 ${className}`}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col w-full max-w-[280px] bg-white/70 backdrop-blur-md rounded-2xl border border-[#DCDCCB] p-3.5 shadow-xs animate-pulse">
      <div className="w-full aspect-[4/5] rounded-xl bg-[#203C2B]/10 mb-3" />
      <div className="h-3 w-20 bg-[#71865B]/20 rounded-full mb-2" />
      <div className="h-4 w-4/5 bg-[#203C2B]/15 rounded-lg mb-2" />
      <div className="h-3 w-1/2 bg-[#203C2B]/10 rounded mb-3" />
      <div className="flex items-center justify-between pt-2.5 border-t border-[#DCDCCB]/60">
        <div className="h-5 w-24 bg-[#203C2B]/20 rounded-md" />
        <div className="h-8 w-8 rounded-full bg-[#203C2B]/10" />
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <main className="relative flex flex-col w-full min-h-screen bg-[#FEF6E4] pt-[110px] pb-16 px-4 sm:px-6 md:px-12 max-w-[1440px] mx-auto animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="h-3 w-48 bg-[#71865B]/20 rounded-full mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
        {/* Left Gallery Skeleton */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
          <div className="flex md:flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-16 h-20 rounded-xl bg-white/60 border border-[#DCDCCB]/80" />
            ))}
          </div>
          <div className="flex-1 aspect-[4/5] rounded-3xl bg-white/80 border border-[#DCDCCB] shadow-xs" />
        </div>

        {/* Right Info Skeleton */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="h-4 w-28 bg-[#71865B]/25 rounded-full" />
          <div className="h-10 w-4/5 bg-[#203C2B]/15 rounded-2xl" />
          <div className="h-7 w-36 bg-[#203C2B]/20 rounded-xl" />

          {/* Koko Banner Skeleton */}
          <div className="h-14 w-full bg-white/80 rounded-2xl border border-[#DCDCCB]" />

          {/* Variants Skeleton */}
          <div className="flex flex-col gap-2 pt-2">
            <div className="h-3 w-20 bg-[#71865B]/20 rounded-full" />
            <div className="flex gap-2">
              <div className="h-10 w-24 rounded-full bg-white/90 border border-[#DCDCCB]" />
              <div className="h-10 w-24 rounded-full bg-white/90 border border-[#DCDCCB]" />
              <div className="h-10 w-24 rounded-full bg-white/90 border border-[#DCDCCB]" />
            </div>
          </div>

          {/* Buttons Skeleton */}
          <div className="h-14 w-full rounded-full bg-[#203C2B]/15 mt-4" />
          <div className="h-12 w-full rounded-full bg-white/80 border border-[#DCDCCB]" />

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2 pt-4">
            <div className="h-16 rounded-xl bg-white/60 border border-[#DCDCCB]/60" />
            <div className="h-16 rounded-xl bg-white/60 border border-[#DCDCCB]/60" />
            <div className="h-16 rounded-xl bg-white/60 border border-[#DCDCCB]/60" />
          </div>
        </div>
      </div>
    </main>
  );
}

export function CatalogGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex justify-center w-full">
          <ProductCardSkeleton />
        </div>
      ))}
    </div>
  );
}

