"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Leaf, BadgeCheck, Sparkles, ArrowRight, MapPin, Clock, ShieldCheck, HeartHandshake, UtensilsCrossed, Sun } from "lucide-react";
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
                alt="Masky Product Gourmet Mushrooms Harvest"
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
                  <p className="font-poppins text-xs font-semibold text-[#203C2B] tracking-wide uppercase">Organic Harvest</p>
                  <p className="font-poppins text-xs text-[#5c5650] font-light">Cultivated & Dehydrated in Sri Lanka</p>
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
              Pure Earth, Intense Umami, Conscious Harvest.
            </h1>

            <p className="font-poppins text-base text-[#5c5650] leading-relaxed font-light">
              Masky Product was born out of an appreciation for natural culinary purity and the restorative gifts of the fungal kingdom. We believe gourmet nourishment shouldn't be complicated—it should celebrate earthy flavors, patient dehydration craftsmanship, and wholesome organic nutrients.
            </p>

            <p className="font-poppins text-base text-[#5c5650] leading-relaxed font-light">
              From fresh oyster mushrooms to sun-dried dehydrated varieties and ready-to-eat delicacies, every harvest is gently cured in controlled, hygienic batches in Sri Lanka, locking in peak umami, beta-glucans, and plant proteins without artificial additives or preservatives.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#203C2B] hover:bg-[#15271C] text-[#FFFCF4] font-poppins text-sm font-medium tracking-wide shadow-md hover:shadow-lg transition-all"
              >
                Explore Products <ArrowRight size={16} />
              </Link>
              <a
                href="https://wa.me/94783130967"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 text-[#128C7E] font-poppins text-sm font-medium tracking-wide transition-all"
              >
                WhatsApp Inquiry (078 313 0967)
              </a>
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
              Grown & Dehydrated with Quiet Intention
            </h2>
            <p className="font-poppins text-sm text-[#5c5650] font-light mt-3">
              We hold ourselves to uncompromising standards of organic cultivation, nutritional preservation, and culinary delight.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1 */}
            <div className="bg-[#FFFCF4]/80 backdrop-blur-md border border-[#DCDCCB] rounded-3xl p-7 flex flex-col items-start gap-4 hover:border-[#71865B]/40 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#71865B]/15 text-[#203C2B] flex items-center justify-center">
                <Leaf size={22} strokeWidth={1.5} />
              </div>
              <h3 className="font-poppins text-base font-semibold text-[#203C2B]">
                100% Organically Grown
              </h3>
              <p className="font-poppins text-xs sm:text-sm text-[#5c5650] leading-relaxed font-light">
                Nurtured in pristine local microclimates free of synthetic chemical pesticides, fertilizers, or growth hormones.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="bg-[#FFFCF4]/80 backdrop-blur-md border border-[#DCDCCB] rounded-3xl p-7 flex flex-col items-start gap-4 hover:border-[#71865B]/40 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#71865B]/15 text-[#203C2B] flex items-center justify-center">
                <Sun size={22} strokeWidth={1.5} />
              </div>
              <h3 className="font-poppins text-base font-semibold text-[#203C2B]">
                Low-Temp Dehydration
              </h3>
              <p className="font-poppins text-xs sm:text-sm text-[#5c5650] leading-relaxed font-light">
                Slow drying at controlled gentle temperatures preserves deep savory umami, delicate aroma, and heat-sensitive vitamins.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="bg-[#FFFCF4]/80 backdrop-blur-md border border-[#DCDCCB] rounded-3xl p-7 flex flex-col items-start gap-4 hover:border-[#71865B]/40 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#71865B]/15 text-[#203C2B] flex items-center justify-center">
                <UtensilsCrossed size={22} strokeWidth={1.5} />
              </div>
              <h3 className="font-poppins text-base font-semibold text-[#203C2B]">
                Chef-Grade Versatility
              </h3>
              <p className="font-poppins text-xs sm:text-sm text-[#5c5650] leading-relaxed font-light">
                Rehydrates in just 10 minutes into succulent textures that enhance soups, gravies, risottos, stir-fries, and teas.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="bg-[#FFFCF4]/80 backdrop-blur-md border border-[#DCDCCB] rounded-3xl p-7 flex flex-col items-start gap-4 hover:border-[#71865B]/40 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#71865B]/15 text-[#203C2B] flex items-center justify-center">
                <BadgeCheck size={22} strokeWidth={1.5} />
              </div>
              <h3 className="font-poppins text-base font-semibold text-[#203C2B]">
                12-Month Shelf Life
              </h3>
              <p className="font-poppins text-xs sm:text-sm text-[#5c5650] leading-relaxed font-light">
                Hygienically heat-sealed in airtight moisture-barrier packs ensuring fresh pantry longevity without preservatives.
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
                The Harvest Creed
              </span>
              <p className="font-signature italic text-2xl sm:text-3xl lg:text-4xl leading-relaxed text-[#FFFCF4] font-light">
                &ldquo;True culinary luxury is honoring nature's fungal kingdom—bringing earthy aroma, unhurried craft, and wholesome vitality to every table.&rdquo;
              </p>
              <div className="w-16 h-[1.5px] bg-[#D9C99B]/60 my-2" />
              <div className="flex items-center gap-2 text-xs font-poppins uppercase tracking-widest text-[#FFFCF4]/70">
                <span>MASKY PRODUCT</span>
                <span>•</span>
                <span>SRI LANKAN ARTISANAL HARVEST</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Ordering & Islandwide Delivery */}
        <section className="mb-16">
          <div className="bg-[#FFFCF4]/90 backdrop-blur-md border border-[#DCDCCB] rounded-3xl p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-10 shadow-sm">
            <div className="flex flex-col gap-4 max-w-xl">
              <div className="inline-flex items-center gap-2 text-[#71865B] text-xs font-poppins font-semibold uppercase tracking-widest">
                <MapPin size={14} />
                Colombo & Islandwide Distribution
              </div>
              <h2 className="font-signature text-3xl sm:text-4xl text-[#203C2B] font-normal leading-tight">
                Order Direct or Shop on Daraz
              </h2>
              <p className="font-poppins text-sm text-[#5c5650] leading-relaxed font-light">
                Order directly from our web boutique, chat with us on WhatsApp for custom bulk or wholesale orders, or visit our verified flagship store on Daraz.
              </p>
              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-[#5c5650] font-poppins">
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-[#71865B]" />
                  <span>Dispatched in 24 - 48 Hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-[#71865B]" />
                  <span>Islandwide Secure Courier</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full lg:w-auto">
              <Link
                href="/shop"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-[#203C2B] hover:bg-[#15271C] text-[#FFFCF4] font-poppins text-sm font-medium tracking-wide shadow-md hover:shadow-lg transition-all"
              >
                Shop All Products <ArrowRight size={16} />
              </Link>
              <a
                href="https://s.daraz.lk/s.Z7xIF"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-full bg-[#F85606]/15 hover:bg-[#F85606] text-[#F85606] hover:text-white border border-[#F85606]/40 font-poppins text-sm font-medium tracking-wide transition-all"
              >
                Daraz Store <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
