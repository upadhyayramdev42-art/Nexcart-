"use client";

import { useState } from "react";
import { ExternalLink, CheckCircle, XCircle, Zap } from "lucide-react";
import type { Supplier } from "@/types";

const SUPPLIERS: Supplier[] = [
  {
    id: "baap_store",
    key: "baap_store",
    name: "Baap Store",
    logo: "🏪",
    description: "India's leading B2B dropshipping platform with 10,000+ products across all categories.",
    status: "disconnected",
    productCount: 0,
    website: "https://baapstore.com",
  },
  {
    id: "meesho",
    key: "meesho",
    name: "Meesho",
    logo: "🛍️",
    description: "Social commerce platform with affordable fashion, home, and lifestyle products.",
    status: "disconnected",
    productCount: 0,
    website: "https://meesho.com",
  },
  {
    id: "udaan",
    key: "udaan",
    name: "Udaan",
    logo: "🚀",
    description: "B2B e-commerce platform connecting manufacturers, wholesalers and retailers.",
    status: "disconnected",
    productCount: 0,
    website: "https://udaan.com",
  },
  {
    id: "indiamart",
    key: "indiamart",
    name: "IndiaMART",
    logo: "🏭",
    description: "India's largest online B2B marketplace connecting buyers with suppliers.",
    status: "disconnected",
    productCount: 0,
    website: "https://indiamart.com",
  },
  {
    id: "tradeindia",
    key: "tradeindia",
    name: "TradeIndia",
    logo: "📦",
    description: "B2B marketplace for manufacturers, exporters and importers in India.",
    status: "disconnected",
    productCount: 0,
    website: "https://tradeindia.com",
  },
  {
    id: "cj_dropshipping",
    key: "cj_dropshipping",
    name: "CJ Dropshipping",
    logo: "🌐",
    description: "Global dropshipping partner with warehouses in 30+ countries, fast shipping.",
    status: "disconnected",
    productCount: 0,
    website: "https://cjdropshipping.com",
  },
  {
    id: "aliexpress",
    key: "aliexpress",
    name: "AliExpress",
    logo: "🛒",
    description: "Global e-commerce platform by Alibaba Group with millions of products.",
    status: "disconnected",
    productCount: 0,
    website: "https://aliexpress.com",
  },
];

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(SUPPLIERS);
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleToggle = async (supplier: Supplier) => {
    if (supplier.key === "baap_store" && supplier.status === "disconnected") {
      // Baap Store connects in Module 03
      alert("Baap Store integration will be enabled in Module 03. Architecture is ready!");
      return;
    }
    setConnecting(supplier.id);
    await new Promise((r) => setTimeout(r, 800));
    setSuppliers((prev) =>
      prev.map((s) =>
        s.id === supplier.id
          ? { ...s, status: s.status === "connected" ? "disconnected" : "connected" }
          : s
      )
    );
    setConnecting(null);
  };

  const connected = suppliers.filter((s) => s.status === "connected").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Suppliers</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {connected} of {suppliers.length} suppliers connected
        </p>
      </div>

      {/* Module 03 notice */}
      <div className="flex items-start gap-3 bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-800 rounded-2xl p-4">
        <Zap size={16} className="text-brand-600 dark:text-brand-400 mt-0.5 shrink-0 fill-brand-600 dark:fill-brand-400" />
        <div>
          <p className="text-sm font-semibold text-brand-800 dark:text-brand-300">Module 03: Baap Store Integration</p>
          <p className="text-xs text-brand-600 dark:text-brand-500 mt-0.5">
            Full API + CSV import for Baap Store is coming in Module 03. All other supplier architecture is ready.
          </p>
        </div>
      </div>

      {/* Supplier cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {suppliers.map((supplier) => (
          <div key={supplier.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl">
                  {supplier.logo}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{supplier.name}</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    {supplier.status === "connected" ? (
                      <><CheckCircle size={11} className="text-emerald-500" /><span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Connected</span></>
                    ) : (
                      <><XCircle size={11} className="text-gray-400" /><span className="text-[11px] text-gray-400 font-medium">Disconnected</span></>
                    )}
                  </div>
                </div>
              </div>
              <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-500 transition-colors">
                <ExternalLink size={14} />
              </a>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
              {supplier.description}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{supplier.productCount} products</span>
              <button
                onClick={() => handleToggle(supplier)}
                disabled={connecting === supplier.id}
                className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all disabled:opacity-60 ${
                  supplier.status === "connected"
                    ? "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/50"
                    : "bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/30"
                }`}
              >
                {connecting === supplier.id ? (
                  <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : supplier.status === "connected" ? "Disconnect" : supplier.key === "baap_store" ? "Connect (M03)" : "Connect"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
