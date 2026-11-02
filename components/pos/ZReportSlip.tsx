import { forwardRef } from "react";

export interface ZReportProps {
  session: {
    id: string;
    openedAt: string;
    closedAt?: string;
    openingFloat: number;
    terminal: { name: string };
    branch: { name: string };
    userId: string;
  };
  summary: {
    totalSales: number;
    totalReturns: number;
    netTotal: number;
    paymentMethods: Record<string, number>;
  };
}

const ZReportSlip = forwardRef<HTMLDivElement, ZReportProps>((props, ref) => {
  const { session, summary } = props;
  
  return (
    <div ref={ref} className="print-receipt w-[300px] bg-white text-black p-4 font-mono text-sm leading-snug mx-auto shadow-md">
      {/* Header */}
      <div className="text-center flex flex-col items-center gap-1 mb-4">
        <img src="/logo.png" alt="LAURAL" className="h-6 object-contain grayscale brightness-0" />
        <h2 className="font-bold text-xl tracking-widest mt-1">Z-REPORT</h2>
        <span className="text-xs">{session.branch.name}</span>
        <span className="text-[10px]">Session: {session.id}</span>
      </div>

      <div className="border-t border-dashed border-black my-2"></div>

      {/* Info */}
      <div className="flex flex-col gap-1 text-xs mb-2">
        <div className="flex justify-between">
          <span>Terminal:</span>
          <span>{session.terminal.name}</span>
        </div>
        <div className="flex justify-between">
          <span>Cashier:</span>
          <span>{session.userId}</span>
        </div>
        <div className="flex justify-between">
          <span>Opened:</span>
          <span>{new Date(session.openedAt).toLocaleString()}</span>
        </div>
        {session.closedAt && (
          <div className="flex justify-between">
            <span>Closed:</span>
            <span>{new Date(session.closedAt).toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="border-t border-dashed border-black my-2"></div>

      {/* Sales Summary */}
      <div className="text-center font-bold mb-1">SALES SUMMARY</div>
      <div className="flex flex-col gap-1 text-xs mb-2">
        <div className="flex justify-between">
          <span>Gross Sales:</span>
          <span>{summary.totalSales.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Returns:</span>
          <span>{summary.totalReturns.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="border-t border-dashed border-black my-2"></div>

      <div className="flex justify-between font-bold text-sm my-1">
        <span>NET SALES:</span>
        <span>Rs. {summary.netTotal.toFixed(2)}</span>
      </div>

      <div className="border-t border-dashed border-black my-2"></div>

      {/* Tender Types */}
      <div className="text-center font-bold my-1">PAYMENT METHODS</div>
      <div className="flex flex-col gap-1 text-xs mb-4">
        {Object.entries(summary.paymentMethods).map(([method, amount]) => (
          <div key={method} className="flex justify-between">
            <span>{method}</span>
            <span>{amount.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-black my-2"></div>
      
      {/* Drawer */}
      <div className="flex flex-col gap-1 text-xs mb-4 mt-2">
        <div className="flex justify-between">
          <span>Opening Float:</span>
          <span>{session.openingFloat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Expected Cash in Drawer:</span>
          <span>
            {(session.openingFloat + (summary.paymentMethods['CASH'] || 0)).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center flex flex-col items-center gap-2 text-[10px] mt-6">
        <span>--- END OF REPORT ---</span>
        <span className="text-stone-400">Powered by MASKY PRODUCT POS</span>
      </div>

    </div>
  );
});

ZReportSlip.displayName = "ZReportSlip";

export default ZReportSlip;
