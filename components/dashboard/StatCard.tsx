"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  badge?: string;
  trend?: string;
  trendText?: string;
  trendType?: "positive" | "negative" | "neutral";
  subtext?: string;
  icon?: React.ReactNode;
}

export default function StatCard({
  label,
  value,
  badge,
  trend,
  trendText,
  trendType = "positive",
  subtext,
  icon,
}: StatCardProps) {
  const displayTrend = trendText || trend;
  const isPositive = trendType === "positive";
  const isNegative = trendType === "negative";

  const badgeStyles = isPositive
    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
    : isNegative
    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
    : "bg-surface-subtle text-muted border-border";

  const trendTextStyles = isPositive
    ? "text-emerald-600 dark:text-emerald-400"
    : isNegative
    ? "text-rose-600 dark:text-rose-400"
    : "text-muted";

  return (
    <div className="flex flex-col justify-between p-5 w-full bg-surface border border-border rounded-2xl shadow-2xs hover:border-border/80 transition-all group">
      {/* Top Row: Label and Icon / Pill Badge */}
      <div className="flex items-start justify-between gap-2">
        <span className="font-inter text-xs font-semibold text-muted uppercase tracking-wider">
          {label}
        </span>
        {icon ? (
          <div className="w-8 h-8 rounded-xl bg-surface-subtle border border-border flex items-center justify-center text-muted group-hover:text-accent transition-colors shrink-0">
            {icon}
          </div>
        ) : badge ? (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold font-inter border ${badgeStyles}`}
          >
            {isPositive && <TrendingUp size={11} strokeWidth={2.5} />}
            {isNegative && <TrendingDown size={11} strokeWidth={2.5} />}
            {badge}
          </span>
        ) : null}
      </div>

      {/* Main Metric Value */}
      <div className="my-2.5">
        <span className="font-inter font-bold text-[28px] sm:text-[32px] leading-tight text-foreground tracking-tight block">
          {value}
        </span>
        {displayTrend && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className={`inline-flex items-center gap-1 text-xs font-semibold font-inter ${trendTextStyles}`}>
              {isPositive && <TrendingUp size={12} strokeWidth={2.5} />}
              {isNegative && <TrendingDown size={12} strokeWidth={2.5} />}
              {!isPositive && !isNegative && <Minus size={12} />}
              {displayTrend}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Subtext Row */}
      {subtext && (
        <div className="pt-3 border-t border-border/40 mt-1">
          <span className="font-inter text-xs text-muted/70 font-medium block truncate">
            {subtext}
          </span>
        </div>
      )}
    </div>
  );
}
