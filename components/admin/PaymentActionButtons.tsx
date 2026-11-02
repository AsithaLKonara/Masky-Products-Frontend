"use client";

import React, { useState } from "react";
import { RefreshCcw, AlertCircle } from "lucide-react";
import RefundModal from "./RefundModal";
import RetryPaymentModal from "./RetryPaymentModal";

interface PaymentActionButtonsProps {
  transactionId: string;
  status: "paid" | "failed" | "pending";
  totalAmount: number;
  customerName: string;
}

export default function PaymentActionButtons({ transactionId, status, totalAmount, customerName }: PaymentActionButtonsProps) {
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showRetryModal, setShowRetryModal] = useState(false);

  return (
    <>
      <div className="flex gap-2">
        {status === "paid" && (
          <button 
            onClick={() => setShowRefundModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-surface-elevated hover:bg-border text-foreground text-sm font-semibold font-inter rounded-lg transition-colors border border-border"
          >
            <RefreshCcw size={14} /> Process Refund
          </button>
        )}

        {status === "failed" && (
          <button 
            onClick={() => setShowRetryModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 text-sm font-semibold font-inter rounded-lg transition-colors border border-amber-200"
          >
            <AlertCircle size={14} /> Retry Payment
          </button>
        )}
      </div>

      {showRefundModal && (
        <RefundModal 
          transactionId={transactionId}
          totalAmount={totalAmount}
          onClose={() => setShowRefundModal(false)}
          onSuccess={() => setShowRefundModal(false)}
        />
      )}

      {showRetryModal && (
        <RetryPaymentModal 
          transactionId={transactionId}
          customerName={customerName}
          onClose={() => setShowRetryModal(false)}
          onSuccess={() => setShowRetryModal(false)}
        />
      )}
    </>
  );
}
