"use client";

import { useEffect, useState } from "react";
import { DollarSign, ShoppingCart, Users, Package } from "lucide-react";
import { StatCard } from "@/components/admin/dashboard/StatCard";
import { RecentOrdersTable } from "@/components/admin/dashboard/RecentOrdersTable";
import { getDashboardStats, getRecentOrders } from "@/lib/firebase/firestore";
import { formatCurrency } from "@/lib/utils";
import type { DashboardStats, RecentOrder } from "@/types";
import { useAuth } from "@/context/AuthContext";

// Fallback mock data when Firestore is empty
const MOCK_STATS: DashboardStats = {
  totalRevenue: 48320,
  totalOrders: 312,
  totalCustomers: 1840,
  totalProducts: 94,
  revenueChange: 12.5,
  ordersChange: 8.2,
  customersChange: 5.1,
  productsChange: 3.7,
};

const MOCK_ORDERS: RecentOrder[] = [
  { id: "ord_abc123", customerName: "Priya Sharma", total: 129.99, status: "delivered", createdAt: new Date("2026-06-20") },
  { id: "ord_def456", customerName: "Rahul Mehta", total: 74.50, status: "shipped", createdAt: new Date("2026-06-21") },
  { id: "ord_ghi789", customerName: "Anita Verma", total: 299.00, status: "processing", createdAt: new Date("2026-06-22") },
  { id: "ord_jkl012", customerName: "Karan Patel", total: 54.99, status: "pending", createdAt: new Date("2026-06-23") },
  { id: "ord_mno345", customerName: "Sunita Rao", total: 189.00, status: "confirmed", createdAt: new Date("2026-06-24") },
];

export default function DashboardPage() {
  const { appUser } = useAuth();
  const [stats, setStats] = useState<DashboardStats>(MOCK_STATS);
  const [orders, setOrders] = useState<RecentOrder[]>(MOCK_ORDERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, o] = await Promise.all([getDashboardStats(), getRecentOrders(5)]);
        setStats(s);
        if (o.length > 0) setOrders(o as RecentOrder[]);
      } catch {
        // Firestore not configured yet — use mock data
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">
          {greeting}, {appUser?.name?.split(" ")[0] ?? "Admin"} 👋
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Here&apos;s what&apos;s happening with your store today.
        </p>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            change={stats.revenueChange}
            icon={DollarSign}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders.toLocaleString()}
            change={stats.ordersChange}
            icon={ShoppingCart}
            iconColor="text-brand-600"
            iconBg="bg-brand-100 dark:bg-brand-900/30"
          />
          <StatCard
            title="Customers"
            value={stats.totalCustomers.toLocaleString()}
            change={stats.customersChange}
            icon={Users}
            iconColor="text-blue-600"
            iconBg="bg-blue-100 dark:bg-blue-900/30"
          />
          <StatCard
            title="Products"
            value={stats.totalProducts.toLocaleString()}
            change={stats.productsChange}
            icon={Package}
            iconColor="text-orange-600"
            iconBg="bg-orange-100 dark:bg-orange-900/30"
          />
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Add Product", href: "/products/add-product", color: "bg-brand-600 hover:bg-brand-700 text-white" },
          { label: "Manage Suppliers", href: "/suppliers", color: "bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700" },
          { label: "View Orders", href: "/orders", color: "bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700" },
          { label: "View Reports", href: "/reports", color: "bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700" },
        ].map((action) => (
          <a
            key={action.href}
            href={action.href}
            className={`flex items-center justify-center text-center text-sm font-semibold px-4 py-3 rounded-xl transition-all ${action.color}`}
          >
            {action.label}
          </a>
        ))}
      </div>

      {/* Recent Orders */}
      <RecentOrdersTable orders={orders} />

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top categories */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Top Categories</h3>
          <div className="space-y-3">
            {[
              { name: "Electronics", pct: 34, color: "bg-brand-500" },
              { name: "Fashion", pct: 28, color: "bg-purple-500" },
              { name: "Home & Living", pct: 19, color: "bg-orange-500" },
              { name: "Beauty", pct: 12, color: "bg-pink-500" },
              { name: "Sports", pct: 7, color: "bg-emerald-500" },
            ].map((cat) => (
              <div key={cat.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{cat.name}</span>
                  <span className="text-gray-400">{cat.pct}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Supplier status */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Supplier Status</h3>
            <a href="/suppliers" className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline">
              Manage
            </a>
          </div>
          <div className="space-y-3">
            {[
              { name: "Baap Store", status: "disconnected", products: 0 },
              { name: "Meesho", status: "disconnected", products: 0 },
              { name: "CJ Dropshipping", status: "disconnected", products: 0 },
              { name: "AliExpress", status: "disconnected", products: 0 },
            ].map((s) => (
              <div key={s.name} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{s.name}</p>
                  <p className="text-xs text-gray-400">{s.products} products</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                  s.status === "connected"
                    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500"
                }`}>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
