"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, HelpCircle, MessageCircle, Sparkles, Truck, RotateCcw, CreditCard, Shirt } from "lucide-react";
import CategoryBar from "@/components/CategoryBar";
import Breadcrumbs from "@/components/Breadcrumbs";

interface FAQItem {
  question: string;
  answer: string;
  category: "shipping" | "returns" | "products" | "payments";
}

const FAQS: FAQItem[] = [
  {
    category: "shipping",
    question: "How long does delivery take across Sri Lanka?",
    answer: "We partner with trusted express couriers (including Fardar Express). Standard deliveries within Colombo 1–15 arrive within 1–2 working days. Greater Colombo suburbs and outstation islandwide locations typically arrive within 2–4 working days."
  },
  {
    category: "shipping",
    question: "Is islandwide delivery complimentary?",
    answer: "Yes, all orders of Rs. 15,000 or above automatically qualify for complimentary islandwide delivery. For orders below this threshold, a flat delivery fee of Rs. 400 is calculated at checkout."
  },
  {
    category: "returns",
    question: "What is your return and exchange policy?",
    answer: "We offer a 7-day hassle-free exchange privilege on all unworn, unwashed garments retaining their original luxury tags. You can initiate a return or size exchange directly through our online Returns Portal with your order number and email."
  },
  {
    category: "returns",
    question: "How do I request a size exchange?",
    answer: "Simply visit /returns, enter your order reference and email, select the piece requiring a different size, and choose 'Size Too Small' or 'Size Too Large'. Our concierge team will arrange courier doorstep exchange."
  },
  {
    category: "products",
    question: "What fabrics and materials are used in your creations?",
    answer: "Our wardrobe is crafted from natural botanical textiles including pure linens, organic cotton blends, mulberry silk blends, and ethically sourced Italian full-grain leathers, prioritizing breathable tactile comfort and durability."
  },
  {
    category: "products",
    question: "How do I find my precise fit?",
    answer: "Each product details page includes an interactive Size Guide with detailed bust, waist, hip, and length measurements in both inches and centimeters. When between sizes, we recommend sizing up for a relaxed draped fit."
  },
  {
    category: "payments",
    question: "Can I pay in interest-free installments?",
    answer: "Yes, we proudly support Koko and Mintpay at checkout. These allow you to split your purchase total into 3 equal monthly installments with zero interest and zero hidden fees."
  },
  {
    category: "payments",
    question: "What other payment methods are accepted?",
    answer: "In addition to installment plans (Koko, Mintpay), we accept Visa, Mastercard, and American Express via OnePay, as well as Cash on Delivery (COD) islandwide across Sri Lanka."
  }
];

