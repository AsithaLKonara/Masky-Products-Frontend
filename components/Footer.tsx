"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Mail, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCategories } from "@/hooks/useCategories";
import { useCms } from "@/hooks/useCms";
import { useBranches } from "@/hooks/useInventory";
import { usePublicSettings } from "@/hooks/useSettings";
import { useState, useEffect } from "react";
import api from "@/services/api";

export default function Footer() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const pathname = usePathname();
  const { data: response } = useCategories();
  const categories = response?.data?.slice(0, 5) || [];
  const { pages } = useCms();
  const { data: branchesData } = useBranches();
  const { data: settingsData } = usePublicSettings();
  
  const mainBranch = branchesData?.data?.[0] || branchesData?.[0];
  const supportEmail = settingsData?.find((s: any) => s.key === "support_email")?.value;

  const [gazetteEmail, setGazetteEmail] = useState("");
  const [gazetteStatus, setGazetteStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [gazetteMsg, setGazetteMsg] = useState("");

  const handleGazetteSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = gazetteEmail.trim().toLowerCase();
    if (!clean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setGazetteStatus("error");
      setGazetteMsg("Please enter a valid email address");
      return;
    }

    setGazetteStatus("loading");
    setGazetteMsg("");
    try {
      const res = await api.post("/cms/gazette/subscribe", { email: clean, source: "FOOTER" });
      setGazetteStatus("success");
      setGazetteMsg(res.data?.message || "Welcome to our inner circle. Membership confirmation dispatched.");
      setGazetteEmail("");
    } catch (err: any) {
      setGazetteStatus("error");
      setGazetteMsg(err.response?.data?.error || "Subscription failed. Please try again.");
    }
  };
  
  if (pathname === "/login") return null;

  return (
    <footer aria-label="Storefront Footer" className="relative flex flex-col items-center w-full text-[#FFFCF4] overflow-hidden">
      
      {/* Background Layer with Chris Briggs Botanical Grove Image */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <Image
          src="/footer-bg.jpg"
          alt="Ancient botanical grove landscape"
          fill
          sizes="100vw"
          className="object-cover"
        />
        {/* Deep Forest Overlay without blur */}
        <div 
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, rgba(14,26,19,0.85) 0%, rgba(10,18,13,0.92) 50%, rgba(7,13,9,0.96) 100%)",
          }}
        />
      </div>

      {/* Main Footer Section with Frosted Glass Panels */}
      <div className="relative z-10 flex flex-col items-center w-full pt-12 md:pt-20 pb-8 px-4 md:px-8 lg:px-[120px] max-w-[1360px] mx-auto">
        
        {/* Content Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 w-full">
          
          {/* Brand Col */}
          <div className="flex flex-col items-start gap-4 lg:col-span-4">
            {/* Logo */}
            <Link href="/" className="inline-block group" aria-label="MASKY PRODUCT Home">
              <Image
                src="/logo/VCFB%20VFC.png"
                alt="MASKY PRODUCT - Botanical Delicacies"
                width={120}
                height={132}
                className="w-20 md:w-24 h-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            <p className="font-poppins font-light text-xs sm:text-sm text-[#FFFCF4]/75 leading-relaxed max-w-[340px] mt-1">
              Curating 100% organic, artisan-harvested dehydrated gourmet mushrooms and delicacies with quiet luxury, earthy integrity, and culinary purity.
            </p>
            
            {/* Glass Contact Cards */}
            <div className="flex flex-col gap-2.5 w-full max-w-[340px] mt-2">
              <div 
                className="flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 hover:bg-white/10"
                style={{
                  background: "rgba(255, 252, 244, 0.06)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 text-[#A8B995] shrink-0">
                  <MapPin size={15} />
                </div>
                <span className="font-poppins text-xs text-[#FFFCF4]/90 truncate">{mainBranch?.address || "Colombo, Sri Lanka"}</span>
              </div>

              <Link 
                href="https://wa.me/94783130967"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 hover:bg-white/10 cursor-pointer"
                style={{
                  background: "rgba(255, 252, 244, 0.06)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#25D366]/20 text-[#25D366] shrink-0">
                  <Phone size={15} />
                </div>
                <span className="font-poppins text-xs text-[#FFFCF4]/90">078 313 0967</span>
              </Link>

              <Link 
                href="mailto:maskyproduct@gmail.com"
                className="flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 hover:bg-white/10 cursor-pointer"
                style={{
                  background: "rgba(255, 252, 244, 0.06)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 text-[#A8B995] shrink-0">
                  <Mail size={15} />
                </div>
                <span className="font-poppins text-xs text-[#FFFCF4]/90">maskyproduct@gmail.com</span>
              </Link>
            </div>
          </div>

          {/* Navigation Links Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 lg:col-span-5 w-full">
            {/* Shop Column */}
            <div className="flex flex-col gap-3">
              <span className="font-poppins font-medium text-xs tracking-[0.16em] uppercase text-[#A8B995]">Shop</span>
              <div className="flex flex-col gap-2">
                {["Artisan Blends", "Ceremonial Series", "Gift Sets", "All Products"].map((link) => (
                  <Link href="/shop" key={link} className="font-poppins font-light text-xs sm:text-sm text-[#FFFCF4]/75 hover:text-[#FFFCF4] transition-colors">
                    {link}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Information Column */}
            <div className="flex flex-col gap-3">
              <span className="font-poppins font-medium text-xs tracking-[0.16em] uppercase text-[#A8B995]">Information</span>
              <div className="flex flex-col gap-2">
                <Link href="/track-order" className="font-poppins font-light text-xs sm:text-sm text-[#FFFCF4]/75 hover:text-[#FFFCF4] transition-colors">Track Order</Link>
                <Link href="/returns" className="font-poppins font-light text-xs sm:text-sm text-[#FFFCF4]/75 hover:text-[#FFFCF4] transition-colors">Returns</Link>
                <Link href="/faq" className="font-poppins font-light text-xs sm:text-sm text-[#FFFCF4]/75 hover:text-[#FFFCF4] transition-colors">FAQ</Link>
                <Link href="/contact" className="font-poppins font-light text-xs sm:text-sm text-[#FFFCF4]/75 hover:text-[#FFFCF4] transition-colors">Contact Us</Link>
                {mounted && pages?.map((page: any) => (
                  <Link href={`/pages/${page.slug}`} key={page.id} className="font-poppins font-light text-xs sm:text-sm text-[#FFFCF4]/75 hover:text-[#FFFCF4] transition-colors">{page.title}</Link>
                ))}
              </div>
            </div>
            
            {/* Categories Column */}
            <div className="flex flex-col gap-3">
              <span className="font-poppins font-medium text-xs tracking-[0.16em] uppercase text-[#A8B995]">Collections</span>
              <div className="flex flex-col gap-2">
                {mounted && categories.map((cat: any) => (
                  <Link href={`/categories/${cat.slug}`} key={cat.id} className="font-poppins font-light text-xs sm:text-sm text-[#FFFCF4]/75 hover:text-[#FFFCF4] transition-colors">{cat.name}</Link>
                ))}
              </div>
            </div>
          </div>

          {/* Frosted Glass Newsletter Column */}
          <div className="flex flex-col gap-3 lg:col-span-3 w-full">
            <div 
              className="p-5 sm:p-6 rounded-2xl flex flex-col gap-3"
              style={{
                background: "rgba(255, 252, 244, 0.08)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
                border: "1px solid rgba(255, 255, 255, 0.16)",
                boxShadow: "0 12px 35px rgba(0, 0, 0, 0.25)",
              }}
            >
              <span className="font-poppins font-medium text-xs tracking-[0.16em] uppercase text-[#A8B995]">
                Private Gazette
              </span>
              <p className="font-poppins font-light text-xs text-[#FFFCF4]/80 leading-relaxed">
                Receive private reserve announcements, harvest chronicles, and exclusive tasting invitations.
              </p>
              
              <form onSubmit={handleGazetteSubscribe} className="flex flex-col gap-2.5 w-full mt-1">
                <div 
                  className="flex items-center px-3.5 w-full h-11 rounded-full"
                  style={{
                    background: "rgba(255, 252, 244, 0.10)",
                    border: "1px solid rgba(255, 255, 255, 0.18)",
                  }}
                >
                  <Mail size={16} className="text-[#A8B995] shrink-0" />
                  <input 
                    type="email" 
                    value={gazetteEmail}
                    onChange={(e) => {
                      setGazetteEmail(e.target.value);
                      if (gazetteStatus === "error") setGazetteStatus("idle");
                    }}
                    placeholder="Enter your email" 
                    disabled={gazetteStatus === "loading"}
                    className="flex-1 bg-transparent border-none outline-none text-xs text-[#FFFCF4] placeholder:text-[#FFFCF4]/50 ml-2" 
                  />
                </div>
                <button 
                  type="submit"
                  disabled={gazetteStatus === "loading"}
                  className="group flex justify-center items-center gap-2 w-full h-11 rounded-full transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #71865B 0%, #4D5E3C 100%)",
                    boxShadow: "0 4px 15px rgba(113,134,91,0.3)",
                  }}
                >
                  {gazetteStatus === "loading" ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="font-poppins font-medium text-xs uppercase tracking-wider text-[#FFFCF4]">Subscribe</span>
                      <ArrowRight size={13} className="text-[#FFFCF4] transition-transform duration-300 group-hover:translate-x-1" />
                    </>
                  )}
                </button>

                {gazetteStatus === "success" && (
                  <div className="flex items-start gap-1.5 p-2.5 rounded-xl bg-[#71865B]/25 border border-[#71865B]/40 text-[#A8B995] text-[11px] font-poppins leading-tight mt-1">
                    <CheckCircle size={14} className="shrink-0 text-[#A8B995] mt-0.5" />
                    <span>{gazetteMsg}</span>
                  </div>
                )}

                {gazetteStatus === "error" && (
                  <div className="flex items-start gap-1.5 p-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-[11px] font-poppins leading-tight mt-1">
                    <AlertCircle size={14} className="shrink-0 text-red-300 mt-0.5" />
                    <span>{gazetteMsg}</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Separator Line */}
        <div className="w-full h-[1px] bg-white/10 mt-10 md:mt-14 mb-6" />

        {/* Pre-Bottom Social & Legal */}
        <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-4 text-xs text-[#FFFCF4]/70">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms-conditions" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>

          <div className="flex items-center gap-3">
            {/* WhatsApp */}
            <Link 
              href="https://wa.me/94783130967" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="WhatsApp Masky Product"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366] hover:text-white"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.59-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.882-4.434 9.885-9.885.002-2.641-1.026-5.124-2.893-6.993-1.868-1.869-4.35-2.898-6.992-2.899-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.75-.981z"/>
              </svg>
            </Link>

            {/* Facebook */}
            <Link 
              href="https://www.facebook.com/share/1CQDRvhudv/" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Facebook Page"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              style={{
                background: "rgba(255, 252, 244, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </Link>

            {/* Daraz Store */}
            <Link 
              href="https://s.daraz.lk/s.Z7xIF" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Daraz Store Masky Product"
              className="px-2.5 h-9 rounded-full flex items-center justify-center gap-1.5 transition-all duration-300 hover:scale-105 text-[11px] font-poppins font-semibold text-[#FFFCF4] bg-[#F85606]/20 border border-[#F85606]/40 hover:bg-[#F85606] hover:text-white"
            >
              <span>Daraz Store</span>
              <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      </div>

      {/* True Bottom Bar */}
      <div 
        className="w-full py-5 px-4 md:px-8 lg:px-[120px] flex flex-col sm:flex-row justify-between items-center gap-3 relative z-10"
        style={{
          background: "rgba(7, 13, 9, 0.95)",
          borderTop: "1px solid rgba(255, 255, 255, 0.12)",
        }}
      >
        <p className="font-poppins font-normal text-xs text-[#FFFCF4]/85 text-center sm:text-left">
          © 2026 MASKY PRODUCT. All rights reserved.
        </p>

        {/* Developer Credit */}
        <div className="flex items-center gap-1.5 font-poppins text-xs text-[#FFFCF4]/85">
          <span>Designed & Developed by</span>
          <Link 
            href="https://xonitspace.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="font-medium text-[#D9C99B] hover:text-[#FFFFFF] underline decoration-[#D9C99B]/60 transition-colors"
          >
            Xonit Space
          </Link>
        </div>
      </div>
    </footer>
  );
}
