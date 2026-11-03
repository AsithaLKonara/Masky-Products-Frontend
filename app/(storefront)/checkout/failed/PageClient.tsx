"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, RotateCcw, ArrowLeft, Banknote, CreditCard } from "lucide-react";
import Link from "next/link";
import { paymentService } from "@/services/payment.service";
import CategoryBar from "@/components/CategoryBar";

export default function CheckoutFailedClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderNumber = searchParams.get("orderNumber");

  const [selectedMethod, setSelectedMethod] = useState("mintpay");
  const [isRetrying, setIsRetrying] = useState(false);

  if (!orderNumber) {
    return (
      <main className="flex flex-col items-center w-full min-h-screen bg-[#FEF6E4] pt-[84px] px-4 text-[#203C2B]">
        <CategoryBar />
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto">
          <h1 className="font-signature font-bold text-2xl text-[#203C2B] mb-2">No Order Specified</h1>
          <p className="font-poppins text-xs text-[#62695A] mb-6">Please check your link or return to our shop catalog.</p>
          <Link href="/shop" className="px-6 py-2.5 rounded-full bg-[#203C2B] text-[#FFFCF4] font-poppins text-xs uppercase tracking-widest">
            Return to Catalog
          </Link>
        </div>
      </main>
    );
  }

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      const response = await paymentService.retryPayment(orderNumber, selectedMethod);
      if (response.success && response.payment) {
        if (selectedMethod === "cod" || !response.payment.redirectUrl) {
          router.push(`/checkout/success?orderNumber=${orderNumber}`);
        } else if (response.payment.isFormRedirect && response.payment.formData) {
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = response.payment.redirectUrl;
          
          Object.keys(response.payment.formData).forEach(key => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = response.payment.formData[key];
            form.appendChild(input);
          });
          
          document.body.appendChild(form);
          form.submit();
        } else {
          window.location.href = response.payment.redirectUrl;
        }
      } else {
        alert("Could not initiate retry. Please contact support.");
        setIsRetrying(false);
      }
    } catch (error) {
      console.error("Retry failed:", error);
      alert("Something went wrong. Please try again.");
      setIsRetrying(false);
    }
  };

  return (
    <main className="flex flex-col items-center w-full min-h-screen bg-[#FEF6E4] pt-[84px] pb-24 px-4 text-[#203C2B]">
      <CategoryBar />

      <div className="max-w-xl mx-auto py-12 w-full">
        <div className="bg-[#FFFCF4]/90 backdrop-blur-md rounded-3xl shadow-xs border border-[#DCDCCB] p-8 md:p-12 text-center">
          <div className="w-18 h-18 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-700">
            <AlertCircle size={36} />
          </div>
          
          <h1 className="font-signature font-bold text-3xl sm:text-4xl text-[#203C2B] mb-2">
            Payment Unsuccessful
          </h1>
          <p className="font-poppins text-xs sm:text-sm text-[#62695A] mb-8 leading-relaxed max-w-md mx-auto">
            We could not complete the transaction for Order <span className="font-semibold text-[#203C2B]">#{orderNumber}</span>. Your chosen creations remain saved. Please select an alternative payment method to proceed.
          </p>

          <div className="space-y-3 mb-8 text-left">
            <span className="font-poppins text-xs font-semibold uppercase tracking-wider text-[#62695A] block mb-2">
              Select Alternate Payment Method:
            </span>
            
            <label className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-white transition-all border rounded-2xl ${selectedMethod === 'mintpay' ? 'border-[#203C2B] bg-white shadow-2xs' : 'border-[#DCDCCB] bg-white/60'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${selectedMethod === 'mintpay' ? 'border-[#203C2B] bg-[#203C2B]' : 'border-[#DCDCCB] bg-white'}`}>
                {selectedMethod === 'mintpay' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <input type="radio" value="mintpay" checked={selectedMethod === 'mintpay'} onChange={() => setSelectedMethod('mintpay')} className="hidden" />
              <div className="font-poppins text-sm text-[#203C2B] font-medium">Mintpay (Buy Now, Pay Later)</div>
            </label>

            <label className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-white transition-all border rounded-2xl ${selectedMethod === 'koko' ? 'border-[#203C2B] bg-white shadow-2xs' : 'border-[#DCDCCB] bg-white/60'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${selectedMethod === 'koko' ? 'border-[#203C2B] bg-[#203C2B]' : 'border-[#DCDCCB] bg-white'}`}>
                {selectedMethod === 'koko' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <input type="radio" value="koko" checked={selectedMethod === 'koko'} onChange={() => setSelectedMethod('koko')} className="hidden" />
              <div className="font-poppins text-sm text-[#203C2B] font-medium">Koko (3 Interest-Free Installments)</div>
            </label>

            <label className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-white transition-all border rounded-2xl ${selectedMethod === 'cod' ? 'border-[#203C2B] bg-white shadow-2xs' : 'border-[#DCDCCB] bg-white/60'}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${selectedMethod === 'cod' ? 'border-[#203C2B] bg-[#203C2B]' : 'border-[#DCDCCB] bg-white'}`}>
                {selectedMethod === 'cod' && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <input type="radio" value="cod" checked={selectedMethod === 'cod'} onChange={() => setSelectedMethod('cod')} className="hidden" />
              <div className="font-poppins text-sm text-[#203C2B] font-medium">Cash On Delivery (Pay Upon Receipt)</div>
            </label>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full h-12 bg-[#203C2B] hover:bg-[#2d523c] text-[#FFFCF4] font-poppins font-semibold text-xs uppercase tracking-widest rounded-full transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw size={14} className={isRetrying ? "animate-spin" : ""} />
              {isRetrying ? "Retrying Transaction..." : "Retry With Selected Method"}
            </button>

            <Link
              href="/cart"
              className="font-poppins text-xs font-semibold text-[#62695A] hover:text-[#203C2B] transition-colors inline-flex items-center justify-center gap-1.5 py-2 uppercase tracking-wider"
            >
              <ArrowLeft size={13} />
              <span>Return to Shopping Bag</span>
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}
