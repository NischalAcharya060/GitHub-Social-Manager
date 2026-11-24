"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { ToastMessage } from "@/types";
import { cn } from "@/lib/ui";

interface ToastContextType {
  showToast: (type: "success" | "error" | "info", title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (type: "success" | "error" | "info", title: string, message?: string) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, message }]);

      // Auto dismiss after 4 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed bottom-4 right-4 z-[70] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2.5 sm:w-full"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.type === "error" ? "alert" : "status"}
            className={cn(
              "animate-scale-in pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-[var(--radius-md)] border p-3.5 shadow-[var(--shadow-lg)] backdrop-blur-xl",
              toast.type === "success" && "border-[var(--brand-line)] bg-[rgba(14,21,30,0.94)]",
              toast.type === "error" && "border-[var(--danger-line)] bg-[rgba(14,21,30,0.94)]",
              toast.type === "info" && "border-[var(--info-line)] bg-[rgba(14,21,30,0.94)]"
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                toast.type === "success" && "bg-[var(--brand-soft)] text-[var(--brand)]",
                toast.type === "error" && "bg-[var(--danger-soft)] text-[var(--danger)]",
                toast.type === "info" && "bg-[var(--info-soft)] text-[var(--info)]"
              )}
            >
              {toast.type === "success" && <CheckCircle2 className="h-4 w-4" />}
              {toast.type === "error" && <AlertCircle className="h-4 w-4" />}
              {toast.type === "info" && <Info className="h-4 w-4" />}
            </span>

            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-sm font-semibold text-[var(--text)]">{toast.title}</p>
              {toast.message && (
                <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-muted)]">
                  {toast.message}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="-mr-1 -mt-1 rounded-lg p-2 text-[var(--text-faint)] transition-colors hover:bg-white/5 hover:text-[var(--text)]"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
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
