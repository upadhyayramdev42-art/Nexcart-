"use client";

import { useEffect, useState } from "react";
import {
  Search, Filter, RefreshCw, Trash2, Eye, Download,
  Boxes, CheckSquare, Square, ChevronDown, X,
} from "lucide-react";
import { getSupplierProducts, bulkUpdateSupplierProductStatus, deleteSupplierProduct } from "@/lib/supplier/firestore";
import { exportProductsToCsv, downloadCsv } from "@/lib/supplier/csvEngine";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn, formatCurrency } from "@/lib/utils";
import type { SupplierProduct } from "@/types";

const PAGE_SIZE = 15;

const STATUS_STYLE: Record<SupplierProduct["status"], string> = {
  published: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  unpublished: "bg-gray-100 dark:bg-gray-800 text-gray-500",
  syncing: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  error: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400",
};

const MOCK_PRODUCTS: SupplierProduct[] = Array.from({ length: 22 }, (_, i) => ({
  id: `sp_${i + 1}`,
  supplierId: i % 2 === 0 ? "baap_store" : "cj_dropshipping",
  supplierName: i % 2 === 0 ? "Baap Store" : "CJ Dropshipping",
  supplierSKU: `SKU-${1000 + i}`,
  name: ["Wireless Earbuds Pro", "Linen Shirt Men", "Smart Watch Band", "Ceramic Mug Set", "LED Desk Lamp", "Cotton Tote Bag", "Phone Stand Holder", "Stainless Water Bottle"][i % 8],
  description: "Product imported from supplier",
  category: ["Electronics", "Fashion", "Electronics", "Home & Living", "Electronics", "Fashion", "Electronics", "Home & Living"][i % 8],
  brand: ["TechPro", "StyleCo", "SmartWear", "HomeBasics"][i % 4],
  images: [`https://images.unsplash.com/photo-${1505740420928 + i}?w=100`],
  costPrice: 15 + i * 3,
  sellingPrice: 45 + i * 5,
  profit: 30 + i * 2,
  profitMargin: 35,
  stock: 50 + i * 10,
  status: i % 3 === 0 ? "published" : "unpublished",
  importedAt: new Date("2026-06-20"),
  updatedAt: new Date(),
}));

