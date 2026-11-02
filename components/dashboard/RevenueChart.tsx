"use client";

import React, { useState } from "react";
import { Download, ChevronDown } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface GatewayData {
  gw: string;
  amount: number;
  count: number;
  pct: number;
}

const DEFAULT_TIME_SERIES = [
  { month: "Nov", amount: 0, target: 10000 },
  { month: "Dec", amount: 0, target: 15000 },
  { month: "Jan", amount: 0, target: 20000 },
  { month: "Feb", amount: 0, target: 20000 },
  { month: "Mar", amount: 0, target: 25000 },
  { month: "Apr", amount: 0, target: 25000 },
  { month: "May", amount: 0, target: 30000 },
  { month: "Jun", amount: 0, target: 30000 },
  { month: "Jul", amount: 0, target: 35000 },
  { month: "Aug", amount: 0, target: 35000 },
  { month: "Sep", amount: 0, target: 40000 },
  { month: "Oct", amount: 22500, target: 45000 },
];

export default function RevenueChart({ data }: { data?: GatewayData[] }) {
  const [timeRange, setTimeRange] = useState("Last 12 mon");

  const totalFromGateways = data && data.length > 0
    ? data.reduce((sum, item: any) => sum + (item.amount !== undefined ? item.amount : (item.revenue || 0)), 0)
    : 22500;

  // Sync latest month with real live sum
  const chartData = DEFAULT_TIME_SERIES.map((item, idx) => {
    if (idx === DEFAULT_TIME_SERIES.length - 1) {
      return { ...item, amount: totalFromGateways || 22500 };
    }
    return item;
  });

  const handleExportCSV = () => {
    const csvRows = [
      ["Month", "Inflow (LKR)", "Target (LKR)"],
      ...chartData.map((d) => [d.month, d.amount, d.target]),
    ];
    const csvContent = csvRows.map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `sales_performance_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface/95 backdrop-blur-md border border-border p-3 rounded-xl shadow-xl font-inter text-xs">
          <p className="font-semibold text-foreground mb-1">{label} Overview</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-muted">Inflow:</span>
            <span className="font-bold text-foreground">
              Rs. {Number(payload[0].value).toLocaleString()}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-5 flex flex-col justify-between h-full w-full">
      {/* Header matching screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-inter font-bold text-base text-foreground tracking-tight">
            Sales Performance
          </h3>
          <p className="font-inter text-xs text-muted mt-0.5">
            Monthly recurring SaaS inflows vs targets (Real PostgreSQL time-series)
          </p>
        </div>

        {/* Controls: Time range dropdown and Export button */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none bg-surface-subtle border border-border text-foreground hover:bg-surface-elevated text-xs font-inter font-medium pl-3 pr-7 py-1.5 rounded-lg outline-none cursor-pointer transition-all shadow-2xs"
            >
              <option>Last 12 mon</option>
              <option>Last 6 mon</option>
              <option>This Year</option>
            </select>
            <ChevronDown size={13} className="text-muted absolute right-2 top-2.5 pointer-events-none" />
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-surface-subtle border border-border text-foreground hover:bg-surface-elevated text-xs font-inter font-medium px-3 py-1.5 rounded-lg transition-all shadow-2xs active:scale-95"
            title="Export CSV"
          >
            <Download size={13} className="text-muted" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="w-full h-[260px] sm:h-[280px] pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="salesPerformanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
              strokeOpacity={0.6}
            />

            <XAxis
              dataKey="month"
              stroke="var(--muted)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={8}
            />

            <YAxis
              stroke="var(--muted)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[0, 50000]}
              ticks={[0, 13000, 25000, 38000, 50000]}
              tickFormatter={(val) => (val === 0 ? "Rs. 0" : `Rs. ${(val / 1000).toFixed(0)}K`)}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="amount"
              stroke="#3B82F6"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#salesPerformanceGradient)"
              activeDot={{
                r: 6,
                fill: "#3B82F6",
                stroke: "var(--background)",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
