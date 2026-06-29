"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Truck,
  BarChart3,
  Settings,
  Tags,
  Zap,
  ChevronDown,
  ChevronRight,
  PackagePlus,
  PackageSearch,
  Link2,
  FileSpreadsheet,
  Globe,
  TrendingUp,
  History,
  RefreshCw,
  Boxes,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavChild {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  children?: NavChild[];
  section?: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    label: "Products",
    icon: Package,
    children: [
      { label: "My Products", href: "/products/my-products", icon: PackagePlus },
      { label: "Dropshipping", href: "/products/dropshipping-products", icon: PackageSearch },
      { label: "Add Product", href: "/products/add-product", icon: PackagePlus },
    ],
  },
  { label: "Categories", href: "/categories", icon: Tags },
  { label: "Orders", href: "/orders", icon: ShoppingCart },
  { label: "Customers", href: "/customers", icon: Users },
  // ─── Module 03 ───
  {
    label: "Supplier Engine",
    icon: Truck,
    section: "MODULE 03",
    children: [
      { label: "Connections", href: "/supplier-connections", icon: Link2 },
      { label: "Supplier Products", href: "/supplier-products", icon: Boxes },
      { label: "CSV Imports", href: "/csv-imports", icon: FileSpreadsheet },
      { label: "API Connections", href: "/api-connections", icon: Globe },
      { label: "Profit Rules", href: "/profit-rules", icon: TrendingUp },
      { label: "Import History", href: "/import-history", icon: History },
      { label: "Sync History", href: "/sync-history", icon: RefreshCw },
    ],
  },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

interface AdminSidebarProps {
  collapsed?: boolean;
}

export function AdminSidebar({ collapsed = false }: AdminSidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string[]>(["Products", "Supplier Engine"]);

  const toggleExpand = (label: string) => {
    setExpanded((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const isGroupActive = (item: NavItem) =>
    item.children?.some((c) => isActive(c.href)) ?? false;

  let lastSection = "";

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-gray-950 border-r border-gray-800 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-800">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/30">
          <Zap size={16} className="text-white fill-white" />
        </div>
        {!collapsed && (
          <div>
            <span className="font-display text-lg font-bold text-white tracking-tight">
              Nex<span className="text-brand-400">Cart</span>
            </span>
            <p className="text-[10px] text-gray-500 font-medium -mt-0.5">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const showSection = !collapsed && item.section && item.section !== lastSection;
          if (item.section) lastSection = item.section;

          if (item.children) {
            const open = expanded.includes(item.label);
            const groupActive = isGroupActive(item);
            return (
              <div key={item.label}>
                {showSection && (
                  <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest px-3 pt-4 pb-1">
                    {item.section}
                  </p>
                )}
                <button
                  onClick={() => toggleExpand(item.label)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                    groupActive
                      ? "bg-brand-600/20 text-brand-400"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon size={18} className="shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </>
                  )}
                </button>
                {!collapsed && open && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l border-gray-800 pl-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all",
                          isActive(child.href)
                            ? "bg-brand-600 text-white shadow-lg shadow-brand-600/30"
                            : "text-gray-500 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <child.icon size={14} />
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive(item.href!)
                  ? "bg-brand-600 text-white shadow-lg shadow-brand-600/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Version */}
      {!collapsed && (
        <div className="px-5 py-4 border-t border-gray-800">
          <p className="text-[10px] text-gray-600">NexCart v3.0 · Module 03</p>
        </div>
      )}
    </aside>
  );
}
