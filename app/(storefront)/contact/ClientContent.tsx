
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";

import { useBranches } from "@/hooks/useInventory";
import { usePublicSettings } from "@/hooks/useSettings";

export default function ClientContent() {
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>();
  const { data: branchesData } = useBranches();
  const { data: settingsData } = usePublicSettings();
  
  const mainBranch = branchesData?.data?.[0] || branchesData?.[0];
  const supportEmail = settingsData?.find((s: any) => s.key === "support_email")?.value;

  return (
    <main className="flex flex-col items-center w-full min-h-screen bg-background pt-[83px]">
      
      {/* Container */}
      <div className="flex flex-col lg:flex-row w-full max-w-[1280px] min-h-[796px] mx-auto py-[80px] px-4 md:px-[120px] gap-16 lg:gap-0">
        
        {/* Left Column: Form */}
        <div className="flex flex-col flex-1 w-full lg:pr-[80px] lg:border-r lg:border-stone-200 gap-[40px]">
          <h1 className="font-poppins font-normal text-[36px] md:text-5xl text-primary leading-tight">
            Contact Us
          </h1>

          <form className="flex flex-col gap-8 w-full">
            {/* Full Name */}
            <div className="flex flex-col gap-3 w-full">
              <label className="font-poppins font-medium text-xs uppercase tracking-wider text-stone-500">
                Full name <span className="text-accent">*</span>
              </label>
              <input 
                type="text" 
                placeholder="Enter full name"
                className="w-full h-[52px] px-[20px] border border-stone-200 rounded-full bg-white font-poppins text-sm text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-stone-400"
              />
            </div>

            {/* Email Address */}
            <div className="flex flex-col gap-3 w-full">
              <label className="font-poppins font-medium text-xs uppercase tracking-wider text-stone-500">
                Email address <span className="text-accent">*</span>
              </label>
              <input 
                type="email" 
                placeholder="Enter email address"
                className="w-full h-[52px] px-[20px] border border-stone-200 rounded-full bg-white font-poppins text-sm text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-stone-400"
              />
            </div>

            {/* Phone Number */}
            <div className="flex flex-col gap-3 w-full">
              <label className="font-poppins font-medium text-xs uppercase tracking-wider text-stone-500">
                Phone number <span className="text-accent">*</span>
              </label>
              
              <input 
                type="tel"
                placeholder="Enter phone number (e.g., 0712345678)"
                value={phoneNumber || ''}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full h-[52px] px-[20px] border border-stone-200 rounded-full bg-white font-poppins text-sm text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-stone-400"
              />
            </div>

            {/* Message */}
            <div className="flex flex-col gap-3 w-full">
              <label className="font-poppins font-medium text-xs uppercase tracking-wider text-stone-500">
                Message <span className="text-accent">*</span>
              </label>
              <textarea 
                placeholder="How can we help you?"
                className="w-full h-[180px] p-[20px] border border-stone-200 rounded-[24px] bg-white font-poppins text-sm text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none transition-all placeholder:text-stone-400"
              />
            </div>

            {/* Submit Button */}
            <button 
              type="button"
              className="w-full h-[54px] flex justify-center items-center bg-primary hover:bg-stone-800 transition-colors rounded-full font-poppins font-semibold text-sm text-white uppercase tracking-widest mt-2"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Right Column: Brand Details */}
        <div className="flex flex-col w-full lg:w-[460px] lg:pl-[80px] gap-[30px] pt-[10px]">
          
          {/* Map Image Placeholder */}
          <div className="w-full aspect-[4/3] bg-stone-100 rounded-lg overflow-hidden relative shadow-sm border border-stone-200">
            {/* If there was a real map image, it would go here. For now, a styled placeholder */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400 gap-3 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')] bg-stone-50">
              <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-accent">
                <MapPin size={24} />
              </div>
              <span className="font-poppins text-xs uppercase tracking-widest font-medium text-stone-400">Map View</span>
            </div>
          </div>

          <div className="flex flex-col gap-6 mt-4">
            {/* Logo */}
            <div className="w-[180px] h-[34px] relative">
              <Image 
                src="/logo.png" 
                alt="MASKY PRODUCT" 
                fill 
                sizes="200px"
                className="object-contain object-left" 
              />
            </div>

            {/* Description */}
            <p className="font-poppins font-light text-sm leading-[1.8] text-stone-500 max-w-[340px]">
              We'd love to hear from you. Please fill out the form or reach out to us using the details below for any private fitting appointments or general inquiries.
            </p>

            {/* Contact Details List */}
            <div className="flex flex-col gap-[20px] w-full mt-4">
              
              {/* Location */}
              <div className="flex items-center gap-[16px] w-full group cursor-pointer">
                <div className="w-[40px] h-[40px] flex items-center justify-center border border-stone-200 bg-white group-hover:bg-primary group-hover:border-primary transition-colors rounded-full shrink-0 shadow-sm">
                  <MapPin size={16} strokeWidth={1.5} className="text-primary group-hover:text-white transition-colors" />
                </div>
                <span className="font-poppins font-light text-sm text-primary">
                  {mainBranch?.address || "Colombo Flagship Studio, Sri Lanka"}
                </span>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-[16px] w-full group cursor-pointer">
                <div className="w-[40px] h-[40px] flex items-center justify-center border border-stone-200 bg-white group-hover:bg-primary group-hover:border-primary transition-colors rounded-full shrink-0 shadow-sm">
                  <Phone size={16} strokeWidth={1.5} className="text-primary group-hover:text-white transition-colors" />
                </div>
                <span className="font-poppins font-light text-sm text-primary">
                  {mainBranch?.phone || "+94 76 112 8979"}
                </span>
              </div>

              {/* Email */}
              <div className="flex items-center gap-[16px] w-full group cursor-pointer">
                <div className="w-[40px] h-[40px] flex items-center justify-center border border-stone-200 bg-white group-hover:bg-primary group-hover:border-primary transition-colors rounded-full shrink-0 shadow-sm">
                  <Mail size={16} strokeWidth={1.5} className="text-primary group-hover:text-white transition-colors" />
                </div>
                <span className="font-poppins font-light text-sm text-primary">
                  {supportEmail || "info@maskyproductclothing.com"}
                </span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </main>
  );
}
