import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MASKY PRODUCT POS",
  description: "MASKY PRODUCT Point of Sale Terminal",
};

export default function POSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-theme flex h-screen w-full bg-background overflow-hidden select-none">
      {children}
    </div>
  );
}
