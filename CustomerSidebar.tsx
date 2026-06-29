"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Heart, ShoppingBag, MapPin, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "My Profile", href: "/profile", icon: User },
  { label: "My Wishlist", href: "/wishlist", icon: Heart },
  { label: "My Orders", href: "/orders", icon: ShoppingBag },
  { label: "Addresses", href: "/addresses", icon: MapPin },
];

export function CustomerSidebar() {
  const pathname = usePathname();
  const { appUser, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const initials = appUser?.name
    ? appUser.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "NC";

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0">
      {/* Profile card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-base">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{appUser?.name}</p>
            <p className="text-xs text-gray-400 truncate">{appUser?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
              pathname === item.href
                ? "bg-brand-600 text-white shadow-md shadow-brand-600/30"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
            )}
          >
            <item.icon size={16} />
            {item.label}
          </Link>
        ))}
        <div className="border-t border-gray-100 dark:border-gray-800 mt-2 pt-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
