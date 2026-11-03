"use client";

import { X, CreditCard, Banknote, Smartphone, Globe, Landmark } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function PaymentModal({ total, onClose, onSuccess }: { total: string, onClose: () => void, onSuccess: (method: string) => void }) {
  const [selectedMethod, setSelectedMethod] = useState("Cash");
  const [tenderedAmount, setTenderedAmount] = useState("");

  const paymentMethods = [
    { name: "Cash", icon: <Banknote size={24} /> },
    { name: "Card", icon: <CreditCard size={24} /> },
    { name: "Koko", icon: <span className="font-bold text-[10px] text-primary tracking-widest">KOKO</span> },
    { name: "Mintpay", icon: <span className="font-bold text-[10px] text-emerald-600 tracking-wider">MINTPAY</span> },
    { name: "Payzy", icon: <span className="font-bold text-[10px] text-blue-600 tracking-wider">PAYZY</span> },
    { name: "Bank Transfer", icon: <Landmark size={24} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-[800px] max-h-[90vh] md:h-[550px] bg-background shadow-2xl rounded-2xl overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-200">
        
        {/* Left Sidebar - Payment Methods */}
        <div className="w-full md:w-[280px] bg-surface border-b md:border-b-0 md:border-r border-border flex flex-col shrink-0">
          <div className="p-4 border-b border-border hidden md:block">
            <h3 className="font-inter font-bold text-lg text-foreground">Payment Method</h3>
          </div>
          <div className="flex-none md:flex-1 overflow-x-auto md:overflow-y-auto p-4 flex flex-row md:flex-col gap-2 custom-scrollbar">
            {paymentMethods.map(method => (
              <button 
                key={method.name}
                onClick={() => setSelectedMethod(method.name)}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all border ${
                  selectedMethod === method.name 
                    ? 'border-primary bg-primary-soft shadow-sm' 
                    : 'border-border hover:border-primary/50 hover:bg-background'
                }`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                  selectedMethod === method.name ? 'text-primary' : 'text-muted'
                }`}>
                  {method.icon}
                </div>
                <span className={`font-inter font-semibold text-sm whitespace-nowrap ${
                  selectedMethod === method.name ? 'text-primary' : 'text-foreground'
                }`}>
                  {method.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col bg-background relative overflow-y-auto">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-muted hover:text-foreground hover:bg-surface rounded-full transition-colors z-10">
            <X size={20} />
          </button>
          
          <div className="flex-1 p-6 md:p-8 flex flex-col min-h-0">
            <div className="flex flex-col items-center justify-center mb-6 md:mb-8 mt-4 md:mt-0">
              <span className="font-inter text-muted text-sm uppercase tracking-widest font-semibold mb-2">Total Due</span>
              <div className="flex items-baseline gap-2">
                <span className="font-inter font-bold text-2xl text-muted">Rs.</span>
                <span className="font-inter font-bold text-5xl text-foreground tracking-tight">{total}</span>
              </div>
            </div>

            {/* Dynamic Content based on selected method */}
            {selectedMethod === "Cash" && (
              <div className="flex flex-col gap-4 md:gap-6 animate-in fade-in">
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  {['10,000', '5,000', 'Exact'].map(amt => (
                    <button 
                      key={amt} 
                      onClick={() => {
                        if (amt === 'Exact') {
                          setTenderedAmount(total.replace(/,/g, ''));
                        } else {
                          setTenderedAmount(amt.replace(/,/g, ''));
                        }
                      }}
                      className="py-3 bg-surface border border-border rounded-xl font-inter font-semibold text-foreground hover:border-primary hover:text-primary transition-colors">
                      {amt === 'Exact' ? 'Exact Amount' : `Rs. ${amt}`}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-inter font-semibold text-sm text-muted">Tendered Amount</label>
                  <input 
                    type="text" 
                    placeholder="Enter amount..."
                    value={tenderedAmount}
                    onChange={(e) => setTenderedAmount(e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl px-4 py-4 font-inter text-xl text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                {tenderedAmount && (
                  <div className="flex justify-between items-center p-4 bg-success-soft border border-success/20 rounded-xl mt-auto">
                    <span className="font-inter font-bold text-success text-sm uppercase tracking-wide">Change Due</span>
                    <span className="font-inter font-bold text-2xl text-success">Rs. {(parseFloat(tenderedAmount.replace(/,/g, '')) - parseFloat(total.replace(/,/g, ''))).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>
            )}

            {selectedMethod !== "Cash" && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 animate-in fade-in">
                <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center shadow-inner border border-border mb-4">
                  {paymentMethods.find(m => m.name === selectedMethod)?.icon}
                </div>
                <h4 className="font-inter font-bold text-xl text-foreground text-center">
                  Awaiting {selectedMethod} Payment
                </h4>
                <p className="font-inter text-muted text-center max-w-[250px] leading-relaxed">
                  Please process the payment on the {selectedMethod} terminal or merchant app.
                </p>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="mt-auto pt-6 flex gap-3">
              <button onClick={onClose} className="flex-1 py-4 bg-surface border border-border rounded-xl font-inter font-semibold text-foreground hover:bg-background transition-colors">
                Cancel
              </button>
              <button onClick={() => onSuccess(selectedMethod)} className="flex-1 py-4 bg-primary rounded-xl font-inter font-bold text-white hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">
                Complete Payment
              </button>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
