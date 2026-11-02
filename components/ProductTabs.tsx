"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Truck, Clock, ShieldCheck, ArrowRight } from "lucide-react";

import ProductReviews from "./ProductReviews";

type TabName = "Product Details" | "Shipping Information" | "FAQs" | "Reviews";

export default function ProductTabs({ description, excerpt, productId }: { description?: string | null, excerpt?: string | null, productId: string }) {
  const [activeTab, setActiveTab] = useState<TabName>("Product Details");

  const tabs: TabName[] = ["Product Details", "Reviews", "Shipping Information", "FAQs"];

  return (
    <div className="flex flex-col w-full mt-[80px]">
      
      {/* Tabs Header */}
      <div className="flex flex-row justify-center md:justify-center items-center w-full border-b border-stone-200 overflow-x-auto no-scrollbar gap-8">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-4 py-4 font-poppins text-base md:text-xl transition-all ${
              activeTab === tab 
                ? "text-primary font-medium border-b-2 border-primary" 
                : "text-[#79716B] font-normal border-b-2 border-transparent hover:text-primary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tabs Content */}
      <div className="flex flex-col w-full py-[40px]">
        {activeTab === "Product Details" && (
          <div className="flex flex-col items-center text-center max-w-[800px] mx-auto animate-in fade-in duration-500">
            {excerpt && (
              <h3 className="font-poppins font-semibold text-xl md:text-2xl text-primary mb-4">{excerpt}</h3>
            )}
            
            {description ? (
              <div 
                className="font-poppins font-light text-base leading-[1.8] text-stone-600 mb-6 text-left w-full prose prose-stone max-w-none"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            ) : (
              <p className="font-poppins font-light text-base leading-[1.8] text-stone-600 mb-6">
                No detailed description available for this product.
              </p>
            )}
          </div>
        )}

        {activeTab === "Shipping Information" && (
          <div className="flex flex-col max-w-[800px] mx-auto w-full gap-8 animate-in fade-in duration-500">
            <div className="bg-stone-50 rounded-2xl p-8 border border-stone-200">
              <h3 className="font-poppins font-semibold text-2xl text-primary mb-4 flex items-center gap-3">
                <Truck className="text-[#5E3122]" /> Fast & Reliable Delivery
              </h3>
              <p className="font-poppins font-light text-base leading-[1.8] text-stone-600 mb-6">
                We partner with <strong>Fardar Express</strong> to ensure your orders reach you safely and on time. We offer island-wide delivery across Sri Lanka.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="flex gap-4">
                  <div className="mt-1"><Clock className="text-stone-400" size={20} /></div>
                  <div>
                    <h4 className="font-poppins font-medium text-primary">Delivery Times</h4>
                    <p className="font-poppins font-light text-sm text-stone-600 mt-1">Colombo 1-15: 1-2 Working Days<br/>Suburbs & Outstation: 3-5 Working Days</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1"><ShieldCheck className="text-stone-400" size={20} /></div>
                  <div>
                    <h4 className="font-poppins font-medium text-primary">Secure Tracking</h4>
                    <p className="font-poppins font-light text-sm text-stone-600 mt-1">Track your package in real-time through our delivery partner's portal.</p>
                  </div>
                </div>
              </div>

              <Link 
                href="/track-order"
                className="inline-flex items-center gap-2 font-poppins font-medium text-sm text-white bg-primary px-6 py-3 rounded-full hover:bg-stone-800 transition-colors w-fit mx-auto"
              >
                Track Order <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}

        {activeTab === "Reviews" && (
          <ProductReviews productId={productId} />
        )}

        {activeTab === "FAQs" && (
          <div className="flex flex-col max-w-[800px] mx-auto w-full gap-6 animate-in fade-in duration-500">
            <div className="border-b border-stone-200 pb-4">
              <h4 className="font-poppins font-medium text-lg text-primary mb-2">How long does shipping take?</h4>
              <p className="font-poppins font-light text-sm text-stone-600">
                Standard shipping takes 3-5 business days within Sri Lanka. International shipping can take up to 14 days.
              </p>
            </div>
            <div className="border-b border-stone-200 pb-4">
              <h4 className="font-poppins font-medium text-lg text-primary mb-2">What is your return policy?</h4>
              <p className="font-poppins font-light text-sm text-stone-600">
                We accept returns within 14 days of delivery. Items must be unworn and in their original packaging.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
