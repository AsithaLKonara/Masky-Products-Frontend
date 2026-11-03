import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2, ArrowRight } from "lucide-react";
import CategoryBar from "@/components/CategoryBar";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata = {
  title: "Privacy Policy - MASKY PRODUCT",
  description: "Privacy policy and client data ethics at MASKY PRODUCT."
};

export default function PrivacyPolicyPage() {
  const sections = [
    {
      num: "01",
      title: "Information We Collect",
      icon: Eye,
      content:
        "We collect information provided directly by you when placing an order, inquiring via WhatsApp, subscribing to harvest updates, or contacting our team. This includes your name, delivery address across Sri Lanka, telephone number, email, and encrypted transaction metadata."
    },
    {
      num: "02",
      title: "How We Use Your Data",
      icon: FileText,
      content:
        "Your details are utilized strictly to process gourmet mushroom orders, orchestrate islandwide courier dispatch, provide order tracking updates, and respond to culinary or wholesale inquiries. We honor digital privacy and never sell client data."
    },
    {
      num: "03",
      title: "Encrypted Payment Processing",
      icon: Lock,
      content:
        "All online transactions are processed through end-to-end 256-bit SSL encrypted payment gateways. MASKY PRODUCT does not store raw credit card numbers or card CVVs on our servers. When using BNPL partners (Koko or Mintpay), authentication is managed through verified cryptographic protocols."
    },
    {
      num: "04",
      title: "Cookies & Digital Preferences",
      icon: CheckCircle2,
      content:
        "We employ essential cookies to remember items in your shopping bag, preserve your wishlist preferences, and analyze anonymized browsing flow. You can adjust your cookie settings at any time through your browser controls without restricting fundamental checkout capabilities."
    },
    {
      num: "05",
      title: "Third-Party Logistics & Disclosures",
      icon: ShieldCheck,
      content:
        "We only share strictly required shipping details (recipient name, address, and mobile phone number) with verified logistics partners (such as Fardar Express) solely to execute doorstep deliveries. We do not sell or monetize client records under any circumstances."
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
            { label: "Privacy Policy" }
          ]}
          className="mb-8"
        />

        {/* Hero Section */}
        <div className="flex flex-col items-start gap-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#71865B]/15 text-[#203C2B] border border-[#71865B]/30 text-xs font-poppins font-medium uppercase tracking-widest">
            <Lock size={13} className="text-[#71865B]" />
            Client Privacy & Data Security
          </div>
          <h1 className="font-signature text-4xl sm:text-5xl text-[#203C2B] leading-[1.15]">
            Privacy Policy
          </h1>
          <p className="font-poppins text-xs sm:text-sm text-[#5c5650] font-light">
            Effective Date: August 2026 • Revised for Sri Lanka & Global Clients
          </p>
        </div>

        {/* Reader Card */}
        <div className="bg-[#FFFCF4]/90 backdrop-blur-md border border-[#DCDCCB] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm flex flex-col gap-10">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <section
                key={section.num}
                className={`flex flex-col sm:flex-row items-start gap-5 ${
                  idx !== sections.length - 1 ? "pb-8 border-b border-[#DCDCCB]/60" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-2xl bg-[#71865B]/15 text-[#203C2B] flex items-center justify-center shrink-0">
                  <Icon size={18} />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-poppins text-xs font-semibold text-[#71865B] uppercase tracking-wider">
                      Section {section.num}
                    </span>
                  </div>
                  <h2 className="font-poppins text-lg sm:text-xl font-semibold text-[#203C2B]">
                    {section.title}
                  </h2>
                  <p className="font-poppins text-sm leading-relaxed text-[#5c5650] font-light">
                    {section.content}
                  </p>
                </div>
              </section>
            );
          })}

          {/* Concierge Inquiry Box */}
          <div className="mt-4 p-6 sm:p-8 rounded-2xl bg-[#71865B]/10 border border-[#71865B]/25 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col gap-1">
              <h3 className="font-poppins text-sm font-semibold text-[#203C2B]">
                Questions Regarding Your Data?
              </h3>
              <p className="font-poppins text-xs text-[#5c5650] font-light leading-relaxed">
                Our client advisory team is readily available to answer data inquiries or update your preferences.
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
