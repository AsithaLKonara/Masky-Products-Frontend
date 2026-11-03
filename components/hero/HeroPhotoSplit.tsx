"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Leaf, Sparkles, ShieldCheck, HeartHandshake, CheckCircle2 } from "lucide-react";
import type { HeroConfig } from "@/services/cms.service";

interface HeroPhotoSplitProps {
  config?: HeroConfig["photoConfig"];
}

export default function HeroPhotoSplit({ config }: HeroPhotoSplitProps) {
  const imageUrl = config?.imageUrl?.trim() || "/hero-image/Product1.png";
  const eyebrow = config?.eyebrow || "100% ORGANIC HIGHLAND HARVEST";
  const title = config?.title || "Pure Artisanal Mushrooms";
  const subtitle = config?.subtitle || "Dehydrated & Fresh Gourmet Fungi";
  const description =
    config?.description ||
    "Carefully selected and handcrafted in Sri Lanka. Slowly dehydrated at low temperatures to lock in concentrated umami, essential vitamins, and earthy gourmet perfection.";
  const badgeText = config?.badgeText || "Sun-Kissed & Dehydrated";
  const badgeSubtext = config?.badgeSubtext || "Sustainably grown in Sri Lanka";
  const ctaText = config?.ctaText || "Explore Products";
  const ctaLink = config?.ctaLink || "/shop";
  const ctaSecondaryText = config?.ctaSecondaryText || "Our Story";
  const ctaSecondaryLink = config?.ctaSecondaryLink || "/about";

  return (
    <section 
      data-testid="hero-photo-section"
      className="relative w-full min-h-[720px] lg:min-h-[820px] bg-[#FEF6E4] flex items-center overflow-hidden py-16 sm:py-20 lg:py-24"
    >
      {/* Background Subtle Ambience */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#71865B]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#D9C99B]/20 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left Column: Typography & CTAs */}
          <div className="w-full lg:w-1/2 flex flex-col items-start text-left">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#71865B]/15 text-[#203C2B] border border-[#71865B]/30 text-xs font-poppins font-medium uppercase tracking-[0.2em] mb-6">
              <Leaf size={14} className="text-[#71865B]" />
              <span>{eyebrow}</span>
            </div>

            {/* Headline */}
            <h1 className="font-signature text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#203C2B] font-light tracking-tight leading-[1.08] mb-4">
              {title}
            </h1>

            {/* Subtitle */}
            {subtitle && (
              <p className="font-poppins text-lg sm:text-xl font-semibold text-[#71865B] tracking-wide mb-4">
                {subtitle}
              </p>
            )}

            {/* Narrative Body */}
            {description && (
              <p className="font-poppins text-sm sm:text-base text-[#5c5650] font-light leading-relaxed max-w-xl mb-8">
                {description}
              </p>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-10">
              <Link
                href={ctaLink}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#203C2B] text-[#FFFCF4] font-poppins text-sm font-semibold tracking-wider uppercase hover:bg-[#16291e] hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
              >
                <span>{ctaText}</span>
                <ArrowRight size={16} />
              </Link>

              {ctaSecondaryText && ctaSecondaryLink && (
                <Link
                  href={ctaSecondaryLink}
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-white/60 backdrop-blur-sm border border-[#DCDCCB] text-[#203C2B] font-poppins text-sm font-medium tracking-wider uppercase hover:bg-white hover:border-[#71865B] transition-all duration-300"
                >
                  <span>{ctaSecondaryText}</span>
                </Link>
              )}
            </div>

            {/* Trust Bullet Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full pt-6 border-t border-[#DCDCCB]/80 text-[#203C2B] text-xs font-poppins">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#71865B] shrink-0" />
                <span className="font-medium">100% Organically Grown</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#71865B] shrink-0" />
                <span className="font-medium">Nutrient & Umami Rich</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#71865B] shrink-0" />
                <span className="font-medium">Islandwide Courier</span>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Photograph Box */}
          <div className="w-full lg:w-1/2 flex justify-center">
            <div className="relative w-full max-w-[520px] aspect-[4/5] rounded-3xl overflow-hidden bg-[#EAE8DC] border border-[#DCDCCB] shadow-[0_12px_40px_rgba(32,60,43,0.08)]">
              <Image
                src={imageUrl}
                alt={title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#203C2B]/35 via-transparent to-transparent pointer-events-none" />

              {/* Floating Frosted Pill Badge */}
              <div className="absolute bottom-6 left-6 right-6 sm:right-auto bg-[#FFFCF4]/90 backdrop-blur-md border border-[#DCDCCB] rounded-2xl p-4 shadow-lg flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#71865B]/20 text-[#203C2B] flex items-center justify-center shrink-0">
                  <Sparkles size={18} />
                </div>
                <div>
                  <p className="font-poppins text-xs font-semibold text-[#203C2B] tracking-wide uppercase">
                    {badgeText}
                  </p>
                  <p className="font-poppins text-xs text-[#5c5650] font-light">
                    {badgeSubtext}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

