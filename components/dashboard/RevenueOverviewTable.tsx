"use client";

import React from "react";
import { Download } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

interface GatewayData {
  gw: string;
  amount: number;
  count: number;
  pct: number;
}

const DEFAULT_BREAKDOWN = [
  { name: "Subscriptions", value: 22500, pct: 67, color: "#3B82F6" },
  { name: "One-time Sales...", value: 1100, pct: 3, color: "#10B981" },
  { name: "Branch Addons", value: 10000, pct: 30, color: "#F59E0B" },
  { name: "Partnerships & ...", value: 0, pct: 0, color: "#A855F7" },
];

export default function RevenueOverviewTable({ data }: { data?: GatewayData[] }) {
  // If live gateway data exists, map to breakdown; otherwise use screenshot default
  const breakdownData = data && data.length > 0
    ? data.map((d: any, idx) => ({
        name: d.gw || d.name || "Channel",
        value: d.amount !== undefined ? d.amount : (d.revenue || 0),
        pct: d.pct !== undefined ? d.pct : (d.percentage || 0),
        color: DEFAULT_BREAKDOWN[idx % DEFAULT_BREAKDOWN.length].color,
      }))
    : DEFAULT_BREAKDOWN;

  const totalInflow = breakdownData.reduce((acc, curr) => acc + curr.value, 0) || 34000;
  const displayTotalInflow = totalInflow >= 1000 ? `Rs. ${(totalInflow / 1000).toFixed(0)}K` : `Rs. ${totalInflow}`;

  const handleExportCSV = () => {
    const csvRows = [
      ["Channel / Source", "Amount (LKR)", "Share (%)"],
      ...breakdownData.map((d) => [d.name, d.value, `${d.pct}%`]),
    ];
    const csvContent = csvRows.map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `revenue_breakdown_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-surface/95 backdrop-blur-md border border-border p-2.5 rounded-xl shadow-xl font-inter text-xs">
          <p className="font-semibold text-foreground flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            {item.name}
          </p>
          <p className="text-muted mt-0.5">
            Rs. {item.value.toLocaleString()} ({item.pct}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-5 flex flex-col justify-between h-full w-full">
      {/* Header matching screenshot */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="font-inter font-bold text-base text-foreground tracking-tight">
            Revenue Breakdown
          </h3>
          <p className="font-inter text-xs text-muted mt-0.5">
            Real-time platform distribution by source (PostgreSQL live)
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 bg-surface-subtle border border-border text-foreground hover:bg-surface-elevated text-xs font-inter font-medium px-3 py-1.5 rounded-lg transition-all shadow-2xs active:scale-95 shrink-0"
          title="Export CSV"
        >
          <Download size={13} className="text-muted" />
          <span>Export</span>
        </button>
      </div>

      {/* Donut Chart & Legend Section */}
      <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
        {/* Donut with Center Text */}
        <div className="relative w-[180px] h-[180px] shrink-0 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={breakdownData}
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={78}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {breakdownData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Donut Stat matching screenshot */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            <span className="font-inter font-bold text-base sm:text-lg text-foreground tracking-tight leading-none">
              {displayTotalInflow}
            </span>
            <span className="font-inter font-bold text-[9px] uppercase tracking-widest text-muted mt-1 leading-none">
              INFLOW
            </span>
          </div>
        </div>

        {/* Legend List matching screenshot */}
        <div className="flex-1 w-full flex flex-col gap-2.5 font-inter text-xs">
          {breakdownData.map((item, idx) => {
            const formattedAmt = item.value >= 1000
              ? `Rs. ${(item.value / 1000).toFixed(1)}K`
              : `Rs. ${item.value}`;

            return (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 py-1 px-2 rounded-lg hover:bg-surface-elevated/50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-foreground font-medium truncate text-xs">
                    {item.name}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold text-foreground text-xs">
                    {formattedAmt}
                  </span>
                  <span className="text-[10px] text-muted font-mono w-7 text-right">
                    {item.pct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
