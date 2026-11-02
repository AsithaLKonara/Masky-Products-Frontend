"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { ChevronLeft, ChevronRight, ArrowRight, Play } from "lucide-react";
import { useCms } from "@/hooks/useCms";
import type { HeroSlide } from "@/services/cms.service";

// ─── Fallback slides (Luxury collection matching design reference) ───────────
const FALLBACK_SLIDES: HeroSlide[] = [
  {
    id: "matcha-blend",
    title: "Matcha Blend",
    subtitle: "Ceremonial Grade",
    eyebrow: "SHADE-GROWN HARVEST",
    description: "Vibrant stone-ground Japanese matcha balanced with mellow creamy undertones.",
    cta: "Explore Matcha",
    ctaLink: "/shop",
    ctaSecondaryLabel: "Watch Story",
    ctaSecondaryLink: "/about",
    image: "/hero-image/Product1.png",
    accentColor: "#71865B",
    active: true,
    order: 0,
  },
  {
    id: "vanilla-dream",
    title: "Vanilla Dream",
    subtitle: "Artisan Series",
    eyebrow: "PURE BOTANICAL ESSENCE",
    description: "Silky smooth vanilla bean infusion with gentle botanical notes and soothing warmth.",
    cta: "Explore Vanilla",
    ctaLink: "/shop",
    ctaSecondaryLabel: "View Ingredients",
    ctaSecondaryLink: "/about",
    image: "/hero-image/Product2.png",
    accentColor: "#D9C99B",
    active: true,
    order: 1,
  },
  {
    id: "champagne-cream",
    title: "Champagne",
    subtitle: "Cream Edition",
    eyebrow: "PREMIUM QUALITY • TIMELESS ELEGANCE",
    description: "Hand-poured tactile finishes and creamy warm golden tones engineered for luxury.",
    cta: "Explore Collection",
    ctaLink: "/shop",
    ctaSecondaryLabel: "Watch Video",
    ctaSecondaryLink: "/about",
    image: "/hero-image/Product3.png",
    accentColor: "#71865B",
    active: true,
    order: 2,
  },
  {
    id: "green-tea",
    title: "Green Tea",
    subtitle: "Spring Harvest",
    eyebrow: "HAND-PICKED LEAF",
    description: "Crisp mountain-grown tender tea leaves gently steamed to preserve delicate floral notes.",
    cta: "Explore Green Tea",
    ctaLink: "/shop",
    ctaSecondaryLabel: "Learn More",
    ctaSecondaryLink: "/about",
    image: "/hero-image/Product4.png",
    accentColor: "#A8B995",
    active: true,
    order: 3,
  },
  {
    id: "classic-blend",
    title: "Classic Blend",
    subtitle: "Signature Roast",
    eyebrow: "TIMELESS TRADITION",
    description: "A rich, full-bodied heritage blend with deep roasted character and lasting finish.",
    cta: "Explore Classic",
    ctaLink: "/shop",
    ctaSecondaryLabel: "Discover More",
    ctaSecondaryLink: "/about",
    image: "/hero-image/Product5.png",
    accentColor: "#62695A",
    active: true,
    order: 4,
  },
];

// ─── Position math ────────────────────────────────────────────────────────────
interface SlideTransform {
  scale: number;
  translateX: number;
  translateY: number;
  translateZ: number;
  rotateY: number;
  rotateZ: number;
  opacity: number;
  zIndex: number;
  blur: number;
  brightness: number;
}

