"use client";

import { MapPin, LayoutDashboard, ShoppingBag, Box, TerminalSquare, CreditCard, Users, FileText, Bell, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FEATURES } from "@/config/features";

export default function BranchAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const allNavItems = [
    { name: "Dashboard", href: "/branch-admin", icon: LayoutDashboard },
    { name: "POS", href: "/pos", icon: TerminalSquare, isPos: true },
  ];

  const navItems = allNavItems.filter((item) => !item.isPos || FEATURES.ENABLE_POS);

  const managementItems = [
    { name: "Orders", href: "/branch-admin/orders", icon: ShoppingBag },
    { name: "Inventory", href: "/branch-admin/inventory", icon: Box },
    { name: "Payments", href: "/branch-admin/payments", icon: CreditCard },
    { name: "Cashiers", href: "/branch-admin/cashiers", icon: Users },
    { name: "Reports", href: "/branch-admin/reports", icon: FileText },
  ];

  return (
    <div className="dashboard-theme flex h-screen w-full bg-background overflow-hidden relative">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-[224px] z-50 bg-surface flex flex-col shrink-0 text-text-secondary overflow-y-auto border-r border-border transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative`}>
        <div className="px-6 h-[60px] flex items-center justify-between border-b border-border bg-surface shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-foreground rounded-full flex items-center justify-center shadow-sm">
              <span className="font-signature text-white text-lg leading-none pt-1">L</span>
            </div>
            <span className="font-inter font-bold tracking-tight text-foreground">Kandy</span>
          </div>
          <button className="md:hidden text-muted hover:text-foreground" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col py-6 px-4 gap-1">
          <span className="px-2 text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Today</span>
          
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === "/branch-admin" ? pathname === "/branch-admin" : pathname?.startsWith(item.href);
            return (
              <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all border-l-4 font-medium text-sm ${
                isActive ? "bg-accent-soft text-primary border-primary font-bold shadow-sm" : "border-transparent text-text-secondary hover:text-foreground hover:bg-background"
              }`}>
                <Icon size={16} /> {item.name}
              </Link>
            )
          })}

          <span className="px-2 text-[10px] font-bold text-muted uppercase tracking-wider mt-6 mb-2">Management</span>
          
          {managementItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname?.startsWith(item.href);
            return (
              <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all border-l-4 font-medium text-sm ${
                isActive ? "bg-accent-soft text-primary border-primary font-bold shadow-sm" : "border-transparent text-text-secondary hover:text-foreground hover:bg-background"
              }`}>
                <Icon size={16} /> {item.name}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden w-full">
        
        {/* Header */}
        <div className="h-[60px] bg-surface border-b border-border px-4 md:px-6 flex items-center justify-between shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 -ml-2 text-muted hover:text-foreground hover:bg-background rounded-xl transition-colors" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex font-inter font-medium text-sm text-muted items-center gap-2">
              <MapPin size={16} /> Kandy Branch Active
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-muted hover:text-foreground transition-colors">
              <Bell size={18} />
            </button>
            <div className="flex items-center gap-2 pl-2 sm:pl-4 border-l border-border cursor-pointer group">
              <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-foreground font-bold text-xs group-hover:bg-border transition-colors">
                AM
              </div>
              <span className="hidden sm:block font-inter font-medium text-sm text-foreground">Admin</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
