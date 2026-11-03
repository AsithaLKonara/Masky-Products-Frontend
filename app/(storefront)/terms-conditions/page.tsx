import React from "react";
import Link from "next/link";
import { Scale, CheckCircle2, RotateCcw, CreditCard, Shield, ArrowRight } from "lucide-react";
import CategoryBar from "@/components/CategoryBar";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata = {
  title: "Terms & Conditions - MASKY PRODUCT",
  description: "Terms and conditions of service at MASKY PRODUCT."
};

export default function TermsConditionsPage() {
  const terms = [
    {
      num: "01",
      title: "Agreement & General Terms",
      icon: Scale,
      content:
        "By accessing our platform and placing an order with MASKY PRODUCT, you confirm agreement with and acceptance of these Terms of Service. These conditions apply to all browsing, purchases, and communications across our digital storefront and physical atelier."
    },
    {
      num: "02",
      title: "Artisan Garment Authenticity & Colorways",
      icon: CheckCircle2,
      content:
        "Our pieces are crafted from natural textiles including pure linens and organic weaves. While we capture our photography in true natural lighting, subtle variations in botanical texture, yarn slub, and display monitor calibration are intrinsic to authentic artisan garments."
    },
    {
      num: "03",
      title: "Pricing, Currency & Payment Methods",
      icon: CreditCard,
      content:
        "All prices are quoted in Sri Lankan Rupees (LKR) inclusive of applicable taxes. We accept major credit/debit cards, Cash on Delivery (COD) islandwide, and interest-free installment payment through verified BNPL partners (Koko and Mintpay)."
    },
    {
      num: "04",
      title: "Order Fulfillment & Doorstep Delivery",
      icon: Shield,
      content:
        "Orders are dispatched via trusted express couriers. Standard delivery times are 1–2 business days within Colombo and suburbs, and 2–4 business days across greater Sri Lanka. Orders exceeding Rs. 15,000 enjoy complimentary islandwide shipping."
    },
    {
      num: "05",
      title: "Exchange Privilege & Cancellations",
      icon: RotateCcw,
      content:
        "We offer a 7-day complimentary exchange privilege on unworn, unwashed items in original packaging with intact tags. Order cancellations may be requested before dispatch by connecting immediately with our WhatsApp concierge."
    }
  ];

  return (
    <main className="flex flex-col w-full min-h-screen bg-[#FEF6E4]">
      {/* Category Sub-Navigation */}
      <CategoryBar />

      <div className="w-full max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb Trail */}
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Terms & Conditions" }
          ]}
          className="mb-8"
        />

        {/* Hero Section */}
        <div className="flex flex-col items-start gap-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#71865B]/15 text-[#203C2B] border border-[#71865B]/30 text-xs font-poppins font-medium uppercase tracking-widest">
            <Scale size={13} className="text-[#71865B]" />
            Client Agreement & Terms of Service
          </div>
          <h1 className="font-signature text-4xl sm:text-5xl text-[#203C2B] leading-[1.15]">
            Terms & Conditions
          </h1>
          <p className="font-poppins text-xs sm:text-sm text-[#5c5650] font-light">
            Effective Date: August 2026 • Governing Sri Lankan Jurisdiction
          </p>
        </div>

        {/* Reader Card */}
        <div className="bg-[#FFFCF4]/90 backdrop-blur-md border border-[#DCDCCB] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm flex flex-col gap-10">
          {terms.map((term, idx) => {
            const Icon = term.icon;
            return (
              <section
                key={term.num}
                className={`flex flex-col sm:flex-row items-start gap-5 ${
                  idx !== terms.length - 1 ? "pb-8 border-b border-[#DCDCCB]/60" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-2xl bg-[#71865B]/15 text-[#203C2B] flex items-center justify-center shrink-0">
                  <Icon size={18} />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-poppins text-xs font-semibold text-[#71865B] uppercase tracking-wider">
                      Clause {term.num}
                    </span>
                  </div>
                  <h2 className="font-poppins text-lg sm:text-xl font-semibold text-[#203C2B]">
                    {term.title}
                  </h2>
                  <p className="font-poppins text-sm leading-relaxed text-[#5c5650] font-light">
                    {term.content}
                  </p>
                </div>
              </section>
            );
          })}

          {/* Concierge Inquiry Box */}
          <div className="mt-4 p-6 sm:p-8 rounded-2xl bg-[#71865B]/10 border border-[#71865B]/25 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col gap-1">
              <h3 className="font-poppins text-sm font-semibold text-[#203C2B]">
                Need Clarification on Our Terms?
              </h3>
              <p className="font-poppins text-xs text-[#5c5650] font-light leading-relaxed">
                Connect with our concierge team anytime for personalized assistance regarding orders or terms.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#203C2B] hover:bg-[#15271C] text-[#FFFCF4] font-poppins text-xs font-medium uppercase tracking-wider transition-all shrink-0"
            >
              Contact Concierge <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
