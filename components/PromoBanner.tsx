"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { api } from "@/services/api";

export default function PromoBanner() {
  const [banners, setBanners] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Fetch active banners on mount
    api.get("/cms/banners")
      .then(res => {
        const activeBanners = (res.data.data || res.data).filter((b: any) => b.active && b.type !== 'PROMO');
        setBanners(activeBanners);
        if (activeBanners.length === 0) {
          const layout = document.getElementById("storefront-layout");
          if (layout) layout.style.paddingTop = "0px";
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentIdx((prev) => (prev + 1) % banners.length);
      }, 5000); // Rotate every 5s
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  const handleClose = () => {
    setVisible(false);
    const layout = document.getElementById("storefront-layout");
    if (layout) layout.style.paddingTop = "0px";
  };

  if (!visible || banners.length === 0) return null;

  const activeBanner = banners[currentIdx];

  const content = (
    <p className="font-inter text-[11px] md:text-[13px] font-semibold text-center w-full tracking-wide">
      {activeBanner.text}
    </p>
  );

  return (
    <div 
      className="relative w-full py-2 px-4 transition-all duration-500 z-[60] flex items-center justify-center animate-in slide-in-from-top-2"
      style={{ backgroundColor: activeBanner.bgColor, color: "#fff" }}
    >
      <div className="flex-1 flex justify-center items-center">
        {activeBanner.link ? (
          <Link href={activeBanner.link} className="hover:opacity-80 transition-opacity">
            {content}
          </Link>
        ) : content}
      </div>
      <button 
        onClick={handleClose} 
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-70 hover:opacity-100 transition-opacity"
      >
        <X size={14} />
      </button>
    </div>
  );
}
