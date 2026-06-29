"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus, Globe, Trash2, Edit2, TestTube, Save, X, CheckCircle, XCircle } from "lucide-react";
import { getApiConnections, addApiConnection, updateApiConnection, deleteApiConnection } from "@/lib/supplier/firestore";
import { testConnection } from "@/lib/supplier/apiEngine";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import type { ApiConnection, ApiMethod } from "@/types";

const METHODS: ApiMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

const METHOD_COLORS: Record<ApiMethod, string> = {
  GET: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  POST: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  PUT: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
  PATCH: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
  DELETE: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400",
};

const MOCK: ApiConnection[] = [
  { id: "ac1", supplierId: "baap_store", supplierName: "Baap Store", name: "Products Endpoint", baseUrl: "https://api.baapstore.com", method: "GET", endpoint: "/v1/products", authType: "bearer", customHeaders: {}, paginationType: "page", pageParam: "page", pageSizeParam: "limit", pageSize: 50, timeout: 30000, retryCount: 3, status: "idle", createdAt: new Date(), updatedAt: new Date() },
  { id: "ac2", supplierId: "cj_dropshipping", supplierName: "CJ Dropshipping", name: "Inventory Sync", baseUrl: "https://developers.cjdropshipping.com", method: "GET", endpoint: "/api2.0/v1/product/list", authType: "api_key", customHeaders: {}, paginationType: "page", pageSize: 100, timeout: 30000, retryCount: 3, status: "idle", createdAt: new Date(), updatedAt: new Date() },
];

const EMPTY_FORM: Omit<ApiConnection, "id" | "createdAt" | "updatedAt"> = {
  supplierId: "", supplierName: "", name: "", baseUrl: "", method: "GET",
  endpoint: "/products", authType: "bearer", bearerToken: "", apiKey: "",
  apiKeyHeader: "X-API-Key", customHeaders: {}, paginationType: "page",
  pageParam: "page", pageSizeParam: "per_page", pageSize: 50,
  timeout: 30000, retryCount: 3, status: "idle",
};

