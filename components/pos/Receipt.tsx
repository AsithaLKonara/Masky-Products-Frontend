"use client";

import { forwardRef } from "react";

export interface ReceiptProps {
  orderId: string;
  cashierName: string;
  date: Date;
  items: any[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  tendered?: number;
  change?: number;
  branchName?: string;
  branchAddress?: string;
  branchPhone?: string;
}

const Receipt = forwardRef<HTMLDivElement, ReceiptProps>((props, ref) => {
  const { orderId, cashierName, date, items, subtotal, discount, total, paymentMethod, tendered, change, branchName, branchAddress, branchPhone } = props;

  const fmt = (n: number) => n.toFixed(2);
  const truncate = (str: string, max = 28) => str.length > max ? str.slice(0, max - 1) + "\u2026" : str;

  const containerStyle: React.CSSProperties = {
    width: "72mm",
    maxWidth: "72mm",
    fontFamily: "monospace",
    fontSize: "11px",
    lineHeight: "1.35",
    color: "#000",
    background: "#fff",
    padding: "3mm 2mm",
    margin: "0 auto",
    boxSizing: "border-box",
    overflowX: "hidden",
    wordBreak: "break-word",
  };

  const divider = (
    <div style={{ borderTop: "1px dashed #000", margin: "4px 0" }} />
  );

  const solidDivider = (
    <div style={{ borderTop: "1px solid #000", margin: "4px 0" }} />
  );

  const row = (label: string, value: string, bold = false): React.ReactNode => (
    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: bold ? "bold" : "normal" }}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );

  return (
    <div ref={ref} className="print-receipt" style={containerStyle}>
      {/* Store Header */}
      <div style={{ textAlign: "center", marginBottom: "4px" }}>
        <img src="/logo.png" alt="LAURAL" style={{ height: "24px", margin: "0 auto 4px", filter: "grayscale(100%) brightness(0)", objectFit: "contain" }} />
        {branchName && <div style={{ fontSize: "12px", fontWeight: "bold" }}>{branchName}</div>}
        <div style={{ fontSize: "10px" }}>{branchAddress || "Point of Sale Receipt"}</div>
        <div style={{ fontSize: "10px", marginTop: "2px" }}>Tel: {branchPhone || "+94 77 123 4567"}</div>
      </div>

      {divider}

      {/* Order Info */}
      <div style={{ fontSize: "10px", marginBottom: "3px" }}>
        <div>Date: {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
        <div>Receipt: #{orderId}</div>
        <div>Cashier: {cashierName}</div>
      </div>

      {divider}

      {/* Items Header */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 30px 60px", gap: "4px", fontWeight: "bold", fontSize: "10px", marginBottom: "2px" }}>
        <span>Item</span>
        <span style={{ textAlign: "center" }}>Qty</span>
        <span style={{ textAlign: "right" }}>Rs.</span>
      </div>

      {divider}

      {/* Items */}
      <div style={{ marginBottom: "3px" }}>
        {items.map((item, idx) => (
          <div key={idx} style={{ marginBottom: "4px" }}>
            <div style={{ fontSize: "10px" }}>{truncate(item.name)}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 30px 60px", gap: "4px", fontSize: "10px" }}>
              <span style={{ color: "#555", fontSize: "9px" }}>
                {[item.color, item.size].filter(Boolean).join(" / ")}
              </span>
              <span style={{ textAlign: "center" }}>x{item.qty}</span>
              <span style={{ textAlign: "right" }}>{fmt(item.price * item.qty)}</span>
            </div>
          </div>
        ))}
      </div>

      {divider}

      {/* Totals */}
      <div style={{ fontSize: "10px", marginBottom: "3px" }}>
        {row("Subtotal", fmt(subtotal))}
        {discount > 0 && row("Discount", `- ${fmt(discount)}`)}
      </div>

      {solidDivider}

      {/* Grand Total */}
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "13px", margin: "2px 0" }}>
        <span>TOTAL</span>
        <span>Rs. {fmt(total)}</span>
      </div>

      {divider}

      {/* Payment */}
      <div style={{ fontSize: "10px", marginBottom: "4px" }}>
        {row("Method:", paymentMethod)}
        {tendered !== undefined && tendered > 0 && row("Tendered:", `Rs. ${fmt(tendered)}`)}
        {change !== undefined && change >= 0 && row("Change:", `Rs. ${fmt(change)}`, true)}
      </div>

      {divider}

      {/* Footer */}
      <div style={{ textAlign: "center", fontSize: "10px", marginTop: "4px" }}>
        <div style={{ fontWeight: "bold" }}>Thank you for shopping!</div>
        <div style={{ fontSize: "9px", marginTop: "2px", lineHeight: "1.3" }}>
          Returns within 14 days with<br />original tags and receipt.
        </div>
        <div style={{ marginTop: "6px", fontFamily: "monospace", fontSize: "9px", letterSpacing: "2px", wordBreak: "break-all" }}>
          {orderId}
        </div>
        <div style={{ fontSize: "8px", color: "#888", marginTop: "6px" }}>Powered by MASKY PRODUCT POS</div>
      </div>
    </div>
  );
});

Receipt.displayName = "Receipt";

export default Receipt;
