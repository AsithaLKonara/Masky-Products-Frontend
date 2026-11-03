"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, ChevronRight, Package, ArrowLeft, Loader2, AlertCircle, RotateCcw, CheckCircle2, Sparkles, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useCreateReturn } from "@/hooks/useReturns";
import { api } from "@/services/api";
import CategoryBar from "@/components/CategoryBar";
import Breadcrumbs from "@/components/Breadcrumbs";
import { PLACEHOLDER_IMAGE } from "@/lib/placeholder";

export default function ClientContent() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"search" | "select" | "reason" | "success">("search");
  const [error, setError] = useState("");
  
  const [selectedItems, setSelectedItems] = useState<{ id: string, quantity: number }[]>([]);
  const [itemReasons, setItemReasons] = useState<Record<string, { reason: string, details: string }>>({});

  const [isLoading, setIsLoading] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);

  const createReturnMutation = useCreateReturn();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderNumber && email) {
      setIsLoading(true);
      setError("");
      try {
        const { data } = await api.get('/returns/verify', { params: { orderNumber, email } });
        setOrderData(data);
        setStep("select");
      } catch (err: any) {
        setError(err.response?.data?.error || "We could not find an order matching that reference and email.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleToggleItem = (itemId: string) => {
    setSelectedItems(prev => {
      const exists = prev.find(p => p.id === itemId);
      if (exists) {
        return prev.filter(p => p.id !== itemId);
      }
      return [...prev, { id: itemId, quantity: 1 }];
    });
  };

  const handleChangeQty = (itemId: string, qty: number) => {
    setSelectedItems(prev => prev.map(p => p.id === itemId ? { ...p, quantity: qty } : p));
  };

  const handleReasonChange = (itemId: string, field: 'reason' | 'details', value: string) => {
    setItemReasons(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId] || { reason: '', details: '' },
        [field]: value
      }
    }));
  };

  const handleSubmitReturn = async () => {
    if (selectedItems.length === 0 || !orderData) return;
    
    for (const item of selectedItems) {
      if (!itemReasons[item.id]?.reason) {
        setError("Please select an exchange or return reason for all chosen items.");
        return;
      }
    }

    try {
      setError("");
      const payload = {
        orderId: orderData.orderId,
        items: selectedItems.map(item => ({
          orderItemId: item.id,
          quantity: item.quantity,
          reason: itemReasons[item.id].reason,
          details: itemReasons[item.id].details || ""
        }))
      };
      
      await createReturnMutation.mutateAsync(payload);
      setStep("success");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to submit return request. Please try again.");
    }
  };

  return (
    <main className="flex flex-col items-center w-full min-h-screen bg-[#FEF6E4] pt-[84px] text-[#203C2B]">
      {/* Sub Navbar */}
      <CategoryBar />

      {/* Hero Header */}
      <section className="w-full bg-gradient-to-b from-[#FFFDF7] via-[#FEF6E4] to-[#F5ECE0] border-b border-[#DCDCCB]/70 py-12 md:py-16 px-4 sm:px-6 lg:px-12 relative overflow-hidden">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#71865B]/15 border border-[#71865B]/30 text-[#203C2B]">
            <RotateCcw size={12} className="text-[#71865B]" />
            <span className="font-poppins text-[10px] font-semibold tracking-[0.18em] uppercase">
              7-Day Complimentary Exchange
            </span>
          </div>

          <h1 className="font-signature font-bold text-3xl sm:text-4xl md:text-5xl text-[#203C2B] tracking-tight">
            Returns & Exchanges
          </h1>

          <p className="font-poppins text-xs sm:text-sm text-[#62695A] leading-relaxed max-w-lg">
            We are dedicated to ensuring your complete satisfaction. Request a size exchange or initiate an authorized return seamlessly below.
          </p>
        </div>
      </section>

      {/* Tool Bar & Breadcrumbs */}
      <div className="w-full bg-[#FFFCF4]/60 border-b border-[#DCDCCB]/60 backdrop-blur-xs">
        <div className="flex flex-row justify-between items-center w-full max-w-7xl mx-auto h-12 px-4 sm:px-6 lg:px-12">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Returns & Exchanges" }]} />
          <span className="font-poppins text-xs text-[#62695A] tracking-wider uppercase">Client Care Portal</span>
        </div>
      </div>

      {/* Content Form Container */}
      <section className="flex flex-col items-center w-full max-w-2xl px-4 sm:px-6 lg:px-12 py-12 pb-24">
        {step === "search" && (
          <div className="w-full bg-[#FFFCF4]/90 backdrop-blur-md border border-[#DCDCCB] rounded-3xl p-6 sm:p-10 shadow-xs">
            <h2 className="font-signature font-bold text-2xl text-[#203C2B] mb-2 text-center">
              Find Your Order
            </h2>
            <p className="font-poppins text-xs text-[#62695A] text-center mb-6">
              Enter your order reference and the email address used during purchase.
            </p>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 font-poppins text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSearch} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-poppins text-xs font-semibold uppercase tracking-wider text-[#62695A]">
                  Order Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. ORD-10023"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full h-12 px-5 rounded-full bg-white/90 border border-[#DCDCCB] font-poppins text-xs text-[#203C2B] placeholder:text-[#8F9489] outline-none focus:border-[#203C2B] transition-all"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-poppins text-xs font-semibold uppercase tracking-wider text-[#62695A]">
                  Account Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. client@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 px-5 rounded-full bg-white/90 border border-[#DCDCCB] font-poppins text-xs text-[#203C2B] placeholder:text-[#8F9489] outline-none focus:border-[#203C2B] transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 mt-3 bg-[#203C2B] hover:bg-[#2d523c] text-[#FFFCF4] font-poppins font-semibold text-xs uppercase tracking-widest rounded-full transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Search size={14} />
                    <span>Locate Order</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {step === "select" && orderData && (
          <div className="w-full bg-[#FFFCF4]/90 backdrop-blur-md border border-[#DCDCCB] rounded-3xl p-6 sm:p-10 shadow-xs">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#DCDCCB]/60">
              <button
                onClick={() => setStep("search")}
                className="inline-flex items-center gap-1.5 font-poppins text-xs text-[#62695A] hover:text-[#203C2B] cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
              <span className="font-poppins text-xs text-[#203C2B] font-semibold">
                Order #{orderNumber}
              </span>
            </div>

            <h2 className="font-signature font-bold text-2xl text-[#203C2B] mb-2">
              Select Pieces to Exchange or Return
            </h2>
            <p className="font-poppins text-xs text-[#62695A] mb-6">
              Mark the items you wish to return. Eligible items are within 7 calendar days of delivery.
            </p>

            <div className="space-y-3 mb-6">
              {orderData.items?.map((item: any) => {
                const isSelected = selectedItems.some(p => p.id === item.id);
                const selectedItem = selectedItems.find(p => p.id === item.id);

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-pointer ${
                      isSelected 
                        ? 'border-[#203C2B] bg-white shadow-2xs' 
                        : 'border-[#DCDCCB] bg-white/70 hover:bg-white'
                    }`}
                    onClick={() => handleToggleItem(item.id)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 ${
                        isSelected ? 'border-[#203C2B] bg-[#203C2B]' : 'border-[#DCDCCB] bg-white'
                      }`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-signature font-bold text-sm text-[#203C2B] truncate">
                          {item.productName || item.variant?.name || "Creations"}
                        </span>
                        <span className="font-poppins text-[11px] text-[#62695A]">
                          Qty purchased: {item.quantity} · Price: Rs. {item.price?.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {isSelected && item.quantity > 1 && (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <span className="font-poppins text-[11px] text-[#62695A]">Qty:</span>
                        <select
                          value={selectedItem?.quantity || 1}
                          onChange={(e) => handleChangeQty(item.id, parseInt(e.target.value))}
                          className="px-2 py-1 rounded-lg border border-[#DCDCCB] text-xs font-poppins"
                        >
                          {Array.from({ length: item.quantity }, (_, i) => i + 1).map(num => (
                            <option key={num} value={num}>{num}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              disabled={selectedItems.length === 0}
              onClick={() => setStep("reason")}
              className="w-full h-12 bg-[#203C2B] hover:bg-[#2d523c] text-[#FFFCF4] font-poppins font-semibold text-xs uppercase tracking-widest rounded-full transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>Continue to Reason</span>
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        {step === "reason" && (
          <div className="w-full bg-[#FFFCF4]/90 backdrop-blur-md border border-[#DCDCCB] rounded-3xl p-6 sm:p-10 shadow-xs">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#DCDCCB]/60">
              <button
                onClick={() => setStep("select")}
                className="inline-flex items-center gap-1.5 font-poppins text-xs text-[#62695A] hover:text-[#203C2B] cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
              <span className="font-poppins text-xs text-[#203C2B] font-semibold">
                Reason Specification
              </span>
            </div>

            <h2 className="font-signature font-bold text-2xl text-[#203C2B] mb-2">
              Reason for Return / Exchange
            </h2>
            <p className="font-poppins text-xs text-[#62695A] mb-6">
              Please share the context for each piece so our atelier can process replacements smoothly.
            </p>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 font-poppins text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-5 mb-8">
              {selectedItems.map((selItem) => {
                const itemMeta = orderData.items?.find((p: any) => p.id === selItem.id);

                return (
                  <div key={selItem.id} className="p-4 bg-white/80 rounded-2xl border border-[#DCDCCB] space-y-3">
                    <span className="font-signature font-bold text-sm text-[#203C2B] block">
                      {itemMeta?.productName || "Selected Item"} ({selItem.quantity} unit)
                    </span>

                    <select
                      value={itemReasons[selItem.id]?.reason || ""}
                      onChange={(e) => handleReasonChange(selItem.id, 'reason', e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-[#DCDCCB] bg-white font-poppins text-xs text-[#203C2B] outline-none focus:border-[#203C2B]"
                    >
                      <option value="">-- Choose reason --</option>
                      <option value="SIZE_TOO_SMALL">Size Too Small (Request Size Exchange)</option>
                      <option value="SIZE_TOO_LARGE">Size Too Large (Request Size Exchange)</option>
                      <option value="ITEM_DEFECTIVE">Material Flaw / Defect</option>
                      <option value="NOT_AS_EXPECTED">Silhouette Not as Envisioned</option>
                      <option value="OTHER">Other Reason</option>
                    </select>

                    <textarea
                      rows={2}
                      placeholder="Additional details or requested replacement size..."
                      value={itemReasons[selItem.id]?.details || ""}
                      onChange={(e) => handleReasonChange(selItem.id, 'details', e.target.value)}
                      className="w-full p-3 rounded-xl border border-[#DCDCCB] bg-white font-poppins text-xs text-[#203C2B] placeholder:text-[#8F9489] outline-none focus:border-[#203C2B]"
                    />
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleSubmitReturn}
              disabled={createReturnMutation.isPending}
              className="w-full h-12 bg-[#203C2B] hover:bg-[#2d523c] text-[#FFFCF4] font-poppins font-semibold text-xs uppercase tracking-widest rounded-full transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {createReturnMutation.isPending ? "Transmitting..." : "Submit Return Authorization"}
            </button>
          </div>
        )}

        {step === "success" && (
          <div className="w-full bg-[#FFFCF4]/90 backdrop-blur-md border border-[#DCDCCB] rounded-3xl p-8 sm:p-12 shadow-xs text-center animate-in zoom-in-95 duration-300">
            <div className="w-18 h-18 bg-[#71865B]/15 border border-[#71865B]/30 rounded-full flex items-center justify-center text-[#203C2B] mx-auto mb-6">
              <CheckCircle2 size={36} />
            </div>

            <h2 className="font-signature font-bold text-3xl text-[#203C2B] mb-2">
              Return Request Received
            </h2>
            <p className="font-poppins text-xs sm:text-sm text-[#62695A] mb-8 leading-relaxed max-w-md mx-auto">
              Our concierge team will review your authorization details and dispatch courier pickup instructions to your email within 24 hours.
            </p>

            <Link
              href="/shop"
              className="inline-flex px-8 py-3.5 bg-[#203C2B] hover:bg-[#2d523c] text-[#FFFCF4] font-poppins font-semibold text-xs uppercase tracking-widest rounded-full transition-all shadow-md"
            >
              Return to Catalog
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
