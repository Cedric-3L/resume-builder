"use client";

import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { useToastStore, type ToastType } from "@/store/useToastStore";

const TOAST_STYLES: Record<ToastType, { bg: string; border: string; icon: React.ReactNode }> = {
  success: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: <AlertCircle className="h-4 w-4 text-red-600" />,
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: <Info className="h-4 w-4 text-blue-600" />,
  },
};

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[200] flex flex-col gap-2">
      {toasts.map((toast) => {
        const style = TOAST_STYLES[toast.type];
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2.5 rounded-xl border px-4 py-3 shadow-lg animate-in slide-in-from-right-full ${style.bg} ${style.border}`}
          >
            {style.icon}
            <span className="text-sm font-medium text-slate-900">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 rounded p-0.5 text-slate-400 transition-colors hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
