"use client";

import PageHeader from "@/components/dashboard/PageHeader";
import { useInventoryValuationReport } from "@/hooks/useReports";
import { Download, AlertTriangle } from "lucide-react";
import dynamic from "next/dynamic";

const InventoryChart = dynamic(() => import("./InventoryChart"), { 
  ssr: false, 
  loading: () => <div className="h-[300px] w-full flex items-center justify-center bg-surface rounded-lg animate-pulse text-muted">Loading chart...</div> 
});

export default function InventoryReportPage() {
  const { data, isPending, error } = useInventoryValuationReport();

  const handleDownloadCSV = () => {
    if (!data) return;
    const csvRows = ["Branch Name,Total Stock Items,Retail Valuation (Rs)"];
    data.branchValuations.forEach(row => {
      csvRows.push(`${row.branchName},${row.totalItems},${row.valuation}`);
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory_valuation_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isPending) return <div className="p-10 font-poppins text-muted flex flex-col gap-2"><span>Loading report data...</span><span className="text-xs text-muted/70">If this takes more than 10 seconds, check if the backend API is running.</span></div>;
  if (error || !data) return <div className="p-10 font-poppins text-red-500">Failed to load report. {(error as any)?.message || "Unknown error"}</div>;

  return (
    <div className="flex flex-col p-4 md:p-10 max-w-[1280px] mx-auto w-full gap-8">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <PageHeader 
          title="Inventory Valuation Report" 
          description="Total retail value of stock across all physical and virtual warehouses."
        />
        <button onClick={handleDownloadCSV} className="h-10 px-4 bg-primary text-white text-sm font-medium rounded-lg flex items-center gap-2 hover:opacity-80 transition-colors">
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Global Valuation Card */}
      <div className="bg-surface border border-border rounded-xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xs">
        <div>
          <h3 className="text-sm font-medium text-muted font-inter uppercase tracking-wider">Total Global Retail Valuation</h3>
          <p className="text-4xl font-semibold text-foreground font-poppins mt-2">Rs. {data.totalGlobalValuation.toLocaleString()}</p>
        </div>
        <div className="w-full md:w-px md:h-16 bg-border"></div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-2xl font-semibold text-foreground font-poppins">{data.lowStockItems.length}</p>
            <p className="text-sm font-medium text-muted font-inter">Low Stock SKUs Global</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Valuations Table & Chart */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="bg-surface border border-border rounded-xl p-6 lg:col-span-1 shadow-2xs">
          <h3 className="text-lg font-semibold text-foreground font-poppins mb-6">Valuation Distribution</h3>
          {data.branchValuations && data.branchValuations.length > 0 ? (
            <InventoryChart data={data.branchValuations} />
          ) : (
            <div className="h-[300px] w-full flex items-center justify-center bg-surface-subtle rounded-lg border border-dashed border-border">
              <p className="text-muted font-inter font-medium">0 Data Available</p>
            </div>
          )}
        </div>

          <div className="bg-surface border border-border rounded-xl p-5 shadow-2xs">
            <h3 className="text-base font-semibold text-foreground font-inter mb-4">Valuation by Branch</h3>
            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-subtle">
                  <th className="py-3 px-3 font-semibold text-muted font-inter text-xs uppercase tracking-wider">Branch</th>
                  <th className="py-3 px-3 font-semibold text-muted font-inter text-xs uppercase tracking-wider text-right">Total Items</th>
                  <th className="py-3 px-3 font-semibold text-muted font-inter text-xs uppercase tracking-wider text-right">Retail Valuation</th>
                </tr>
              </thead>
              <tbody>
                {data.branchValuations.map((row, idx) => (
                  <tr key={idx} className="border-b border-border last:border-0 hover:bg-surface-elevated/40 transition-colors">
                    <td className="py-4 font-medium text-foreground font-poppins text-sm">{row.branchName}</td>
                    <td className="py-4 text-muted font-mono text-sm text-right">{row.totalItems.toLocaleString()}</td>
                    <td className="py-4 text-foreground font-mono font-black text-sm text-right">Rs. {row.valuation.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-surface border border-border rounded-xl p-6 flex flex-col h-[500px] shadow-2xs">
          <h3 className="text-lg font-semibold text-foreground font-poppins mb-6 flex items-center gap-2">
            Low Stock Alerts <span className="text-xs font-bold font-mono text-rose-500">({data.lowStockItems.length})</span>
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {data.lowStockItems.length === 0 ? (
              <div className="text-center text-muted text-sm py-10">No low stock items!</div>
            ) : (
              data.lowStockItems.map((item, idx) => (
                <div key={idx} className="p-4 border border-rose-500/20 bg-surface-subtle rounded-lg">
                  <p className="font-poppins font-medium text-foreground text-sm mb-1">{item.productName}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-inter text-muted">{item.branchName}</span>
                    <span className="text-xs font-mono font-bold text-rose-500">
                      {item.quantity} left (Threshold: {item.threshold})
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
