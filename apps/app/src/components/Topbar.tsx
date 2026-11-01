import { Bell, Menu } from "lucide-react";
import { useAuth } from "../lib/auth";
import { useNotifications } from "../lib/notifications";

interface TopbarProps {
  onMenuClick: () => void;
  onProfileClick: () => void;
}

export function Topbar({ onMenuClick, onProfileClick }: TopbarProps) {
  const { user } = useAuth();
  const { unreadCount, openPanel } = useNotifications();
  const initial = user?.name?.trim().charAt(0).toUpperCase() || "K";

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
          <p className="text-sm font-bold text-charcoal truncate">Welcome back</p>
          <p className="text-[11px] text-muted truncate hidden sm:block">
            Here's what's happening with your requests.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={openPanel}
          aria-label={
            unreadCount > 0
              ? `${unreadCount} unread notifications`
              : "Notifications"
          }
          className="relative rounded-lg p-2 text-charcoal transition-colors hover:bg-ivory cursor-pointer"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-extrabold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-charcoal">{user?.name}</p>
          <p className="text-[11px] text-muted">+91 {user?.mobile}</p>
        </div>
        <button
          type="button"
          onClick={onProfileClick}
          aria-label="Open profile"
          className="w-9 h-9 rounded-full bg-gold text-charcoal font-bold flex items-center justify-center transition-shadow hover:ring-2 hover:ring-gold/50 cursor-pointer"
        >
          {initial}
        </button>
      </div>
    </header>
  );
}
