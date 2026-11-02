"use client";

import React, { useState } from "react";
import { X, Lock, Unlock, AlertCircle } from "lucide-react";
import { useOpenSession, useCloseSession, useExpectedClosing, useSessionSummary } from "@/hooks/usePos";
import ZReportSlip from "./ZReportSlip";

interface PosShiftModalProps {
  mode: "OPEN" | "CLOSE";
  activeSession: any;
  branchId: string;
  terminalId: string;
  userId: string;
  onClose: () => void;
  onSuccess: (float: number) => void;
}

export default function PosShiftModal({ mode, activeSession, branchId, terminalId, userId, onClose, onSuccess }: PosShiftModalProps) {
  const [floatAmount, setFloatAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [closedSessionId, setClosedSessionId] = useState<string | null>(null);

  const { data: expectedClosingData, isLoading: expectedClosingLoading } = useExpectedClosing(
    mode === "CLOSE" ? activeSession?.id : undefined
  );

  const { data: sessionSummaryData } = useSessionSummary(
    (mode === "CLOSE" && isSuccess && closedSessionId) ? closedSessionId : undefined
  );

  const expectedCash = expectedClosingData?.expectedClosing || 0;
  const actualCash = Number(floatAmount) || 0;
  const variance = actualCash - expectedCash;
  
  const openSessionMutation = useOpenSession();
  const closeSessionMutation = useCloseSession();

  const handleProcess = async () => {
    setIsProcessing(true);
    try {
      if (mode === "CLOSE") {
        if (!activeSession) throw new Error("No active session to close.");
        const sessionId = activeSession.id;
        await closeSessionMutation.mutateAsync({
          sessionId,
          actualClosing: actualCash
        });
        setClosedSessionId(sessionId);
        setIsSuccess(true);
      } else {
        await openSessionMutation.mutateAsync({
          branchId,
          terminalId,
          userId,
          openingFloat: actualCash
        });
        onSuccess(actualCash);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess && mode === "CLOSE") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col p-8 items-center text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
            <Lock size={32} />
          </div>
          <h2 className="font-inter font-bold text-2xl text-stone-900 mb-2">Shift Closed</h2>
          <p className="text-stone-500 font-inter text-sm mb-6">Drawer balanced and sales recorded for the day.</p>
          
          <div className="w-full bg-stone-50 border border-stone-200 rounded-lg p-4 mb-6 flex flex-col gap-2 text-sm text-left font-inter">
            <div className="flex justify-between"><span>Opening Cash</span><span>Rs. {activeSession?.openingFloat?.toLocaleString() || '0'}</span></div>
            <div className="flex justify-between font-bold pt-2 border-t border-stone-200"><span>Variance</span><span className={variance < 0 ? "text-red-600" : "text-emerald-600"}>Rs. {variance.toLocaleString()}</span></div>
          </div>

          {sessionSummaryData && (
            <div className="print-only">
              <ZReportSlip session={sessionSummaryData.session} summary={sessionSummaryData.summary} />
            </div>
          )}

          <button 
            onClick={() => {
              window.print();
            }}
            disabled={!sessionSummaryData}
            className="w-full py-3 bg-stone-900 text-white font-inter font-bold rounded-xl hover:bg-stone-800 transition-colors mb-3 disabled:opacity-50"
          >
            Print Day End Report
          </button>
          
          <button 
            onClick={() => onSuccess(actualCash)}
            className="w-full py-3 bg-stone-100 text-stone-700 font-inter font-bold rounded-xl hover:bg-stone-200 transition-colors"
          >
            Finish & Log Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-6 border-b border-stone-200 bg-stone-50 shrink-0">
          <div>
            <h2 className="font-inter font-bold text-xl text-stone-900 flex items-center gap-2">
              {mode === "OPEN" ? <Unlock className="text-emerald-600" size={24} /> : <Lock className="text-red-600" size={24} />}
              {mode === "OPEN" ? "Open Register" : "Close Register"}
            </h2>
            <p className="font-inter text-sm text-stone-500 mt-1">
              {mode === "OPEN" ? "Enter the opening cash float to begin your shift." : "Count and enter the closing cash float."}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 bg-stone-100 flex-1 flex flex-col gap-6">
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm flex flex-col gap-5">
            
            {mode === "CLOSE" && (
              <div className="flex flex-col gap-2 p-4 bg-stone-50 border border-stone-200 rounded-lg">
                <div className="flex justify-between text-sm font-inter">
                  <span className="text-stone-500">Opening Float</span>
                  <span className="font-medium text-stone-900">Rs. {activeSession?.openingFloat?.toLocaleString() || '0'}</span>
                </div>
                {expectedClosingLoading ? (
                  <div className="text-sm text-muted animate-pulse">Calculating cash sales...</div>
                ) : (
                  <>
                    <div className="flex justify-between text-sm font-inter">
                      <span className="text-stone-500">Cash Sales</span>
                      <span className="font-medium text-stone-900">Rs. {(expectedCash - (activeSession?.openingFloat || 0)).toLocaleString()}</span>
                    </div>
                    <div className="w-full h-px bg-stone-200 my-1"></div>
                    <div className="flex justify-between font-inter">
                      <span className="font-bold text-stone-700">Expected Cash</span>
                      <span className="font-bold text-stone-900">Rs. {expectedCash.toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="font-inter text-sm font-semibold text-stone-700">
                {mode === "OPEN" ? "Opening Cash Amount (Rs.)" : "Actual Cash Amount (Rs.)"}
              </label>
              <input 
                type="number" 
                value={floatAmount}
                onChange={(e) => setFloatAmount(e.target.value)}
                placeholder="e.g. 5000"
                autoFocus
                className="w-full border border-stone-200 rounded-lg px-4 py-3 text-lg font-inter font-bold outline-none focus:ring-2 focus:ring-stone-900 bg-white"
              />
            </div>

            {mode === "CLOSE" && floatAmount && !expectedClosingLoading && (
              <div className={`flex items-start gap-3 p-3 rounded-lg text-sm font-inter ${variance === 0 ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold">Variance: {variance > 0 ? '+' : ''}{variance.toLocaleString()}</p>
                  <p>{variance === 0 ? 'Perfect match. Drawer is balanced.' : variance > 0 ? 'Drawer is over.' : 'Drawer is short.'}</p>
                </div>
              </div>
            )}

          </div>
        </div>

        <div className="p-6 border-t border-stone-200 bg-white flex justify-end gap-3 shrink-0">
          <button onClick={onClose} disabled={isProcessing} className="px-5 py-2.5 bg-white border border-stone-200 text-stone-700 font-inter font-medium text-sm rounded-lg hover:bg-stone-50 transition-colors shadow-sm disabled:opacity-50">
            Cancel
          </button>
          <button 
            onClick={handleProcess} 
            disabled={isProcessing || !floatAmount || (mode === "CLOSE" && expectedClosingLoading)} 
            className={`px-8 py-2.5 text-white font-inter font-medium text-sm rounded-lg transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 ${mode === 'OPEN' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {isProcessing ? "Processing..." : mode === "OPEN" ? "Open Shift" : "Close Shift"}
          </button>
        </div>

      </div>
    </div>
  );
}
