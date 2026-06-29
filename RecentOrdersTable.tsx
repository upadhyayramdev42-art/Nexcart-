import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

interface RecentOrderRow {
  id: string;
  customerName: string;
  total: number;
  status: OrderStatus;
  createdAt: Date;
}

const statusStyle: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
  confirmed: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  processing: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400",
  shipped: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  delivered: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  cancelled: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400",
  refunded: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
};

interface RecentOrdersTableProps {
  orders: RecentOrderRow[];
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white">Recent Orders</h3>
        <a href="/orders" className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline">
          View all
        </a>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              {["Order ID", "Customer", "Total", "Status", "Date"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-400 text-sm">
                  No orders yet
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-gray-500">#{order.id.slice(0, 8)}</td>
                  <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">{order.customerName}</td>
                  <td className="px-5 py-3.5 font-semibold text-gray-900 dark:text-white">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={cn("px-2.5 py-1 rounded-lg text-xs font-semibold capitalize", statusStyle[order.status])}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs">
                    {order.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
