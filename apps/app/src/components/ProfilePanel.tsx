import { useEffect } from "react";
import { User, X } from "lucide-react";
import { ProfileContent } from "../pages/Profile";

interface ProfilePanelProps {
  open: boolean;
  onClose: () => void;
}

export function ProfilePanel({ open, onClose }: ProfilePanelProps) {
  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-[90] ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-inverse/50 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Profile"
        className={`absolute inset-y-0 right-0 flex w-full flex-col bg-surface-muted shadow-2xl transition-transform duration-300 ease-out sm:w-1/2 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border bg-surface p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-brand-strong">
              <User className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base font-extrabold tracking-tight text-foreground">
                Your profile
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Personal details, client ID and security PIN.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close profile"
            className="shrink-0 rounded-lg border border-border p-2 text-foreground hover:border-brand/60 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <ProfileContent compact />
        </div>
      </aside>
    </div>
  );
}
