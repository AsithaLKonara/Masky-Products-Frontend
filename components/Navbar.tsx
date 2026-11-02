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
      <div className="w-full px-4 md:px-6 lg:px-12 xl:px-[120px] h-[83px] flex justify-between items-center relative gap-4">
        
        {/* Mobile Hamburger (Left) */}
        <div className="flex md:hidden flex-1 items-center">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`p-2 -ml-2 rounded-full transition-colors ${hoverBgClass}`}
          >
            {isMobileMenuOpen ? <X size={24} className={textColorClass} /> : <Menu size={24} className={textColorClass} />}
          </button>
        </div>

        {/* Desktop Left Links */}
        <div className="hidden md:flex flex-1 items-center space-x-[15px] lg:space-x-[30px] xl:space-x-[40px] text-xs font-bold font-poppins">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.name} 
                href={link.href} 
                className={`transition-colors hover:text-stone-500 ${
                  isActive 
                    ? `${textColorClass} underline underline-offset-8 decoration-2` 
                    : textColorClass
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Center Logo */}
        <div className="flex justify-center shrink-0">
          <Link href="/">
            <div className="relative w-[200px] md:w-[240px] lg:w-[280px] h-[30px] md:h-[36px] lg:h-[42px]">
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

        {/* Right Actions */}
        <div className="flex justify-end flex-1 items-center">
          <div className="hidden md:flex items-center gap-[4px] space-x-2 xl:space-x-4 mr-2 xl:mr-4">
            <Link href={authHref} className={`font-poppins font-bold text-[10px] xl:text-xs tracking-wide uppercase transition-colors hover:opacity-70 ${textColorClass}`}>
              {authText}
            </Link>
          </div>
          <div className="flex items-center gap-1 md:gap-[4px]">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-2 md:p-2.5 rounded-full transition-colors ${hoverBgClass}`}
            >
              <Search size={20} className={textColorClass} />
            </button>
            <button 
              onClick={openWishlist}
              className={`p-2 md:p-2.5 rounded-full transition-colors ${hoverBgClass}`}
            >
              <Heart size={20} className={textColorClass} />
            </button>
            
            <button onClick={openDrawer} className={`flex items-center space-x-1 md:space-x-2 p-2 md:p-2.5 rounded-full transition-colors relative ${hoverBgClass}`}>
              <div className="relative">
                <ShoppingCart size={20} className={textColorClass} />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className={`hidden sm:inline font-bold text-xs font-poppins ${textColorClass}`}>
                Rs: {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </button>
          </div>
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
