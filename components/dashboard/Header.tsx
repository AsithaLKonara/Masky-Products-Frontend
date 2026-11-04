"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  LogOut,
  ExternalLink,
  Plus,
  SlidersHorizontal,
  Sun,
  Moon,
  ShoppingBag,
  Package,
  Info,
  AlertTriangle,
  Layers,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { useNotifications } from "@/hooks/useNotifications";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default function Header({
  onMenuClick,
  isCollapsed,
  session,
}: {
  onMenuClick?: () => void;
  isCollapsed?: boolean;
  session?: any;
}) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: ⌘K or Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getInitials = (name?: string | null) => {
    if (!name) return "AK";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const displayName = user?.name || session?.user?.name || "Asitha K.";
  const displayRole = user?.roles?.[0] || session?.user?.role || "Super Admin";

  return (
    <header className="h-[64px] bg-surface/90 backdrop-blur-md border-b border-border flex items-center justify-between px-4 lg:px-6 shrink-0 z-40 transition-colors duration-200">
      
      {/* Left Area: Mobile Menu + Search */}
      <div className="flex items-center gap-3 md:gap-4 flex-1 max-w-[540px]">
        {/* Mobile / Sidebar Toggle */}
        <button
          onClick={onMenuClick}
          className="p-2 -ml-1 text-muted hover:text-foreground hover:bg-surface-elevated rounded-xl transition-colors border border-transparent hover:border-border cursor-pointer"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen size={18} className="text-primary hidden md:block" />
          ) : (
            <PanelLeftClose size={18} className="hidden md:block" />
          )}
          <Menu size={18} className="md:hidden" />
        </button>

        {/* Global Omnisearch Bar matching screenshot */}
        <div className="relative w-full max-w-[420px] hidden sm:block">
          <div className="flex items-center gap-2 h-[38px] bg-surface-subtle/70 hover:bg-surface-elevated border border-border rounded-xl px-3.5 transition-all focus-within:border-accent focus-within:ring-1 focus-within:ring-accent/30 focus-within:bg-surface">
            <Search size={15} className="text-muted shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search orders, customers, SKU..."
              className="flex-1 bg-transparent border-none outline-none font-inter text-[13px] text-foreground placeholder:text-muted/70 tracking-normal"
            />
            <kbd className="hidden sm:inline-flex items-center justify-center px-1.5 py-0.5 bg-surface border border-border rounded text-[10px] font-mono font-medium text-muted shrink-0 shadow-2xs">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Area: Status, Links, Actions & Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 ml-auto">
        
        {/* Landing / Storefront external link */}
        <Link
          href="/"
          target="_blank"
          className="hidden md:flex items-center gap-1.5 text-xs font-inter font-medium text-muted hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg hover:bg-surface-elevated"
        >
          <span>Landing</span>
          <ExternalLink size={13} className="opacity-70" />
        </Link>

        {/* Status Badge: "• System Online" with pulsating green dot */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-inter font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[12px] font-medium tracking-tight">System Online</span>
        </div>

        {/* Primary Action Button: "+ New Product" */}
        <button
          onClick={() => router.push("/admin/products?action=new")}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground hover:opacity-90 font-inter font-semibold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <Plus size={14} strokeWidth={2.5} />
          <span>New Product</span>
        </button>

        {/* Secondary Action Button: "Actions ▾" */}
        <div className="relative">
          <button
            onClick={() => setIsActionsOpen(!isActionsOpen)}
            className="hidden sm:flex items-center gap-1.5 bg-surface-subtle border border-border hover:bg-surface-elevated text-foreground font-inter font-medium text-xs px-3 py-2 rounded-xl transition-all active:scale-95"
          >
            <SlidersHorizontal size={13} className="text-muted" />
            <span>Actions</span>
          </button>

          {isActionsOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-48 bg-surface border border-border rounded-xl shadow-xl py-1 z-50 flex flex-col text-xs font-inter"
              onMouseLeave={() => setIsActionsOpen(false)}
            >
              <button
                onClick={() => {
                  router.push("/admin/orders");
                  setIsActionsOpen(false);
                }}
                className="flex items-center gap-2 px-3.5 py-2 hover:bg-surface-elevated text-foreground text-left"
              >
                <ShoppingBag size={14} className="text-muted" />
                View All Orders
              </button>
              <button
                onClick={() => {
                  router.push("/admin/reports");
                  setIsActionsOpen(false);
                }}
                className="flex items-center gap-2 px-3.5 py-2 hover:bg-surface-elevated text-foreground text-left"
              >
                <Layers size={14} className="text-muted" />
                Export Telemetry
              </button>
              <button
                onClick={() => {
                  router.push("/admin/system/settings");
                  setIsActionsOpen(false);
                }}
                className="flex items-center gap-2 px-3.5 py-2 hover:bg-surface-elevated text-foreground text-left border-t border-border"
              >
                <Sparkles size={14} className="text-accent" />
                Cluster Settings
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle Button (Sun / Moon) */}
        <button
          type="button"
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-surface-subtle border border-border hover:bg-surface-elevated text-muted hover:text-foreground transition-all cursor-pointer"
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
          aria-label="Toggle theme"
          id="theme-toggle-btn"
        >
          {theme === "dark" ? (
            <Sun size={16} className="text-amber-400 transition-transform rotate-0 hover:rotate-45" />
          ) : (
            <Moon size={16} className="text-slate-700 transition-transform -rotate-12 hover:rotate-0" />
          )}
        </button>

        {/* Notification Bell */}
        <div className="relative group">
          <button
            className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-surface-subtle border border-border hover:bg-surface-elevated text-muted hover:text-foreground transition-all"
            aria-label="Notifications"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-surface animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-border flex items-center justify-between bg-surface-subtle">
              <h3 className="font-semibold text-xs text-foreground font-inter">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="text-[11px] text-accent hover:underline font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-muted flex flex-col items-center">
                  <Bell size={22} className="opacity-20 mb-2" />
                  <p className="text-xs">No new notifications</p>
                </div>
              ) : (
                notifications.map((notif: any) => (
                  <div
                    key={notif.id}
                    className={`p-3 border-b border-border last:border-0 hover:bg-surface-elevated transition-colors flex gap-3 cursor-pointer ${
                      !notif.isRead ? "bg-accent/5" : ""
                    }`}
                    onClick={() => {
                      if (!notif.isRead) markAsRead(notif.id);
                      if (notif.link) router.push(notif.link);
                    }}
                  >
                    <div className="mt-0.5 shrink-0">
                      {notif.type === "ORDER" ? (
                        <ShoppingBag size={14} className="text-accent" />
                      ) : notif.type === "INVENTORY" ? (
                        <Package size={14} className="text-warning" />
                      ) : notif.type === "ALERT" ? (
                        <AlertTriangle size={14} className="text-error" />
                      ) : (
                        <Info size={14} className="text-info" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-0.5">
                        <p className="text-xs font-medium truncate text-foreground">
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-muted shrink-0">
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* User Profile Avatar with Initials */}
        <div className="relative group">
          <button className="flex items-center gap-2 p-1 pl-1.5 rounded-xl hover:bg-surface-elevated border border-border bg-surface-subtle transition-all">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-slate-800 to-slate-700 text-slate-100 flex items-center justify-center font-inter font-bold text-[11px] shadow-inner border border-slate-600/30">
              {getInitials(displayName)}
            </div>
            <ChevronDown size={13} className="text-muted mr-1 group-hover:text-foreground transition-colors" />
          </button>

          {/* Profile Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-52 bg-surface border border-border rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1.5 z-50 flex flex-col font-inter">
            <div className="px-3.5 py-2 border-b border-border">
              <p className="text-xs font-semibold text-foreground truncate">{displayName}</p>
              <p className="text-[10px] text-muted truncate mt-0.5">{displayRole}</p>
            </div>
            <button
              onClick={() => router.push("/admin/system/settings")}
              className="flex items-center gap-2 px-3.5 py-2 text-xs text-foreground hover:bg-surface-elevated transition-colors text-left w-full"
            >
              <SlidersHorizontal size={14} className="text-muted" />
              Settings
            </button>
            <button
              onClick={async () => {
                const { logout } = useAuthStore.getState();
                await logout("/login");
                router.push("/login");
              }}
              className="flex items-center gap-2 px-3.5 py-2 text-xs text-error hover:bg-error/10 transition-colors text-left w-full border-t border-border mt-1"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}
