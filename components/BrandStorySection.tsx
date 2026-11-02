import Image from "next/image";
import Link from "next/link";
import { Leaf, ShieldCheck, Sparkles } from "lucide-react";

export default function BrandStorySection() {
  return (
    <section 
      aria-label="About Our Botanical Origin"
      className="relative flex justify-center items-center px-4 md:px-8 lg:px-[120px] py-16 md:py-24 w-full overflow-hidden m-0"
    >
      {/* Background Image with Dark Forest Botanical Veil */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <Image
          src="/victor-birai-_AZPhkkrHL8-unsplash.jpg"
          alt="Ancient botanical grove background"
          fill
          priority={false}
          sizes="100vw"
          className="object-cover scale-105"
        />
        <div 
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, rgba(14,26,19,0.86) 0%, rgba(20,38,27,0.80) 50%, rgba(10,20,14,0.92) 100%)",
            backdropFilter: "blur(4px)",
          }}
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between w-full max-w-[1140px] gap-8 md:gap-12">
        
        {/* Left Floating Image Showcase - Clean cutout floating naturally without blur box */}
        <div className="relative flex-1 w-full max-w-[480px] flex items-center justify-center">
          <div className="relative w-full aspect-square max-w-[440px] flex items-center justify-center transition-transform duration-500 hover:scale-[1.03]">
            {/* Cutout Oyster Mushroom Hero Image */}
            <div className="relative w-full h-[300px] sm:h-[360px] md:h-[420px] flex items-center justify-center">
              <Image
                src="/about-mushroom.webp"
                alt="Artisan Oyster Mushroom Botanical Cutout"
                fill
                priority={true}
                unoptimized={true}
                className="object-contain drop-shadow-[0_24px_45px_rgba(0,0,0,0.6)] select-none"
              />
            </div>
          </div>
        </div>

        {/* Right Story Card (Frosted Glass) */}
        <div 
          className="flex-1 w-full max-w-[560px] rounded-3xl p-6 sm:p-8 md:p-10 flex flex-col justify-center"
          style={{
            background: "rgba(255, 252, 244, 0.12)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255, 255, 255, 0.22)",
            boxShadow: "0 24px 60px rgba(0, 0, 0, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.3)",
          }}
        >
          {/* Over-title */}
          <span className="font-poppins uppercase tracking-[0.24em] text-[10px] font-medium text-[#A8B995] mb-2 block">
            THE BOTANICAL ETHOS
          </span>

          {/* Main Headline */}
          <h2 className="font-inria font-normal text-3xl sm:text-4xl md:text-5xl text-[#FFFCF4] tracking-tight leading-[1.12] mb-3">
            Purity from Earth to Essence
          </h2>

          <div className="w-12 h-[1.5px] bg-[#A8B995]/50 my-2" />

          {/* Luxury Quote */}
          <p className="font-inria italic text-base sm:text-lg md:text-xl text-[#DDE5CC] leading-relaxed my-2">
            &ldquo;True luxury is born when human patience honours the natural rhythms of the earth.&rdquo;
          </p>

          {/* Story Narrative */}
          <p className="font-poppins font-light text-xs sm:text-sm text-[#FFFCF4]/80 leading-relaxed mt-2 mb-6">
            At our core, every harvest is gently nurtured in pesticide-free microclimates and cold-processed to retain full bio-active integrity. We bridge timeless culinary traditions with modern gourmet standards, bringing restorative nature directly to your table.
          </p>

          {/* 3 Pillar Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-6">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
              <Leaf size={14} className="text-[#A8B995]" />
              <span className="font-poppins text-[11px] text-[#FFFCF4]">100% Organic</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
              <ShieldCheck size={14} className="text-[#A8B995]" />
              <span className="font-poppins text-[11px] text-[#FFFCF4]">Zero Additives</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
              <Sparkles size={14} className="text-[#A8B995]" />
              <span className="font-poppins text-[11px] text-[#FFFCF4]">Artisan Crafted</span>
            </div>
          </div>

          {/* Action CTA */}
          <div>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 font-poppins font-medium text-xs uppercase tracking-[0.14em] text-[#FFFCF4] px-6 py-3 rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #71865B 0%, #4D5E3C 100%)",
                boxShadow: "0 6px 20px rgba(113,134,91,0.35)",
              }}
            >
              <span>Discover Our Story</span>
              <span>→</span>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
