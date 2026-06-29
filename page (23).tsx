import { BarChart3, TrendingUp, DollarSign, ShoppingCart } from "lucide-react";

export default function ReportsPage() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const revenues = [18000, 22000, 19500, 31000, 28000, 48320];
  const maxRev = Math.max(...revenues);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Business performance overview</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Revenue (YTD)", value: "$167,320", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
          { label: "Orders (YTD)", value: "1,842", icon: ShoppingCart, color: "text-brand-600", bg: "bg-brand-100 dark:bg-brand-900/30" },
          { label: "Avg Order Value", value: "$90.83", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },
          { label: "Return Rate", value: "2.4%", icon: BarChart3, color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
              <kpi.icon size={18} className={kpi.color} />
            </div>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-6">Monthly Revenue</h2>
        <div className="flex items-end justify-between gap-3 h-48">
          {months.map((month, i) => (
            <div key={month} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">${(revenues[i] / 1000).toFixed(0)}k</span>
              <div className="w-full relative">
                <div
                  className="w-full bg-brand-600 rounded-t-lg hover:bg-brand-500 transition-colors cursor-pointer"
                  style={{ height: `${(revenues[i] / maxRev) * 160}px` }}
                  title={`$${revenues[i].toLocaleString()}`}
                />
              </div>
              <span className="text-xs text-gray-400">{month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">Monthly Breakdown</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              {["Month", "Revenue", "Orders", "Avg Order", "Growth"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {months.map((month, i) => {
              const prev = revenues[i - 1] ?? revenues[i];
              const growth = i === 0 ? 0 : ((revenues[i] - prev) / prev * 100);
              const orders = [180, 210, 195, 290, 268, 312][i];
              return (
                <tr key={month} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">{month} 2026</td>
                  <td className="px-5 py-3.5 font-semibold text-gray-900 dark:text-white">${revenues[i].toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400">{orders}</td>
                  <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400">${(revenues[i] / orders).toFixed(2)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold ${growth >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {growth >= 0 ? "+" : ""}{growth.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
