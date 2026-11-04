"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardLayoutClient({ children, session }: { children: React.ReactNode, session?: any }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Ensure admin dashboard always has dark mode class active on html root
    if (typeof document !== "undefined") {
      document.documentElement.classList.add("dark");
    }
    try {
      const saved = localStorage.getItem("masky_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch (_) {}
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("masky_sidebar_collapsed", String(next));
      } catch (_) {}
      return next;
    });
  };

  const handleMenuClick = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      toggleCollapse();
    } else {
      setIsSidebarOpen((prev) => !prev);
    }
  };

  return (
    <div className="dashboard-theme dark flex h-screen w-full bg-background text-foreground overflow-hidden relative">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />

      {/* Main Layout Area - Smoothly transitions margin when sidebar collapses */}
      <div 
        id="dashboard-main-content"
        className={`flex-1 flex flex-col ${
          isCollapsed ? "md:ml-[68px]" : "md:ml-[240px]"
        } h-screen overflow-hidden w-full transition-[margin] duration-300 ease-in-out`}
      >
        {/* Header */}
        <Header 
          onMenuClick={handleMenuClick} 
          isCollapsed={isCollapsed}
          session={session} 
        />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto w-full p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
