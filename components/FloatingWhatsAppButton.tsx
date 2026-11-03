"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MessageCircle, X } from "lucide-react";

export default function FloatingWhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(false);

  // Phone: 0783130967 -> International format: 94783130967
  const whatsappUrl =
    "https://wa.me/94783130967?text=Hello%20Masky%20Product!%20I%20would%20like%20to%20inquire%20about%20your%20dehydrated%20mushroom%20products.";

  return (
    <div 
      className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 flex items-center gap-3 group"
      data-testid="floating-whatsapp"
    >
      {/* Interactive Tooltip Card */}
      <div
        className={`hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#FFFCF4]/95 backdrop-blur-md border border-[#DCDCCB] shadow-xl text-[#203C2B] transition-all duration-300 pointer-events-none transform ${
          showTooltip ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
        <div className="flex flex-col text-left">
          <span className="font-poppins text-xs font-semibold leading-tight">Chat on WhatsApp</span>
          <span className="font-poppins text-[10px] text-[#71865B] font-medium leading-tight">078 313 0967</span>
        </div>
      </div>

      {/* Main Floating Button */}
      <Link
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Masky Products on WhatsApp 0783130967"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_10px_30px_rgba(37,211,102,0.4)] hover:shadow-[0_14px_36px_rgba(37,211,102,0.55)] hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white/80 cursor-pointer"
      >
        {/* Subtle Ambient Pulse Ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping -z-10 pointer-events-none" />

        {/* WhatsApp Vector Icon */}
        <svg
          viewBox="0 0 24 24"
          width="32"
          height="32"
          stroke="currentColor"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-7 h-7 sm:w-8 sm:h-8 fill-white stroke-none"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </Link>
    </div>
  );
}

