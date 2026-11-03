import { CatalogGridSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#FEF6E4] pt-[110px] pb-16 px-4 sm:px-6 md:px-12 max-w-[1440px] mx-auto animate-pulse">
      {/* Category Banner Skeleton */}
      <div className="w-full h-44 sm:h-56 rounded-3xl bg-white/70 border border-[#DCDCCB] mb-10 flex flex-col items-center justify-center gap-3 p-6">
        <div className="h-4 w-28 bg-[#71865B]/25 rounded-full" />
        <div className="h-10 w-64 bg-[#203C2B]/15 rounded-2xl" />
        <div className="h-4 w-96 max-w-full bg-[#203C2B]/10 rounded-lg" />
      </div>

      {/* Grid of Product Skeletons */}
      <CatalogGridSkeleton count={8} />
    </main>
  );
}