export default function SupplierProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<SupplierProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SupplierProduct["status"] | "all">("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState<SupplierProduct | null>(null);

  useEffect(() => {
    getSupplierProducts()
      .then((d) => setProducts(d.length > 0 ? d : MOCK_PRODUCTS))
      .catch(() => setProducts(MOCK_PRODUCTS))
      .finally(() => setLoading(false));
  }, []);

  const suppliers = Array.from(new Set(products.map((p) => p.supplierName)));

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.supplierSKU.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchSupplier = supplierFilter === "all" || p.supplierName === supplierFilter;
    return matchSearch && matchStatus && matchSupplier;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const toggleSelect = (id: string) => {
    setSelected((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  const toggleSelectAll = () => {
    if (selected.size === paginated.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paginated.map((p) => p.id)));
    }
  };

  const handleBulkAction = async (action: "publish" | "unpublish" | "delete") => {
    if (selected.size === 0) { showToast("Select at least one product", "warning"); return; }
    setBulkLoading(true);
    const ids = Array.from(selected);
    try {
      if (action === "delete") {
        await Promise.all(ids.map((id) => deleteSupplierProduct(id)));
        setProducts((p) => p.filter((pr) => !ids.includes(pr.id)));
        showToast(`${ids.length} products deleted`, "success");
      } else {
        const status = action === "publish" ? "published" : "unpublished";
        await bulkUpdateSupplierProductStatus(ids, status);
        setProducts((p) => p.map((pr) => ids.includes(pr.id) ? { ...pr, status } : pr));
        showToast(`${ids.length} products ${status}`, "success");
      }
      setSelected(new Set());
    } catch {
      // Demo mode
      if (action === "delete") {
        setProducts((p) => p.filter((pr) => !ids.includes(pr.id)));
      } else {
        const status = action === "publish" ? "published" : "unpublished";
        setProducts((p) => p.map((pr) => ids.includes(pr.id) ? { ...pr, status } : pr));
      }
      setSelected(new Set());
      showToast(`Bulk ${action} complete`, "success");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleExport = () => {
    const csv = exportProductsToCsv(filtered);
    downloadCsv(csv, `supplier_products_${Date.now()}.csv`);
    showToast("Products exported", "success");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await deleteSupplierProduct(deleteTarget); } catch { /* ignore */ }
    setProducts((p) => p.filter((pr) => pr.id !== deleteTarget));
    showToast("Product deleted", "success");
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Supplier Products</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {filtered.length} products · {products.filter((p) => p.status === "published").length} published
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="flex items-center gap-2 text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 px-4 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
            <Download size={15} /> Export
          </button>
          <a href="/csv-imports" className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-brand-600/30">
            Import CSV
          </a>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="search" placeholder="Search products…" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="pl-9 pr-4 py-2.5 text-sm rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all w-52" />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as SupplierProduct["status"] | "all"); setCurrentPage(1); }} className="pl-9 pr-8 py-2.5 text-sm rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all appearance-none">
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="unpublished">Unpublished</option>
            <option value="error">Error</option>
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select value={supplierFilter} onChange={(e) => { setSupplierFilter(e.target.value); setCurrentPage(1); }} className="px-4 py-2.5 text-sm rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all appearance-none pr-8">
            <option value="all">All Suppliers</option>
            {suppliers.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800 rounded-xl px-4 py-3">
          <span className="text-sm font-semibold text-brand-700 dark:text-brand-300">{selected.size} selected</span>
          <div className="flex gap-2 ml-auto">
            <button onClick={() => handleBulkAction("publish")} disabled={bulkLoading} className="text-xs font-semibold px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all disabled:opacity-50">Publish</button>
            <button onClick={() => handleBulkAction("unpublish")} disabled={bulkLoading} className="text-xs font-semibold px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all disabled:opacity-50">Unpublish</button>
            <button onClick={() => handleBulkAction("delete")} disabled={bulkLoading} className="text-xs font-semibold px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-all disabled:opacity-50">Delete</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <TableSkeleton rows={6} cols={7} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <EmptyState icon={Boxes} title="No products found" description="Import products via CSV or connect an API supplier" action={{ label: "Import CSV", onClick: () => window.location.href = "/csv-imports" }} />
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th className="px-4 py-3.5 w-10">
                      <button onClick={toggleSelectAll} className="text-gray-400 hover:text-brand-600 transition-colors">
                        {selected.size === paginated.length && paginated.length > 0 ? <CheckSquare size={16} className="text-brand-600" /> : <Square size={16} />}
                      </button>
                    </th>
                    {["Product", "Supplier", "SKU", "Cost", "Sell", "Profit", "Stock", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((product) => (
                    <tr key={product.id} className={cn("border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors", selected.has(product.id) && "bg-brand-50/50 dark:bg-brand-950/20")}>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleSelect(product.id)} className="text-gray-400 hover:text-brand-600 transition-colors">
                          {selected.has(product.id) ? <CheckSquare size={15} className="text-brand-600" /> : <Square size={15} />}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden shrink-0">
                            {product.images[0]
                              ? <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No img</div>}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-xs max-w-[140px] line-clamp-1">{product.name}</p>
                            <p className="text-[10px] text-gray-400">{product.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">{product.supplierName}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{product.supplierSKU}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">{formatCurrency(product.costPrice)}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white text-xs">{formatCurrency(product.sellingPrice)}</td>
                      <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">{formatCurrency(product.profit)}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white text-xs">{product.stock}</td>
                      <td className="px-4 py-3">
                        <span className={cn("px-2 py-1 rounded-lg text-[11px] font-semibold capitalize", STATUS_STYLE[product.status])}>{product.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setShowDetail(product)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors" title="View">
                            <Eye size={13} />
                          </button>
                          <button onClick={() => showToast("Sync coming in Module 04", "info")} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors" title="Sync">
                            <RefreshCw size={13} />
                          </button>
                          <button onClick={() => setDeleteTarget(product.id)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors" title="Delete">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      )}

      {/* Detail modal */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white">Product Details</h2>
              <button onClick={() => setShowDetail(null)} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><X size={16} /></button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ["Name", showDetail.name],
                ["Supplier", showDetail.supplierName],
                ["SKU", showDetail.supplierSKU],
                ["Category", showDetail.category],
                ["Brand", showDetail.brand],
                ["Cost Price", formatCurrency(showDetail.costPrice)],
                ["Selling Price", formatCurrency(showDetail.sellingPrice)],
                ["Profit", formatCurrency(showDetail.profit)],
                ["Margin", `${showDetail.profitMargin}%`],
                ["Stock", showDetail.stock.toString()],
                ["Status", showDetail.status],
                ["Imported", showDetail.importedAt.toLocaleDateString()],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <span className="text-gray-400">{label}</span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteTarget} title="Delete Product" message="Delete this supplier product? This cannot be undone." confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
