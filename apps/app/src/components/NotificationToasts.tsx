import { useNavigate } from "react-router-dom";
import { Bell, ChevronRight, X } from "lucide-react";
import { useNotifications } from "../lib/notifications";

export function NotificationToasts() {
  const navigate = useNavigate();
  const { toasts, dismissToast, markRead, openPanel } = useNotifications();

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
      {toasts.map(({ key, notification }) => {
        const open = () => {
          markRead(notification.id);
          dismissToast(key);
          if (notification.href) navigate(notification.href);
          else openPanel();
        };

        return (
          <div
            key={key}
            role="status"
            className="pointer-events-auto relative flex items-start gap-3 rounded-xl border border-gold/40 bg-white p-3 pr-9 shadow-lg"
          >
            <button
              type="button"
              onClick={open}
              className="flex w-full items-start gap-3 text-left cursor-pointer"
            >
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-light text-[#B8860B]">
                <Bell className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-extrabold text-charcoal">
                  {notification.title}
                </span>
                <span className="mt-0.5 block line-clamp-2 text-[11px] leading-relaxed text-muted">
                  {notification.message}
                </span>
              </span>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-gold" />
            </button>
            <button
              type="button"
              onClick={() => dismissToast(key)}
              aria-label="Dismiss notification"
              className="absolute right-2 top-2 rounded-md p-1 text-muted-light hover:bg-ivory hover:text-charcoal cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
