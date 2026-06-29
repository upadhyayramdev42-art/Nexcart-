"use client";

import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { getCustomerOrders } from "@/lib/firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

const statusStyle: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
  confirmed: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  processing: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400",
  shipped: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  delivered: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  cancelled: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400",
  refunded: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
};

export default function CustomerOrdersPage() {
  const { appUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!appUser) return;
    getCustomerOrders(appUser.uid)
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [appUser]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">My Orders</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{orders.length} orders</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-16 text-center">
          <ShoppingBag size={40} className="mx-auto mb-4 text-gray-200 dark:text-gray-700" />
          <p className="font-semibold text-gray-500 dark:text-gray-400 mb-2">No orders yet</p>
          <p className="text-sm text-gray-400 mb-5">Start shopping to see your orders here</p>
          <a href="/" className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm shadow-lg shadow-brand-600/30">
            Shop Now
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-xs font-mono text-gray-400 mb-1">#{order.id.slice(0, 12)}</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{order.items.length} item(s)</p>
                  <p className="text-xs text-gray-400 mt-0.5">{order.createdAt.toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">${order.total.toFixed(2)}</p>
                  <span className={cn("px-2.5 py-1 rounded-lg text-xs font-semibold capitalize", statusStyle[order.status])}>
                    {order.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
