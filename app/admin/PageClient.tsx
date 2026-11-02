"use client";

import { useState } from "react";
import { useBranches } from "@/hooks/useInventory";
import { globalDialog } from "@/store/dialog.store";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { useQueryClient } from "@tanstack/react-query";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useAuthStore } from "@/store/auth.store";
import { Shield, Download, ChevronDown } from "lucide-react";

const DashboardData = dynamic(() => import("@/components/dashboard/DashboardData"), { ssr: false });

const DashboardSkeleton = () => (
  <div className="flex flex-col gap-4 mt-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-32 bg-surface-subtle border border-border rounded-2xl animate-pulse" />
      ))}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-32 bg-surface-subtle border border-border rounded-2xl animate-pulse" />
      ))}
    </div>
  </div>
);

export default function SuperAdminDashboard() {
  const [activeBranch, setActiveBranch] = useState("All");
  const [activePeriod, setActivePeriod] = useState("Today");

  const { user, hasPermission, isAdmin, isSuperAdmin, isLoading } = useAuthStore();
  const { data: branchesData } = useBranches();

  // Combine static options with dynamic branches from DB
  const dynamicBranches = branchesData
    ? Array.isArray(branchesData)
      ? branchesData.map((b: any) => b.name)
      : []
    : [];
  const displayBranches = ["All", "Online", ...dynamicBranches];
  const queryClient = useQueryClient();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const canAccessDashboard =
    isSuperAdmin() ||
    isAdmin() ||
    hasPermission("reports:view_dashboard") ||
    hasPermission("reports:view_financial");

  if (!canAccessDashboard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-surface border border-border rounded-2xl shadow-sm my-8 max-w-xl mx-auto">
        <div className="w-16 h-16 bg-surface-subtle border border-border rounded-full flex items-center justify-center text-muted mb-4">
          <Shield size={32} />
        </div>
        <h2 className="font-inter font-bold text-xl text-foreground mb-2">
          Dashboard Restricted
        </h2>
        <p className="font-inter text-sm text-muted leading-relaxed max-w-md">
          You do not have permission to view the executive business overview dashboard. Please contact an administrator or use the sidebar navigation menu to access your authorized sections.
        </p>
      </div>
    );
  }

  const handleExport = () => {
    const analytics: any = queryClient.getQueryData([
      "analytics",
      "overview",
      activePeriod,
      activeBranch,
    ]);
    if (!analytics || !analytics.recentTransactions || analytics.recentTransactions.length === 0) {
      globalDialog.alert("No data available to export");
      return;
    }

    const headers = [
      "Order ID",
      "Customer",
      "Branch",
      "Amount",
      "Payment Method",
      "Payment Status",
      "Order Status",
      "Date",
    ];
    const csvContent = [
      headers.join(","),
      ...analytics.recentTransactions.map((tx: any) =>
        [
          tx.id,
          `"${tx.customer}"`,
          `"${tx.branch}"`,
          tx.amount,
          tx.paymentMethod,
          tx.paymentStatus,
          tx.orderStatus,
          new Date(tx.createdAt).toLocaleString(),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `dashboard_export_${activePeriod.replace(/ /g, "_").toLowerCase()}_${new Date().getTime()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const canExport =
    hasPermission("reports:export_data") || hasPermission("reports:view_dashboard");

  return (
    <div className="flex flex-col gap-6 md:gap-8 p-4 md:p-10 max-w-[1400px] mx-auto w-full overflow-hidden md:overflow-visible">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-inter font-bold text-2xl md:text-[28px] leading-tight text-foreground tracking-tight">
            Business Overview
          </h1>
          <p className="font-inter text-xs md:text-sm text-muted leading-relaxed">
            Global performance across all branches, channels, and payment gateways
          </p>
        </div>

        {/* Filter & Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto mt-2 md:mt-0">
          <div className="relative">
            <select
              value={activePeriod}
              onChange={(e) => setActivePeriod(e.target.value)}
              className="appearance-none bg-surface border border-border text-foreground hover:bg-surface-elevated text-xs font-inter font-medium pl-3 pr-8 py-2 rounded-xl outline-none cursor-pointer transition-all shadow-2xs"
            >
              <option>Today</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Month</option>
            </select>
            <ChevronDown size={13} className="text-muted absolute right-2.5 top-3 pointer-events-none" />
          </div>

          {canExport && (
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 bg-surface border border-border text-foreground hover:bg-surface-elevated px-3.5 py-2 rounded-xl font-inter text-xs font-medium transition-all shadow-2xs active:scale-95 cursor-pointer"
            >
              <Download size={13} className="text-muted" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Branch Filter Segmented Tabs */}
      <div className="flex items-center overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        <div className="inline-flex items-center gap-1 p-1 bg-surface border border-border rounded-xl">
          {displayBranches.map((branch: string) => (
            <button
              key={branch}
              onClick={() => setActiveBranch(branch)}
              className={`px-3 py-1.5 rounded-lg text-xs font-inter font-medium transition-all cursor-pointer shrink-0 ${
                activeBranch === branch
                  ? "bg-foreground text-background font-semibold shadow-xs"
                  : "text-muted hover:text-foreground hover:bg-surface-elevated"
              }`}
            >
              {branch}
            </button>
          ))}
        </div>
      </div>

      <ErrorBoundary>
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardData activePeriod={activePeriod} activeBranch={activeBranch} />
        </Suspense>
      </ErrorBoundary>

      <div className="h-6" />
    </div>
  );
}
