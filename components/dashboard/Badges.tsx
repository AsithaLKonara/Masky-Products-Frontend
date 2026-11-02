import React from "react";

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'purple';
  icon?: React.ReactNode;
  dot?: boolean;
}

export function StatusBadge({ label, variant = 'neutral', icon, dot = false }: BadgeProps) {
  const getStyles = () => {
    switch (variant) {
      case 'success': return 'text-emerald-500 dark:text-emerald-400 font-bold';
      case 'warning': return 'text-amber-500 dark:text-amber-400 font-bold';
      case 'error': return 'text-rose-500 dark:text-rose-400 font-semibold italic';
      case 'info': return 'text-blue-500 dark:text-blue-400 font-semibold';
      case 'purple': return 'text-purple-500 dark:text-purple-400 font-semibold';
      default: return 'text-muted font-normal';
    }
  };

  const getDotColor = () => {
    switch (variant) {
      case 'success': return 'bg-emerald-500';
      case 'warning': return 'bg-amber-500';
      case 'error': return 'bg-rose-500';
      case 'info': return 'bg-blue-500';
      case 'purple': return 'bg-purple-500';
      default: return 'bg-muted';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-inter tracking-wide uppercase ${getStyles()}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getDotColor()}`} />}
      {icon && <span className="shrink-0">{icon}</span>}
      {label}
    </span>
  );
}

// Pre-configured semantic text badges based on business context rules

export function PaymentGatewayBadge({ gateway, status = 'paid' }: { gateway: string, status?: 'paid' | 'pending' | 'failed' | 'refunded' }) {
  let style = 'text-foreground/80 font-medium';
  
  switch(status) {
    case 'paid': 
      style = 'text-emerald-600 dark:text-emerald-400 font-semibold';
      break;
    case 'pending': 
      style = 'text-amber-600 dark:text-amber-400 font-medium';
      break;
    case 'failed': 
      style = 'text-rose-600 dark:text-rose-400 font-medium italic';
      break;
    case 'refunded': 
      style = 'text-muted font-light italic';
      break;
  }

  return (
    <span className={`font-mono text-xs tracking-wider uppercase ${style}`}>
      {gateway}
    </span>
  );
}

export function BranchBadge({ branch }: { branch: string }) {
  return (
    <span className="font-inter text-xs font-light text-muted tracking-tight">
      {branch}
    </span>
  );
}

export function OrderStatusBadge({ status }: { status: string }) {
  const norm = status?.toUpperCase() || '';
  
  if (['DELIVERED', 'COMPLETED', 'PAID', 'SUCCESS'].includes(norm)) {
    return <span className="font-inter text-xs font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">{status}</span>;
  }
  if (['PROCESSING', 'PACKED', 'SHIPPED', 'IN TRANSIT', 'DISPATCHED'].includes(norm)) {
    return <span className="font-inter text-xs font-semibold uppercase tracking-wider text-blue-500 dark:text-blue-400">{status}</span>;
  }
  if (['PENDING', 'AWAITING_PAYMENT', 'AWAITING PAYMENT'].includes(norm)) {
    return <span className="font-inter text-xs font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400">{status}</span>;
  }
  if (['CANCELLED', 'FAILED', 'RETURNED'].includes(norm)) {
    return <span className="font-inter text-xs font-normal uppercase tracking-wider text-rose-500 dark:text-rose-400 italic">{status}</span>;
  }
  
  return <span className="font-inter text-xs font-light uppercase tracking-wider text-muted">{status}</span>;
}
