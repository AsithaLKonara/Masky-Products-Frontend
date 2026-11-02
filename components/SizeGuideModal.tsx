"use client";

import { X } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  sizeGuideContent?: string | null;
  sizeGuideImageUrl?: string | null;
}

export default function SizeGuideModal({ isOpen, onClose, sizeGuideContent, sizeGuideImageUrl }: SizeGuideModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"Measurements" | "Visual Guide">("Measurements");

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const parsedGuide = useMemo(() => {
    if (!sizeGuideContent) return { headers: [], rows: [] };
    const lines = sizeGuideContent.split('\n').filter(Boolean);
    const rows: Record<string, string>[] = [];
    const headerSet = new Set<string>();
    
    lines.forEach(line => {
      const [sizePart, measurementsPart] = line.split('—');
      if (!sizePart || !measurementsPart) return;
      
      const size = sizePart.trim();
      const row: Record<string, string> = { Size: size };
      
      const measurements = measurementsPart.split(',');
      measurements.forEach(m => {
        const [key, val] = m.split(':');
        if (key && val) {
          const h = key.trim();
          headerSet.add(h);
          row[h] = val.trim();
        }
      });
      rows.push(row);
    });
    
    return { headers: Array.from(headerSet), rows };
  }, [sizeGuideContent]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-[600px] bg-white shadow-2xl rounded-sm p-6 md:p-8 animate-in fade-in zoom-in duration-300">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-200 rounded-full transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="font-signature text-4xl text-stone-900 mb-4">Size Guide</h2>
        
        {/* Tabs */}
        <div className="flex gap-6 border-b border-stone-200 mb-6">
          {(["Measurements", "Visual Guide"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 font-inter text-sm transition-all ${
                activeTab === tab
                  ? "border-b-2 border-stone-900 text-stone-900 font-medium"
                  : "border-b-2 border-transparent text-stone-500 hover:text-stone-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {activeTab === "Measurements" ? (
          <div className="w-full overflow-x-auto animate-in fade-in duration-300">
            {parsedGuide.rows.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-stone-800 text-stone-900 font-inter font-bold text-sm uppercase tracking-wider">
                    <th className="py-4 pr-4">Size</th>
                    {parsedGuide.headers.map(header => (
                      <th key={header} className="py-4 px-4">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="font-inter text-sm text-stone-700">
                  {parsedGuide.rows.map((row, i) => (
                    <tr key={i} className="border-b border-stone-200">
                      <td className="py-4 pr-4 font-bold text-stone-900">{row.Size}</td>
                      {parsedGuide.headers.map(header => (
                        <td key={header} className="py-4 px-4">{row[header] || '-'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="font-inter text-stone-500 text-sm text-center py-8">
                No measurements available for this product.
              </p>
            )}
          </div>
        ) : (
          <div className="w-full flex flex-col items-center animate-in fade-in duration-300">
            {sizeGuideImageUrl ? (
              <div className="relative w-full aspect-[4/3] bg-stone-50 rounded-lg overflow-hidden border border-stone-200">
                <Image 
                  src={sizeGuideImageUrl} 
                  alt="Visual Size Guide" 
                  fill 
                  className="object-contain" 
                />
              </div>
            ) : (
              <div className="w-full aspect-[4/3] bg-stone-50 rounded-lg flex items-center justify-center border border-stone-200 p-4">
                <div className="text-stone-400 font-inter text-sm flex flex-col items-center gap-2">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  <span>No visual guide available for this product.</span>
                </div>
              </div>
            )}
            
            <p className="font-inter text-stone-500 text-xs mt-4 italic text-center">
              Use this visual guide to understand where to measure your body for the perfect fit.
            </p>
          </div>
        )}
        
        <p className="font-inter text-stone-500 text-xs mt-6 italic">
          * Note: Measurements are for reference only. Fit may vary depending on the style.
        </p>

      </div>
    </div>,
    document.body
  );
}
