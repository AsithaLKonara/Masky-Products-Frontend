"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Scissors, Leaf, BadgeCheck, Sparkles, ArrowRight, MapPin, Clock, ShieldCheck, HeartHandshake } from "lucide-react";
import CategoryBar from "@/components/CategoryBar";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function ClientContent() {
  return (
    <main className="flex flex-col w-full min-h-screen bg-[#FEF6E4]">
      {/* Category Sub-Navigation */}
      <CategoryBar />

      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb Trail */}
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Our Story" }
          ]}
          className="mb-8"
        />

        {/* Section 1: Hero Manifesto */}
        <section className="relative flex flex-col lg:flex-row items-center gap-12 lg:gap-16 pb-16 lg:pb-24">
          {/* Left: Editorial Image Box */}
          <div className="w-full lg:w-1/2 relative">
            <div className="relative aspect-[4/5] w-full rounded-3xl overflow-hidden bg-[#EAE8DC] border border-[#DCDCCB] shadow-lg">
              <Image
                src="/victor-birai-_AZPhkkrHL8-unsplash.jpg"
                alt="Masky Product Editorial Portrait"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#203C2B]/40 via-transparent to-transparent pointer-events-none" />
              
              {/* Floating Frosted Pill Badge */}
              <div className="absolute bottom-6 left-6 right-6 sm:right-auto bg-[#FFFCF4]/90 backdrop-blur-md border border-[#DCDCCB] rounded-2xl p-4 shadow-md flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#71865B]/15 text-[#203C2B] flex items-center justify-center shrink-0">
                  <Sparkles size={18} />
                </div>
                <div>
                  <p className="font-poppins text-xs font-semibold text-[#203C2B] tracking-wide uppercase">Artisan Studio</p>
                  <p className="font-poppins text-xs text-[#5c5650] font-light">Crafted locally in Colombo, Sri Lanka</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Editorial Narrative */}
          <div className="w-full lg:w-1/2 flex flex-col items-start gap-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#71865B]/15 text-[#203C2B] border border-[#71865B]/30 text-xs font-poppins font-medium uppercase tracking-widest">
              <Leaf size={13} className="text-[#71865B]" />
              The Masky Philosophy
            </div>

            <h1 className="font-signature text-4xl sm:text-5xl lg:text-6xl text-[#203C2B] leading-[1.1] tracking-tight">
              Elevated Silhouettes, Conscious Craftsmanship.
            </h1>

            <p className="font-poppins text-base text-[#5c5650] leading-relaxed font-light">
              Masky Product was born out of an appreciation for natural tactile simplicity. We believe modern luxury shouldn't shout—it should whisper through balanced drape, organic textures, and intentional cuts that move effortlessly with your daily rhythm.
            </p>

            <p className="font-poppins text-base text-[#5c5650] leading-relaxed font-light">
              Every garment in our capsule collections is tailored in small, disciplined batches in Sri Lanka, championing fair local craftsmanship while eliminating the excess and waste common to fast fashion.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#203C2B] hover:bg-[#15271C] text-[#FFFCF4] font-poppins text-sm font-medium tracking-wide shadow-md hover:shadow-lg transition-all"
              >
                Explore Capsule Collections <ArrowRight size={16} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#FFFCF4]/80 hover:bg-[#FFFCF4] border border-[#DCDCCB] text-[#203C2B] font-poppins text-sm font-medium tracking-wide transition-all"
              >
                Private Atelier Consultation
              </Link>
            </div>
          </div>
        </section>

        {/* Section 2: Craftsmanship Pillars */}
        <section className="py-16 border-t border-[#DCDCCB]/60">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-14">
            <span className="font-poppins text-xs uppercase tracking-[0.2em] text-[#71865B] font-semibold mb-2">
              Our Principles
            </span>
            <h2 className="font-signature text-3xl sm:text-4xl text-[#203C2B] font-normal">
              Designed with Quiet Intention
            </h2>
            <p className="font-poppins text-sm text-[#5c5650] font-light mt-3">
              We hold ourselves to uncompromising standards of ethical production, material integrity, and timeless longevity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1 */}
            <div className="bg-[#FFFCF4]/80 backdrop-blur-md border border-[#DCDCCB] rounded-3xl p-7 flex flex-col items-start gap-4 hover:border-[#71865B]/40 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#71865B]/15 text-[#203C2B] flex items-center justify-center">
                <Leaf size={22} strokeWidth={1.5} />
              </div>
              <h3 className="font-poppins text-base font-semibold text-[#203C2B]">
                Ethical Sourcing
              </h3>
              <p className="font-poppins text-xs sm:text-sm text-[#5c5650] leading-relaxed font-light">
                Natural linens, organic cottons, and breathable botanicals responsibly harvested and dyed with mindful ecological care.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="bg-[#FFFCF4]/80 backdrop-blur-md border border-[#DCDCCB] rounded-3xl p-7 flex flex-col items-start gap-4 hover:border-[#71865B]/40 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#71865B]/15 text-[#203C2B] flex items-center justify-center">
                <Scissors size={22} strokeWidth={1.5} />
              </div>
              <h3 className="font-poppins text-base font-semibold text-[#203C2B]">
                Artisan Tailoring
              </h3>
              <p className="font-poppins text-xs sm:text-sm text-[#5c5650] leading-relaxed font-light">
                Patterned and stitched locally by skilled Sri Lankan artisans who honor precise finishing and durable french seams.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="bg-[#FFFCF4]/80 backdrop-blur-md border border-[#DCDCCB] rounded-3xl p-7 flex flex-col items-start gap-4 hover:border-[#71865B]/40 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#71865B]/15 text-[#203C2B] flex items-center justify-center">
                <BadgeCheck size={22} strokeWidth={1.5} />
              </div>
              <h3 className="font-poppins text-base font-semibold text-[#203C2B]">
                Enduring Quality
              </h3>
              <p className="font-poppins text-xs sm:text-sm text-[#5c5650] leading-relaxed font-light">
                Quiet luxury that outlives fleeting micro-trends, designed to age with graceful patina and retain structural elegance.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="bg-[#FFFCF4]/80 backdrop-blur-md border border-[#DCDCCB] rounded-3xl p-7 flex flex-col items-start gap-4 hover:border-[#71865B]/40 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#71865B]/15 text-[#203C2B] flex items-center justify-center">
                <Sparkles size={22} strokeWidth={1.5} />
              </div>
              <h3 className="font-poppins text-base font-semibold text-[#203C2B]">
                Small Capsule Drops
              </h3>
              <p className="font-poppins text-xs sm:text-sm text-[#5c5650] leading-relaxed font-light">
                Intentional, limited edition drops ensure each piece remains distinctive while virtually eliminating deadstock waste.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Deep Forest Philosophy Banner */}
        <section className="my-16">
          <div className="relative rounded-3xl bg-gradient-to-br from-[#203C2B] via-[#2A4836] to-[#15271C] text-[#FEF6E4] p-10 sm:p-14 lg:p-20 overflow-hidden shadow-xl text-center flex flex-col items-center">
            {/* Subtle background glow */}
            <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#71865B]/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#D9C99B]/15 blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl flex flex-col items-center gap-6">
              <span className="font-poppins text-xs uppercase tracking-[0.25em] text-[#D9C99B] font-semibold">
                The Atelier Creed
              </span>
              <p className="font-signature italic text-2xl sm:text-3xl lg:text-4xl leading-relaxed text-[#FFFCF4] font-light">
                &ldquo;True luxury is the quiet confidence of wearing garments crafted with reverence for human touch, conscious materials, and timeless proportion.&rdquo;
              </p>
              <div className="w-16 h-[1.5px] bg-[#D9C99B]/60 my-2" />
              <div className="flex items-center gap-2 text-xs font-poppins uppercase tracking-widest text-[#FFFCF4]/70">
                <span>MASKY PRODUCT ATELIER</span>
                <span>•</span>
                <span>EST. SRI LANKA</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Experience the Atelier in Person */}
        <section className="mb-16">
          <div className="bg-[#FFFCF4]/90 backdrop-blur-md border border-[#DCDCCB] rounded-3xl p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-10 shadow-sm">
            <div className="flex flex-col gap-4 max-w-xl">
              <div className="inline-flex items-center gap-2 text-[#71865B] text-xs font-poppins font-semibold uppercase tracking-widest">
                <MapPin size={14} />
                Colombo Flagship Studio
              </div>
              <h2 className="font-signature text-3xl sm:text-4xl text-[#203C2B] font-normal leading-tight">
                Experience Masky Product in Person
              </h2>
              <p className="font-poppins text-sm text-[#5c5650] leading-relaxed font-light">
                Book a private styling consultation at our Colombo atelier. Our wardrobe specialists will guide you through touchable textile swatches, bespoke fit adjustments, and capsule curation over artisan Ceylon tea.
              </p>
              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-[#5c5650] font-poppins">
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-[#71865B]" />
                  <span>Mon - Sat: 10:00 AM - 7:00 PM</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-[#71865B]" />
                  <span>By Appointment & Walk-Ins</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full lg:w-auto">
              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#203C2B] hover:bg-[#15271C] text-[#FFFCF4] font-poppins text-sm font-medium tracking-wide shadow-md hover:shadow-lg transition-all"
              >
                Reserve Consultation <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
