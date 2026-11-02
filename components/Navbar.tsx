"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Heart, ShoppingCart, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCart as useOldCart } from "@/components/CartProvider";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/auth.store";
import { useCart } from "@/hooks/useCart";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const isAuth = pathname === "/login";
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { openWishlist } = useOldCart();
  const sessionId = useCartStore((state) => state.sessionId);
  const openDrawer = useCartStore((state) => state.openDrawer);
  const { isAuthenticated, isAdmin } = useAuthStore();
  const { data: cart } = useCart(sessionId);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const cartItems = mounted ? cart?.items || [] : [];
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + (item.quantity * (item.variant.salePrice ?? item.variant.price)), 0);
  const navLinks = [
    { name: "HOME", href: "/" },
    { name: "SHOP", href: "/shop" },
    { name: "ABOUT US", href: "/about" },
    { name: "CONTACT US", href: "/contact" },
  ];
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Styling based on route and scroll state
  const isTransparent = isHome && !isScrolled;
  
  const navBgClass = isAuth
    ? "bg-black/20 backdrop-blur-md border-b border-white/5"
    : isTransparent
    ? "bg-transparent"
    : "bg-background shadow-sm border-b border-stone-200";

  const textColorClass = isAuth
    ? "text-stone-50"
    : "text-stone-900";

  const hoverBgClass = isAuth
    ? "hover:bg-white/10"
    : "hover:bg-stone-100";

  const logoImage = isAuth
    ? "/logo-white.png"
    : "/logo.png";

  const authText = mounted && isAuthenticated ? "DASHBOARD" : "LOGIN/REGISTER";
  const authHref = mounted && isAuthenticated ? (isAdmin() ? "/admin" : "/account") : "/login";

  return (
    <nav className={`w-full z-[50] transition-colors duration-300 ${navBgClass}`}>
      <div className="w-full px-4 md:px-6 lg:px-12 xl:px-[100px] h-[76px] flex justify-between items-center relative gap-4">
        
        {/* Left: Brand Logo & Mobile Hamburger */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex md:hidden items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 -ml-2 rounded-full transition-colors ${hoverBgClass}`}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X size={22} className={textColorClass} /> : <Menu size={22} className={textColorClass} />}
            </button>
          </div>
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-[150px] md:w-[180px] lg:w-[200px] h-[32px] md:h-[36px]">
              <Image 
                src={logoImage}
                alt="MASKY PRODUCT"
                fill
                sizes="200px"
                className="object-contain"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Center: Nav Links */}
        <div className="hidden md:flex items-center gap-1 lg:gap-2 text-[12px] font-medium font-poppins">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.name} 
                href={link.href} 
                className={`px-4 py-1.5 rounded-full transition-all duration-300 ${
                  isActive 
                    ? "bg-[#627254] text-[#FFFCF4] shadow-sm font-semibold" 
                    : `${textColorClass} hover:text-[#203C2B] hover:bg-stone-200/40`
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Right: Actions */}
        <div className="flex justify-end items-center gap-1 md:gap-2">
          <div className="hidden lg:flex items-center mr-1">
            <Link 
              href={authHref} 
              className={`font-poppins font-medium text-[11px] tracking-wider uppercase transition-all px-3 py-1.5 rounded-full hover:bg-stone-200/40 ${textColorClass}`}
            >
              {authText}
            </Link>
          </div>
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`p-2 rounded-full transition-colors ${hoverBgClass}`}
            aria-label="Search"
          >
            <Search size={18} className={textColorClass} />
          </button>
          <button 
            onClick={openWishlist}
            className={`p-2 rounded-full transition-colors ${hoverBgClass}`}
            aria-label="Wishlist"
          >
            <Heart size={18} className={textColorClass} />
          </button>
          
          <button 
            onClick={openDrawer} 
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border border-[#DCDCCB] bg-[#FFFCF4]/80 hover:bg-[#FFFCF4] shadow-sm ${hoverBgClass}`}
            aria-label="Shopping Cart"
          >
            <div className="relative">
              <ShoppingCart size={17} className={textColorClass} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#203C2B] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </div>
            <span className={`hidden sm:inline font-semibold text-[11px] font-poppins ${textColorClass}`}>
              Rs: {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </button>
        </div>
      </div>

      {/* Search Dropdown */}
      {isSearchOpen && (
        <div className="absolute top-[83px] left-0 w-full bg-background shadow-md border-b border-stone-200 p-4 md:px-8 lg:px-[120px] flex items-center gap-4 animate-in slide-in-from-top-2">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
                setIsSearchOpen(false);
                setSearchQuery("");
              }
            }}
            className="flex-1 flex items-center relative max-w-3xl mx-auto"
          >
            <Search size={20} className="absolute left-4 text-stone-400" />
            <input 
              type="text" 
              placeholder="Search for products, categories, or styles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full h-12 pl-12 pr-[100px] bg-stone-100 rounded-full font-urbanist text-stone-900 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
            <button 
              type="submit" 
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-primary text-background rounded-full font-poppins text-xs font-medium hover:bg-[#2c2824] transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      )}

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-[83px] left-0 w-full bg-background shadow-lg border-b border-stone-200 flex flex-col p-4 md:hidden">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-3 px-4 text-stone-900 font-poppins font-bold text-sm border-b border-stone-100"
            >
              {link.name}
            </Link>
          ))}
          <Link 
            href={authHref} 
            onClick={() => setIsMobileMenuOpen(false)}
            className="py-3 px-4 text-stone-900 font-poppins font-bold text-sm"
          >
            {authText}
          </Link>
        </div>
      )}
    </nav>
  );
}
