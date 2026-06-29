"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Search, CheckCircle, XCircle, Clock, Loader } from "lucide-react";
import { getSyncHistory } from "@/lib/supplier/firestore";
import { Pagination } from "@/components/ui/Pagination";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import type { SyncHistory, SyncType } from "@/types";

const MOCK_SYNC: SyncHistory[] = [
  { id: "sh1", supplierId: "s1", supplierName: "Baap Store", syncType: "full", status: "completed", affectedCount: 148, startedAt: new Date("2026-06-20T10:00:00"), completedAt: new Date("2026-06-20T10:01:30") },
  { id: "sh2", supplierId: "s1", supplierName: "Baap Store", syncType: "price", status: "completed", affectedCount: 148, startedAt: new Date("2026-06-21T08:00:00"), completedAt: new Date("2026-06-21T08:00:12") },
  { id: "sh3", supplierId: "s3", supplierName: "CJ Dropshipping", syncType: "stock", status: "failed", affectedCount: 0, startedAt: new Date("2026-06-22T12:00:00"), error: "API timeout" },
  { id: "sh4", supplierId: "s1", supplierName: "Baap Store", syncType: "stock", status: "completed", affectedCount: 148, startedAt: new Date("2026-06-22T14:00:00"), completedAt: new Date("2026-06-22T14:00:08") },
  { id: "sh5", supplierId: "s2", supplierName: "Custom CSV", syncType: "product", status: "completed", affectedCount: 78, startedAt: new Date("2026-06-23T09:00:00"), completedAt: new Date("2026-06-23T09:00:45") },
];

const SYNC_TYPE_LABELS: Record<SyncType, string> = {
  product: "Products",
  price: "Prices",
  stock: "Stock",
  image: "Images",
  full: "Full Sync",
};

const STATUS_CONFIG = {
  completed: { icon: CheckCircle, style: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400", iconStyle: "text-emerald-500" },
  failed: { icon: XCircle, style: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400", iconStyle: "text-rose-500" },
  pending: { icon: Clock, style: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400", iconStyle: "text-yellow-500" },
  running: { icon: Loader, style: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400", iconStyle: "text-blue-500" },
};

const PAGE_SIZE = 20;

export default function SyncHistoryPage() {
  const [history, setHistory] = useState<SyncHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<SyncType | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    getSyncHistory(100)
      .then((d) => setHistory(d.length > 0 ? d : MOCK_SYNC))
      .catch(() => setHistory(MOCK_SYNC))
      .finally(() => setLoading(false));
  }, []);

  const filtered = history.filter((h) => {
    const matchSearch = h.supplierName.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || h.syncType === typeFilter;
    return matchSearch && matchType;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const getDuration = (h: SyncHistory) => {
    if (!h.completedAt) return "—";
    const ms = h.completedAt.getTime() - h.startedAt.getTime();
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Sync History</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{history.length} sync records</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Syncs", value: history.length, color: "text-gray-900 dark:text-white" },
          { label: "Successful", value: history.filter((h) => h.status === "completed").length, color: "text-emerald-600" },
          { label: "Failed", value: history.filter((h) => h.status === "failed").length, color: "text-rose-600" },
          { label: "Products Affected", value: history.reduce((s, h) => s + h.affectedCount, 0).toLocaleString(), color: "text-brand-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="search" placeholder="Search supplier…" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-400 transition-all" />
        </div>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value as SyncType | "all"); setCurrentPage(1); }} className="px-4 py-2.5 text-sm rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all">
          <option value="all">All Types</option>
          {(Object.keys(SYNC_TYPE_LABELS) as SyncType[]).map((t) => <option key={t} value={t}>{SYNC_TYPE_LABELS[t]}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <TableSkeleton rows={5} cols={7} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <EmptyState icon={RefreshCw} title="No sync history yet" description="Sync logs will appear here after your first product sync" />
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    {["Date", "Supplier", "Type", "Affected", "Duration", "Status", "Notes"].map((h) => (
                      <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((entry) => {
                    const config = STATUS_CONFIG[entry.status];
                    const Icon = config.icon;
                    return (
                      <tr key={entry.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="px-4 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                          {entry.startedAt.toLocaleDateString()} {entry.startedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-gray-900 dark:text-white">{entry.supplierName}</td>
                        <td className="px-4 py-3.5">
                          <span className="px-2 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{SYNC_TYPE_LABELS[entry.syncType]}</span>
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-gray-900 dark:text-white">{entry.affectedCount}</td>
                        <td className="px-4 py-3.5 text-gray-400 text-xs">{getDuration(entry)}</td>
                        <td className="px-4 py-3.5">
                          <span className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold w-fit", config.style)}>
                            <Icon size={11} className={config.iconStyle} />
                            {entry.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-gray-400 text-xs">{entry.error ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      )}
    </div>
  );
}
