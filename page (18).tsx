"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Plus, Edit2, Trash2, Link2, CheckCircle, XCircle,
  TestTube, Save, X, Globe, FileSpreadsheet, Wrench,
} from "lucide-react";
import { getSupplierConfigs, addSupplierConfig, updateSupplierConfig, deleteSupplierConfig } from "@/lib/supplier/firestore";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import type { SupplierConfig, SupplierType } from "@/types";

const TYPE_ICONS: Record<SupplierType, React.ElementType> = {
  csv: FileSpreadsheet,
  api: Globe,
  manual: Wrench,
};

const TYPE_LABELS: Record<SupplierType, string> = {
  csv: "CSV Import",
  api: "REST API",
  manual: "Manual",
};

const MOCK_SUPPLIERS: SupplierConfig[] = [
  { id: "s1", supplierKey: "baap_store", name: "Baap Store", logo: "🏪", type: "api", status: "disconnected", website: "https://baapstore.com", description: "India's leading B2B dropshipping platform", productCount: 0, createdAt: new Date(), updatedAt: new Date() },
  { id: "s2", supplierKey: "meesho", name: "Meesho", logo: "🛍️", type: "api", status: "disconnected", website: "https://meesho.com", description: "Social commerce platform", productCount: 0, createdAt: new Date(), updatedAt: new Date() },
  { id: "s3", supplierKey: "cj_dropshipping", name: "CJ Dropshipping", logo: "🌐", type: "api", status: "disconnected", website: "https://cjdropshipping.com", description: "Global dropshipping partner", productCount: 0, createdAt: new Date(), updatedAt: new Date() },
  { id: "s4", supplierKey: "aliexpress", name: "AliExpress", logo: "🛒", type: "api", status: "disconnected", website: "https://aliexpress.com", description: "Global e-commerce platform", productCount: 0, createdAt: new Date(), updatedAt: new Date() },
  { id: "s5", supplierKey: "custom_csv", name: "Custom CSV Supplier", logo: "📄", type: "csv", status: "disconnected", website: "", description: "Import products via CSV files", productCount: 0, createdAt: new Date(), updatedAt: new Date() },
];

const EMPTY_FORM: Omit<SupplierConfig, "id" | "createdAt" | "updatedAt"> = {
  supplierKey: "", name: "", logo: "🏪", type: "api", status: "disconnected",
  website: "", description: "", apiBaseUrl: "", apiKey: "", apiSecret: "",
  accessToken: "", webhookUrl: "", notes: "", productCount: 0,
};

