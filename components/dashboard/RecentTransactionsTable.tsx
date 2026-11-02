import { OrderStatusBadge, BranchBadge, PaymentGatewayBadge } from "./Badges";

interface TransactionData {
  id: string;
  customer: string;
  branch: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
}

export default function RecentTransactionsTable({ transactions }: { transactions?: TransactionData[] }) {
  const data = transactions || [];

  const formatCurrency = (value: number) => {
    return `Rs. ${value.toLocaleString()}`;
  };

  return (
    <div className="w-full bg-surface border border-border rounded-xl flex flex-col overflow-hidden">
      
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-border bg-surface-subtle">
        <h4 className="font-inter font-bold text-sm text-foreground">
          Recent Transactions
        </h4>
        <button className="text-xs text-accent font-medium hover:underline">View All</button>
      </div>

      {/* Table Header & Body Scroll Wrapper */}
      <div className="overflow-x-auto w-full custom-scrollbar">
        <div className="min-w-[700px]">
          {/* Table Header */}
          <div className="grid grid-cols-6 gap-4 px-6 py-3 border-b border-border bg-surface-subtle text-[11px] font-inter font-semibold text-muted uppercase tracking-wider">
            <div>Order</div>
            <div>Customer</div>
            <div>Branch</div>
            <div>Amount</div>
            <div>Payment</div>
            <div>Status</div>
          </div>

          {/* Table Body */}
          <div className="flex flex-col">
            {data.length > 0 ? (
              data.map((tx, idx) => (
                <div 
                  key={tx.id} 
                  className={`grid grid-cols-6 gap-4 px-6 py-3.5 items-center hover:bg-surface-elevated/60 transition-colors ${
                    idx !== data.length - 1 ? 'border-b border-border/50' : ''
                  }`}
                >
                  <div className="font-mono font-bold text-xs text-foreground tracking-tight truncate" title={tx.id}>
                    {tx.id.split('-')[0] + '-' + tx.id.slice(tx.id.length - 5).toUpperCase()}
                  </div>
                  <div className="font-inter font-normal text-xs text-foreground/90 truncate" title={tx.customer}>
                    {tx.customer}
                  </div>
                  <div className="truncate">
                    <BranchBadge branch={tx.branch} />
                  </div>
                  <div className="font-mono font-black text-xs text-foreground tracking-tight">
                    {formatCurrency(tx.amount)}
                  </div>
                  <div className="truncate">
                    <PaymentGatewayBadge 
                      gateway={tx.paymentMethod} 
                      status={tx.paymentStatus.toLowerCase() as 'paid'|'pending'|'failed'|'refunded'} 
                    />
                  </div>
                  <div className="truncate">
                    <OrderStatusBadge status={tx.orderStatus} />
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-10 text-center text-muted text-xs font-inter">
                No recent transactions found
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
