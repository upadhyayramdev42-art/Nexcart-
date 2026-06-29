"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Plus, TrendingUp, Edit2, Trash2, Save, X, ToggleLeft, ToggleRight } from "lucide-react";
import { getProfitRules, addProfitRule, updateProfitRule, deleteProfitRule } from "@/lib/supplier/firestore";
import { previewProfit } from "@/lib/supplier/profitEngine";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { cn, formatCurrency } from "@/lib/utils";
import type { ProfitRule } from "@/types";

const MOCK_RULES: ProfitRule[] = [
  { id: "pr1", name: "Global Default", type: "percentage", scope: "global", value: 20, isActive: true, priority: 1, createdAt: new Date(), updatedAt: new Date() },
  { id: "pr2", name: "Electronics Premium", type: "percentage", scope: "category", category: "Electronics", value: 30, isActive: true, priority: 5, createdAt: new Date(), updatedAt: new Date() },
  { id: "pr3", name: "Baap Store Margin", type: "percentage", scope: "supplier", supplierId: "baap_store", supplierName: "Baap Store", value: 25, isActive: true, priority: 10, createdAt: new Date(), updatedAt: new Date() },
];

const EMPTY_FORM: Omit<ProfitRule, "id" | "createdAt" | "updatedAt"> = {
  name: "", type: "percentage", scope: "global", value: 20, isActive: true, priority: 1,
};

const CATEGORIES = ["Electronics", "Fashion", "Home & Living", "Beauty", "Sports", "Books", "Toys", "Automotive"];