export default function ClientContent() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs = selectedCategory === "all" 
    ? FAQS 
    : FAQS.filter(f => f.category === selectedCategory);

  const toggleAccordion = (idx: number) => {
    setOpenIndex(prev => prev === idx ? null : idx);
  };

  return (
    <main className="flex flex-col items-center w-full min-h-screen bg-[#FEF6E4] pt-[84px] text-[#203C2B]">
      {/* Sub Navbar */}
      <CategoryBar />

      {/* Hero Header */}
      <section className="w-full bg-gradient-to-b from-[#FFFDF7] via-[#FEF6E4] to-[#F5ECE0] border-b border-[#DCDCCB]/70 py-12 md:py-16 px-4 sm:px-6 lg:px-12 relative overflow-hidden">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#71865B]/15 border border-[#71865B]/30 text-[#203C2B]">
            <HelpCircle size={12} className="text-[#71865B]" />
            <span className="font-poppins text-[10px] font-semibold tracking-[0.18em] uppercase">
              Client Care & Inquiries
            </span>
          </div>

          <h1 className="font-signature font-bold text-3xl sm:text-4xl md:text-5xl text-[#203C2B] tracking-tight">
            Frequently Asked Questions
          </h1>

          <p className="font-poppins text-xs sm:text-sm text-[#62695A] leading-relaxed max-w-lg">
            Answers to common questions regarding delivery timescales, size exchanges, bespoke textiles, and payment options.
          </p>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap justify-center pt-4">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full font-poppins text-xs transition-all cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-[#203C2B] text-[#FFFCF4] shadow-sm font-semibold"
                  : "bg-white/80 border border-[#DCDCCB] text-[#203C2B] hover:bg-white"
              }`}
            >
              All Topics
            </button>
            <button
              onClick={() => setSelectedCategory("shipping")}
              className={`px-4 py-2 rounded-full font-poppins text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === "shipping"
                  ? "bg-[#203C2B] text-[#FFFCF4] shadow-sm font-semibold"
                  : "bg-white/80 border border-[#DCDCCB] text-[#203C2B] hover:bg-white"
              }`}
            >
              <Truck size={13} />
              <span>Delivery</span>
            </button>
            <button
              onClick={() => setSelectedCategory("returns")}
              className={`px-4 py-2 rounded-full font-poppins text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === "returns"
                  ? "bg-[#203C2B] text-[#FFFCF4] shadow-sm font-semibold"
                  : "bg-white/80 border border-[#DCDCCB] text-[#203C2B] hover:bg-white"
              }`}
            >
              <RotateCcw size={13} />
              <span>Returns & Exchanges</span>
            </button>
            <button
              onClick={() => setSelectedCategory("products")}
              className={`px-4 py-2 rounded-full font-poppins text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === "products"
                  ? "bg-[#203C2B] text-[#FFFCF4] shadow-sm font-semibold"
                  : "bg-white/80 border border-[#DCDCCB] text-[#203C2B] hover:bg-white"
              }`}
            >
              <Shirt size={13} />
              <span>Sizing & Textiles</span>
            </button>
            <button
              onClick={() => setSelectedCategory("payments")}
              className={`px-4 py-2 rounded-full font-poppins text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === "payments"
                  ? "bg-[#203C2B] text-[#FFFCF4] shadow-sm font-semibold"
                  : "bg-white/80 border border-[#DCDCCB] text-[#203C2B] hover:bg-white"
              }`}
            >
              <CreditCard size={13} />
              <span>Payments</span>
            </button>
          </div>
        </div>
      </section>

      {/* Tool Bar & Breadcrumbs */}
      <div className="w-full bg-[#FFFCF4]/60 border-b border-[#DCDCCB]/60 backdrop-blur-xs">
        <div className="flex flex-row justify-between items-center w-full max-w-7xl mx-auto h-12 px-4 sm:px-6 lg:px-12">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "FAQ" }]} />
          <span className="font-poppins text-xs text-[#62695A] tracking-wider uppercase">Help & Guidance</span>
        </div>
      </div>

      {/* FAQ Accordions Section */}
      <section className="flex flex-col items-center w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-12 pb-24">
        <div className="flex flex-col gap-3.5 w-full">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className="bg-[#FFFCF4]/90 backdrop-blur-md rounded-2xl border border-[#DCDCCB] overflow-hidden transition-all shadow-2xs"
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/50 transition-colors"
                >
                  <span className="font-signature font-bold text-lg sm:text-xl text-[#203C2B]">
                    {faq.question}
                  </span>
                  <div className={`w-8 h-8 rounded-full bg-white border border-[#DCDCCB] flex items-center justify-center shrink-0 text-[#203C2B] transition-transform duration-300 ${isOpen ? 'rotate-180 bg-[#203C2B] text-[#FFFCF4]' : ''}`}>
                    <ChevronDown size={16} />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm font-poppins text-[#62695A] leading-relaxed border-t border-[#DCDCCB]/50 animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Concierge Assistance Card */}
        <div className="mt-12 w-full p-8 rounded-3xl bg-gradient-to-br from-[#183123] to-[#203C2B] text-[#FFFCF4] text-center flex flex-col items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#FFFCF4]/10 border border-[#D9C99B]/30 flex items-center justify-center text-[#D9C99B]">
            <MessageCircle size={22} />
          </div>
          <h3 className="font-signature font-bold text-2xl text-[#FFFCF4]">
            Still have an inquiry?
          </h3>
          <p className="font-poppins text-xs sm:text-sm text-[#FFFCF4]/80 max-w-md leading-relaxed">
            Our atelier concierge team is pleased to assist with bespoke sizing questions, order modifications, or delivery details.
          </p>
          <Link
            href="/contact"
            className="px-8 py-3.5 bg-[#FFFCF4] text-[#203C2B] hover:bg-[#D9C99B] transition-all font-poppins font-semibold text-xs uppercase tracking-widest rounded-full shadow-sm"
          >
            Contact Client Concierge
          </Link>
        </div>
      </section>
    </main>
  );
}
