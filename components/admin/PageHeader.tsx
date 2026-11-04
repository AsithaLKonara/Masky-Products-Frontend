"use client";

import React from "react";
import { Plus } from "lucide-react";
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function PageHeader({ title, subtitle, actionLabel, actionHref, onAction }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
      <div>
        <h1 className="text-2xl font-bold font-inter text-foreground tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm font-inter text-muted mt-1">{subtitle}</p>
        )}
      </div>
      {actionLabel && (
        actionHref ? (
          <Link href={actionHref} className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-inter text-sm font-medium hover:opacity-90 transition-all shadow-sm flex items-center gap-2">
            <Plus size={18} />
            {actionLabel}
          </Link>
        ) : (
          <button onClick={onAction} className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-inter text-sm font-medium hover:opacity-90 transition-all shadow-sm flex items-center gap-2">
            <Plus size={18} />
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
}
