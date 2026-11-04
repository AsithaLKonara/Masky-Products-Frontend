"use client";

import React, { Suspense, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ChevronRight, Package, Loader2, Sparkles } from "lucide-react";
import { useOrderConfirmation } from "@/hooks/useOrders";
import CategoryBar from "@/components/CategoryBar";
import { api } from "@/services/api";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber");

  const { data: order, isLoading, isError } = useOrderConfirmation(orderNumber || "");

  const hasFiredPixel = useRef(false);
  useEffect(() => {
    if (order && !hasFiredPixel.current) {
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'Purchase', {
          value: order.total,
          currency: 'LKR',
          content_ids: order.items?.map((item: any) => item.variant?.product?.id) || [],
          content_type: 'product',
        });
      }
      hasFiredPixel.current = true;
    }
  }, [order]);

  useEffect(() => {
    if (!order) return;
    
    // Check if we need to poll for payment status
    if (order.paymentMethod?.toUpperCase() !== 'COD' && (order.paymentStatus === 'UNPAID' || order.paymentStatus === 'PENDING')) {
      const interval = setInterval(async () => {
        try {
          const res = await api.get(`/payments/status/${order.orderNumber}`);
          const data = res.data;
          if (data.success && (data.paymentStatus === 'PAID' || data.paymentStatus === 'FAILED' || data.paymentStatus === 'COD_PENDING')) {
            window.location.reload();
          }
        } catch (e) {
          console.error('Failed to poll payment status:', e);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [order]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
        <Loader2 className="animate-spin text-[#203C2B] mb-4" size={36} />
        <p className="font-poppins text-xs uppercase tracking-wider text-[#62695A]">Retrieving your confirmation...</p>
      </div>
    );
  }

  if (order && order.paymentMethod?.toUpperCase() !== 'COD' && (order.paymentStatus === 'UNPAID' || order.paymentStatus === 'PENDING')) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
        <Loader2 className="animate-spin text-[#203C2B] mb-4" size={36} />
        <h2 className="font-signature font-bold text-2xl text-[#203C2B] mb-2">Verifying Payment...</h2>
        <p className="font-poppins text-xs text-[#62695A] text-center max-w-md">
          Please wait while we confirm your transaction with the payment gateway.
        </p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center max-w-lg w-full bg-[#FFFCF4]/90 p-8 md:p-12 rounded-3xl shadow-xs border border-[#DCDCCB] text-center">
        <h1 className="font-signature font-bold text-2xl text-red-600 mb-2">
          Order Not Found
        </h1>
        <p className="font-poppins text-xs text-[#62695A] mb-8 leading-relaxed">
          We could not locate this order record. If you just completed payment, please check your SMS or email for confirmation.
        </p>
        <Link 
          href="/shop"
          className="flex items-center justify-center gap-2 w-full h-12 bg-[#203C2B] text-[#FFFCF4] hover:bg-[#2d523c] transition-all rounded-full font-poppins font-semibold text-xs uppercase tracking-widest"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  // Format amount
  const formattedTotal = new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR'
  }).format(order.total);

  // Format date
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(order.createdAt));

  return (
    <div className="flex flex-col items-center max-w-xl w-full bg-[#FFFCF4]/90 p-8 md:p-12 rounded-3xl shadow-xs border border-[#DCDCCB] animate-in zoom-in-95 fade-in duration-300">
      {/* Success Icon */}
      <div className="w-18 h-18 bg-[#71865B]/15 border border-[#71865B]/30 rounded-full flex items-center justify-center text-[#203C2B] mb-6">
        <CheckCircle2 size={36} />
      </div>

      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#71865B]/15 border border-[#71865B]/30 text-[#203C2B] mb-3">
        <Sparkles size={11} className="text-[#71865B]" />
        <span className="font-poppins text-[10px] font-semibold tracking-[0.18em] uppercase">
          Maison Masky Order Confirmed
        </span>
      </div>

      {/* Title */}
      <h1 className="font-signature font-bold text-3xl sm:text-4xl text-[#203C2B] mb-2 text-center">
        Thank You For Your Order
      </h1>
      <p className="font-poppins text-xs sm:text-sm text-[#62695A] text-center mb-8 leading-relaxed">
        Your creations have been reserved and entered our fulfillment atelier. We will dispatch your package in signature packaging promptly.
      </p>

      {/* Order Details Card */}
      <div className="w-full bg-white/80 border border-[#DCDCCB] rounded-2xl p-6 flex flex-col gap-3.5 mb-8 text-left">
        <div className="flex justify-between items-center w-full border-b border-[#DCDCCB]/60 pb-3 font-poppins text-xs">
          <span className="text-[#62695A]">Order Reference</span>
          <span className="font-semibold text-[#203C2B]">#{order.orderNumber || order.id.substring(0, 8)}</span>
        </div>
        <div className="flex justify-between items-center w-full border-b border-[#DCDCCB]/60 pb-3 font-poppins text-xs">
          <span className="text-[#62695A]">Date</span>
          <span className="font-semibold text-[#203C2B]">{formattedDate}</span>
        </div>
        <div className="flex justify-between items-center w-full border-b border-[#DCDCCB]/60 pb-3 font-poppins text-xs">
          <span className="text-[#62695A]">Payment Gateway</span>
          <span className="font-semibold text-[#203C2B] uppercase">{order.paymentGateway || order.paymentMethod || 'Standard'}</span>
        </div>
        <div className="flex justify-between items-center w-full pt-1">
          <span className="font-signature font-bold text-base text-[#203C2B]">Total Settled</span>
          <span className="font-signature font-bold text-xl text-[#203C2B]">{formattedTotal}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
        <Link 
          href="/track-order"
          className="flex items-center justify-center gap-2 w-full h-12 bg-white/90 border border-[#203C2B] text-[#203C2B] hover:bg-[#203C2B] hover:text-[#FFFCF4] transition-all rounded-full font-poppins font-semibold text-xs uppercase tracking-widest shadow-2xs"
        >
          <Package size={16} />
          Track Parcel
        </Link>
        
        <Link 
          href="/shop"
          className="flex items-center justify-center gap-2 w-full h-12 bg-[#203C2B] text-[#FFFCF4] hover:bg-[#2d523c] transition-all rounded-full font-poppins font-semibold text-xs uppercase tracking-widest shadow-sm"
        >
          Continue Shopping
          <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <main className="flex flex-col items-center w-full min-h-screen bg-[#FEF6E4] pt-[84px] pb-24 px-4 text-[#203C2B]">
      <CategoryBar />
      <div className="py-12 w-full flex justify-center">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
            <Loader2 className="animate-spin text-[#203C2B] mb-4" size={36} />
          </div>
        }>
          <CheckoutSuccessContent />
        </Suspense>
      </div>
    </main>
  );
}
