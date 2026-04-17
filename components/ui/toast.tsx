"use client";

import { createContext, useCallback, useState, type ReactNode } from "react";

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  exiting?: boolean;
}

interface ToastContextValue {
  addToast: (toast: Omit<Toast, "id">) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION = 3000;
const MAX_TOASTS = 3;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 150);
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = crypto.randomUUID();
      setToasts((prev) => {
        const next = [...prev, { ...toast, id }];
        return next.slice(-MAX_TOASTS);
      });
      setTimeout(() => removeToast(id), TOAST_DURATION);
    },
    [removeToast],
  );

  const borderColor: Record<ToastVariant, string> = {
    success: "border-l-success",
    error: "border-l-danger",
    info: "border-l-accent-warm",
  };

  return (
    <ToastContext value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-[var(--radius-md)] border border-border border-l-2 ${borderColor[toast.variant]} bg-surface px-4 py-3 text-sm text-text-primary shadow-[var(--shadow-md)] ${
              toast.exiting
                ? "animate-[slideOutRight_150ms_ease-in_forwards]"
                : "animate-[slideInRight_150ms_ease-out]"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext>
  );
}
