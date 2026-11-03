"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Mail, ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCategories } from "@/hooks/useCategories";
import { useCms } from "@/hooks/useCms";
import { useBranches } from "@/hooks/useInventory";
import { usePublicSettings } from "@/hooks/useSettings";
import { useState, useEffect } from "react";

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
            <div className="flex flex-col">
              <span className="font-signature font-bold text-2xl text-[#FFFCF4] tracking-[0.2em] uppercase">
                MASKY <span className="font-light tracking-[0.25em] text-sm text-[#A8B995]">PRODUCT</span>
              </span>
              <span className="font-poppins text-[10px] uppercase tracking-[0.28em] text-[#FFFCF4]/60 mt-0.5">
                Botanical Delicacies
              </span>
            </div>

            <p className="font-poppins font-light text-xs sm:text-sm text-[#FFFCF4]/75 leading-relaxed max-w-[340px] mt-1">
              Curating earth-born botanical delicacies with quiet elegance, artisanal integrity, and unwavering purity.
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

              <div 
                className="flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 hover:bg-white/10"
                style={{
                  background: "rgba(255, 252, 244, 0.06)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 text-[#A8B995] shrink-0">
                  <Phone size={15} />
                </div>
                <span className="font-poppins text-xs text-[#FFFCF4]/90">{mainBranch?.phone || "+94 76 112 8979"}</span>
              </div>

              <div 
                className="flex items-center gap-3 p-2.5 rounded-xl transition-all duration-300 hover:bg-white/10"
                style={{
                  background: "rgba(255, 252, 244, 0.06)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 text-[#A8B995] shrink-0">
                  <Mail size={15} />
                </div>
                <span className="font-poppins text-xs text-[#FFFCF4]/90">{supportEmail || "info@masky.space"}</span>
              </div>
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
              
              <div className="flex flex-col gap-2.5 w-full mt-1">
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
                    placeholder="Enter your email" 
                    className="flex-1 bg-transparent border-none outline-none text-xs text-[#FFFCF4] placeholder:text-[#FFFCF4]/50 ml-2" 
                  />
                </div>
                <button 
                  type="button"
                  className="group flex justify-center items-center gap-2 w-full h-11 rounded-full transition-all duration-300 hover:scale-[1.02] active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #71865B 0%, #4D5E3C 100%)",
                    boxShadow: "0 4px 15px rgba(113,134,91,0.3)",
                  }}
                >
                  <span className="font-poppins font-medium text-xs uppercase tracking-wider text-[#FFFCF4]">Subscribe</span>
                  <ArrowRight size={13} className="text-[#FFFCF4] transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
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
            <Link 
              href="https://www.instagram.com/serama_aduwen" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
              style={{
                background: "rgba(255, 252, 244, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
            </Link>
            <Link 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer" 
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
