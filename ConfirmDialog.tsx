"use client";

import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

const variantStyles = {
  danger: { btn: "bg-rose-600 hover:bg-rose-700 shadow-rose-600/30", icon: "text-rose-500 bg-rose-100 dark:bg-rose-950/40" },
  warning: { btn: "bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/30", icon: "text-yellow-500 bg-yellow-100 dark:bg-yellow-950/40" },
  info: { btn: "bg-brand-600 hover:bg-brand-700 shadow-brand-600/30", icon: "text-brand-500 bg-brand-100 dark:bg-brand-950/40" },
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;
  const s = variantStyles[variant];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 w-full max-w-sm p-6 animate-fade-in">
        <div className="flex items-start gap-4 mb-5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.icon}`}>
            <AlertTriangle size={18} />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className={`flex-1 text-white font-semibold py-2.5 rounded-xl transition-all shadow-lg text-sm ${s.btn}`}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