function getSlideTransform(offset: number, isMobile: boolean): SlideTransform {
  const abs = Math.abs(offset);
  const sign = offset > 0 ? 1 : -1;

  if (isMobile) {
    // Mobile 3D Carousel Cylinder Rotation
    const scale = abs === 0 ? 1.12 : abs === 1 ? 0.78 : 0.50;
    const translateY = abs === 0 ? -4 : abs === 1 ? 12 : 24;
    const translateX = abs === 0 ? 0 : sign * (abs === 1 ? 48 : 84);
    const translateZ = abs === 0 ? 25 : abs === 1 ? -100 : -220;
    const rotateY = abs === 0 ? 0 : sign * (abs === 1 ? -32 : -52);
    const rotateZ = abs === 0 ? 0 : sign * (abs === 1 ? -2 : -3.5);
    const opacity = abs === 0 ? 1 : abs === 1 ? 0.62 : 0;
    const zIndex = abs === 0 ? 10 : abs === 1 ? 6 : 2;
    const blur = abs === 0 ? 0 : abs === 1 ? 0.4 : 1.2;
    const brightness = abs === 0 ? 1 : abs === 1 ? 0.90 : 0.78;
    return { scale, translateX, translateY, translateZ, rotateY, rotateZ, opacity, zIndex, blur, brightness };
  }

  // Desktop 3D Turntable Cylinder: Tangential curve rotation around focal axis
  const scale = abs === 0 ? 1.10 : abs === 1 ? 0.86 : 0.64;
  const translateY = abs === 0 ? -10 : abs === 1 ? 14 : 30;
  const translateX = abs === 0 ? 0 : sign * (abs === 1 ? 52 : 92);
  const translateZ = abs === 0 ? 35 : abs === 1 ? -130 : -280;
  const rotateY = abs === 0 ? 0 : sign * (abs === 1 ? -36 : -58);
  const rotateZ = abs === 0 ? 0 : sign * (abs === 1 ? -2.5 : -4.5);
  const opacity = abs === 0 ? 1 : abs === 1 ? 0.90 : 0.60;
  const zIndex = abs === 0 ? 10 : abs === 1 ? 7 : 4;
  const blur = abs === 0 ? 0 : abs === 1 ? 0.2 : 0.8;
  const brightness = abs === 0 ? 1 : abs === 1 ? 0.92 : 0.80;

  return { scale, translateX, translateY, translateZ, rotateY, rotateZ, opacity, zIndex, blur, brightness };
}

