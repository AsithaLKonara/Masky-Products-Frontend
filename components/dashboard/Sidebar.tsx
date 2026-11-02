"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import {
  LayoutDashboard,
  ShoppingCart,
  Box,
  Tags,
  Store,
  MonitorSmartphone,
  CreditCard,
  Users,
  Gift,
  Megaphone,
  BarChart3,
  Shield,
  Settings,
  FileText,
  Layers,
  ArchiveRestore,
  Truck,
  RotateCcw,
  MessageSquare,
  PanelsTopLeft,
  HardDrive,
  X,
  LogOut,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface NavItem {
  name: string;
  icon: any;
  href: string;
  permission?: string | string[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

export default function Sidebar({
  isOpen,
  setIsOpen,
}: {
  isOpen?: boolean;
  setIsOpen?: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const { user, hasPermission, isSuperAdmin } = useAuthStore();
  const [expandedGroups, setExpandedGroups] = useState<string[]>([
    "Overview",
    "Sales & Fulfillment",
    "Catalog",
    "Retail",
    "Customers",
    "Content",
    "System",
  ]);

  const getInitials = (name?: string | null) => {
    if (!name) return "US";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const navGroups: NavGroup[] = [
    {
      label: "Overview",
      items: [
        {
          name: "Dashboard",
          icon: LayoutDashboard,
          href: "/admin",
          permission: ["reports:view_dashboard", "reports:view_financial"],
        },
        {
          name: "Reports",
          icon: BarChart3,
          href: "/admin/reports",
          permission: ["reports:view_dashboard", "reports:view_financial"],
        },
      ],
    },
    {
      label: "Sales & Fulfillment",
      items: [
        {
          name: "Orders",
          icon: ShoppingCart,
          href: "/admin/orders",
          permission: "orders:view",
        },
        {
          name: "Returns",
          icon: RotateCcw,
          href: "/admin/returns",
          permission: "returns:view",
        },
        {
          name: "Shipping",
          icon: Truck,
          href: "/admin/shipping",
          permission: "shipping:view_queue",
        },
        {
          name: "Payments",
          icon: CreditCard,
          href: "/admin/payments",
          permission: "payments:view_transactions",
        },
      ],
    },
    {
      label: "Catalog",
      items: [
        {
          name: "Products",
          icon: Box,
          href: "/admin/products",
          permission: "products:view",
        },
        {
          name: "Categories",
          icon: Tags,
          href: "/admin/categories",
          permission: ["categories:manage", "products:view"],
        },
        {
          name: "Collections",
          icon: Layers,
          href: "/admin/collections",
          permission: ["collections:manage", "products:view"],
        },
        {
          name: "Inventory",
          icon: ArchiveRestore,
          href: "/admin/inventory",
          permission: "inventory:view_stock",
        },
      ],
    },
    {
      label: "Retail",
      items: [
        {
          name: "POS Terminal",
          icon: MonitorSmartphone,
          href: "/pos",
          permission: "pos:sales_mode",
        },
        {
          name: "POS Sales",
          icon: MonitorSmartphone,
          href: "/admin/pos-sales",
          permission: ["pos:view_sales_history", "pos:sales_mode"],
        },
        {
          name: "Branches",
          icon: Store,
          href: "/admin/branches",
          permission: "branches:view",
        },
      ],
    },
    {
      label: "Customers",
      items: [
        {
          name: "Customers",
          icon: Users,
          href: "/admin/customers",
          permission: "customers:view",
        },
        {
          name: "Reviews",
          icon: MessageSquare,
          href: "/admin/reviews",
          permission: "reviews:view",
        },
        {
          name: "Loyalty",
          icon: Gift,
          href: "/admin/loyalty",
          permission: "loyalty:view_points",
        },
        {
          name: "Promotions",
          icon: Megaphone,
          href: "/admin/promotions",
          permission: "promotions:view",
        },
      ],
    },
    {
      label: "Content",
      items: [
        {
          name: "CMS",
          icon: PanelsTopLeft,
          href: "/admin/cms",
          permission: "cms:view",
        },
        {
          name: "Media",
          icon: HardDrive,
          href: "/admin/media",
          permission: "media:view_library",
        },
      ],
    },
    {
      label: "System",
      items: [
        {
          name: "Access Control",
          icon: Shield,
          href: "/admin/system/roles",
          permission: ["system:manage_roles", "system:manage_users"],
        },
        {
          name: "Settings",
          icon: Settings,
          href: "/admin/system/settings",
          permission: "system:platform_settings",
        },
        {
          name: "Audit Logs",
          icon: FileText,
          href: "/admin/system/audit",
          permission: "system:view_audit_logs",
        },
      ],
    },
  ];

  const checkPermission = (perm?: string | string[]) => {
    if (!perm || isSuperAdmin()) return true;
    if (Array.isArray(perm)) {
      return perm.some((p) => hasPermission(p));
    }
    return hasPermission(perm);
  };

  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => checkPermission(item.permission)),
    }))
    .filter((group) => group.items.length > 0);

  const primaryRole = user?.roles?.[0] || "Staff Member";

  // Automatically expand the group containing the active route
  useEffect(() => {
    const activeGroup = visibleGroups.find((group) =>
      group.items.some((item) =>
        item.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(item.href)
      )
    );
    if (activeGroup && !expandedGroups.includes(activeGroup.label)) {
      setExpandedGroups((prev) => [...prev, activeGroup.label]);
    }
  }, [pathname]);

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 w-[240px] bg-surface border-r border-border flex flex-col z-50 text-muted transition-transform duration-300 md:translate-x-0 ${
        isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      }`}
    >
      {/* Brand Header */}
      <div className="h-[64px] flex items-center justify-between px-5 border-b border-border shrink-0 bg-surface">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            M
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-inter font-bold tracking-tight text-foreground text-sm uppercase">
              MASKY PRODUCT
            </span>
          </div>
        </Link>
        {setIsOpen && (
          <button
            className="md:hidden text-muted hover:text-foreground p-1"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation Groups with Accordion */}
      <div className="flex-1 overflow-y-auto py-5 px-3 flex flex-col gap-3 scrollbar-hide">
        {visibleGroups.map((group, idx) => {
          const isExpanded = expandedGroups.includes(group.label);
          return (
            <div key={idx} className="flex flex-col gap-1">
              {/* Group Accordion Header */}
              <button
                type="button"
                onClick={() => toggleGroup(group.label)}
                className="flex items-center justify-between px-3 py-1.5 w-full rounded-lg hover:bg-surface-elevated/60 transition-colors group cursor-pointer text-left"
              >
                <span className="font-inter font-bold text-[10px] uppercase tracking-wider text-muted/70 group-hover:text-foreground transition-colors">
                  {group.label}
                </span>
                {isExpanded ? (
                  <ChevronDown size={13} className="text-muted/60 group-hover:text-foreground transition-transform" />
                ) : (
                  <ChevronRight size={13} className="text-muted/60 group-hover:text-foreground transition-transform" />
                )}
              </button>

              {/* Group Items */}
              {isExpanded && (
                <div className="flex flex-col gap-0.5 mt-0.5 pl-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      item.href === "/admin"
                        ? pathname === "/admin"
                        : pathname === item.href ||
                          (item.href !== "/" && pathname?.startsWith(item.href));

                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => {
                          if (setIsOpen && window.innerWidth < 768) setIsOpen(false);
                        }}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-inter font-medium transition-all group ${
                          isActive
                            ? "bg-surface-elevated text-foreground font-semibold border border-border shadow-2xs"
                            : "text-muted hover:text-foreground hover:bg-surface-elevated/60"
                        }`}
                      >
                        <Icon
                          size={15}
                          className={`shrink-0 transition-colors ${
                            isActive ? "text-accent" : "text-muted group-hover:text-foreground"
                          }`}
                        />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-border shrink-0 bg-surface flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0 flex-1 px-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-800 to-slate-700 text-slate-100 flex items-center justify-center font-inter font-bold text-xs shadow-inner border border-slate-600/30 shrink-0">
            {getInitials(user?.name)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-inter font-semibold text-xs text-foreground truncate leading-tight">
              {user?.name || "Staff Member"}
            </span>
            <span className="font-inter text-[10px] text-muted truncate">
              {primaryRole}
            </span>
          </div>
        </div>
        <button
          onClick={() => useAuthStore.getState().logout("/login")}
          className="p-1.5 text-muted hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors ml-1 shrink-0"
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
