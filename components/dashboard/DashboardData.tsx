"use client";

import React from "react";
import StatCard from "@/components/dashboard/StatCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import RevenueOverviewTable from "@/components/dashboard/RevenueOverviewTable";
import RecentTransactionsTable from "@/components/dashboard/RecentTransactionsTable";
import {
  TrendingUp,
  ShoppingCart,
  Users,
  Receipt,
  Package,
  Wallet,
  Gift,
  RefreshCcw,
} from "lucide-react";
import { useBusinessOverviewSuspense } from "@/hooks/useAnalytics";
import { useAuthStore } from "@/store/auth.store";

const GATEWAY_COLORS: Record<string, string> = {
  KOKO: "bg-blue-500",
  MINTPAY: "bg-emerald-500",
  ONEPAY: "bg-amber-500",
  PAYZY: "bg-purple-500",
  COD: "bg-slate-400",
  CASH: "bg-emerald-500",
  CARD: "bg-sky-500",
};

const formatCurrency = (value: number) => {
  if (value >= 1000000) return `Rs. ${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `Rs. ${(value / 1000).toFixed(1)}K`;
  return `Rs. ${(value || 0).toLocaleString()}`;
};

interface DashboardDataProps {
  activePeriod: string;
  activeBranch: string;
}

export default function DashboardData({ activePeriod, activeBranch }: DashboardDataProps) {
  const { data: rawData } = useBusinessOverviewSuspense(activePeriod, activeBranch);
  const analytics = (rawData as any)?.data || rawData || {};
  const { hasPermission, isSuperAdmin } = useAuthStore();

  const canViewFinancials =
    isSuperAdmin() ||
    hasPermission("reports:view_financial") ||
    hasPermission("reports:view_dashboard") ||
    hasPermission("payments:view_transactions");
  const canViewOrders = isSuperAdmin() || hasPermission("orders:view");
  const canViewCustomers = isSuperAdmin() || hasPermission("customers:view");
  const canViewInventory = isSuperAdmin() || hasPermission("inventory:view_stock");
  const canViewLoyalty = isSuperAdmin() || hasPermission("loyalty:view_points");
  const canViewReturns = isSuperAdmin() || hasPermission("returns:view");
  const canViewPayments = isSuperAdmin() || hasPermission("payments:view_transactions") || canViewFinancials;

  const statCardsRow1 = [];
  if (canViewFinancials && analytics?.revenue) {
    statCardsRow1.push(
      <StatCard
        key="revenue"
        label="Revenue"
        value={formatCurrency(analytics.revenue.value)}
        trend={analytics.revenue.trend}
        trendType={analytics.revenue.trendType}
        icon={<TrendingUp size={16} />}
      />
    );
  }
  if (canViewOrders && analytics?.orders) {
    statCardsRow1.push(
      <StatCard
        key="orders"
        label="Orders"
        value={analytics.orders.value.toString()}
        trend={analytics.orders.trend}
        trendType={analytics.orders.trendType}
        icon={<ShoppingCart size={16} />}
      />
    );
  }
  if (canViewCustomers && analytics?.newCustomers) {
    statCardsRow1.push(
      <StatCard
        key="customers"
        label="New Customers"
        value={analytics.newCustomers.value.toString()}
        trend={analytics.newCustomers.trend}
        trendType={analytics.newCustomers.trendType}
        icon={<Users size={16} />}
      />
    );
  }
  if (canViewFinancials && analytics?.avgOrderValue) {
    statCardsRow1.push(
      <StatCard
        key="aov"
        label="Avg Order Value"
        value={formatCurrency(analytics.avgOrderValue.value)}
        trend={analytics.avgOrderValue.trend}
        trendType={analytics.avgOrderValue.trendType}
        icon={<Receipt size={16} />}
      />
    );
  }

  const statCardsRow2 = [];
  if (canViewOrders && analytics?.pendingOrders) {
    statCardsRow2.push(
      <StatCard
        key="pending"
        label="Pending Orders"
        value={analytics.pendingOrders.value.toString()}
        trend={analytics.pendingOrders.trend}
        trendType={analytics.pendingOrders.trendType}
        icon={<Package size={16} />}
      />
    );
  }
  if (canViewInventory && analytics?.inventoryValue) {
    statCardsRow2.push(
      <StatCard
        key="inventory"
        label="Inventory Value"
        value={formatCurrency(analytics.inventoryValue.value)}
        trend={analytics.inventoryValue.trend}
        trendType={analytics.inventoryValue.trendType}
        icon={<Wallet size={16} />}
      />
    );
  }
  if (canViewLoyalty && analytics?.loyaltyPoints) {
    statCardsRow2.push(
      <StatCard
        key="loyalty"
        label="Loyalty Points"
        value={analytics.loyaltyPoints.value.toString()}
        trend={analytics.loyaltyPoints.trend}
        trendType={analytics.loyaltyPoints.trendType}
        icon={<Gift size={16} />}
      />
    );
  }
  if (canViewReturns && analytics?.returns) {
    statCardsRow2.push(
      <StatCard
        key="returns"
        label="Returns"
        value={formatCurrency(analytics.returns.value)}
        trend={analytics.returns.trend}
        trendType={analytics.returns.trendType}
        icon={<RefreshCcw size={16} />}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Stat Cards Row 1 (Real API Metrics) */}
      {statCardsRow1.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCardsRow1}
        </div>
      )}

      {/* Stat Cards Row 2 (Real Operational Metrics) */}
      {statCardsRow2.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCardsRow2}
        </div>
      )}

      {/* Visual Charts Grid: Sales Performance + Revenue Breakdown */}
      {canViewFinancials && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
          <div className="lg:col-span-7 bg-surface border border-border rounded-xl overflow-hidden">
            <RevenueChart data={analytics?.paymentGatewayPerformance} />
          </div>
          <div className="lg:col-span-5 bg-surface border border-border rounded-xl overflow-hidden">
            <RevenueOverviewTable data={analytics?.paymentGatewayPerformance} />
          </div>
        </div>
      )}

      {/* Payment Gateway Performance Progress Bars */}
      {canViewPayments && (analytics?.paymentGatewayPerformance?.length ?? 0) > 0 && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden w-full">
          <div className="px-5 py-4 border-b border-border bg-surface-subtle flex items-center justify-between">
            <div>
              <h2 className="font-inter font-bold text-foreground text-sm">Payment Gateway Performance</h2>
              <p className="font-inter text-xs text-muted mt-0.5">Distribution across integrated payment channels</p>
            </div>
          </div>
          <div className="p-5 flex flex-col gap-3.5">
            {analytics.paymentGatewayPerformance.map((g: any) => {
              const gwName = g.gw || g.name || "OTHER";
              const gwAmount = g.amount !== undefined ? g.amount : (g.revenue || 0);
              const gwPct = g.pct !== undefined ? g.pct : (g.percentage || 0);
              const gwCount = g.count || 0;
              return (
                <div key={gwName} className="flex items-center gap-4 py-0.5">
                  <div className="w-24 font-inter font-semibold text-xs text-foreground shrink-0">{gwName}</div>
                  <div className="flex-1 bg-surface-elevated rounded-full h-2 overflow-hidden border border-border/40">
                    <div
                      className={`h-2 rounded-full ${GATEWAY_COLORS[gwName] || "bg-accent"} transition-all duration-500`}
                      style={{ width: `${Math.min(100, gwPct)}%` }}
                    />
                  </div>
                  <div className="w-10 text-xs font-semibold text-muted text-right shrink-0">{gwPct}%</div>
                  <div className="w-28 font-inter font-semibold text-xs text-foreground text-right shrink-0">
                    {formatCurrency(gwAmount)}
                  </div>
                  <div className="w-16 font-inter text-xs text-muted text-right shrink-0">{gwCount} txns</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Transactions Table */}
      {(canViewOrders || canViewPayments) && (
        <RecentTransactionsTable transactions={analytics?.recentTransactions} />
      )}
    </div>
  );
}