function wrap(index: number, length: number) {
  return ((index % length) + length) % length;
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
export default function Hero() {
  const { heroSlides } = useCms();

  const slides: HeroSlide[] = useMemo(() => {
    const cms =
      (heroSlides as HeroSlide[])
        ?.filter((s) => s.active)
        .sort((a, b) => a.order - b.order) || [];
    return cms.length > 0 ? cms : FALLBACK_SLIDES;
  }, [heroSlides]);

  // Default to index 2 (Champagne Cream Edition)
  const [activeIndex, setActiveIndex] = useState(2);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [contentKey, setContentKey] = useState(0);
  const [prefersReduced, setPrefersReduced] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasUserInteracted = useRef(false);

  // Initialize center slide on data load if user hasn't manually interacted
  useEffect(() => {
    if (!hasUserInteracted.current && slides.length > 0) {
      const champagneIdx = slides.findIndex(
        (s) => s.title?.toLowerCase().includes("champagne") || s.order === 2
      );
      if (champagneIdx !== -1) {
        setActiveIndex(champagneIdx);
      } else {
        setActiveIndex(Math.floor(slides.length / 2));
      }
    }
  }, [slides]);

  const current = slides[activeIndex] ?? slides[0];

  // Responsive breakpoint
  useEffect(() => {
    const checkResponsive = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkResponsive();
    window.addEventListener("resize", checkResponsive);
    return () => window.removeEventListener("resize", checkResponsive);
  }, []);

  // Reduced-motion preference
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const h = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  const goTo = useCallback(
    (i: number) => {
      hasUserInteracted.current = true;
      setActiveIndex(wrap(i, slides.length));
      setContentKey((k) => k + 1);
    },
    [slides.length],
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  // Autoplay
  useEffect(() => {
    if (slides.length <= 1 || isHovered || prefersReduced) return;
    timerRef.current = setTimeout(goNext, 4500);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [activeIndex, isHovered, prefersReduced, goNext, slides.length]);

  // Page visibility
  useEffect(() => {
    const h = () => { if (document.hidden && timerRef.current) clearTimeout(timerRef.current); };
    document.addEventListener("visibilitychange", h);
    return () => document.removeEventListener("visibilitychange", h);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [goNext, goPrev]);

  // Mouse drag
  const onMouseDown = (e: React.MouseEvent) => { setIsDragging(true); setDragStart(e.clientX); };
  const onMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const delta = dragStart - e.clientX;
    if (Math.abs(delta) > 35) delta > 0 ? goNext() : goPrev();
    setIsDragging(false);
  };

  // Touch swipe (Mobile First)
  const onTouchStart = (e: React.TouchEvent) => setDragStart(e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    const delta = dragStart - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 35) delta > 0 ? goNext() : goPrev();
  };

  const halosColor = current?.accentColor || "#71865B";
  const offsets = [-2, -1, 0, 1, 2];

  return (
    <section
      aria-label="Featured products carousel"
      className="relative w-full overflow-hidden pt-2 md:pt-4 pb-4 md:pb-6 min-h-0 md:min-h-[clamp(500px,78vh,740px)]"
      style={{
        background: "transparent",
        userSelect: "none",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsDragging(false); }}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Background arcs */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.22 }}
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1440 800"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="720" cy="270" r="410" fill="none" stroke="var(--hero-divider)" strokeWidth="1" />
        <circle cx="720" cy="270" r="260" fill="none" stroke="var(--hero-divider)" strokeWidth="0.6" />
      </svg>

      {/* Botanical corner leaves */}
      <div aria-hidden="true" className="absolute bottom-0 left-0 pointer-events-none hidden sm:block" style={{ opacity: 0.16 }}>
        <svg width="200" height="230" viewBox="0 0 200 230" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 222 Q32 172 82 152 Q122 138 164 88 Q192 48 182 8" stroke="#203C2B" strokeWidth="1.5" fill="none"/>
          <path d="M28 212 Q48 162 96 142 Q125 128 145 72" stroke="#71865B" strokeWidth="1" fill="none"/>
          <ellipse cx="86" cy="148" rx="18" ry="26" fill="#DDE5CC" opacity="0.7" transform="rotate(-18 86 148)"/>
          <ellipse cx="54" cy="178" rx="13" ry="20" fill="#A8B995" opacity="0.5" transform="rotate(-8 54 178)"/>
        </svg>
      </div>
      <div aria-hidden="true" className="absolute bottom-0 right-0 pointer-events-none hidden sm:block" style={{ opacity: 0.16, transform: "scaleX(-1)" }}>
        <svg width="200" height="230" viewBox="0 0 200 230" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 222 Q32 172 82 152 Q122 138 164 88 Q192 48 182 8" stroke="#203C2B" strokeWidth="1.5" fill="none"/>
          <path d="M28 212 Q48 162 96 142 Q125 128 145 72" stroke="#71865B" strokeWidth="1" fill="none"/>
          <ellipse cx="86" cy="148" rx="18" ry="26" fill="#DDE5CC" opacity="0.7" transform="rotate(-18 86 148)"/>
          <ellipse cx="54" cy="178" rx="13" ry="20" fill="#A8B995" opacity="0.5" transform="rotate(-8 54 178)"/>
        </svg>
      </div>

      {/* Coverflow slider (Bit larger slider with enhanced 3D animation) */}
      <div
        className="relative z-10 flex items-center justify-center cursor-grab active:cursor-grabbing"
        style={{
          perspective: "1100px",
          transformStyle: "preserve-3d",
          height: isMobile ? "min(80vw, 345px)" : "min(36vw, 440px)",
          marginTop: isMobile ? "4px" : "10px",
        }}
      >
        {/* Soft Ambient halo behind active product */}
        <div
          aria-hidden="true"
          className="hero-halo-pulse absolute pointer-events-none"
          style={{
            width: isMobile ? "min(78vw, 320px)" : "min(36vw, 400px)",
            height: isMobile ? "min(78vw, 320px)" : "min(36vw, 400px)",
            borderRadius: "50%",
            background: `radial-gradient(ellipse at center, ${halosColor}60 0%, ${halosColor}28 42%, transparent 72%)`,
            filter: "blur(32px)",
            transition: prefersReduced ? "none" : "background 800ms cubic-bezier(0.16, 1, 0.3, 1)",
            zIndex: 5,
          }}
        />

        {/* 3D Product slides */}
        {offsets.map((offset) => {
          const slideIndex = wrap(activeIndex + offset, slides.length);
          const slide = slides[slideIndex];
          const t = getSlideTransform(offset, isMobile);
          const isCenter = offset === 0;

          return (
            <div
              key={`slide-${slideIndex}-${offset}`}
              role={isCenter ? "group" : "button"}
              aria-label={isCenter ? `Active: ${slide.title}` : `Go to ${slide.title}`}
              aria-current={isCenter ? "true" : undefined}
              tabIndex={isCenter ? 0 : -1}
              className="absolute"
              style={{
                transform: `translateX(${t.translateX}%) translateY(${t.translateY}px) translateZ(${t.translateZ}px) rotateY(${t.rotateY}deg) rotateZ(${t.rotateZ}deg) scale(${t.scale})`,
                opacity: t.opacity,
                zIndex: t.zIndex,
                transformStyle: "preserve-3d",
                transition: prefersReduced
                  ? "none"
                  : "transform 750ms cubic-bezier(0.2, 0.9, 0.3, 1), opacity 750ms ease, filter 750ms ease",
                cursor: isCenter ? "default" : "pointer",
                width: isMobile ? "min(68vw, 265px)" : "min(26vw, 340px)",
                height: isMobile ? "min(82vw, 325px)" : "min(34vw, 430px)",
                pointerEvents: t.opacity === 0 ? "none" : "auto",
              }}
              onClick={() => {
                if (!isCenter) goTo(wrap(activeIndex + offset, slides.length));
              }}
            >
              <div
                className="relative w-full h-full flex items-center justify-center transition-transform duration-300"
                style={{
                  filter: isCenter
                    ? "drop-shadow(0 26px 40px rgba(32,60,43,0.25)) drop-shadow(0 8px 16px rgba(32,60,43,0.14)) brightness(1)"
                    : `drop-shadow(0 12px 24px rgba(0,0,0,0.14)) blur(${t.blur}px) brightness(${t.brightness})`,
                  transition: prefersReduced ? "none" : "filter 750ms ease",
                }}
              >
                <Image
                  src={slide.image || "/hero-image/Product1.png"}
                  alt={slide.title || "Product"}
                  fill
                  priority={isCenter}
                  sizes={isMobile ? "70vw" : "28vw"}
                  className="object-contain select-none"
                  style={{ pointerEvents: "none" }}
                  onError={(e) => { (e.target as HTMLImageElement).src = "/hero-image/Product1.png"; }}
                />

                {/* Soft ground contact shadow */}
                <div
                  aria-hidden="true"
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 pointer-events-none rounded-[50%]"
                  style={{
                    width: isCenter ? "75%" : "60%",
                    height: isCenter ? "18px" : "12px",
                    background: isCenter
                      ? "radial-gradient(ellipse at center, rgba(32,60,43,0.34) 0%, rgba(32,60,43,0.12) 45%, transparent 75%)"
                      : "radial-gradient(ellipse at center, rgba(0,0,0,0.18) 0%, transparent 70%)",
                    filter: isCenter ? "blur(5px)" : "blur(4px)",
                    transition: "all 750ms cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                />
              </div>
            </div>
          );
        })}

        {/* Navigation Arrow buttons - Clean transparent luxury styling (No background) */}
        <button
          onClick={goPrev}
          aria-label="Previous slide"
          className="absolute z-30 top-1/2 -translate-y-1/2 left-0.5 sm:left-2 md:left-4 p-2.5 flex items-center justify-center transition-all duration-300 hover:scale-115 active:scale-90 group focus-visible:outline-none"
          style={{
            background: "transparent",
            border: "none",
            boxShadow: "none",
            cursor: "pointer",
          }}
        >
          <ChevronLeft className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 stroke-[1.5] text-[#203C2B] opacity-55 group-hover:opacity-100 transition-all duration-300 group-hover:-translate-x-1" />
        </button>
        <button
          onClick={goNext}
          aria-label="Next slide"
          className="absolute z-30 top-1/2 -translate-y-1/2 right-0.5 sm:right-2 md:right-4 p-2.5 flex items-center justify-center transition-all duration-300 hover:scale-115 active:scale-90 group focus-visible:outline-none"
          style={{
            background: "transparent",
            border: "none",
            boxShadow: "none",
            cursor: "pointer",
          }}
        >
          <ChevronRight className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 stroke-[1.5] text-[#203C2B] opacity-55 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1" />
        </button>
      </div>

      {/* Pagination indicators - Positioned directly under product images */}
      <div
        className="relative z-20 flex justify-center items-center gap-2 mt-1.5 md:mt-2.5 mb-1 md:mb-1.5"
        role="tablist"
        aria-label="Slide pagination"
      >
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            role="tab"
            aria-selected={i === activeIndex}
            aria-label={`Slide ${i + 1}: ${slide.title}`}
            onClick={() => goTo(i)}
            style={{
              width: i === activeIndex ? 26 : 6,
              height: 4.5,
              borderRadius: 9999,
              background: i === activeIndex ? "var(--hero-green-deep)" : "rgba(113, 134, 91, 0.35)",
              border: "none",
              cursor: "pointer",
              transition: prefersReduced ? "none" : "all 350ms cubic-bezier(0.16, 1, 0.3, 1)",
              outline: "none",
            }}
          />
        ))}
      </div>

      {/* Divider ribbon with eyebrow (Brought up) */}
      <div className="relative z-20 flex items-center justify-center gap-3 md:gap-4 mt-2 md:mt-2.5 px-4" aria-hidden="true">
        <div className="h-px flex-1 max-w-[90px] md:max-w-[120px]" style={{ background: "var(--hero-divider)" }} />
        <span
          className="font-poppins tracking-[0.20em] uppercase font-medium text-center"
          style={{ fontSize: "9px", color: "var(--hero-text-muted)" }}
        >
          {current?.eyebrow || "PREMIUM QUALITY • TIMELESS ELEGANCE"}
        </span>
        <div className="h-px flex-1 max-w-[90px] md:max-w-[120px]" style={{ background: "var(--hero-divider)" }} />
      </div>

      {/* Hero texts (Elevated up, reduced vertical gaps, mobile-first typography) */}
      <div key={contentKey} className="relative z-20 flex flex-col items-center text-center px-4 mt-2 md:mt-2.5">
        <h1
          className="font-inria hero-fade-up font-normal tracking-tight text-center"
          style={{
            fontSize: "clamp(30px, 4.6vw, 66px)",
            lineHeight: 1.02,
            color: "var(--hero-text-primary)",
            letterSpacing: "-0.015em",
            maxWidth: "760px",
            animationDelay: "0ms",
          }}
        >
          <span className="block">{current?.title || "Champagne"}</span>
          {current?.subtitle && (
            <span
              className="block italic mt-0.5 md:mt-1 font-inria font-light"
              style={{
                fontSize: "clamp(24px, 3.8vw, 56px)",
                lineHeight: 1.05,
                color: "var(--hero-green-primary)",
                letterSpacing: "-0.01em",
                animationDelay: "50ms",
              }}
            >
              {current.subtitle}
            </span>
          )}
        </h1>

        {current?.description && (
          <p
            className="font-poppins font-light hero-fade-up mt-1.5 md:mt-2"
            style={{
              fontSize: "clamp(12px, 1.05vw, 15px)",
              lineHeight: 1.55,
              color: "var(--hero-text-secondary)",
              maxWidth: "500px",
              animationDelay: "100ms",
            }}
          >
            {current.description}
          </p>
        )}

        {/* Calls to action (Compact, accessible, mobile-first touch targets) */}
        <div
          className="hero-fade-up flex flex-wrap items-center justify-center gap-3 mt-3 md:mt-4"
          style={{ animationDelay: "150ms" }}
        >
          {current?.cta && (
            <Link
              href={current.ctaLink || "/shop"}
              className="group flex items-center gap-2.5 font-poppins font-medium transition-all duration-300 hover:opacity-95 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-3"
              style={{
                fontSize: 11.5,
                letterSpacing: "0.04em",
                background: "var(--hero-green-deep)",
                color: "#FFFCF4",
                padding: "9px 12px 9px 22px",
                borderRadius: "9999px",
                boxShadow: "0 6px 18px rgba(32,60,43,0.26)",
              }}
            >
              <span>{current.cta}</span>
              <span
                className="flex items-center justify-center rounded-full transition-transform duration-300 group-hover:translate-x-0.5"
                style={{
                  width: 26,
                  height: 26,
                  background: "rgba(255,252,244,0.18)",
                }}
              >
                <ArrowRight size={12} color="#FFFCF4" />
              </span>
            </Link>
          )}
          {current?.ctaSecondaryLabel && current?.ctaSecondaryLink && (
            <Link
              href={current.ctaSecondaryLink}
              className="group flex items-center gap-2 font-poppins font-medium transition-all duration-300 hover:text-[var(--hero-green-primary)] focus-visible:outline-2 focus-visible:outline-offset-3"
              style={{ fontSize: 11.5, letterSpacing: "0.04em", color: "var(--hero-text-secondary)" }}
            >
              <span
                className="flex items-center justify-center rounded-full group-hover:border-[var(--hero-green-primary)] transition-colors duration-300 shadow-sm"
                style={{ width: 30, height: 30, border: "1.5px solid var(--hero-divider)", background: "rgba(255,252,244,0.6)" }}
              >
                <Play size={10} fill="currentColor" className="ml-0.5" />
              </span>
              <span className="underline-offset-4 group-hover:underline">{current.ctaSecondaryLabel}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Mouse scroll indicator (Compact, desktop only) */}
      <div className="hidden md:flex relative z-20 justify-center mt-3 mb-1" aria-hidden="true">
        <svg width="18" height="28" viewBox="0 0 18 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0.75" y="0.75" width="16.5" height="26.5" rx="8.25" stroke="var(--hero-divider)" strokeWidth="1.2" />
          <rect x="7.5" y="5" width="3" height="6" rx="1.5" fill="var(--hero-green-sage)" className="animate-bounce" style={{ animationDuration: "2s" }} />
        </svg>
      </div>
    </section>
  );
}