export default function ProfitRulesPage() {
  const { showToast } = useToast();
  const [rules, setRules] = useState<ProfitRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ProfitRule | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProfitRule | null>(null);
  const [previewCost, setPreviewCost] = useState(100);

  const preview = previewProfit(previewCost, form.type, form.value);

  useEffect(() => {
    getProfitRules()
      .then((d) => setRules(d.length > 0 ? d : MOCK_RULES))
      .catch(() => setRules(MOCK_RULES))
      .finally(() => setLoading(false));
  }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (r: ProfitRule) => { setEditing(r); setForm({ name: r.name, type: r.type, scope: r.scope, value: r.value, isActive: r.isActive, priority: r.priority, supplierId: r.supplierId, supplierName: r.supplierName, category: r.category }); setShowModal(true); };

  const f = <K extends keyof typeof form>(key: K, val: typeof form[K]) => setForm((p) => ({ ...p, [key]: val }));

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name) { showToast("Rule name is required", "error"); return; }
    setSaving(true);
    try {
      if (editing) {
        await updateProfitRule(editing.id, form);
        setRules((p) => p.map((r) => r.id === editing.id ? { ...r, ...form } : r));
        showToast("Rule updated", "success");
      } else {
        const id = await addProfitRule(form);
        setRules((p) => [...p, { id, ...form, createdAt: new Date(), updatedAt: new Date() }]);
        showToast("Rule created", "success");
      }
      setShowModal(false);
    } catch {
      if (editing) {
        setRules((p) => p.map((r) => r.id === editing.id ? { ...r, ...form } : r));
      } else {
        setRules((p) => [...p, { id: `pr_${Date.now()}`, ...form, createdAt: new Date(), updatedAt: new Date() }]);
      }
      setShowModal(false);
      showToast(editing ? "Rule updated" : "Rule created", "success");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (rule: ProfitRule) => {
    const isActive = !rule.isActive;
    try { await updateProfitRule(rule.id, { isActive }); } catch { /* ignore */ }
    setRules((p) => p.map((r) => r.id === rule.id ? { ...r, isActive } : r));
    showToast(`Rule ${isActive ? "enabled" : "disabled"}`, "info");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await deleteProfitRule(deleteTarget.id); } catch { /* ignore */ }
    setRules((p) => p.filter((r) => r.id !== deleteTarget.id));
    showToast("Rule deleted", "success");
    setDeleteTarget(null);
  };

  const scopeStyle: Record<ProfitRule["scope"], string> = {
    global: "bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400",
    supplier: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
    category: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Profit Rules</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{rules.filter((r) => r.isActive).length} active rules</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-brand-600/30">
          <Plus size={16} /> Add Rule
        </button>
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 text-sm text-blue-700 dark:text-blue-300">
        <strong>Priority order:</strong> Supplier-specific &gt; Category-specific &gt; Global. Higher priority number wins.
      </div>

      {loading ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <TableSkeleton rows={3} cols={6} />
        </div>
      ) : rules.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <EmptyState icon={TrendingUp} title="No profit rules yet" description="Create your first profit rule to auto-calculate selling prices" action={{ label: "Add Rule", onClick: openAdd }} />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  {["Rule Name", "Scope", "Type", "Value", "Priority", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rules.sort((a, b) => b.priority - a.priority).map((rule) => (
                  <tr key={rule.id} className={cn("border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors", !rule.isActive && "opacity-50")}>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900 dark:text-white">{rule.name}</p>
                      {rule.category && <p className="text-xs text-gray-400">{rule.category}</p>}
                      {rule.supplierName && <p className="text-xs text-gray-400">{rule.supplierName}</p>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn("px-2.5 py-1 rounded-lg text-xs font-semibold capitalize", scopeStyle[rule.scope])}>{rule.scope}</span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400 capitalize">{rule.type}</td>
                    <td className="px-5 py-3.5 font-bold text-gray-900 dark:text-white">
                      {rule.type === "percentage" ? `${rule.value}%` : formatCurrency(rule.value)}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400">{rule.priority}</td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => handleToggle(rule)} className="transition-colors">
                        {rule.isActive
                          ? <ToggleRight size={22} className="text-brand-600" />
                          : <ToggleLeft size={22} className="text-gray-300 dark:text-gray-600" />}
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(rule)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"><Edit2 size={14} /></button>
                        <button onClick={() => setDeleteTarget(rule)} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"><Trash2 size={14} /></button>
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
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 w-full max-w-md p-6 max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">{editing ? "Edit" : "Add"} Profit Rule</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><X size={16} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Rule Name *</label>
                <input value={form.name} onChange={(e) => f("name", e.target.value)} required placeholder="e.g. Electronics 30% Margin" className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Scope</label>
                  <select value={form.scope} onChange={(e) => f("scope", e.target.value as ProfitRule["scope"])} className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all">
                    <option value="global">Global</option>
                    <option value="supplier">Supplier</option>
                    <option value="category">Category</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Type</label>
                  <select value={form.type} onChange={(e) => f("type", e.target.value as ProfitRule["type"])} className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
              </div>
              {form.scope === "category" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Category</label>
                  <select value={form.category ?? ""} onChange={(e) => f("category", e.target.value)} className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all">
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}
              {form.scope === "supplier" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Supplier Name</label>
                  <input value={form.supplierName ?? ""} onChange={(e) => f("supplierName", e.target.value)} className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Value {form.type === "percentage" ? "(%)" : "(₹)"}</label>
                  <input type="number" min={0} step={0.01} value={form.value} onChange={(e) => f("value", parseFloat(e.target.value) || 0)} className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Priority</label>
                  <input type="number" min={1} value={form.priority} onChange={(e) => f("priority", parseInt(e.target.value) || 1)} className="w-full px-3 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all" />
                </div>
              </div>

              {/* Live Preview */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Live Preview</p>
                <div className="flex items-center gap-2 mb-3">
                  <label className="text-xs text-gray-500">Cost Price:</label>
                  <input type="number" value={previewCost} onChange={(e) => setPreviewCost(parseFloat(e.target.value) || 0)} className="w-24 px-2 py-1 text-xs rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none" />
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xs text-gray-400">Cost</p>
                    <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(preview.costPrice)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Profit</p>
                    <p className="font-bold text-emerald-600">{formatCurrency(preview.profit)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Selling</p>
                    <p className="font-bold text-brand-600">{formatCurrency(preview.sellingPrice)}</p>
                  </div>
                </div>
                <p className="text-center text-xs text-gray-400 mt-2">Margin: {preview.profitMargin.toFixed(1)}%</p>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => f("isActive", e.target.checked)} className="w-4 h-4 rounded accent-brand-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Rule is active</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-all text-sm shadow-lg shadow-brand-600/30">
                  {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={14} />}
                  {saving ? "Saving…" : "Save Rule"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteTarget} title="Delete Profit Rule" message={`Delete "${deleteTarget?.name}"? This cannot be undone.`} confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
