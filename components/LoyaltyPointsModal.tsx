"use client";

import React, { useState, useEffect } from "react";

import { X, Search, Loader2 } from "lucide-react";
import { orderService } from "@/services/order.service";

interface LoyaltyPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPoints: (points: number) => void;
}

export default function LoyaltyPointsModal({ isOpen, onClose, onApplyPoints }: LoyaltyPointsModalProps) {
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>();
  const [availablePoints, setAvailablePoints] = useState<number>(0);
  const [pointsToApply, setPointsToApply] = useState<string>("");
  const [step, setStep] = useState<"search" | "found">("search");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSearch = async () => {
    if (!phoneNumber || !/^0\d{9}$/.test(phoneNumber)) {
      setErrorMsg("Please enter a valid 10-digit phone number starting with 0");
      return;
    }
    setIsLoading(true);
    setErrorMsg("");
    try {
      const { data } = await orderService.getLoyaltyPoints(phoneNumber);
      const points = data?.loyaltyPoints || 0;
      setAvailablePoints(points);
      setStep("found");
    } catch (err: any) {
      console.error("Failed to load loyalty points:", err);
      setErrorMsg("Failed to check points. Please verify phone number.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    const points = parseInt(pointsToApply);
    if (!isNaN(points) && points > 0 && points <= availablePoints) {
      onApplyPoints(points);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="loyalty-modal-title"
        className="relative w-full max-w-[800px] bg-background rounded-[24px] overflow-hidden shadow-2xl flex flex-col p-8 md:p-12 animate-in zoom-in-95 duration-200"
      >
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white border border-stone-200 hover:bg-stone-100 transition-colors text-stone-500 hover:text-primary"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex flex-col gap-2 mb-10 w-full border-b border-stone-300 pb-8">
          <h2 className="font-poppins font-semibold text-2xl md:text-4xl text-[#0C0A09]">
            {step === "search" ? "Loyalty Points" : `You have ${availablePoints.toLocaleString()} points`}
          </h2>
          <p className="font-poppins text-xs md:text-sm text-stone-500">
            Earn 1% in loyalty points on every order you place at Masky Product. 1 point = Rs. 1 discount.
          </p>
        </div>

        {/* Step 1: Search by Phone */}
        {step === "search" && (
          <div className="flex flex-col gap-6 w-full max-w-[500px]">
            <div className="flex flex-col gap-3 w-full">
              <label className="font-poppins font-medium text-xs uppercase tracking-wider text-stone-500">
                Phone number <span className="text-accent">*</span>
              </label>
              
              <input 
                type="tel"
                placeholder="Enter phone number (e.g., 0712345678)"
                value={phoneNumber || ''}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full h-[52px] px-[20px] border border-[#44403B] rounded-full bg-white font-poppins text-sm text-primary outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-stone-400"
              />
            </div>
            
            {errorMsg && (
              <p className="text-red-500 text-xs font-poppins">{errorMsg}</p>
            )}

            <button 
              onClick={handleSearch}
              disabled={!phoneNumber || isLoading}
              className="h-[52px] w-full md:w-[160px] flex justify-center items-center gap-2 bg-primary hover:bg-stone-800 disabled:bg-stone-400 transition-colors rounded-full font-poppins font-semibold text-sm text-white uppercase tracking-widest mt-2"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
              {isLoading ? "Checking..." : "Check"}
            </button>
          </div>
        )}

        {/* Step 2: Apply Points */}
        {step === "found" && (
          <div className="flex flex-col gap-8 w-full animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="flex flex-col gap-3 w-full max-w-[500px]">
              <label className="font-poppins font-medium text-sm text-[#0C0A09]">
                {availablePoints > 0 ? "Enter points to redeem as discount" : "No points available for this number yet"}
              </label>
              {availablePoints > 0 ? (
                <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                  <input 
                    type="number"
                    placeholder={`Max ${availablePoints}`}
                    value={pointsToApply}
                    max={availablePoints}
                    min={1}
                    onChange={(e) => setPointsToApply(e.target.value)}
                    className="w-full md:flex-1 h-[52px] px-[20px] border border-[#44403B] rounded-full bg-white font-poppins text-sm text-primary outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-stone-400"
                  />
                  <button 
                    onClick={handleApply}
                    disabled={!pointsToApply || parseInt(pointsToApply) <= 0 || parseInt(pointsToApply) > availablePoints}
                    className="w-full md:w-[120px] h-[52px] flex justify-center items-center bg-primary hover:bg-stone-800 disabled:bg-stone-400 transition-colors rounded-full font-poppins font-semibold text-sm text-white uppercase tracking-widest"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <p className="font-poppins text-sm text-stone-500">
                  Place an order now to earn 1% in points for your next purchase!
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 w-full pt-8 mt-4 border-t border-stone-200">
              <button 
                onClick={() => {
                  setStep("search");
                  setPointsToApply("");
                }}
                className="w-full sm:w-auto h-[52px] px-8 flex justify-center items-center border border-stone-300 hover:bg-stone-100 transition-colors rounded-full font-poppins font-semibold text-sm text-primary uppercase tracking-widest"
              >
                Change Phone
              </button>
              <button 
                onClick={onClose}
                className="w-full sm:w-auto h-[52px] px-8 flex justify-center items-center border border-[#44403B] hover:bg-stone-100 transition-colors rounded-full font-poppins font-semibold text-sm text-primary uppercase tracking-widest"
              >
                Cancel
              </button>
              {availablePoints > 0 && (
                <button 
                  onClick={handleApply}
                  disabled={!pointsToApply || parseInt(pointsToApply) <= 0 || parseInt(pointsToApply) > availablePoints}
                  className="w-full sm:w-auto h-[52px] px-10 flex justify-center items-center bg-primary hover:bg-stone-800 disabled:bg-stone-400 transition-colors rounded-full font-poppins font-semibold text-sm text-white uppercase tracking-widest"
                >
                  Apply
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
