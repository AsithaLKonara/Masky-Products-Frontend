
"use client";

import React from "react";
import Image from "next/image";
import { Scissors, Leaf, BadgeCheck, ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";

export default function ClientContent() {
  return (
    <main className="flex flex-col w-full min-h-screen bg-background pt-[83px]">
      
      {/* Section 1: Banner 1 */}
      <section className="relative flex flex-col items-center justify-center w-full min-h-[630px] bg-background px-4 md:px-[120px] py-[80px]">
        
        <div className="relative z-10 flex flex-col md:flex-row items-center w-full max-w-[1280px] gap-12 md:gap-[60px]">
          
          {/* Left Image Box */}
          <div className="flex-1 w-full aspect-[4/5] md:h-[600px] relative bg-stone-100 shadow-xl">
            <Image 
              src="/about/image1.jpeg"
              alt="Editorial"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          {/* Right Text Box */}
          <div className="flex-1 flex flex-col justify-center items-center md:items-start p-2 gap-6">
            <h2 className="font-signature text-5xl md:text-[64px] leading-[1.1] text-primary text-center md:text-left lowercase">
              your style deserves to shine
            </h2>
            <p className="font-poppins text-sm md:text-base leading-[1.8] text-[#5c5650] text-center md:text-left font-light tracking-wide max-w-[500px]">
              We believe fashion is more than just clothing—it's a form of self-expression. Our mission is to bring you timeless designs that combine comfort, elegance, and individuality, allowing you to curate a distinctive wardrobe.
            </p>
          </div>

        </div>
      </section>

      {/* Section A: The Craftsmanship */}
      <section className="flex flex-col items-center w-full bg-white px-4 md:px-[120px] py-[100px] border-t border-stone-100">
        <div className="w-full max-w-[1280px] flex flex-col items-center gap-16">
          
          <div className="flex flex-col items-center gap-4">
            <span className="font-poppins text-xs uppercase tracking-[0.2em] text-accent font-semibold">The Craftsmanship</span>
            <h2 className="font-poppins text-3xl md:text-[36px] font-normal text-primary text-center leading-tight">
              Designed with Intention
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 w-full">
            {/* Column 1 */}
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-stone-50 flex items-center justify-center mb-2">
                <Leaf size={28} strokeWidth={1.2} className="text-primary" />
              </div>
              <h3 className="font-poppins text-lg text-primary font-medium">Ethical Sourcing</h3>
              <p className="font-poppins text-sm text-stone-500 leading-relaxed font-light">
                We partner exclusively with suppliers who share our commitment to environmental sustainability and fair labor practices, ensuring every garment leaves a positive footprint.
              </p>
            </div>
            
            {/* Column 2 */}
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-stone-50 flex items-center justify-center mb-2">
                <Scissors size={28} strokeWidth={1.2} className="text-primary" />
              </div>
              <h3 className="font-poppins text-lg text-primary font-medium">Artisan Tailoring</h3>
              <p className="font-poppins text-sm text-stone-500 leading-relaxed font-light">
                Manufactured locally in Sri Lanka, our collections are brought to life by skilled artisans who pay meticulous attention to detail, stitching, and finishing.
              </p>
            </div>

            {/* Column 3 */}
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-stone-50 flex items-center justify-center mb-2">
                <BadgeCheck size={28} strokeWidth={1.2} className="text-primary" />
              </div>
              <h3 className="font-poppins text-lg text-primary font-medium">Enduring Quality</h3>
              <p className="font-poppins text-sm text-stone-500 leading-relaxed font-light">
                Luxury isn't just about appearance; it's about longevity. We select premium fabrics designed to drape beautifully and withstand the test of time.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Section B: Core Philosophy */}
      <section className="flex flex-col items-center w-full bg-primary px-4 md:px-[120px] py-[120px]">
        <div className="w-full max-w-[800px] flex flex-col items-center text-center gap-8">
          <p className="font-inria italic text-2xl md:text-[36px] leading-relaxed text-background font-light">
            "True luxury is the quiet confidence of wearing something made exclusively with passion and purpose."
          </p>
          <div className="w-12 h-[1px] bg-accent mt-4"></div>
          <span className="font-poppins text-sm uppercase tracking-widest text-stone-400 mt-2">MASKY PRODUCT</span>
        </div>
      </section>

      {/* Section 2: Banner 2 */}
      <section className="relative flex flex-col items-center justify-center w-full min-h-[500px] bg-stone-300 px-4 md:px-[120px] py-[100px]">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/about/bg.jpeg"
            alt="Why Choose Us Background"
            fill
            sizes="100vw"
            className="object-cover"
          />
          {/* Overlay to ensure text readability against any image */}
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]" />
        </div>

        <div className="relative z-10 flex flex-col items-center w-full max-w-[1040px] gap-[24px]">
          <h2 className="font-signature text-5xl md:text-6xl leading-tight text-primary text-center">
            Why choose us
          </h2>
          <p className="font-poppins text-sm md:text-[17px] leading-[1.8] text-[#33302d] text-center max-w-[904px] font-light">
            With a focus on comfort and practicality, our designs are thoughtfully created to enhance the everyday experience, allowing our customers to express their personal style effortlessly. Whether it's a cozy knit for a casual coffee date or a statement dress for a special event, we serve as the go-to destination for individuals seeking clothing that reflects their lifestyle. At Masky Product, we are committed to fostering a community that celebrates individuality and embraces the philosophy that fashion should be accessible to all. Join us on this exciting journey as we redefine fashion, offering a seamless fusion of essentials for a lifestyle that is stylish, versatile, and uniquely you.
          </p>
        </div>
      </section>

      {/* Section C: Visit Our Studio */}
      <section className="flex flex-col items-center w-full bg-stone-100 px-4 md:px-[120px] py-[80px]">
        <div className="w-full max-w-[1280px] bg-white border border-stone-200 p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12">
          
          <div className="flex flex-col gap-4 flex-1">
            <h2 className="font-poppins text-3xl md:text-[36px] font-normal text-primary leading-tight">
              Experience Masky Product in Person
            </h2>
            <p className="font-poppins text-sm text-stone-500 leading-relaxed font-light max-w-[500px]">
              Book a private consultation at our Colombo studio. Our personal stylists will guide you through our latest collections and help you curate a wardrobe tailored to your lifestyle.
            </p>
            <div className="flex items-center gap-2 text-accent mt-2">
              <MapPin size={18} />
              <span className="font-poppins text-sm font-medium">Colombo Flagship Studio, Sri Lanka</span>
            </div>
          </div>

          <div className="flex-shrink-0">
            <Link 
              href="/contact" 
              className="flex items-center gap-3 bg-primary hover:bg-[#33302d] transition-colors text-white px-8 py-4 font-poppins font-medium text-sm uppercase tracking-wide rounded-sm"
            >
              Book an Appointment <ArrowRight size={18} />
            </Link>
          </div>

        </div>
      </section>

    </main>
  );
}
