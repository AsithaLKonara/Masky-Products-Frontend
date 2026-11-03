"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play, Pause, Sparkles, Leaf, ShieldCheck } from "lucide-react";
import type { HeroConfig } from "@/services/cms.service";

interface HeroVideoProps {
  config?: HeroConfig["videoConfig"];
}

export default function HeroVideo({ config }: HeroVideoProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoUrl = config?.videoUrl?.trim() || "";
  const posterUrl = config?.posterUrl?.trim() || "/hero-image/Product1.png";
  const eyebrow = config?.eyebrow || "NATURE'S FINEST HARVEST";
  const title = config?.title || "Gourmet Dehydrated Mushrooms";
  const subtitle = config?.subtitle || "Artisan Sun-Dried • Peak Umami • 100% Organic";
  const description =
    config?.description ||
    "Slowly dehydrated at low temperatures to lock in concentrated earthy aroma, dense nutrients, and rich culinary umami. Handcrafted in Sri Lanka.";
  const ctaText = config?.ctaText || "Explore Collection";
  const ctaLink = config?.ctaLink || "/shop";
  const ctaSecondaryText = config?.ctaSecondaryText || "Our Story";
  const ctaSecondaryLink = config?.ctaSecondaryLink || "/about";

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  return (
    <section 
      data-testid="hero-video-section"
      className="relative w-full min-h-[700px] md:min-h-[800px] lg:min-h-[860px] flex items-center justify-center overflow-hidden bg-[#1A261D]"
    >
      {/* Background Media */}
      {videoUrl ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          poster={posterUrl}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      ) : (
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={posterUrl}
            alt={title}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
      )}

      {/* Cinematic Dual Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#142318] via-[#1A261D]/75 to-[#1A261D]/50 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_rgba(15,26,18,0.7)_100%)] pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 flex flex-col items-center text-center">
        {/* Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFFCF4]/15 backdrop-blur-md border border-[#FFFCF4]/25 text-[#FEF6E4] text-xs font-poppins font-semibold uppercase tracking-[0.2em] mb-6 shadow-sm">
          <Leaf size={13} className="text-[#A8B995]" />
          <span>{eyebrow}</span>
        </div>

        {/* Main Headline */}
        <h1 className="font-signature text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-[#FFFCF4] tracking-tight leading-[1.08] font-light max-w-4xl drop-shadow-md">
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="font-poppins text-base sm:text-lg md:text-xl text-[#DCDCCB] font-medium tracking-wide mt-4 max-w-2xl">
            {subtitle}
          </p>
        )}

        {/* Description */}
        {description && (
          <p className="font-poppins text-sm sm:text-base text-[#FEF6E4]/80 font-light leading-relaxed max-w-2xl mt-4">
            {description}
          </p>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 w-full sm:w-auto">
          <Link
            href={ctaLink}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#FEF6E4] text-[#203C2B] font-poppins text-sm font-semibold tracking-wider uppercase hover:bg-[#FFFCF4] hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
          >
            <span>{ctaText}</span>
            <ArrowRight size={16} />
          </Link>

          {ctaSecondaryText && ctaSecondaryLink && (
            <Link
              href={ctaSecondaryLink}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-[#FFFCF4]/10 backdrop-blur-md border border-[#FFFCF4]/30 text-[#FFFCF4] font-poppins text-sm font-medium tracking-wider uppercase hover:bg-[#FFFCF4]/20 hover:border-[#FFFCF4]/50 transition-all duration-300"
            >
              <span>{ctaSecondaryText}</span>
            </Link>
          )}
        </div>

        {/* Trust Markers */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mt-12 pt-8 border-t border-[#FFFCF4]/15 text-[#DCDCCB] text-xs font-poppins font-light">
          <div className="inline-flex items-center gap-2">
            <Sparkles size={14} className="text-[#A8B995]" />
            <span>100% Organically Grown</span>
          </div>
          <div className="inline-flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#A8B995]" />
            <span>Low-Temp Sun & Dehydrator Dried</span>
          </div>
          <div className="inline-flex items-center gap-2">
            <Leaf size={14} className="text-[#A8B995]" />
            <span>Islandwide Delivery</span>
          </div>
        </div>
      </div>

      {/* Video Play/Pause Control (Accessibility requirement) */}
      {videoUrl && (
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause video" : "Play video"}
          className="absolute bottom-6 right-6 z-20 w-11 h-11 rounded-full bg-[#FFFCF4]/15 backdrop-blur-md border border-[#FFFCF4]/30 text-[#FFFCF4] flex items-center justify-center hover:bg-[#FFFCF4]/30 hover:scale-105 transition-all duration-200 cursor-pointer shadow-lg"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
        </button>
      )}
    </section>
  );
}

