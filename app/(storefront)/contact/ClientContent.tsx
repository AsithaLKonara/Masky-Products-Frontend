"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MapPin, Phone, Mail, MessageSquare, Clock, ShieldCheck, Sparkles, Send, CheckCircle2, ArrowRight } from "lucide-react";
import CategoryBar from "@/components/CategoryBar";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useBranches } from "@/hooks/useInventory";
import { usePublicSettings } from "@/hooks/useSettings";

export default function ClientContent() {
  const [topic, setTopic] = useState<string>("fitting");
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { data: branchesData } = useBranches();
  const { data: settingsData } = usePublicSettings();

  const mainBranch = branchesData?.data?.[0] || branchesData?.[0];
  const supportEmail = settingsData?.find((s: any) => s.key === "support_email")?.value || "maskyproduct@gmail.com";
  const storePhone = "078 313 0967";
  const storeAddress = mainBranch?.address || "Colombo, Sri Lanka";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 100);
  };

  return (
    <main className="flex flex-col w-full min-h-screen bg-[#FEF6E4]">
      {/* Category Sub-Navigation */}
      <CategoryBar />

      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb Trail */}
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Client Concierge" }
          ]}
          className="mb-8"
        />

        {/* Hero Title Section */}
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#71865B]/15 text-[#203C2B] border border-[#71865B]/30 text-xs font-poppins font-medium uppercase tracking-widest mb-4">
            <Sparkles size={13} className="text-[#71865B]" />
            Client Concierge & Atelier Visits
          </div>
          <h1 className="font-signature text-4xl sm:text-5xl text-[#203C2B] leading-[1.15] mb-4">
            Connect with Our Concierge
          </h1>
          <p className="font-poppins text-sm sm:text-base text-[#5c5650] font-light leading-relaxed">
            Whether inquiring about a piece in our collection, tracking an artisan order, or reserving a private fitting at our Colombo studio, our client care advisors are dedicated to your comfort.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Inquiry Form */}
          <div className="lg:col-span-7 bg-[#FFFCF4]/90 backdrop-blur-md border border-[#DCDCCB] rounded-3xl p-6 sm:p-10 shadow-sm">
            {submitted ? (
              <div className="py-12 flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#71865B]/15 text-[#203C2B] flex items-center justify-center mb-2">
                  <CheckCircle2 size={32} className="text-[#71865B]" />
                </div>
                <h3 className="font-signature text-2xl sm:text-3xl text-[#203C2B]">
                  Inquiry Received with Pleasure
                </h3>
                <p className="font-poppins text-sm text-[#5c5650] font-light max-w-md leading-relaxed">
                  Thank you for connecting with us, {name}. A dedicated client advisor will attend to your request and reach out within 4 business hours.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setName("");
                    setEmail("");
                    setPhone("");
                    setMessage("");
                  }}
                  className="mt-4 px-6 py-3 rounded-full bg-[#203C2B] text-[#FFFCF4] font-poppins text-xs font-medium uppercase tracking-widest hover:bg-[#15271C] transition-all"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div>
                  <label className="block font-poppins text-xs font-semibold uppercase tracking-wider text-[#203C2B] mb-2.5">
                    How Can We Assist You?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: "fitting", label: "Studio Fitting" },
                      { id: "order", label: "Order Status" },
                      { id: "sizing", label: "Custom Sizing" },
                      { id: "general", label: "General Care" }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTopic(item.id)}
                        className={`py-2.5 px-3 rounded-full text-xs font-poppins font-medium transition-all text-center ${
                          topic === item.id
                            ? "bg-[#203C2B] text-[#FFFCF4] shadow-sm"
                            : "bg-[#FFFDF7] border border-[#DCDCCB] text-[#5c5650] hover:border-[#71865B]/50"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-poppins text-xs font-semibold uppercase tracking-wider text-[#203C2B] mb-2">
                      Full Name <span className="text-[#71865B]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Elena Perera"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-12 px-4 rounded-full bg-[#FFFDF7] border border-[#DCDCCB] font-poppins text-sm text-[#203C2B] placeholder:text-[#9A968D] outline-none focus:border-[#203C2B] focus:ring-1 focus:ring-[#203C2B] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-poppins text-xs font-semibold uppercase tracking-wider text-[#203C2B] mb-2">
                      Email Address <span className="text-[#71865B]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="elena@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-12 px-4 rounded-full bg-[#FFFDF7] border border-[#DCDCCB] font-poppins text-sm text-[#203C2B] placeholder:text-[#9A968D] outline-none focus:border-[#203C2B] focus:ring-1 focus:ring-[#203C2B] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-poppins text-xs font-semibold uppercase tracking-wider text-[#203C2B] mb-2">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +94 77 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-12 px-4 rounded-full bg-[#FFFDF7] border border-[#DCDCCB] font-poppins text-sm text-[#203C2B] placeholder:text-[#9A968D] outline-none focus:border-[#203C2B] focus:ring-1 focus:ring-[#203C2B] transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block font-poppins text-xs font-semibold uppercase tracking-wider text-[#203C2B] mb-2">
                    Your Message <span className="text-[#71865B]">*</span>
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    placeholder="How may our concierge assist you?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-[#FFFDF7] border border-[#DCDCCB] font-poppins text-sm text-[#203C2B] placeholder:text-[#9A968D] outline-none focus:border-[#203C2B] focus:ring-1 focus:ring-[#203C2B] transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-13 py-3.5 rounded-full bg-[#203C2B] hover:bg-[#15271C] text-[#FFFCF4] font-poppins font-medium text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    "Dispatching Message..."
                  ) : (
                    <>
                      <Send size={16} /> Send Concierge Inquiry
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Atelier Details & WhatsApp Concierge */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Direct WhatsApp Concierge Card */}
            <div className="bg-[#FFFCF4]/90 backdrop-blur-md border border-[#DCDCCB] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#25D366]/15 text-[#128C7E] flex items-center justify-center">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="font-poppins text-sm font-semibold text-[#203C2B]">Instant WhatsApp Concierge</h3>
                  <p className="font-poppins text-xs text-[#5c5650] font-light">Typically replies in minutes</p>
                </div>
              </div>
              <p className="font-poppins text-xs sm:text-sm text-[#5c5650] font-light leading-relaxed">
                Connect directly with us for order inquiries, dehydrated mushroom culinary tips, wholesale packs, or instant stock checks.
              </p>
              <a
                href="https://wa.me/94783130967"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-5 rounded-full bg-[#25D366] hover:bg-[#1fa851] text-white font-poppins text-xs font-semibold uppercase tracking-wider text-center transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                Chat on WhatsApp (078 313 0967) <ArrowRight size={14} />
              </a>
            </div>

            {/* Atelier Studio Details Card */}
            <div className="bg-[#FFFCF4]/90 backdrop-blur-md border border-[#DCDCCB] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-5">
              <span className="font-signature text-xl text-[#203C2B]">Colombo Atelier Studio</span>

              <div className="flex flex-col gap-4 text-xs sm:text-sm font-poppins">
                <div className="flex items-start gap-3 text-[#5c5650]">
                  <MapPin size={18} className="text-[#71865B] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#203C2B]">{storeAddress}</p>
                    <p className="text-xs text-[#5c5650] font-light mt-0.5">Private fitting suites & bespoke tailors</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-[#5c5650]">
                  <Clock size={18} className="text-[#71865B] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#203C2B]">Monday – Saturday: 10:00 AM – 7:00 PM</p>
                    <p className="text-xs text-[#5c5650] font-light mt-0.5">Sunday & Public Holidays by appointment</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-[#5c5650]">
                  <Phone size={18} className="text-[#71865B] shrink-0 mt-0.5" />
                  <div>
                    <a href={`tel:${storePhone}`} className="font-medium text-[#203C2B] hover:underline">
                      {storePhone}
                    </a>
                    <p className="text-xs text-[#5c5650] font-light mt-0.5">Concierge telephone hotline</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-[#5c5650]">
                  <Mail size={18} className="text-[#71865B] shrink-0 mt-0.5" />
                  <div>
                    <a href={`mailto:${supportEmail || "concierge@maskyproduct.com"}`} className="font-medium text-[#203C2B] hover:underline">
                      {supportEmail || "concierge@maskyproduct.com"}
                    </a>
                    <p className="text-xs text-[#5c5650] font-light mt-0.5">Direct client advisory inbox</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Official Storefronts & Socials */}
            <div className="bg-[#FFFCF4]/90 backdrop-blur-md border border-[#DCDCCB] rounded-3xl p-6 flex flex-col gap-3">
              <h4 className="font-poppins text-xs font-semibold uppercase tracking-wider text-[#203C2B]">
                Official Storefronts & Socials
              </h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://s.daraz.lk/s.Z7xIF"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#F85606]/10 border border-[#F85606]/30 text-[#F85606] font-poppins text-xs font-semibold text-center hover:bg-[#F85606] hover:text-white transition-all flex items-center justify-center gap-1.5"
                >
                  Daraz Store <ArrowRight size={13} />
                </a>
                <a
                  href="https://www.facebook.com/share/1CQDRvhudv/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#1877F2]/10 border border-[#1877F2]/30 text-[#1877F2] font-poppins text-xs font-semibold text-center hover:bg-[#1877F2] hover:text-white transition-all flex items-center justify-center gap-1.5"
                >
                  Facebook Page <ArrowRight size={13} />
                </a>
              </div>
            </div>

            {/* Quality & Islandwide Delivery Banner */}
            <div className="bg-[#71865B]/10 border border-[#71865B]/25 rounded-3xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#71865B]/20 text-[#203C2B] flex items-center justify-center shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="font-poppins text-xs font-semibold uppercase tracking-wider text-[#203C2B]">
                  Purity & Freshness Guaranteed
                </h4>
                <p className="font-poppins text-xs text-[#5c5650] font-light leading-relaxed">
                  100% organic dehydrated and fresh gourmet mushrooms. Hygienically sealed with tamper-evident packaging and dispatched islandwide within 24-48 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
