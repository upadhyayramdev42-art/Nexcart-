"use client";

import Link from "next/link";
import { ShoppingCart, Heart, User, Menu, X, Zap } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { SearchBar } from "@/components/shared/SearchBar";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "New Arrivals", href: "/new" },
  { label: "Women", href: "/women" },
  { label: "Men", href: "/men" },
  { label: "Electronics", href: "/electronics" },
  { label: "Sale", href: "/sale" },
];

interface HeaderProps {
  cartCount?: number;
  wishlistCount?: number;
}

export function Header({ cartCount = 0, wishlistCount = 0 }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Announcement bar */}
      <div className="bg-brand-700 dark:bg-brand-900 text-white text-xs py-2 text-center font-medium tracking-wide">
        Free shipping on orders over $75 &nbsp;·&nbsp;{" "}
        <Link href="/sale" className="underline underline-offset-2 hover:no-underline">
          Shop the sale →
        </Link>
      </div>

      {/* Main header */}
      <div className="bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4 h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/30">
                <Zap size={16} className="text-white fill-white" />
              </div>
              <span className="font-display text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                Nex<span className="text-brand-600">Cart</span>
              </span>
            </Link>

            {/* Search — desktop */}
            <SearchBar className="hidden md:flex flex-1 max-w-xl" />

            {/* Right actions */}
            <div className="flex items-center gap-1 ml-auto">
              <ThemeToggle />

              <Link
                href="/account"
                className="hidden sm:flex w-9 h-9 items-center justify-center rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Account"
              >
                <User size={18} />
              </Link>

              <Link
                href="/wishlist"
                className="relative hidden sm:flex w-9 h-9 items-center justify-center rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Wishlist"
              >
                <Heart size={18} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                href="/cart"
                className="relative flex w-9 h-9 items-center justify-center rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Cart"
              >
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Menu"
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>

          {/* Nav links — desktop */}
          <nav className="hidden md:flex items-center gap-6 py-2.5 border-t border-gray-100 dark:border-gray-800/60">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors",
                  link.label === "Sale" && "text-rose-600 dark:text-rose-400 font-semibold"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-gray-800 px-4 pb-4 pt-2 space-y-2 animate-fade-in">
            <SearchBar className="mb-3" />
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400",
                  link.label === "Sale" && "text-rose-600 dark:text-rose-400"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 flex items-center gap-4 border-t border-gray-100 dark:border-gray-800">
              <Link href="/account" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <User size={16} /> Account
              </Link>
              <Link href="/wishlist" className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Heart size={16} /> Wishlist
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
