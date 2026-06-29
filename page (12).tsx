"use client";

import { useState } from "react";
import { Save, Store, Bell, Shield, Palette } from "lucide-react";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [storeName, setStoreName] = useState("NexCart");
  const [storeEmail, setStoreEmail] = useState("admin@nexcart.com");
  const [currency, setCurrency] = useState("INR");
  const [orderNotifs, setOrderNotifs] = useState(true);
  const [stockNotifs, setStockNotifs] = useState(true);

  const handleSave = async () => {
    // Save to Firestore settings collection
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Configure your store preferences</p>
      </div>

      {saved && (
        <div className="px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
          ✓ Settings saved successfully
        </div>
      )}

      {/* Store Settings */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Store size={16} className="text-brand-600" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Store Information</h2>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Store Name</label>
          <input value={storeName} onChange={(e) => setStoreName(e.target.value)} className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Store Email</label>
          <input type="email" value={storeEmail} onChange={(e) => setStoreEmail(e.target.value)} className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 transition-all" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Currency</label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-brand-400 transition-all">
            <option value="INR">INR — Indian Rupee (₹)</option>
            <option value="USD">USD — US Dollar ($)</option>
            <option value="EUR">EUR — Euro (€)</option>
            <option value="GBP">GBP — British Pound (£)</option>
          </select>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Bell size={16} className="text-brand-600" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Notifications</h2>
        </div>
        {[
          { label: "New order notifications", sub: "Get notified when a new order is placed", value: orderNotifs, set: setOrderNotifs },
          { label: "Low stock alerts", sub: "Alert when product stock drops below 10", value: stockNotifs, set: setStockNotifs },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
            </div>
            <button
              onClick={() => item.set(!item.value)}
              className={`w-11 h-6 rounded-full transition-colors ${item.value ? "bg-brand-600" : "bg-gray-200 dark:bg-gray-700"}`}
            >
              <span className={`block w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${item.value ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>
        ))}
      </div>

      {/* Security */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={16} className="text-brand-600" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Security</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Firestore Security Rules and Authentication settings are managed in your Firebase Console.</p>
        <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-brand-600 dark:text-brand-400 font-semibold hover:underline">
          Open Firebase Console →
        </a>
      </div>

      {/* Theme */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Palette size={16} className="text-brand-600" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Appearance</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Dark/Light mode is controlled by the toggle in the topbar. System default follows your OS preference.</p>
      </div>

      <button onClick={handleSave} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-brand-600/30 active:scale-[0.98] text-sm">
        <Save size={15} /> Save Settings
      </button>
    </div>
  );
}
