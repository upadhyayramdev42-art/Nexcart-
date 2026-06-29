"use client";

import { useEffect, useState } from "react";
import { Search, RefreshCw, Link2, Package, TrendingUp } from "lucide-react";
import { getDropshippingProducts } from "@/lib/firebase/firestore";
import { cn, formatCurrency } from "@/lib/utils";
import type { DropshippingProduct } from "@/types";

const MOCK: DropshippingProduct[] = [
  { id: "ds1", type: "dropshipping", supplierId: "baap_store", supplierName: "Baap Store", supplierSKU: "BS-EL-1001", name: "Bluetooth Earbuds Pro", category: "Electronics", images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200"], costPrice: 18.5, sellingPrice: 49.99, profit: 31.49, stock: 200, status: "inactive", importedAt: new Date(), updatedAt: new Date() },
  { id: "ds2", type: "dropshipping", supplierId: "baap_store", supplierName: "Baap Store", supplierSKU: "BS-FA-2002", name: "Casual Linen Shirt", category: "Fashion", images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200"], costPrice: 9.0, sellingPrice: 34.99, profit: 25.99, stock: 150, status: "inactive", importedAt: new Date(), updatedAt: new Date() },
];

export default function DropshippingProductsPage() {
  const [products, setProducts] = useState<DropshippingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getDropshippingProducts();
        setProducts(data.length > 0 ? data : MOCK);
      } catch {
        setProducts(MOCK);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.supplierSKU.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Dropshipping Products</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Products imported from suppliers — read only</p>
        </div>
        <a href="/suppliers" className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
          <Link2 size={15} /> Connect Supplier
        </a>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
        <RefreshCw size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Baap Store integration coming in Module 03</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">Connect your supplier in the Suppliers page. Products will be imported automatically after integration.</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="search" placeholder="Search by name or supplier SKU…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all" />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  {["Product", "Supplier SKU", "Supplier", "Cost", "Selling", "Profit", "Stock", "Status"].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-gray-400">
                      <Package size={32} className="mx-auto mb-3 opacity-40" />
                      <p>No dropshipping products yet</p>
                      <p className="text-xs mt-1">Connect a supplier to import products</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {p.images[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <Package size={16} className="text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white max-w-[160px] line-clamp-1">{p.name}</p>
                            <p className="text-xs text-gray-400">{p.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{p.supplierSKU}</td>
                      <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400">{p.supplierName}</td>
                      <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400">{formatCurrency(p.costPrice)}</td>
                      <td className="px-5 py-3.5 font-semibold text-gray-900 dark:text-white">{formatCurrency(p.sellingPrice)}</td>
                      <td className="px-5 py-3.5">
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <TrendingUp size={13} /> {formatCurrency(p.profit)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-900 dark:text-white font-medium">{p.stock}</td>
                      <td className="px-5 py-3.5">
                        <span className={cn("px-2.5 py-1 rounded-lg text-xs font-semibold capitalize",
                          p.status === "active" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-500")}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
