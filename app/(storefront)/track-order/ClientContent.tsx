"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Search, 
  MapPin, 
  Clock, 
  AlertCircle, 
  Globe, 
  Mail, 
  MessageSquare, 
  ShieldAlert,
  ArrowRight
} from "lucide-react";
import { useTrackOrderByPhone } from "@/hooks/useOrders";
import CategoryBar from "@/components/CategoryBar";
import Breadcrumbs from "@/components/Breadcrumbs";
import { PLACEHOLDER_IMAGE } from "@/lib/placeholder";

interface CountryOption {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  supported: boolean;
}

const COUNTRIES: CountryOption[] = [
  { code: "LK", name: "Sri Lanka", dialCode: "+94", flag: "🇱🇰", supported: true },
  { code: "IN", name: "India", dialCode: "+91", flag: "🇮🇳", supported: false },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧", supported: false },
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸", supported: false },
  { code: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺", supported: false },
  { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦", supported: false },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971", flag: "🇦🇪", supported: false },
  { code: "SG", name: "Singapore", dialCode: "+65", flag: "🇸🇬", supported: false },
  { code: "MY", name: "Malaysia", dialCode: "+60", flag: "🇲🇾", supported: false },
  { code: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪", supported: false },
  { code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷", supported: false },
  { code: "IT", name: "Italy", dialCode: "+39", flag: "🇮🇹", supported: false },
  { code: "JP", name: "Japan", dialCode: "+81", flag: "🇯🇵", supported: false },
  { code: "OTHER", name: "Other International Region", dialCode: "", flag: "🌐", supported: false },
];

// Helper component for each order's timeline
function OrderTrackingCard({ order }: { order: any }) {
  let currentStep = 1;
  
  if (order.status === "PENDING" || order.status === "PAID") currentStep = 1;
  if (order.status === "PROCESSING") currentStep = 2;
  if (order.status === "DISPATCHED") currentStep = 3;
  if (order.status === "DELIVERED") currentStep = 4;

  if (order.trackingInfo) {
    const ts = order.trackingInfo.status;
    if (ts === "DELIVERED") currentStep = 4;
    else currentStep = 3; 
  }

  return (
    <div className="flex flex-col lg:flex-row items-start w-full gap-8 p-6 sm:p-8 bg-[#FFFCF4]/90 backdrop-blur-md border border-[#DCDCCB] rounded-3xl shadow-xs">
      {/* Left Column: Timeline */}
      <div className="flex flex-col flex-1 w-full gap-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#71865B]/15 border border-[#71865B]/30 text-[#203C2B] mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#71865B] animate-pulse" />
            <span className="font-poppins text-[10px] font-semibold tracking-wider uppercase">
              {order.trackingInfo?.status ? order.trackingInfo.status.replace(/_/g, " ") : order.status}
            </span>
          </div>

          <h2 className="font-signature font-bold text-2xl sm:text-3xl text-[#203C2B] leading-tight">
            Order #{order.orderNumber || order.id?.substring(0, 8)}
          </h2>
          
          {order.trackingInfo?.location && (
            <p className="font-poppins text-xs text-[#62695A] mt-1 flex items-center gap-1.5">
              <MapPin size={13} className="text-[#71865B]" />
              Last scanned dispatch hub: <strong className="text-[#203C2B]">{order.trackingInfo.location}</strong>
            </p>
          )}
        </div>

        {/* Minimalist Organic Timeline */}
        <div className="flex flex-row items-center w-full justify-between relative mt-2 pt-2 pb-2">
          <div className="absolute top-[28px] left-[10%] right-[10%] h-[2px] bg-[#DCDCCB] z-0" />
          <div 
            className="absolute top-[28px] left-[10%] h-[2px] bg-[#203C2B] z-0 transition-all duration-700"
            style={{ width: currentStep === 1 ? "0%" : currentStep === 2 ? "33%" : currentStep === 3 ? "66%" : "80%" }}
          />

          {/* Step 1: Order Accepted */}
          <div className="flex flex-col items-center gap-2 z-10 w-24">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              currentStep >= 1 ? "bg-[#203C2B] text-[#FFFCF4] shadow-sm" : "border border-[#DCDCCB] bg-white text-[#8F9489]"
            }`}>
              <CheckCircle size={20} />
            </div>
            <span className={`font-poppins text-[11px] font-medium text-center uppercase tracking-wider ${currentStep >= 1 ? "text-[#203C2B] font-semibold" : "text-[#8F9489]"}`}>
              Order<br/>Accepted
            </span>
          </div>

          {/* Step 2: Packaging */}
          <div className="flex flex-col items-center gap-2 z-10 w-24">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              currentStep >= 2 ? "bg-[#203C2B] text-[#FFFCF4] shadow-sm" : "border border-[#DCDCCB] bg-white text-[#8F9489]"
            }`}>
              <Package size={20} />
            </div>
            <span className={`font-poppins text-[11px] font-medium text-center uppercase tracking-wider ${currentStep >= 2 ? "text-[#203C2B] font-semibold" : "text-[#8F9489]"}`}>
              Hygienic<br/>Packaging
            </span>
          </div>

          {/* Step 3: Shipped */}
          <div className="flex flex-col items-center gap-2 z-10 w-24">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              currentStep >= 3 ? "bg-[#203C2B] text-[#FFFCF4] shadow-sm" : "border border-[#DCDCCB] bg-white text-[#8F9489]"
            }`}>
              <Truck size={20} />
            </div>
            <span className={`font-poppins text-[11px] font-medium text-center uppercase tracking-wider ${currentStep >= 3 ? "text-[#203C2B] font-semibold" : "text-[#8F9489]"}`}>
              In Transit<br/>Courier
            </span>
          </div>

          {/* Step 4: Delivered */}
          <div className="flex flex-col items-center gap-2 z-10 w-24">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              currentStep >= 4 ? "bg-[#203C2B] text-[#FFFCF4] shadow-sm" : "border border-[#DCDCCB] bg-white text-[#8F9489]"
            }`}>
              <MapPin size={20} />
            </div>
            <span className={`font-poppins text-[11px] font-medium text-center uppercase tracking-wider ${currentStep >= 4 ? "text-[#203C2B] font-semibold" : "text-[#8F9489]"}`}>
              Delivered<br/>Direct
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Order Details Summary */}
      <div className="flex flex-col w-full lg:w-[380px] gap-4 bg-white/70 border border-[#DCDCCB] rounded-2xl p-5 shrink-0">
        <h3 className="font-signature font-bold text-lg text-[#203C2B] border-b border-[#DCDCCB]/60 pb-2">
          Consignment Items
        </h3>

        <div className="flex flex-col w-full gap-3 max-h-[260px] overflow-y-auto pr-1">
          {order.items?.map((item: any) => (
            <div key={item.id} className="flex flex-row items-center w-full p-2.5 bg-white/90 border border-[#DCDCCB]/60 rounded-xl gap-3">
              <div className="w-12 h-14 relative bg-[#FEF6E4] rounded-lg overflow-hidden shrink-0 border border-[#DCDCCB]">
                <Image 
                  src={item.variant?.featuredImage || item.variant?.gallery?.[0] || PLACEHOLDER_IMAGE} 
                  alt={item.variant?.product?.name || "Product"} 
                  fill 
                  sizes="60px" 
                  className="object-cover object-top" 
                />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <h4 className="font-signature font-bold text-xs text-[#203C2B] truncate">
                  {item.variant?.product?.name || "Dehydrated Mushroom Product"}
                </h4>
                <span className="font-poppins text-[11px] text-[#62695A] mt-0.5">
                  Qty: {item.quantity} · {item.variant?.name || item.variant?.size || "Standard Pack"}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full pt-3 border-t border-[#DCDCCB]/60 flex justify-between items-baseline font-poppins">
          <span className="text-xs text-[#62695A]">Total Value</span>
          <span className="font-signature font-bold text-lg text-[#203C2B]">
            Rs. {Number(order.total || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ClientContent() {
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("LK");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [searchPhone, setSearchPhone] = useState<string | undefined>();

  const selectedCountry = COUNTRIES.find((c) => c.code === selectedCountryCode) || COUNTRIES[0];
  const isCountrySupported = selectedCountry.supported;

  const { data: ordersData, isLoading, isError } = useTrackOrderByPhone(isCountrySupported ? searchPhone : undefined);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedCountryCode(code);
    setPhoneError(null);
    setSearchPhone(undefined);
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCountrySupported) {
      return;
    }

    const cleanInput = phoneNumber.replace(/[\s-]/g, "");

    // Allow 10-digit starting with 0 (e.g. 0771234567) or 9-digit (e.g. 771234567)
    if (/^0\d{9}$/.test(cleanInput)) {
      setPhoneError(null);
      setSearchPhone(cleanInput);
    } else if (/^\d{9}$/.test(cleanInput)) {
      setPhoneError(null);
      setSearchPhone("0" + cleanInput);
    } else {
      setPhoneError("Please enter a valid 10-digit Sri Lankan mobile number (e.g. 077 123 4567)");
    }
  };

  return (
    <main className="flex flex-col items-center w-full min-h-screen bg-[#FEF6E4] pt-[84px] text-[#203C2B]">
      {/* Sub Navbar */}
      <CategoryBar />

      {/* Top Search Hero */}
      <section className="w-full bg-gradient-to-b from-[#FFFDF7] via-[#FEF6E4] to-[#F5ECE0] border-b border-[#DCDCCB]/70 py-12 md:py-16 px-4 sm:px-6 lg:px-12 relative overflow-hidden">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-5 relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#71865B]/15 border border-[#71865B]/30 text-[#203C2B]">
            <Truck size={12} className="text-[#71865B]" />
            <span className="font-poppins text-[10px] font-semibold tracking-[0.18em] uppercase">
              Consignment & Delivery Tracking
            </span>
          </div>

          <h1 className="font-signature font-bold text-3xl sm:text-4xl md:text-5xl text-[#203C2B] tracking-tight">
            Track Your Consignment
          </h1>

          <p className="font-poppins text-xs sm:text-sm text-[#62695A] leading-relaxed max-w-lg">
            Monitor real-time courier dispatch progress, sorting hubs, and delivery timelines for your Masky orders.
          </p>

          {/* Form Container with Separated Country Selector */}
          <div className="w-full max-w-xl flex flex-col gap-4 mt-2">
            
            {/* Country Selector Box */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-white/90 backdrop-blur-md border border-[#DCDCCB] rounded-2xl shadow-xs">
              <div className="flex items-center gap-2.5 px-2 text-left">
                <Globe size={18} className="text-[#71865B] shrink-0" />
                <div className="flex flex-col">
                  <span className="font-poppins text-[10px] uppercase font-bold tracking-wider text-[#62695A]">
                    Delivery Destination / Country
                  </span>
                  <span className="font-poppins text-xs font-semibold text-[#203C2B]">
                    {selectedCountry.flag} {selectedCountry.name} {selectedCountry.dialCode ? `(${selectedCountry.dialCode})` : ""}
                  </span>
                </div>
              </div>

              <div className="relative">
                <select
                  data-testid="country-selector"
                  value={selectedCountryCode}
                  onChange={handleCountryChange}
                  className="w-full sm:w-auto h-10 pl-3 pr-8 rounded-xl bg-[#FEF6E4] border border-[#DCDCCB] font-poppins text-xs font-semibold text-[#203C2B] focus:outline-none focus:ring-2 focus:ring-[#203C2B] cursor-pointer"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name} {c.dialCode ? `(${c.dialCode})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Country Status / Alert or Sri Lanka Phone Search Form */}
            {!isCountrySupported ? (
              /* Unsupported Country Alert Card */
              <div className="w-full p-6 sm:p-7 bg-[#FFFDF7] border-2 border-dashed border-[#C29D38]/50 rounded-3xl shadow-sm text-left flex flex-col sm:flex-row items-start gap-4 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-[#C29D38]/15 border border-[#C29D38]/30 flex items-center justify-center shrink-0 text-[#C29D38]">
                  <ShieldAlert size={24} />
                </div>
                <div className="flex flex-col flex-1 gap-2">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#C29D38]/15 border border-[#C29D38]/30 text-[#8C6D15] self-start">
                    <span className="font-poppins text-[10px] font-bold uppercase tracking-wider">
                      Region Notice
                    </span>
                  </div>
                  <h3 className="font-signature font-bold text-lg sm:text-xl text-[#203C2B]">
                    Tracking not available for your country
                  </h3>
                  <p className="font-poppins text-xs text-[#62695A] leading-relaxed">
                    Automated courier dispatch tracking is currently supported only for domestic orders within <strong>Sri Lanka</strong>.
                    For international shipments, overseas freight status, or bulk export consignments, please contact our logistics desk directly:
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <a
                      href="mailto:maskyproduct@gmail.com"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#203C2B] text-[#FFFCF4] font-poppins text-xs font-semibold hover:bg-[#2d523c] transition-colors"
                    >
                      <Mail size={13} />
                      <span>maskyproduct@gmail.com</span>
                    </a>
                    <a
                      href="https://wa.me/94783130967?text=Hello%20Masky%20Product%2C%20I%20would%20like%20to%20inquire%20about%20my%20international%20shipment"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#25D366]/15 border border-[#25D366]/40 text-[#128C7E] font-poppins text-xs font-semibold hover:bg-[#25D366]/25 transition-colors"
                    >
                      <MessageSquare size={13} />
                      <span>WhatsApp: +94 78 313 0967</span>
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              /* Sri Lanka Phone Number Tracking Form */
              <form onSubmit={handleTrack} className="w-full flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-poppins text-xs font-bold text-[#71865B] pointer-events-none">
                      🇱🇰 +94
                    </span>
                    <input 
                      type="tel"
                      placeholder="Enter mobile (e.g. 077 123 4567 or 77 123 4567)"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                        if (phoneError) setPhoneError(null);
                      }}
                      className="w-full h-12 pl-22 pr-4 rounded-full bg-white/95 border border-[#DCDCCB] text-[#203C2B] placeholder:text-[#8F9489] font-poppins text-xs shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#203C2B] transition-all"
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isLoading || !phoneNumber.trim()}
                    className="h-12 px-7 bg-[#203C2B] hover:bg-[#2d523c] text-[#FFFCF4] font-poppins font-semibold text-xs uppercase tracking-widest rounded-full transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-[#FFFCF4] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Search size={14} />
                        <span>Track Consignment</span>
                      </>
                    )}
                  </button>
                </div>

                {phoneError && (
                  <p className="font-poppins text-xs text-red-600 flex items-center gap-1.5 px-3">
                    <AlertCircle size={13} />
                    {phoneError}
                  </p>
                )}
              </form>
            )}

          </div>

        </div>
      </section>

      {/* Tool Bar & Breadcrumbs */}
      <div className="w-full bg-[#FFFCF4]/60 border-b border-[#DCDCCB]/60 backdrop-blur-xs">
        <div className="flex flex-row justify-between items-center w-full max-w-7xl mx-auto h-12 px-4 sm:px-6 lg:px-12">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Track Order" }]} />
          <span className="font-poppins text-xs text-[#62695A] tracking-wider uppercase">Live Delivery Portal</span>
        </div>
      </div>

      {/* Result Section */}
      <section className="flex flex-col items-center w-full max-w-7xl px-4 sm:px-6 lg:px-12 py-10 pb-24">
        {isCountrySupported && searchPhone ? (
          isLoading ? (
            <div className="w-full max-w-lg p-10 bg-white/70 border border-[#DCDCCB] rounded-3xl flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-[#203C2B] border-t-transparent rounded-full animate-spin" />
              <p className="font-poppins text-xs text-[#62695A]">Searching live courier dispatch records...</p>
            </div>
          ) : isError ? (
            <div className="w-full max-w-lg p-6 bg-red-500/10 text-red-700 rounded-3xl border border-red-500/20 text-center font-poppins text-xs leading-relaxed">
              No active orders found for <strong className="font-semibold">{searchPhone}</strong>. Please ensure the phone number matches your checkout records or contact support.
            </div>
          ) : Array.isArray(ordersData) && ordersData.length > 0 ? (
            <div className="flex flex-col w-full gap-6 max-w-4xl">
              <span className="font-poppins text-xs font-semibold uppercase tracking-wider text-[#62695A]">
                Found {ordersData.length} order {ordersData.length === 1 ? "record" : "records"}
              </span>
              {ordersData.map((order: any) => (
                <OrderTrackingCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="w-full max-w-lg p-6 bg-white/70 text-[#62695A] rounded-3xl border border-[#DCDCCB] text-center font-poppins text-xs leading-relaxed">
              No active orders found for contact number <strong className="text-[#203C2B]">{searchPhone}</strong>.
            </div>
          )
        ) : (
          <div className="p-8 text-center max-w-md">
            <Clock size={32} className="mx-auto text-[#71865B] mb-3" />
            <h3 className="font-signature font-bold text-xl text-[#203C2B] mb-1">
              Real-Time Courier Updates
            </h3>
            <p className="font-poppins text-xs text-[#62695A] leading-relaxed">
              {isCountrySupported 
                ? "Enter your mobile contact used during checkout to track live courier movement, hub handoffs, and estimated delivery dates."
                : "Tracking via public portal is exclusive to domestic deliveries within Sri Lanka. For overseas shipments, please contact our export helpline."}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
