"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
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
  const categories = response?.data?.slice(0, 5) || []; // Show up to 5 categories
  const { pages } = useCms();
  const { data: branchesData } = useBranches();
  const { data: settingsData } = usePublicSettings();
  
  const mainBranch = branchesData?.data?.[0] || branchesData?.[0]; // Support either data wrapper or direct array
  const supportEmail = settingsData?.find((s: any) => s.key === "support_email")?.value;
  
  if (pathname === "/login") return null;

  return (
    <footer className="relative flex flex-col items-center w-full bg-stone-900 text-background">
      
      {/* Main Footer Section with Image Background */}
      <div className="relative flex flex-col items-center w-full pt-10 md:pt-[72px]">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/footer/bg.jpeg"
            alt="Footer Background"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/80" />
        </div>

        {/* Content Row */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 w-full px-4 md:px-8 lg:px-[120px]">
          
          {/* Brand Col */}
          <div className="flex flex-col items-start gap-[20px] lg:col-span-3">
            {/* Logo */}
            <div className="relative w-[280px] h-[60px] mb-4">
               <Image src="/logo-white.png" alt="MASKY PRODUCT" fill sizes="200px" className="object-contain object-left" />
            </div>
            
            {/* Contact Items */}
            <div className="flex flex-col gap-[12px] w-full mt-2">
              <div className="flex items-center gap-[10px]">
                <MapPin className="w-[20px] h-[20px] text-background shrink-0" />
                <span className="font-inter text-sm leading-[21px] text-background/90">{mainBranch?.address || "Colombo, Sri Lanka"}</span>
              </div>
              <div className="flex items-center gap-[10px]">
                <Phone className="w-[20px] h-[20px] text-background shrink-0" />
                <span className="font-inter text-sm leading-[21px] text-background/90">{mainBranch?.phone || "+94 76 112 8979"}</span>
              </div>
              <div className="flex items-center gap-[10px]">
                <Mail className="w-[20px] h-[20px] text-background shrink-0" />
                <span className="font-inter text-sm leading-[21px] text-background/90">{supportEmail || "info@masky.space"}</span>
              </div>
            </div>
          </div>

          {/* Links Cols */}
          <div className="flex flex-col sm:flex-row gap-8 lg:gap-8 lg:col-span-6 justify-between lg:justify-center w-full">
            {/* Shop Col */}
            <div className="flex flex-col gap-[16px] min-w-[120px]">
              <h4 className="font-inter font-bold text-sm tracking-[0.02em] uppercase text-background">Shop</h4>
              <div className="flex flex-col gap-[10px]">
                {["Collared Top", "Core Crop Tank Top", "Raglan Top", "Shirt"].map(link => (
                  <Link href="#" key={link} className="font-inter text-sm text-background/85 hover:text-white transition-colors">{link}</Link>
                ))}
              </div>
            </div>
            
            {/* Information Col */}
            <div className="flex flex-col gap-[16px] min-w-[120px]">
              <h4 className="font-inter font-bold text-sm tracking-[0.02em] uppercase text-background">Information</h4>
              <div className="flex flex-col gap-[10px]">
                <Link href="/track-order" className="font-inter text-sm text-background/85 hover:text-white transition-colors">Track Order</Link>
                <Link href="/returns" className="font-inter text-sm text-background/85 hover:text-white transition-colors">Returns</Link>
                <Link href="/faq" className="font-inter text-sm text-background/85 hover:text-white transition-colors">FAQ</Link>
                <Link href="/contact" className="font-inter text-sm text-background/85 hover:text-white transition-colors">Contact Us</Link>
                {mounted && pages?.map((page: any) => (
                  <Link href={`/pages/${page.slug}`} key={page.id} className="font-inter text-sm text-background/85 hover:text-white transition-colors">{page.title}</Link>
                ))}
              </div>
            </div>
            
            {/* Categories Col */}
            <div className="flex flex-col gap-[16px] min-w-[120px]">
              <h4 className="font-inter font-bold text-sm tracking-[0.02em] uppercase text-background">Categories</h4>
              <div className="flex flex-col gap-[10px]">
                {mounted && categories.map((cat: any) => (
                  <Link href={`/categories/${cat.slug}`} key={cat.id} className="font-inter text-sm text-background/85 hover:text-white transition-colors">{cat.name}</Link>
                ))}
              </div>
            </div>
          </div>

          {/* Newsletter Col */}
          <div className="flex flex-col gap-[16px] lg:col-span-3 w-full">
            <h4 className="font-inter font-bold text-sm tracking-[0.02em] uppercase text-background">Newsletter</h4>
            <p className="font-inter text-sm leading-[21px] text-background/90">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <div className="flex flex-col gap-[10px] w-full mt-2">
              <div className="flex items-center px-[14px] w-full h-[48px] bg-stone-900 border border-background rounded-full">
                <Mail className="w-[20px] h-[20px] text-background" />
                <input 
                  type="email" 
                  placeholder="Email address" 
                  className="flex-1 bg-transparent border-none outline-none text-sm text-background placeholder:text-background/75 ml-[10px]" 
                />
              </div>
              <button className="flex justify-center items-center w-full h-[48px] bg-background rounded-full hover:bg-stone-200 transition-colors">
                <span className="font-inter font-bold text-sm text-primary">Subscribe</span>
              </button>
            </div>
          </div>
        </div>

        {/* Legal & Social Pre-Bottom */}
        <div className="relative z-10 flex flex-col items-center w-full px-4 md:px-8 lg:px-[120px] mt-8 md:mt-[48px]">
          <div className="w-full h-[1px] bg-background/20" />
          <div className="flex flex-col md:flex-row justify-between items-center w-full py-[20px] gap-6 md:gap-0">
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-[16px]">
              <Link href="/about" className="font-inter text-xs text-background/85 hover:text-white transition-colors">About</Link>
              <Link href="/privacy-policy" className="font-inter text-xs text-background/85 hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms-conditions" className="font-inter text-xs text-background/85 hover:text-white transition-colors">Terms & Conditions</Link>
            </div>
            <div className="flex items-center gap-[16px]">
              <Link href="https://www.instagram.com/serama_aduwen?stkn=MWw4b2VudGo1dDU1aA==" target="_blank" rel="noopener noreferrer" className="flex justify-center items-center w-[40px] h-[40px] border border-background rounded-full hover:bg-background/10 transition-colors cursor-pointer">
                {/* Facebook SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-background">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </Link>
              <Link href="https://www.instagram.com/serama_aduwen?stkn=MWw4b2VudGo1dDU1aA==" target="_blank" rel="noopener noreferrer" className="flex justify-center items-center w-[40px] h-[40px] border border-background rounded-full hover:bg-background/10 transition-colors cursor-pointer">
                {/* Instagram SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-background">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* True Bottom Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center w-full py-4 md:py-0 min-h-[40px] px-4 md:px-8 lg:px-[120px] bg-background gap-4 md:gap-0">
        <p className="font-inter text-xs text-stone-500 text-center md:text-left">
          © 2026 MASKY PRODUCT. All Rights Reserved. 
        </p>
        <div className="relative w-[309px] h-[24px]">
          <Image src="/footer/payments.webp" alt="Payment Methods" fill sizes="400px" className="object-contain md:object-right" />
        </div>
      </div>
    </footer>
  );
}
