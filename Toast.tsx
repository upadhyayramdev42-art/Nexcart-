"use client";

import { useEffect, useState, createContext, useContext, useCallback, type ReactNode } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Toast, ToastType } from "@/types";

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const icons: Record<ToastType, React.ElementType> = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const styles: Record<ToastType, string> = {
  success: "bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300",
  error: "bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300",
  warning: "bg-yellow-50 dark:bg-yellow-950/80 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300",
  info: "bg-blue-50 dark:bg-blue-950/80 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300",
};

const iconStyles: Record<ToastType, string> = {
  success: "text-emerald-500",
  error: "text-rose-500",
  warning: "text-yellow-500",
  info: "text-blue-500",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info", duration = 4000) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message, duration }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const remove = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <div
              key={toast.id}
              className={cn(
                "flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-sm pointer-events-auto animate-slide-up",
                styles[toast.type]
              )}
            >
              <Icon size={16} className={cn("shrink-0 mt-0.5", iconStyles[toast.type])} />
              <p className="text-sm font-medium flex-1">{toast.message}</p>
              <button onClick={() => remove(toast.id)} className="opacity-60 hover:opacity-100 transition-opacity shrink-0">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
