"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Sparkles, Award, PackageCheck, Star } from "lucide-react";

export interface PublicStats {
  products: number;
  categories: number;
  orders: number;
  customers: number;
  rating: number;
  reviewsCount: number;
}

interface StatsSectionProps {
  initialStats?: PublicStats | null;
}

export default function StatsSection({ initialStats }: StatsSectionProps) {
  const [stats, setStats] = useState<PublicStats>(
    initialStats || {
      products: 15,
      categories: 6,
      orders: 14,
      customers: 4,
      rating: 4.9,
      reviewsCount: 120,
    }
  );

  // Live client-side refresh to guarantee live synchronization
  useEffect(() => {
    fetch("/api/v1/analytics/public-stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(() => {});
  }, []);

  const items = [
    {
      icon: Sparkles,
      value: `${stats.products}+`,
      label: "Artisan Blends",
      sublabel: "Hand-crafted formulations",
    },
    {
      icon: Award,
      value: `${stats.categories}`,
      label: "Botanical Collections",
      sublabel: "Shade-grown harvests",
    },
    {
      icon: PackageCheck,
      value: `${stats.orders}+`,
      label: "Orders Dispatched",
      sublabel: "Islandwide cold-chain care",
    },
    {
      icon: Star,
      value: `${stats.rating} ★`,
      label: "Customer Acclaim",
      sublabel: `${stats.reviewsCount}+ verified ratings`,
    },
  ];

  return (
    <section
      aria-label="Brand Milestones & Statistics"
      className="relative w-full overflow-hidden py-12 md:py-16 m-0"
    >
      {/* Background image without blur */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <Image
          src="/pexels-andre-mouton-16296130.jpg"
          alt="Natural botanical harvest background"
          fill
          priority={false}
          sizes="100vw"
          className="object-cover"
        />
        {/* Soft veil for text readability */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(250,247,242,0.80) 0%, rgba(250,247,242,0.65) 50%, rgba(250,247,242,0.82) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3 bg-white/45 backdrop-blur-md border border-[#71865B]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#71865B] animate-pulse" />
            <span className="font-poppins tracking-[0.2em] uppercase text-[10px] font-medium text-[#203C2B]">
              REAL-TIME MILESTONES
            </span>
          </div>
          <h2 className="font-inria text-2xl sm:text-3xl md:text-4xl text-[#203C2B] font-normal tracking-tight">
            Distinguished Quality, Verified Daily
          </h2>
          <p className="font-poppins font-light text-xs sm:text-sm text-[#62695A] mt-2">
            Every blend is measured by strict botanical purity, meticulous curation, and customer trust.
          </p>
        </div>

        {/* 4 Frosted Glass Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative flex flex-col items-center text-center p-5 sm:p-6 md:p-7 rounded-2xl transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: "rgba(255, 252, 244, 0.48)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid rgba(255, 255, 255, 0.7)",
                  boxShadow:
                    "0 8px 32px 0 rgba(32, 60, 43, 0.08), inset 0 1px 1px 0 rgba(255, 255, 255, 0.8)",
                }}
              >
                {/* Glow ring */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 0%, rgba(113,134,91,0.18) 0%, transparent 70%)",
                  }}
                />

                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4 transition-transform duration-300 group-hover:scale-110 shadow-sm"
                  style={{
                    background: "rgba(255, 255, 255, 0.65)",
                    border: "1px solid rgba(113, 134, 91, 0.2)",
                  }}
                >
                  <Icon className="w-5 h-5 text-[#203C2B]" strokeWidth={1.75} />
                </div>

                <span className="font-inria text-3xl sm:text-4xl md:text-5xl font-light text-[#203C2B] tracking-tight">
                  {item.value}
                </span>

                <span className="font-poppins font-medium text-xs sm:text-sm text-[#203C2B] mt-1.5 tracking-wide">
                  {item.label}
                </span>

                <span className="font-poppins font-light text-[11px] sm:text-xs text-[#71865B] mt-0.5">
                  {item.sublabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
