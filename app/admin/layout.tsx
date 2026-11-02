import DashboardLayoutClient from "@/components/dashboard/DashboardLayoutClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Masky Product Admin Dashboard",
  description: "Admin dashboard for MASKY PRODUCT",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = { user: { name: "Admin User", role: "Super Admin" } };

  return (
    <DashboardLayoutClient session={session}>
      {children}
    </DashboardLayoutClient>
  );
}
