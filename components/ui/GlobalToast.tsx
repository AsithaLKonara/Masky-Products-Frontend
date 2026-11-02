"use client";

import { useToastStore } from "@/store/toast.store";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function GlobalToast() {
  const { toasts, remove } = useToastStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => {
        const isSuccess = t.type === "success";
        const isError = t.type === "error";
        const isWarning = t.type === "warning";

        const bgClass = isSuccess ? "bg-emerald-50 border-emerald-200" : isError ? "bg-red-50 border-red-200" : isWarning ? "bg-orange-50 border-orange-200" : "bg-blue-50 border-blue-200";
        const textClass = isSuccess ? "text-emerald-800" : isError ? "text-red-800" : isWarning ? "text-orange-800" : "text-blue-800";
        const Icon = isSuccess ? CheckCircle2 : isError ? XCircle : isWarning ? AlertTriangle : Info;

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg transition-all animate-in slide-in-from-right-8 ${bgClass}`}
          >
            <Icon className={textClass} size={20} />
            <p className={`font-inter text-sm font-medium ${textClass}`}>{t.message}</p>
            <button
              onClick={() => remove(t.id)}
              className={`ml-2 p-1 rounded-md opacity-70 hover:opacity-100 transition-opacity ${textClass}`}
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
