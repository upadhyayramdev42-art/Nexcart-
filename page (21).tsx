"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Edit2, Trash2, Eye, Package } from "lucide-react";
import { getMyProducts, deleteMyProduct } from "@/lib/firebase/firestore";
import { cn, formatCurrency } from "@/lib/utils";
import type { MyProduct, ProductStatus } from "@/types";

const statusStyle: Record<ProductStatus, string> = {
  active: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  inactive: "bg-gray-100 dark:bg-gray-800 text-gray-500",
  draft: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
  out_of_stock: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400",
};

// Mock data for when Firestore is empty
const MOCK_PRODUCTS: MyProduct[] = [
  { id: "p1", type: "my_product", name: "Premium Wireless Headphones", category: "Electronics", brand: "SoundPro", description: "High-quality wireless headphones", price: 129.99, salePrice: 99.99, stock: 45, sku: "EL-WH-001", images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200"], status: "active", createdAt: new Date(), updatedAt: new Date(), createdBy: "admin" },
  { id: "p2", type: "my_product", name: "Leather Crossbody Bag", category: "Fashion", brand: "UrbanStyle", description: "Premium leather bag", price: 89.00, stock: 20, sku: "FA-LB-002", images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200"], status: "active", createdAt: new Date(), updatedAt: new Date(), createdBy: "admin" },
  { id: "p3", type: "my_product", name: "Ceramic Table Lamp", category: "Home & Living", brand: "LumiHome", description: "Minimalist table lamp", price: 59.99, stock: 0, sku: "HL-CL-003", images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=200"], status: "out_of_stock", createdAt: new Date(), updatedAt: new Date(), createdBy: "admin" },
];

export default function MyProductsPage() {
  const [products, setProducts] = useState<MyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getMyProducts();
        setProducts(data.length > 0 ? data : MOCK_PRODUCTS);
      } catch {
        setProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    setDeleting(id);
    try {
      await deleteMyProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Failed to delete product");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">My Products</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{products.length} products</p>
        </div>
        <Link
          href="/products/add-product"
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-brand-600/30"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder="Search by name or SKU…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  {["Product", "SKU", "Category", "Price", "Stock", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-gray-400">
                      <Package size={32} className="mx-auto mb-3 opacity-40" />
                      <p>No products found</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((product) => (
                    <tr key={product.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {product.images[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.images[0]} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                              <Package size={16} className="text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white line-clamp-1 max-w-[180px]">{product.name}</p>
                            <p className="text-xs text-gray-400">{product.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-500">{product.sku}</td>
                      <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400">{product.category}</td>
                      <td className="px-5 py-3.5">
                        <div>
                          <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(product.salePrice ?? product.price)}</span>
                          {product.salePrice && (
                            <span className="block text-xs text-gray-400 line-through">{formatCurrency(product.price)}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn("font-semibold", product.stock === 0 ? "text-rose-600" : product.stock < 10 ? "text-orange-500" : "text-gray-900 dark:text-white")}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={cn("px-2.5 py-1 rounded-lg text-xs font-semibold capitalize", statusStyle[product.status])}>
                          {product.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors" title="View">
                            <Eye size={15} />
                          </button>
                          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors" title="Edit">
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={deleting === product.id}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
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
