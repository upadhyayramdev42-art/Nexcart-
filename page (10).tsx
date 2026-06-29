"use client";

import { useEffect, useState } from "react";
import { Search, Filter } from "lucide-react";
import { getOrders, updateOrderStatus } from "@/lib/firebase/firestore";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

const STATUS_OPTIONS: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

const statusStyle: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
  confirmed: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  processing: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400",
  shipped: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  delivered: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  cancelled: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400",
  refunded: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
};

const MOCK_ORDERS: Order[] = [
  { id: "ord_1", customerId: "u1", customerName: "Priya Sharma", customerEmail: "priya@example.com", items: [], subtotal: 120, shippingCost: 9.99, total: 129.99, status: "delivered", paymentStatus: "paid", shippingAddress: { name: "Priya Sharma", phone: "9999999999", line1: "123 Main St", city: "Mumbai", state: "MH", pincode: "400001", country: "India" }, createdAt: new Date("2026-06-20"), updatedAt: new Date() },
  { id: "ord_2", customerId: "u2", customerName: "Rahul Mehta", customerEmail: "rahul@example.com", items: [], subtotal: 64.51, shippingCost: 9.99, total: 74.50, status: "shipped", paymentStatus: "paid", shippingAddress: { name: "Rahul Mehta", phone: "8888888888", line1: "456 Park Ave", city: "Delhi", state: "DL", pincode: "110001", country: "India" }, createdAt: new Date("2026-06-21"), updatedAt: new Date() },
  { id: "ord_3", customerId: "u3", customerName: "Anita Verma", customerEmail: "anita@example.com", items: [], subtotal: 289.01, shippingCost: 9.99, total: 299.00, status: "processing", paymentStatus: "paid", shippingAddress: { name: "Anita Verma", phone: "7777777777", line1: "789 Lake Rd", city: "Bangalore", state: "KA", pincode: "560001", country: "India" }, createdAt: new Date("2026-06-22"), updatedAt: new Date() },
  { id: "ord_4", customerId: "u4", customerName: "Karan Patel", customerEmail: "karan@example.com", items: [], subtotal: 45, shippingCost: 9.99, total: 54.99, status: "pending", paymentStatus: "pending", shippingAddress: { name: "Karan Patel", phone: "6666666666", line1: "321 Hill St", city: "Pune", state: "MH", pincode: "411001", country: "India" }, createdAt: new Date("2026-06-23"), updatedAt: new Date() },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getOrders();
        setOrders(data.length > 0 ? data : MOCK_ORDERS);
      } catch {
        setOrders(MOCK_ORDERS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = orders.filter((o) => {
    const matchSearch = o.customerName.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search);
    const matchFilter = filter === "all" || o.status === filter;
    return matchSearch && matchFilter;
  });

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
    } catch {
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{orders.length} total orders</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="search" placeholder="Search orders…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-4 py-2.5 text-sm rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all w-56" />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-gray-400" />
          {(["all", ...STATUS_OPTIONS] as const).map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={cn("text-xs font-semibold px-3 py-1.5 rounded-lg capitalize transition-all",
              filter === s ? "bg-brand-600 text-white" : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-brand-400")}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  {["Order ID", "Customer", "Total", "Payment", "Status", "Date", "Action"].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-500">#{order.id.slice(0, 10)}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900 dark:text-white">{order.customerName}</p>
                      <p className="text-xs text-gray-400">{order.customerEmail}</p>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-gray-900 dark:text-white">${order.total.toFixed(2)}</td>
                    <td className="px-5 py-3.5">
                      <span className={cn("px-2.5 py-1 rounded-lg text-xs font-semibold capitalize",
                        order.paymentStatus === "paid" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                        : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400")}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn("px-2.5 py-1 rounded-lg text-xs font-semibold capitalize", statusStyle[order.status])}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{order.createdAt.toLocaleDateString()}</td>
                    <td className="px-5 py-3.5">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        disabled={updating === order.id}
                        className="text-xs py-1.5 px-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-400 disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
