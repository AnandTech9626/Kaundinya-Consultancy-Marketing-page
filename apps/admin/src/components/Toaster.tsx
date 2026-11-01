import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import type { ToastDetail } from "../lib/toast";

export function Toaster() {
  const [toasts, setToasts] = useState<ToastDetail[]>([]);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<ToastDetail>).detail;
      if (!detail) return;

      setToasts((current) => [...current, detail]);
      window.setTimeout(() => {
        setToasts((current) =>
          current.filter((toast) => toast.id !== detail.id),
        );
      }, 4000);
    };

    window.addEventListener("kaundinya:toast", handler);
    return () => window.removeEventListener("kaundinya:toast", handler);
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={`pointer-events-auto flex items-start gap-2 rounded-xl border bg-white p-3 shadow-lg ${
            toast.tone === "success"
              ? "border-emerald-200"
              : "border-rose-200"
          }`}
        >
          {toast.tone === "success" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
          )}
          <p className="flex-1 text-xs font-semibold leading-relaxed text-charcoal">
            {toast.message}
          </p>
          <button
            type="button"
            onClick={() =>
              setToasts((current) =>
                current.filter((item) => item.id !== toast.id),
              )
            }
            className="text-muted hover:text-charcoal"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
