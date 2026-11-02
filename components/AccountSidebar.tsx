"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, ShoppingBag, MapPin, Heart, Award, LogOut, RotateCcw, Star } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

export default function AccountSidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/account", label: "Overview", icon: User },
    { href: "/account/orders", label: "Orders", icon: ShoppingBag },
    { href: "/account/returns", label: "Returns", icon: RotateCcw },
    { href: "/account/reviews", label: "Reviews", icon: Star },
    { href: "/account/loyalty", label: "Loyalty Rewards", icon: Award },
    { href: "/account/wishlist", label: "Wishlist", icon: Heart },
    { href: "/account/addresses", label: "Addresses", icon: MapPin },
  ];

  return (
    <div className="w-full md:w-64 shrink-0 flex flex-col gap-4 md:gap-8">
      <div className="hidden md:block">
        <h2 className="font-signature text-3xl text-stone-900 mb-1">My Account</h2>
        <p className="font-inter text-sm text-stone-500">Welcome back, Kasun</p>
      </div>

      <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 hide-scrollbar">
        {links.map((link) => {
          const Icon = link.icon;
          // Exact match for overview, startsWith for subpages to keep active on child routes if any
          const isActive = link.href === "/account" 
            ? pathname === "/account" 
            : pathname.startsWith(link.href);

          return (
            <Link 
              key={link.href}
              href={link.href} 
              className={`flex items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3 font-inter text-sm rounded-lg transition-colors whitespace-nowrap ${
                isActive 
                  ? "bg-stone-100 text-stone-900 font-semibold" 
                  : "text-stone-600 hover:bg-stone-50 hover:text-stone-900 font-medium"
              }`}
            >
              <Icon size={18} /> {link.label}
            </Link>
          );
        })}
        
        <div className="hidden md:block h-px bg-stone-200 my-2"></div>
        
        <button 
          onClick={async () => {
            const { logout } = useAuthStore.getState();
            await logout('/login');
            window.location.href = "/login";
          }}
          className="flex items-center gap-2 md:gap-3 px-4 py-2.5 md:py-3 text-red-600 hover:bg-red-50 font-inter font-medium text-sm rounded-lg transition-colors text-left whitespace-nowrap"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </nav>
    </div>
  );
}
