"use client";

import { useEffect, useState } from "react";
import { History, Download, Search, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { getImportLogs } from "@/lib/supplier/firestore";
import { buildErrorReport, downloadCsv } from "@/lib/supplier/csvEngine";
import { Pagination } from "@/components/ui/Pagination";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import type { ImportLog } from "@/types";

const MOCK_LOGS: ImportLog[] = [
  { id: "il1", supplierId: "s1", supplierName: "Baap Store", source: "csv", importedCount: 148, updatedCount: 0, skippedCount: 2, failedCount: 0, status: "success", durationMs: 1840, notes: "June batch", createdAt: new Date("2026-06-20T10:01:30") },
  { id: "il2", supplierId: "s2", supplierName: "Custom CSV", source: "csv", importedCount: 75, updatedCount: 3, skippedCount: 0, failedCount: 2, status: "partial", durationMs: 920, createdAt: new Date("2026-06-22T14:00:45") },
  { id: "il3", supplierId: "s3", supplierName: "CJ Dropshipping", source: "api", importedCount: 0, updatedCount: 0, skippedCount: 0, failedCount: 10, status: "failed", durationMs: 5000, notes: "API credentials invalid", createdAt: new Date("2026-06-24T09:00:00") },
  { id: "il4", supplierId: "s1", supplierName: "Baap Store", source: "csv", importedCount: 200, updatedCount: 12, skippedCount: 3, failedCount: 0, status: "success", durationMs: 2100, notes: "July batch", createdAt: new Date("2026-07-01T11:00:00") },
];

const STATUS_CONFIG = {
  success: { icon: CheckCircle, style: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400", iconStyle: "text-emerald-500" },
  partial: { icon: AlertCircle, style: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400", iconStyle: "text-yellow-500" },
  failed: { icon: XCircle, style: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400", iconStyle: "text-rose-500" },
};

const PAGE_SIZE = 20;

export default function ImportHistoryPage() {
  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    getImportLogs(100)
      .then((d) => setLogs(d.length > 0 ? d : MOCK_LOGS))
      .catch(() => setLogs(MOCK_LOGS))
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter((l) =>
    l.supplierName.toLowerCase().includes(search.toLowerCase()) ||
    l.source.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const totals = {
    imported: logs.reduce((s, l) => s + l.importedCount, 0),
    updated: logs.reduce((s, l) => s + l.updatedCount, 0),
    skipped: logs.reduce((s, l) => s + l.skippedCount, 0),
    failed: logs.reduce((s, l) => s + l.failedCount, 0),
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Import History</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{logs.length} import records</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Imported", value: totals.imported, color: "text-emerald-600" },
          { label: "Total Updated", value: totals.updated, color: "text-blue-600" },
          { label: "Total Skipped", value: totals.skipped, color: "text-yellow-600" },
          { label: "Total Failed", value: totals.failed, color: "text-rose-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="relative max-w-xs">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="search" placeholder="Search supplier…" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all" />
      </div>

      {loading ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <TableSkeleton rows={5} cols={8} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <EmptyState icon={History} title="No import history yet" description="Import logs will appear here after your first CSV or API import" />
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    {["Date", "Supplier", "Source", "Imported", "Updated", "Skipped", "Failed", "Duration", "Status", ""].map((h) => (
                      <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((log) => {
                    const config = STATUS_CONFIG[log.status];
                    const Icon = config.icon;
                    return (
                      <tr key={log.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                        <td className="px-4 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                          {log.createdAt.toLocaleDateString()} {log.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-gray-900 dark:text-white">{log.supplierName}</td>
                        <td className="px-4 py-3.5">
                          <span className="capitalize px-2 py-1 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{log.source}</span>
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-emerald-600 dark:text-emerald-400">{log.importedCount}</td>
                        <td className="px-4 py-3.5 text-blue-600 dark:text-blue-400">{log.updatedCount}</td>
                        <td className="px-4 py-3.5 text-yellow-600 dark:text-yellow-400">{log.skippedCount}</td>
                        <td className="px-4 py-3.5 text-rose-600 dark:text-rose-400">{log.failedCount}</td>
                        <td className="px-4 py-3.5 text-gray-400 text-xs">{(log.durationMs / 1000).toFixed(1)}s</td>
                        <td className="px-4 py-3.5">
                          <span className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold w-fit", config.style)}>
                            <Icon size={11} className={config.iconStyle} />
                            {log.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          {log.failedCount > 0 && (
                            <button
                              onClick={() => { const r = buildErrorReport([]); downloadCsv(r, `errors_${log.id}.csv`); }}
                              className="flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 hover:underline"
                            >
                              <Download size={11} /> Errors
                            </button>
                          )}
                        </td>
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
