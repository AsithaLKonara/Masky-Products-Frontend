import { CatalogGridSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#FEF6E4] pt-[110px] pb-16 px-4 sm:px-6 md:px-12 max-w-[1440px] mx-auto animate-pulse">
      {/* Shop Header Bar Skeleton */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#DCDCCB]/60">
        <div>
          <div className="h-4 w-32 bg-[#71865B]/25 rounded-full mb-2" />
          <div className="h-9 w-64 bg-[#203C2B]/15 rounded-xl" />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="h-10 w-36 rounded-full bg-white/80 border border-[#DCDCCB]" />
          <div className="h-10 w-28 rounded-full bg-[#203C2B]/10" />
        </div>
      </div>

      <div className="flex gap-8 items-start">
        {/* Left Filter Bar Skeleton (desktop) */}
        <div className="hidden lg:flex flex-col gap-4 w-64 shrink-0 bg-white/60 rounded-3xl p-6 border border-[#DCDCCB]">
          <div className="h-5 w-24 bg-[#203C2B]/15 rounded" />
          <div className="h-px w-full bg-[#DCDCCB]" />
          <div className="h-4 w-32 bg-[#203C2B]/10 rounded" />
          <div className="h-4 w-28 bg-[#203C2B]/10 rounded" />
          <div className="h-4 w-36 bg-[#203C2B]/10 rounded" />
          <div className="h-px w-full bg-[#DCDCCB]" />
          <div className="h-5 w-20 bg-[#203C2B]/15 rounded" />
          <div className="h-8 w-full bg-[#203C2B]/10 rounded-lg" />
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1">
          <CatalogGridSkeleton count={8} />
        </div>
      </div>
    </main>
  );
}

