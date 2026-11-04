"use client";

import React, { useState } from "react";
import { X, ArrowRightLeft, Search } from "lucide-react";
import { useCreateTransfer, useInventory } from "@/hooks/useInventory";

interface StockTransferModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const LOCATIONS = ["Online", "Colombo", "Kandy"];

export default function StockTransferModal({ onClose, onSuccess }: StockTransferModalProps) {
  const [fromLocation, setFromLocation] = useState("Online");
  const [toLocation, setToLocation] = useState("Colombo");
  const [variantId, setVariantId] = useState("");
  const [skuSearch, setSkuSearch] = useState("");
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const createTransfer = useCreateTransfer();
  const { data: searchResults } = useInventory(undefined, skuSearch, undefined, 1);
  const selectedVariant = searchResults?.data?.find((v: any) => v.variantId === variantId);

  const handleSelectVariant = (v: any) => {
    setVariantId(v.variantId);
    setSkuSearch(v.sku);
    setShowDropdown(false);
  };

  const handleProcess = async () => {
    if (!variantId || fromLocation === toLocation) return;
    await createTransfer.mutateAsync({
      variantId,
      fromBranchId: fromLocation,
      toBranchId: toLocation,
      quantity: qty,
      notes,
    });
    onSuccess();
  };

  const isProcessing = createTransfer.isPending;
  const canSubmit = variantId && qty > 0 && fromLocation !== toLocation;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-border bg-surface-elevated shrink-0">
          <div>
            <h2 className="font-inter font-bold text-xl text-foreground flex items-center gap-2">
              <ArrowRightLeft className="text-foreground/80" size={24} /> Request Stock Transfer
            </h2>
            <p className="font-inter text-sm text-muted mt-1">Move inventory between branches.</p>
          </div>
          <button onClick={onClose} className="p-2 text-muted/70 hover:text-foreground hover:bg-border rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto bg-surface-elevated flex-1 flex flex-col gap-5">
          <div className="bg-surface border border-border rounded-xl p-5 shadow-sm flex flex-col gap-5">

            {/* From / To */}
            <div className="grid grid-cols-2 gap-4 relative">
              <div className="flex flex-col gap-2">
                <label className="font-inter text-sm font-semibold text-foreground/80">From Branch</label>
                <select
                  value={fromLocation}
                  onChange={e => setFromLocation(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm font-inter outline-none focus:ring-2 focus:ring-primary bg-surface-elevated"
                >
                  {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-inter text-sm font-semibold text-foreground/80">To Branch</label>
                <select
                  value={toLocation}
                  onChange={e => setToLocation(e.target.value)}
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm font-inter outline-none focus:ring-2 focus:ring-primary bg-surface-elevated"
                >
                  {LOCATIONS.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="absolute top-9 left-1/2 -translate-x-1/2 w-8 h-8 bg-surface border border-border rounded-full flex items-center justify-center text-muted/70 z-10 shadow-sm">
                <ArrowRightLeft size={14} />
              </div>
            </div>

            {fromLocation === toLocation && (
              <p className="text-amber-600 text-xs font-inter">From and To branches must be different.</p>
            )}

            {/* SKU Search */}
            <div className="flex flex-col gap-2 relative">
              <label className="font-inter text-sm font-semibold text-foreground/80">Product / SKU</label>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/70" />
                <input
                  type="text"
                  value={skuSearch}
                  onChange={e => { setSkuSearch(e.target.value); setVariantId(""); setShowDropdown(true); }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Search SKU or product name..."
                  className="w-full pl-9 border border-border rounded-lg px-3 py-2.5 text-sm font-inter outline-none focus:ring-2 focus:ring-primary bg-surface"
                />
              </div>
              {showDropdown && skuSearch && (
                <div className="absolute top-full left-0 right-0 z-10 bg-surface border border-border rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                  {(searchResults?.data ?? []).length === 0 ? (
                    <p className="p-3 text-sm text-muted/70 text-center">No results</p>
                  ) : (
                    (searchResults?.data ?? []).map((v: any) => (
                      <button
                        key={v.variantId}
                        onClick={() => handleSelectVariant(v)}
                        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-surface-elevated transition-colors text-left"
                      >
                        <div>
                          <p className="font-mono text-xs font-medium text-foreground">{v.sku}</p>
                          <p className="text-xs text-muted">{v.productName} — {v.name}</p>
                        </div>
                        <span className="text-xs font-bold bg-surface-elevated text-foreground/80 px-2 py-0.5 rounded">
                          {v.quantity} in stock
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {selectedVariant && (
              <div className="flex items-center justify-between bg-surface-elevated border border-border rounded-lg px-4 py-2.5">
                <div>
                  <p className="font-inter text-sm font-semibold text-foreground">{selectedVariant.productName}</p>
                  <p className="font-mono text-xs text-muted/70">{selectedVariant.sku} · {selectedVariant.name}</p>
                </div>
                <span className="text-sm font-bold text-foreground/80">{selectedVariant.quantity} available</span>
              </div>
            )}

            {/* Quantity */}
            <div className="flex flex-col gap-2">
              <label className="font-inter text-sm font-semibold text-foreground/80">Quantity to Transfer</label>
              <input
                type="number"
                value={qty}
                onChange={e => setQty(Number(e.target.value))}
                min="1"
                max={selectedVariant?.quantity ?? undefined}
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm font-inter outline-none focus:ring-2 focus:ring-primary bg-surface"
              />
            </div>

            {/* Notes */}
            <div className="flex flex-col gap-2">
              <label className="font-inter text-sm font-semibold text-foreground/80">Notes (optional)</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Urgent restock for weekend sale"
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm font-inter outline-none focus:ring-2 focus:ring-primary bg-surface"
              />
            </div>

            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm font-inter">
              <span className="mt-0.5">ℹ️</span>
              <p>This request will require approval from a Super Admin before stock is deducted.</p>
            </div>

            {createTransfer.isError && (
              <p className="text-red-600 text-sm font-inter text-center">Failed to submit transfer. Please try again.</p>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-border bg-surface flex justify-end gap-3 shrink-0">
          <button onClick={onClose} disabled={isProcessing} className="px-5 py-2.5 bg-surface border border-border text-foreground/80 font-inter font-medium text-sm rounded-lg hover:bg-surface-elevated transition-colors shadow-sm disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={handleProcess}
            disabled={isProcessing || !canSubmit}
            className="px-8 py-2.5 bg-primary text-primary-foreground font-inter font-medium text-sm rounded-lg hover:opacity-90 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isProcessing ? "Submitting..." : "Request Transfer"}
          </button>
        </div>
      </div>
    </div>
  );
}
