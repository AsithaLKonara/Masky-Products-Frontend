"use client";

import Image from "next/image";
import { useCms } from "@/hooks/useCms";
import Link from "next/link";

export default function AdBannerSection() {
  const { banners, isLoadingBanners } = useCms();
  const activeBanners = banners?.filter(b => b.active && b.type === 'PROMO') || [];

  if (isLoadingBanners) {
    return <section className="w-full h-[150px] md:h-[250px] bg-stone-100 animate-pulse"></section>;
  }

  if (activeBanners.length === 0) {
    return null;
  }

  return (
    <>
      {activeBanners.map(activeBanner => {
        const content = (
          <>
            {/* Background Color/Image */}
            <div className="absolute inset-0 z-0" style={{ backgroundColor: activeBanner.bgColor || '#000' }}>
              {activeBanner.imageUrl && (
                <Image src={activeBanner.imageUrl} alt="Banner Background" fill className="object-cover" />
              )}
            </div>
            
            {/* Dark Overlay */}
            {(activeBanner.showOverlay ?? true) && (
              <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />
            )}

            {/* Text Content */}
            <div className="absolute inset-0 z-20 flex justify-center items-center pointer-events-none w-full h-full px-4">
              <h2 className="font-signature font-normal text-2xl md:text-5xl leading-tight text-center text-white drop-shadow-md">
                {activeBanner.text}
              </h2>
            </div>
          </>
        );

        return (
          <section key={activeBanner.id} className="relative flex flex-col justify-center items-center px-4 md:px-8 lg:px-[120px] py-10 md:py-[60px] w-full h-[150px] md:h-[250px] overflow-hidden hover:opacity-95 transition-opacity">
            {activeBanner.link ? (
              <Link href={activeBanner.link} className="absolute inset-0 z-30">
                {content}
              </Link>
            ) : (
              content
            )}
          </section>
        );
      })}
    </>
  );
}
