import Hero from "@/components/Hero";
import StatsSection, { PublicStats } from "@/components/StatsSection";
import CollectionsSection from "@/components/CollectionsSection";
import NewArrivalsSection from "@/components/NewArrivalsSection";
import CuratedCollectionsSection from "@/components/CuratedCollectionsSection";
import dynamicImport from "next/dynamic";
import AdBannerSection from "@/components/AdBannerSection";

const OfferCollectionSection = dynamicImport(() => import("@/components/OfferCollectionSection"));
import BrandStorySection from "@/components/BrandStorySection";
import TestimonialSection from "@/components/TestimonialSection";
import { serverFetch } from "@/lib/server-fetch";
import { PaginatedResponse } from "@/types/api";
import { Product } from "@/types/product";
import { Category } from "@/types/category";

// Server-render on demand — prevents Railway build hanging on API calls during SSG
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch SEO-critical data on the server in parallel
  const [categoriesRes, newArrivalsRes, offersRes, sectionsRes, statsRes] = await Promise.all([
    serverFetch<PaginatedResponse<Category>>("/categories", { tags: ["categories"], revalidate: 0 }).catch(() => undefined),
    serverFetch<PaginatedResponse<Product>>("/products", { tags: ["products"], revalidate: 60 }).catch(() => undefined),
    serverFetch<PaginatedResponse<Product>>("/products?skip=0&take=8", { tags: ["products"], revalidate: 60 }).catch(() => undefined),
    serverFetch<any>("/cms/sections", { revalidate: 60 }).catch(() => undefined),
    serverFetch<PublicStats>("/analytics/public-stats", { revalidate: 30 }).catch(() => undefined),
  ]);

  // /cms/sections returns a plain array (not paginated)
  const sections: any[] = Array.isArray(sectionsRes) ? sectionsRes : (sectionsRes as any)?.data || [];
  
  // Create mapping of section name to React components
  const sectionComponents: Record<string, React.ReactNode> = {
    "CollectionsSection": <CollectionsSection key="CollectionsSection" initialData={categoriesRes} />,
    "NewArrivalsSection": <NewArrivalsSection key="NewArrivalsSection" initialData={newArrivalsRes} />,
    "CuratedCollectionsSection": <CuratedCollectionsSection key="CuratedCollectionsSection" />,
    "OfferCollectionSection": <OfferCollectionSection key="OfferCollectionSection" initialData={offersRes} />,
    "AdBannerSection": <AdBannerSection key="AdBannerSection" />,
    "BrandStorySection": <BrandStorySection key="BrandStorySection" />,
    "TestimonialSection": <TestimonialSection key="TestimonialSection" />,
  };

  return (
    <div className="min-h-screen bg-transparent">
      <Hero />
      <StatsSection initialStats={statsRes} />
      {/* Infinite Scroll Ribbon */}
      <div className="w-full bg-[#1A1A1A] py-3 overflow-hidden flex items-center">
        <div className="flex animate-marquee whitespace-nowrap w-max">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-10 px-5">
              <span className="font-poppins text-xs md:text-sm text-white tracking-[0.2em] uppercase font-light">
                100% Organic Gourmet Mushrooms
              </span>
              <span className="font-poppins text-xs md:text-sm text-white tracking-[0.2em] uppercase font-light">
                •
              </span>
              <span className="font-poppins text-xs md:text-sm text-white tracking-[0.2em] uppercase font-light">
                Low-Temperature Dehydration
              </span>
              <span className="font-poppins text-xs md:text-sm text-white tracking-[0.2em] uppercase font-light">
                •
              </span>
              <span className="font-poppins text-xs md:text-sm text-white tracking-[0.2em] uppercase font-light">
                12-Month Shelf Life • Locked Umami
              </span>
              <span className="font-poppins text-xs md:text-sm text-white tracking-[0.2em] uppercase font-light">
                •
              </span>
              <span className="font-poppins text-xs md:text-sm text-white tracking-[0.2em] uppercase font-light">
                Islandwide Courier Dispatch
              </span>
              <span className="font-poppins text-xs md:text-sm text-white tracking-[0.2em] uppercase font-light">
                •
              </span>
              <span className="font-poppins text-xs md:text-sm text-white tracking-[0.2em] uppercase font-light">
                Order Direct, WhatsApp & Daraz
              </span>
              <span className="font-poppins text-xs md:text-sm text-white tracking-[0.2em] uppercase font-light">
                •
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Dynamic Sections from CMS */}
      {sections.length > 0 ? (
        sections
          .filter((s: any) => s.visible)
          .sort((a: any, b: any) => a.order - b.order)
          .map((s: any) => sectionComponents[s.name])
      ) : (
        // Fallback if CMS is uninitialized
        <>
          <CollectionsSection initialData={categoriesRes} />
          <NewArrivalsSection initialData={newArrivalsRes} />
          <CuratedCollectionsSection />
          <OfferCollectionSection initialData={offersRes} />
          <AdBannerSection />
          <BrandStorySection />
          <TestimonialSection />
        </>
      )}
    </div>
  );
}
