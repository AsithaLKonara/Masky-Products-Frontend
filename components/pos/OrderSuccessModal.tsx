"use client";

import { CheckCircle2, Printer, Mail, Plus, X } from "lucide-react";
import { useState } from "react";
import Receipt from "./Receipt";

export default function OrderSuccessModal({ 
  onClose, 
  orderData
}: { 
  onClose: () => void,
  orderData?: any
}) {
  const [showReceipt, setShowReceipt] = useState(false);

  const printReceipt = () => {
    window.print();
  };

  const receiptProps = {
    orderId: orderData?.orderId || "ORD-0000-0000",
    cashierName: orderData?.cashierName || "Kasun",
    date: new Date(),
    items: orderData?.items || [],
    subtotal: orderData?.subtotal || 0,
    discount: orderData?.discount || 0,
    total: orderData?.total || 0,
    paymentMethod: orderData?.paymentMethod || "Cash",
    tendered: orderData?.tendered || undefined,
    change: orderData?.change || undefined,
    branchName: orderData?.branchName,
    branchAddress: orderData?.branchAddress,
    branchPhone: orderData?.branchPhone
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      {!showReceipt ? (
        <div className="relative w-full max-w-[400px] bg-background shadow-2xl rounded-2xl overflow-hidden flex flex-col items-center animate-in fade-in zoom-in duration-300 p-8">
          
          <div className="w-20 h-20 bg-success-soft text-success rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={48} />
          </div>

          <h2 className="font-inter font-bold text-2xl text-foreground text-center mb-2">
            Payment Successful!
          </h2>
          <p className="font-inter text-muted text-sm text-center mb-8">
            Order #{receiptProps.orderId} has been completed.
          </p>

          <div className="w-full bg-surface border border-border rounded-xl p-4 flex flex-col gap-3 mb-8">
            <div className="flex justify-between items-center">
              <span className="font-inter text-muted text-sm">Total Paid</span>
              <span className="font-inter font-bold text-foreground">Rs. {receiptProps.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-inter text-muted text-sm">Method</span>
              <span className="font-inter font-semibold text-foreground">{receiptProps.paymentMethod}</span>
            </div>
            {receiptProps.change !== undefined && (
              <div className="flex justify-between items-center pt-3 border-t border-border">
                <span className="font-inter font-bold text-success text-sm uppercase tracking-wider">Change Due</span>
                <span className="font-inter font-bold text-success text-lg">Rs. {receiptProps.change.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="w-full flex flex-col gap-3">
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setShowReceipt(true)}
                className="flex-1 py-3 bg-surface border border-border rounded-xl font-inter font-semibold text-foreground hover:bg-background transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Printer size={16} /> View Receipt
              </button>
              <button className="flex-1 py-3 bg-surface border border-border rounded-xl font-inter font-semibold text-foreground hover:bg-background transition-colors flex items-center justify-center gap-2 text-sm">
                <Mail size={16} /> Email Receipt
              </button>
            </div>
            <button 
              onClick={onClose}
              className="w-full py-4 mt-2 bg-primary hover:bg-primary-hover text-white rounded-xl font-inter font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              <Plus size={20} /> New Order
            </button>
          </div>

        </div>
      ) : (
        <div className="relative w-full max-w-[400px] bg-background shadow-2xl rounded-2xl overflow-hidden flex flex-col items-center animate-in fade-in zoom-in duration-300 p-6">
          <button 
            onClick={() => setShowReceipt(false)}
            className="absolute top-4 right-4 p-2 text-muted hover:text-foreground hover:bg-surface rounded-full transition-colors z-10"
          >
            <X size={20} />
          </button>
          
          <h2 className="font-inter font-bold text-lg text-foreground text-center mb-4 w-full border-b border-border pb-4">
            Receipt Preview
          </h2>

          <div className="w-full max-h-[60vh] overflow-y-auto bg-stone-100 p-4 rounded-lg flex justify-center custom-scrollbar shadow-inner border border-border">
            <Receipt {...receiptProps} />
          </div>

          <button 
            onClick={printReceipt}
            className="w-full py-4 mt-6 bg-primary hover:bg-primary-hover text-white rounded-xl font-inter font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            <Printer size={20} /> Print Now
          </button>
        </div>
      )}
    </div>
  );
}
