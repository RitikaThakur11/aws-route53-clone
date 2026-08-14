"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastMessage, "id">) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 4500 }: Omit<ToastMessage, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastMessage = { id, type, title, message, duration };
      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, message?: string) => showToast({ type: "success", title, message }),
    [showToast]
  );

  const error = useCallback(
    (title: string, message?: string) => showToast({ type: "error", title, message, duration: 6000 }),
    [showToast]
  );

  const info = useCallback(
    (title: string, message?: string) => showToast({ type: "info", title, message }),
    [showToast]
  );

  const warning = useCallback(
    (title: string, message?: string) => showToast({ type: "warning", title, message }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning, removeToast }}>
      {children}
      {/* AWS Console Toast Container */}
      <div className="fixed top-14 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
        {toasts.map((toast) => {
          let bg = "bg-[#ebf6ed] border-[#037f0c] text-[#037f0c]";
          let Icon = CheckCircle2;

          if (toast.type === "error") {
            bg = "bg-[#fdf3f2] border-[#d13212] text-[#d13212]";
            Icon = AlertCircle;
          } else if (toast.type === "warning") {
            bg = "bg-[#fff9e6] border-[#8d6605] text-[#8d6605]";
            Icon = AlertTriangle;
          } else if (toast.type === "info") {
            bg = "bg-[#f1faff] border-[#0073bb] text-[#0073bb]";
            Icon = Info;
          }

          return (
            <div
              key={toast.id}
              role="alert"
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded border shadow-md transition-all duration-200 ${bg}`}
            >
              <Icon className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 text-sm text-[#16191f]">
                <p className="font-semibold text-xs tracking-wide">{toast.title}</p>
                {toast.message && <p className="text-xs text-[#545b64] mt-0.5">{toast.message}</p>}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-[#545b64] hover:text-[#16191f] p-0.5 rounded transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