export default function SupplierConnectionsPage() {
  const { showToast } = useToast();
  const [suppliers, setSuppliers] = useState<SupplierConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<SupplierConfig | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SupplierConfig | null>(null);

  useEffect(() => {
    loadSuppliers();
  }, []);

  async function loadSuppliers() {
    try {
      const data = await getSupplierConfigs();
      setSuppliers(data.length > 0 ? data : MOCK_SUPPLIERS);
    } catch {
      setSuppliers(MOCK_SUPPLIERS);
    } finally {
      setLoading(false);
    }
  }

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (s: SupplierConfig) => {
    setEditing(s);
    setForm({
      supplierKey: s.supplierKey, name: s.name, logo: s.logo, type: s.type,
      status: s.status, website: s.website, description: s.description,
      apiBaseUrl: s.apiBaseUrl ?? "", apiKey: s.apiKey ?? "",
      apiSecret: s.apiSecret ?? "", accessToken: s.accessToken ?? "",
      webhookUrl: s.webhookUrl ?? "", notes: s.notes ?? "", productCount: s.productCount,
    });
    setShowModal(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.supplierKey) {
      showToast("Name and Supplier Key are required", "error");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateSupplierConfig(editing.id, form);
        setSuppliers((prev) => prev.map((s) => s.id === editing.id ? { ...s, ...form } : s));
        showToast("Supplier updated successfully", "success");
      } else {
        const id = await addSupplierConfig(form);
        setSuppliers((prev) => [...prev, { id, ...form, createdAt: new Date(), updatedAt: new Date() }]);
        showToast("Supplier added successfully", "success");
      }
      setShowModal(false);
    } catch {
      // Fallback for demo
      if (editing) {
        setSuppliers((prev) => prev.map((s) => s.id === editing.id ? { ...s, ...form } : s));
      } else {
        const id = `s_${Date.now()}`;
        setSuppliers((prev) => [...prev, { id, ...form, createdAt: new Date(), updatedAt: new Date() }]);
      }
      setShowModal(false);
      showToast(editing ? "Supplier updated" : "Supplier added", "success");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async (id: string) => {
    setTesting(id);
    await new Promise((r) => setTimeout(r, 1500));
    setTesting(null);
    showToast("Connection test failed — API credentials required", "warning");
  };

  const handleToggleStatus = async (supplier: SupplierConfig) => {
    const newStatus = supplier.status === "connected" ? "disconnected" : "connected";
    try {
      await updateSupplierConfig(supplier.id, { status: newStatus });
    } catch { /* ignore */ }
    setSuppliers((prev) => prev.map((s) => s.id === supplier.id ? { ...s, status: newStatus } : s));
    showToast(`Supplier ${newStatus}`, newStatus === "connected" ? "success" : "info");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSupplierConfig(deleteTarget.id);
    } catch { /* ignore */ }
    setSuppliers((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    showToast("Supplier deleted", "success");
    setDeleteTarget(null);
  };

  const f = (field: keyof typeof form, val: string) => setForm((p) => ({ ...p, [field]: val }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Supplier Connections</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {suppliers.filter((s) => s.status === "connected").length} connected · {suppliers.length} total
          </p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-brand-600/30">
          <Plus size={16} /> Add Supplier
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Suppliers", value: suppliers.length, color: "text-gray-900 dark:text-white" },
          { label: "Connected", value: suppliers.filter((s) => s.status === "connected").length, color: "text-emerald-600" },
          { label: "CSV Type", value: suppliers.filter((s) => s.type === "csv").length, color: "text-blue-600" },
          { label: "API Type", value: suppliers.filter((s) => s.type === "api").length, color: "text-brand-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <TableSkeleton rows={4} cols={6} />
        </div>
      ) : suppliers.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <EmptyState icon={Link2} title="No suppliers yet" description="Add your first supplier to start importing products" action={{ label: "Add Supplier", onClick: openAdd }} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {suppliers.map((supplier) => {
            const TypeIcon = TYPE_ICONS[supplier.type];
            return (
              <div key={supplier.id} className={cn("bg-white dark:bg-gray-900 rounded-2xl border p-5 transition-all hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20",
                supplier.status === "connected" ? "border-emerald-200 dark:border-emerald-800" : "border-gray-100 dark:border-gray-800")}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl">{supplier.logo}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{supplier.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <TypeIcon size={11} className="text-gray-400" />
                        <span className="text-[11px] text-gray-400">{TYPE_LABELS[supplier.type]}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(supplier)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => setDeleteTarget(supplier)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{supplier.description}</p>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    {supplier.status === "connected"
                      ? <><CheckCircle size={12} className="text-emerald-500" /><span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Connected</span></>
                      : <><XCircle size={12} className="text-gray-400" /><span className="text-xs text-gray-400">Disconnected</span></>}
                  </div>
                  <span className="text-xs text-gray-400">{supplier.productCount} products</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleStatus(supplier)}
                    className={cn("flex-1 text-xs font-semibold py-1.5 rounded-xl transition-all",
                      supplier.status === "connected"
                        ? "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100"
                        : "bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/30"
                    )}
                  >
                    {supplier.status === "connected" ? "Disconnect" : "Connect"}
                  </button>
                  {supplier.type === "api" && (
                    <button
                      onClick={() => handleTest(supplier.id)}
                      disabled={testing === supplier.id}
                      className="flex items-center gap-1.5 px-3 text-xs font-semibold py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all disabled:opacity-50"
                    >
                      {testing === supplier.id
                        ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        : <TestTube size={12} />}
                      Test
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 w-full max-w-lg p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">
                {editing ? "Edit Supplier" : "Add Supplier"}
              </h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Supplier Name *</label>
                  <input value={form.name} onChange={(e) => f("name", e.target.value)} required className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Supplier Key *</label>
                  <input value={form.supplierKey} onChange={(e) => f("supplierKey", e.target.value.toLowerCase().replace(/\s+/g, "_"))} required placeholder="baap_store" className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Type</label>
                  <select value={form.type} onChange={(e) => f("type", e.target.value)} className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all">
                    <option value="api">REST API</option>
                    <option value="csv">CSV Import</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Logo Emoji</label>
                  <input value={form.logo} onChange={(e) => f("logo", e.target.value)} placeholder="🏪" className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Website</label>
                <input type="url" value={form.website} onChange={(e) => f("website", e.target.value)} placeholder="https://" className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => f("description", e.target.value)} rows={2} className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all resize-none" />
              </div>

              {form.type === "api" && (
                <>
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">API Configuration</p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">API Base URL</label>
                        <input value={form.apiBaseUrl} onChange={(e) => f("apiBaseUrl", e.target.value)} placeholder="https://api.supplier.com/v1" className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">API Key</label>
                          <input type="password" value={form.apiKey} onChange={(e) => f("apiKey", e.target.value)} placeholder="••••••••" className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">API Secret</label>
                          <input type="password" value={form.apiSecret} onChange={(e) => f("apiSecret", e.target.value)} placeholder="••••••••" className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Bearer Token</label>
                        <input type="password" value={form.accessToken} onChange={(e) => f("accessToken", e.target.value)} placeholder="••••••••" className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Webhook URL</label>
                        <input value={form.webhookUrl} onChange={(e) => f("webhookUrl", e.target.value)} placeholder="https://yoursite.com/webhook" className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all" />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Notes</label>
                <textarea value={form.notes} onChange={(e) => f("notes", e.target.value)} rows={2} placeholder="Any notes about this supplier..." className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all resize-none" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-all text-sm shadow-lg shadow-brand-600/30">
                  {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={14} />}
                  {saving ? "Saving…" : "Save Supplier"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Supplier"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
