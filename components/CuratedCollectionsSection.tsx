"use client";
import Link from "next/link";
import Image from "next/image";
import { useCollections } from "@/hooks/useCollections";

export default function CuratedCollectionsSection() {
  const { data: response, isLoading } = useCollections();
  const collections = response?.data || [];
  
  // Show max 2 collections for this specific layout
  const displayCollections = collections.slice(0, 2);

  // Fallback images if collection doesn't have an image field yet
  const fallbacks = [
    "/hero-image/hero-3.jpeg",
    "/hero-image/hero-2.jpeg",
  ];

  if (isLoading) {
    return <div className="w-full h-40 bg-stone-50 animate-pulse" />;
  }

  if (displayCollections.length === 0) {
    return null; // hide section if no collections
  }

  return (
    <section className="w-full h-auto px-4 md:px-8 lg:px-[120px] py-10 md:py-[60px] bg-stone-50">
      <div className="flex flex-col items-center text-center mb-10 w-full max-w-[1280px] mx-auto">
        <span className="text-sm md:text-base font-poppins text-stone-500 block mb-2 uppercase tracking-widest">
          Curated For You
        </span>
        <h2 className="text-3xl md:text-[36px] font-signature text-stone-900 tracking-wide mb-2">
          Featured Collections
        </h2>
        <div className="w-12 h-[1px] bg-stone-300 mt-4 mb-2" />
      </div>

      <div className="max-w-[1280px] mx-auto w-full flex flex-col md:flex-row justify-center gap-4 md:gap-6">
        {displayCollections.map((collection, idx) => {
          const img = collection.imageUrl || fallbacks[idx % fallbacks.length];
          return (
          <Link 
            key={collection.id} 
            href={`/collections/${collection.slug}`}
            className="group relative w-full md:w-1/2 aspect-[4/5] md:aspect-square lg:aspect-[4/3] overflow-hidden rounded-sm"
          >
            <Image 
              src={img}
              alt={collection.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Content */}
            <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
              <h3 className="font-signature text-3xl md:text-4xl text-white tracking-wider mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                {collection.title}
              </h3>
              <p className="font-poppins text-sm md:text-base text-stone-200 font-light mb-6 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
                {collection.description || `Explore our ${collection.title} collection.`}
              </p>
              
              <div className="overflow-hidden">
                <span className="inline-block font-poppins text-xs font-semibold text-white tracking-[0.2em] uppercase border-b border-white pb-1 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 delay-200">
                  Shop Collection
                </span>
              </div>
            </div>
          </Link>
          );
        })}
      </div>
    </section>
  );
}
