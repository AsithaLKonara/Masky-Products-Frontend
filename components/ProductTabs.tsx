"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Truck, Clock, ShieldCheck, ArrowRight, Sparkles, HelpCircle } from "lucide-react";
import ProductReviews from "./ProductReviews";

type TabName = "Product Details" | "Shipping Information" | "FAQs" | "Reviews";

export default function ProductTabs({ description, excerpt, productId }: { description?: string | null, excerpt?: string | null, productId: string }) {
  const [activeTab, setActiveTab] = useState<TabName>("Product Details");

  const tabs: TabName[] = ["Product Details", "Reviews", "Shipping Information", "FAQs"];

  return (
    <div className="flex flex-col w-full mt-12 md:mt-20">
      
      {/* Pills Switcher */}
      <div className="flex justify-center w-full">
        <div className="inline-flex flex-wrap justify-center items-center gap-1.5 p-1.5 rounded-full bg-white/70 backdrop-blur-md border border-[#DCDCCB] shadow-2xs">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 sm:px-6 sm:py-2.5 rounded-full font-poppins text-xs sm:text-sm font-medium tracking-wide transition-all duration-300 cursor-pointer ${
                activeTab === tab 
                  ? "bg-[#203C2B] text-[#FFFCF4] shadow-sm font-semibold" 
                  : "text-[#62695A] hover:text-[#203C2B] hover:bg-[#203C2B]/5"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs Content */}
      <div className="flex flex-col w-full py-8 md:py-12">
        {activeTab === "Product Details" && (
          <div className="bg-[#FFFCF4]/80 backdrop-blur-md rounded-3xl border border-[#DCDCCB]/80 p-6 sm:p-10 max-w-4xl mx-auto w-full shadow-xs animate-in fade-in duration-300">
            {excerpt && (
              <div className="mb-6 pb-6 border-b border-[#DCDCCB]/60 text-center">
                <span className="font-signature font-bold text-xl sm:text-2xl text-[#203C2B] block">
                  {excerpt}
                </span>
              </div>
            )}
            
            {description ? (
              <div 
                className="font-poppins font-normal text-sm sm:text-base leading-[1.8] text-[#555E4E] prose prose-stone max-w-none"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            ) : (
              <div className="text-center py-8">
                <p className="font-poppins text-sm text-[#71865B]">
                  No detailed description available for this harvest selection.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "Shipping Information" && (
          <div className="flex flex-col max-w-4xl mx-auto w-full gap-8 animate-in fade-in duration-300">
            <div className="bg-[#FFFCF4]/80 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-[#DCDCCB]/80 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#71865B]/15 flex items-center justify-center text-[#203C2B]">
                  <Truck size={20} />
                </div>
                <h3 className="font-signature font-bold text-2xl text-[#203C2B]">
                  Bespoke Islandwide Delivery
                </h3>
              </div>
              <p className="font-poppins text-sm text-[#62695A] leading-relaxed mb-8">
                We partner with trusted express couriers to deliver each order in signature packaging directly to your doorstep across Sri Lanka.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="p-5 rounded-2xl bg-white/60 border border-[#DCDCCB]/60 flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#203C2B]/10 flex items-center justify-center text-[#203C2B] shrink-0">
                    <Clock size={16} />
                  </div>
                  <div>
                    <h4 className="font-poppins font-semibold text-sm text-[#203C2B]">Delivery Times</h4>
                    <p className="font-poppins text-xs text-[#62695A] mt-1 leading-relaxed">
                      Colombo 1-15: 1–2 Working Days<br/>Islandwide & Outstation: 2–4 Working Days
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/60 border border-[#DCDCCB]/60 flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#203C2B]/10 flex items-center justify-center text-[#203C2B] shrink-0">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <h4 className="font-poppins font-semibold text-sm text-[#203C2B]">Tracked Parcel</h4>
                    <p className="font-poppins text-xs text-[#62695A] mt-1 leading-relaxed">
                      Real-time live SMS tracking and direct driver dispatch updates for every parcel.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Link 
                  href="/track-order"
                  className="inline-flex items-center gap-2 font-poppins font-medium text-xs uppercase tracking-widest text-[#FFFCF4] bg-[#203C2B] px-7 py-3.5 rounded-full hover:bg-[#2d523c] transition-all shadow-sm"
                >
                  Track an Order <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Reviews" && (
          <div className="bg-[#FFFCF4]/80 backdrop-blur-md rounded-3xl border border-[#DCDCCB]/80 p-6 sm:p-10 max-w-4xl mx-auto w-full shadow-xs animate-in fade-in duration-300">
            <ProductReviews productId={productId} />
          </div>
        )}

        {activeTab === "FAQs" && (
          <div className="flex flex-col max-w-3xl mx-auto w-full gap-4 animate-in fade-in duration-300">
            <div className="bg-[#FFFCF4]/80 backdrop-blur-md rounded-2xl border border-[#DCDCCB]/80 p-5 shadow-xs">
              <h4 className="font-signature font-bold text-lg text-[#203C2B] mb-2 flex items-center gap-2">
                <HelpCircle size={16} className="text-[#71865B]" /> How long does delivery take?
              </h4>
              <p className="font-poppins text-xs sm:text-sm text-[#62695A] leading-relaxed pl-6">
                Deliveries within Colombo take 1-2 business days. Outstation islandwide delivery typically takes 2-4 business days.
              </p>
            </div>

            <div className="bg-[#FFFCF4]/80 backdrop-blur-md rounded-2xl border border-[#DCDCCB]/80 p-5 shadow-xs">
              <h4 className="font-signature font-bold text-lg text-[#203C2B] mb-2 flex items-center gap-2">
                <HelpCircle size={16} className="text-[#71865B]" /> What is your return & replacement policy?
              </h4>
              <p className="font-poppins text-xs sm:text-sm text-[#62695A] leading-relaxed pl-6">
                As our products are consumable organic foods, we cannot accept returns once packaging seals are broken. If an item arrives damaged or compromised during transit, contact us within 48 hours for an immediate complimentary replacement.
              </p>
            </div>

            <div className="bg-[#FFFCF4]/80 backdrop-blur-md rounded-2xl border border-[#DCDCCB]/80 p-5 shadow-xs">
              <h4 className="font-signature font-bold text-lg text-[#203C2B] mb-2 flex items-center gap-2">
                <HelpCircle size={16} className="text-[#71865B]" /> Can I pay with Koko installment plans?
              </h4>
              <p className="font-poppins text-xs sm:text-sm text-[#62695A] leading-relaxed pl-6">
                Yes, simply choose Koko at checkout to split your total order value into 3 interest-free installments debiting every 30 days.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
