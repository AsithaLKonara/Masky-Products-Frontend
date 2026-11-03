"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, HelpCircle, MessageCircle, Sparkles, Truck, RotateCcw, CreditCard, Leaf } from "lucide-react";
import CategoryBar from "@/components/CategoryBar";
import Breadcrumbs from "@/components/Breadcrumbs";

interface FAQItem {
  question: string;
  answer: string;
  category: "shipping" | "returns" | "products" | "payments";
}

const FAQS: FAQItem[] = [
  {
    category: "products",
    question: "How do I rehydrate dehydrated mushrooms for cooking?",
    answer: "Place the dried mushrooms in a bowl of lukewarm water or warm broth for 10–15 minutes until plump and tender. Tip: Never discard the soaking liquid! It is concentrated liquid umami—strain and use it as a rich stock for soups, gravies, noodles, or risottos."
  },
  {
    category: "products",
    question: "What is the shelf life and proper storage for dehydrated products?",
    answer: "Masky dehydrated mushrooms have a shelf life of up to 12 months when kept sealed in a cool, dry place away from moisture and direct sunlight. Once opened, zip the pouch tightly or store in an airtight glass jar at ambient room temperature."
  },
  {
    category: "products",
    question: "Are your mushroom products 100% organic and chemical-free?",
    answer: "Yes, absolutely. Our gourmet mushrooms are cultivated in Sri Lanka under strict hygienic conditions without synthetic chemical pesticides, toxic sprays, or growth stimulants. They are dried at low temperatures to retain natural beta-glucans, vitamin D, and proteins."
  },
  {
    category: "shipping",
    question: "How long does islandwide delivery take across Sri Lanka?",
    answer: "Orders are dispatched within 24–48 hours. Standard courier delivery takes 1–2 business days within Colombo and 2–4 business days for all other regions across the island. Tracking details are sent directly via SMS and email."
  },
  {
    category: "shipping",
    question: "Can I order directly through WhatsApp or Daraz?",
    answer: "Yes! You can order directly through our web store, purchase through our verified Daraz store (https://s.daraz.lk/s.Z7xIF), or chat directly with our sales team on WhatsApp at 078 313 0967 for custom bulk or culinary orders."
  },
  {
    category: "returns",
    question: "What is your return and replacement policy?",
    answer: "Because our products are consumable food items, we cannot accept returns once the tamper-evident packaging seal has been broken. However, if your package arrives damaged or compromised during transit, please contact us within 48 hours for an immediate complimentary replacement."
  },
  {
    category: "payments",
    question: "What payment options do you support?",
    answer: "We support Visa, Mastercard, and American Express via OnePay, interest-free 3-month installments with Koko and Mintpay, direct bank transfer, and Cash on Delivery (COD) islandwide across Sri Lanka."
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
            Answers to common questions regarding mushroom rehydration, 12-month shelf life, organic cultivation, courier dispatch, and payments.
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
              <Leaf size={13} />
              <span>Mushrooms & Quality</span>
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
