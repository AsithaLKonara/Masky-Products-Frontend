import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Column<T> {
  header: string | React.ReactNode;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange?: (page: number) => void;
  };
}

export default function DataTable<T>({ 
  data, 
  columns, 
  keyExtractor, 
  onRowClick,
  pagination 
}: DataTableProps<T>) {
  
  return (
    <div className="flex flex-col w-full bg-surface border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-subtle border-b border-border">
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  className="px-6 py-3.5 font-inter font-semibold text-[11px] uppercase tracking-wider text-muted whitespace-nowrap"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr 
                key={keyExtractor(row)}
                onClick={() => onRowClick && onRowClick(row)}
                className={`border-b border-border/40 last:border-0 transition-colors bg-surface ${
                  onRowClick ? 'cursor-pointer hover:bg-surface-elevated/70' : 'hover:bg-surface-elevated/40'
                }`}
              >
                {columns.map((col, idx) => (
                  <td 
                    key={idx}
                    className={`px-6 py-4 font-inter text-sm text-foreground ${col.className || ''}`}
                  >
                    {typeof col.accessor === 'function' 
                      ? col.accessor(row) 
                      : (row[col.accessor] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <p className="text-muted text-sm font-inter font-medium">No records found</p>
                  <p className="text-muted/70 text-xs font-inter mt-1">Try adjusting your filters or search term</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && (
        <div className="px-4 sm:px-6 py-3.5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 bg-surface-subtle shrink-0">
          <span className="font-inter text-xs text-muted">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <div className="flex items-center gap-1.5">
            <button 
              disabled={pagination.currentPage <= 1}
              onClick={() => pagination.onPageChange?.(pagination.currentPage - 1)}
              className="p-1.5 rounded-lg border border-border text-muted hover:bg-surface hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => pagination.onPageChange?.(page)}
                className={`w-7 h-7 rounded-lg text-xs font-medium font-inter transition-colors ${
                  page === pagination.currentPage
                    ? "bg-foreground text-background font-semibold"
                    : "text-muted hover:text-foreground hover:bg-surface border border-transparent"
                }`}
              >
                {page}
              </button>
            ))}
            {pagination.totalPages > 5 && (
              <span className="text-muted text-xs px-1">…{pagination.totalPages}</span>
            )}
            
            <button 
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => pagination.onPageChange?.(pagination.currentPage + 1)}
              className="p-1.5 rounded-lg border border-border text-muted hover:bg-surface hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
