import { Menu } from "lucide-react";
import { useAuth } from "../lib/auth";
import { initials } from "../lib/formats";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { staff } = useAuth();

  return (
    <header className="h-16 bg-white/95 backdrop-blur border-b border-border-subtle flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 sticky top-0 z-10">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="lg:hidden shrink-0 p-2 -ml-1 rounded-lg text-charcoal hover:bg-ivory transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <p className="text-sm font-bold text-charcoal truncate">Admin Console</p>
          <p className="text-[11px] text-muted truncate hidden sm:block">
            Manage enquiries, clients &amp; requests
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-charcoal">{staff?.name}</p>
          <p className="text-[11px] text-muted capitalize">{staff?.role}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-charcoal text-gold font-bold flex items-center justify-center text-xs">
          {initials(staff?.name ?? "Admin")}
        </div>
      </div>
    </header>
  );
}
