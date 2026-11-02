"use client";

import React, { useState, useEffect } from "react";
import { X, ShieldCheck, Loader2 } from "lucide-react";
import { useSendOtp, useVerifyOtp } from "@/hooks/useOtp";
import { globalDialog } from "@/store/dialog.store";

interface OtpVerificationModalProps {
  isOpen: boolean;
  phone: string;
  onClose: () => void;
  onSuccess: (token: string) => void;
}

export default function OtpVerificationModal({ isOpen, phone, onClose, onSuccess }: OtpVerificationModalProps) {
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [hasSentInitial, setHasSentInitial] = useState(false);
  
  const sendOtpMutation = useSendOtp();
  const verifyOtpMutation = useVerifyOtp();

  useEffect(() => {
    if (isOpen && !hasSentInitial && phone) {
      handleSendOtp();
      setHasSentInitial(true);
    }
  }, [isOpen, phone, hasSentInitial]);

  useEffect(() => {
    if (!isOpen) {
      setOtp("");
      setTimeLeft(300);
      setHasSentInitial(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const handleSendOtp = () => {
    if (!phone) return;
    
    sendOtpMutation.mutate(phone, {
      onSuccess: () => {
        setTimeLeft(300); // Reset timer
      },
      onError: (err: any) => {
        const msg = err.response?.data?.error || "Failed to send OTP";
        globalDialog.alert(msg);
      }
    });
  };

  const handleVerify = () => {
    if (otp.length < 6) {
      globalDialog.alert("Please enter the 6-digit OTP");
      return;
    }

    verifyOtpMutation.mutate({ phone, otp }, {
      onSuccess: (data) => {
        onSuccess(data.verificationToken);
      },
      onError: (err: any) => {
        const msg = err.response?.data?.error || "Invalid OTP. Please try again.";
        globalDialog.alert(msg);
      }
    });
  };

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-[400px] bg-white rounded-3xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-stone-100">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="text-accent" size={24} />
            <h3 className="font-poppins font-semibold text-lg">Verify Phone Number</h3>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-primary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <p className="font-poppins text-sm text-stone-500 text-center">
            For security, please enter the 6-digit code sent to <br/>
            <span className="font-semibold text-primary">{phone}</span>
          </p>

          <div className="flex flex-col gap-2">
            <input 
              type="text" 
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full h-[60px] text-center text-3xl tracking-[1em] pl-[1em] font-poppins font-medium border border-stone-200 rounded-xl outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
            />
          </div>

          <div className="flex justify-center items-center">
             {timeLeft > 0 ? (
               <p className="font-poppins text-xs text-stone-500">
                 Code expires in <span className="font-semibold text-primary">{minutes}:{seconds.toString().padStart(2, '0')}</span>
               </p>
             ) : (
               <button 
                 onClick={handleSendOtp}
                 disabled={sendOtpMutation.isPending}
                 className="font-poppins text-xs font-semibold text-accent hover:underline disabled:opacity-50"
               >
                 {sendOtpMutation.isPending ? "Sending..." : "Resend Code"}
               </button>
             )}
          </div>

          <button 
            onClick={handleVerify}
            disabled={verifyOtpMutation.isPending || otp.length < 6}
            className="w-full h-[52px] mt-2 flex justify-center items-center bg-primary hover:bg-stone-800 transition-colors rounded-full font-poppins font-semibold text-sm text-white uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {verifyOtpMutation.isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              "Verify & Continue"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