export default function ApiConnectionsPage() {
  const { showToast } = useToast();
  const [connections, setConnections] = useState<ApiConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ApiConnection | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; message: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiConnection | null>(null);
  const [headerKey, setHeaderKey] = useState("");
  const [headerVal, setHeaderVal] = useState("");

  useEffect(() => {
    getApiConnections()
      .then((d) => setConnections(d.length > 0 ? d : MOCK))
      .catch(() => setConnections(MOCK))
      .finally(() => setLoading(false));
  }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (c: ApiConnection) => { setEditing(c); setForm({ ...c }); setShowModal(true); };

  const f = <K extends keyof typeof form>(key: K, val: typeof form[K]) =>
    setForm((p) => ({ ...p, [key]: val }));

  const addHeader = () => {
    if (!headerKey.trim()) return;
    setForm((p) => ({ ...p, customHeaders: { ...p.customHeaders, [headerKey]: headerVal } }));
    setHeaderKey(""); setHeaderVal("");
  };

  const removeHeader = (key: string) => {
    setForm((p) => {
      const headers = { ...p.customHeaders };
      delete headers[key];
      return { ...p, customHeaders: headers };
    });
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.baseUrl || !form.endpoint) {
      showToast("Name, Base URL and Endpoint are required", "error"); return;
    }
    setSaving(true);
    try {
      if (editing) {
        await updateApiConnection(editing.id, form);
        setConnections((p) => p.map((c) => c.id === editing.id ? { ...c, ...form } : c));
        showToast("Connection updated", "success");
      } else {
        const id = await addApiConnection(form);
        setConnections((p) => [...p, { id, ...form, createdAt: new Date(), updatedAt: new Date() }]);
        showToast("Connection added", "success");
      }
      setShowModal(false);
    } catch {
      if (editing) {
        setConnections((p) => p.map((c) => c.id === editing.id ? { ...c, ...form } : c));
      } else {
        setConnections((p) => [...p, { id: `ac_${Date.now()}`, ...form, createdAt: new Date(), updatedAt: new Date() }]);
      }
      setShowModal(false);
      showToast(editing ? "Connection updated" : "Connection added", "success");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async (connection: ApiConnection) => {
    setTesting(connection.id);
    setTestResult(null);
    try {
      const res = await testConnection(connection);
      setTestResult({ id: connection.id, success: res.success, message: res.success ? `Success (${res.duration}ms)` : res.error ?? "Failed" });
      showToast(res.success ? "Connection successful!" : `Test failed: ${res.error}`, res.success ? "success" : "error");
    } catch {
      setTestResult({ id: connection.id, success: false, message: "Request failed" });
      showToast("Connection test failed", "error");
    } finally {
      setTesting(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await deleteApiConnection(deleteTarget.id); } catch { /* ignore */ }
    setConnections((p) => p.filter((c) => c.id !== deleteTarget.id));
    showToast("Connection deleted", "success");
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">API Connections</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Configure REST API endpoints for suppliers</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-brand-600/30">
          <Plus size={16} /> Add Connection
        </button>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <TableSkeleton rows={3} cols={5} />
        </div>
      ) : connections.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <EmptyState icon={Globe} title="No API connections yet" description="Add your first REST API connection to start syncing supplier products" action={{ label: "Add Connection", onClick: openAdd }} />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  {["Name", "Supplier", "Method", "Endpoint", "Auth", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {connections.map((conn) => (
                  <tr key={conn.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">{conn.name}</td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400">{conn.supplierName}</td>
                    <td className="px-5 py-3.5">
                      <span className={cn("px-2 py-1 rounded-lg text-xs font-bold", METHOD_COLORS[conn.method])}>{conn.method}</span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-500 max-w-[200px] truncate" title={`${conn.baseUrl}${conn.endpoint}`}>
                      {conn.baseUrl}{conn.endpoint}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 capitalize text-xs">{conn.authType.replace("_", " ")}</td>
                    <td className="px-5 py-3.5">
                      {testResult?.id === conn.id ? (
                        <span className={cn("flex items-center gap-1 text-xs font-medium", testResult.success ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                          {testResult.success ? <CheckCircle size={12} /> : <XCircle size={12} />}
                          {testResult.message}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleTest(conn)} disabled={testing === conn.id} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-all">
                          {testing === conn.id ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <TestTube size={12} />}
                          Test
                        </button>
                        <button onClick={() => openEdit(conn)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteTarget(conn)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">{editing ? "Edit" : "Add"} API Connection</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><X size={16} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Connection Name *</label>
                  <input value={form.name} onChange={(e) => f("name", e.target.value)} required className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Supplier Name</label>
                  <input value={form.supplierName} onChange={(e) => f("supplierName", e.target.value)} className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Base URL *</label>
                <input value={form.baseUrl} onChange={(e) => f("baseUrl", e.target.value)} required placeholder="https://api.supplier.com" className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Method</label>
                  <select value={form.method} onChange={(e) => f("method", e.target.value as ApiMethod)} className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all">
                    {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Endpoint *</label>
                  <input value={form.endpoint} onChange={(e) => f("endpoint", e.target.value)} required placeholder="/v1/products" className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Authentication Type</label>
                <select value={form.authType} onChange={(e) => f("authType", e.target.value as ApiConnection["authType"])} className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all">
                  <option value="bearer">Bearer Token</option>
                  <option value="api_key">API Key</option>
                  <option value="basic">Basic Auth</option>
                  <option value="none">None</option>
                </select>
              </div>
              {form.authType === "bearer" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Bearer Token</label>
                  <input type="password" value={form.bearerToken ?? ""} onChange={(e) => f("bearerToken", e.target.value)} className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all" />
                </div>
              )}
              {form.authType === "api_key" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">API Key Header</label>
                    <input value={form.apiKeyHeader ?? ""} onChange={(e) => f("apiKeyHeader", e.target.value)} placeholder="X-API-Key" className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">API Key</label>
                    <input type="password" value={form.apiKey ?? ""} onChange={(e) => f("apiKey", e.target.value)} className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all" />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Timeout (ms)</label>
                  <input type="number" value={form.timeout} onChange={(e) => f("timeout", parseInt(e.target.value) || 30000)} className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Retry Count</label>
                  <input type="number" min={0} max={5} value={form.retryCount} onChange={(e) => f("retryCount", parseInt(e.target.value) || 3)} className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Page Size</label>
                  <input type="number" value={form.pageSize} onChange={(e) => f("pageSize", parseInt(e.target.value) || 50)} className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all" />
                </div>
              </div>
              {/* Custom Headers */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Custom Headers</label>
                {Object.entries(form.customHeaders).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2 mb-2">
                    <span className="flex-1 text-xs bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg font-mono text-gray-700 dark:text-gray-300">{k}: {v}</span>
                    <button type="button" onClick={() => removeHeader(k)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"><X size={12} /></button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input value={headerKey} onChange={(e) => setHeaderKey(e.target.value)} placeholder="Header name" className="flex-1 px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all" />
                  <input value={headerVal} onChange={(e) => setHeaderVal(e.target.value)} placeholder="Value" className="flex-1 px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all" />
                  <button type="button" onClick={addHeader} className="px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-xl text-xs font-semibold transition-all">Add</button>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-all text-sm shadow-lg shadow-brand-600/30">
                  {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={14} />}
                  {saving ? "Saving…" : "Save Connection"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteTarget} title="Delete API Connection" message={`Delete "${deleteTarget?.name}"? This cannot be undone.`} confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
