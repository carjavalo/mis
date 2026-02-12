import React, { createContext, useCallback, useContext, useMemo } from "react";
import { Toaster, toast } from "sonner";

type ToastType = "success" | "error" | "info";

interface ToastOptions {
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  show: (message: string, type?: ToastType, options?: ToastOptions) => void;
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
  dismiss: (toastId?: string | number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const trigger = useCallback((message: string, type: ToastType = "info", options?: ToastOptions) => {
    const payload = {
      description: options?.description,
      duration: options?.duration ?? 3500,
    };

    switch (type) {
      case "success":
        toast.success(message, payload);
        break;
      case "error":
        toast.error(message, payload);
        break;
      default:
        toast(message, payload);
        break;
    }
  }, []);

  const value = useMemo<ToastContextValue>(() => ({
    show: (message, type = "info", options) => trigger(message, type, options),
    success: (message, options) => trigger(message, "success", options),
    error: (message, options) => trigger(message, "error", options),
    info: (message, options) => trigger(message, "info", options),
    dismiss: toast.dismiss,
  }), [trigger]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        expand
        toastOptions={{
          duration: 3500,
          className: "text-sm",
        }}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};
