import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  NavLink,
  Outlet,
  useLocation,
} from "react-router-dom";
import { AdminNotificationPanel } from "./AdminNotificationPanel";
import { AdminNotificationToasts } from "./AdminNotificationToasts";
import { StaffProfilePanel } from "./StaffProfilePanel";
import { Toaster } from "./Toaster";
import { ErrorBoundary } from "./ErrorBoundary";
import { AdminNotificationsProvider, useAdminNotifications } from "../lib/admin-notifications";
import { useStaffAuth } from "../lib/staff-auth";
import { fetchStaffAvatar } from "../lib/api";
import { BrandLockup } from "./BrandLockup";
import {
  Bell,
  Building2,
  Database,
  FileText,
  Inbox,
  LogOut,
  Menu,
  PhoneCall,
  ShieldCheck,
  Wallet,
  Wrench,
  X,
} from "lucide-react";

export function AppShell() {
  const { staff } = useStaffAuth();
  const isAdmin = staff?.role === "admin";

  return (
    <AdminNotificationsProvider enabled={isAdmin}>
      <AppShellContent />
    </AdminNotificationsProvider>
  );
}

function AppShellContent() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { unreadCount, openPanel } = useAdminNotifications();
  const { staff, logout } = useStaffAuth();
  const isAdmin = staff?.role === "admin";
  const initial = (staff?.name || "A").charAt(0).toUpperCase();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetchStaffAvatar()
        .then((result) => {
          if (!cancelled) setAvatarUrl(result.url);
        })
        .catch(() => undefined);
    };
    load();
    const onUpdated = () => load();
    window.addEventListener("staff-avatar-updated", onUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener("staff-avatar-updated", onUpdated);
    };
  }, []);

  // Partners (call-center agents) can only use the Daily Tasks module.
  if (!isAdmin && location.pathname !== "/daily-tasks") {
    return <Navigate to="/daily-tasks" replace />;
  }

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors ${
      isActive
        ? "bg-gold text-charcoal"
        : "text-white/70 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <div className="flex h-screen overflow-hidden bg-ivory">
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-72 shrink-0 flex-col overflow-y-auto bg-charcoal text-white transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-24 items-center justify-between border-b border-white/10 px-4">
          <Link
            to={isAdmin ? "/requests" : "/daily-tasks"}
            onClick={() => setOpen(false)}
            className="flex flex-col items-start gap-1"
          >
            <BrandLockup size="md" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-white/70 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          <NavLink
            to="/daily-tasks"
            onClick={() => setOpen(false)}
            className={navClass}
          >
            <PhoneCall className="h-4 w-4" />
            Daily Tasks
          </NavLink>
          {isAdmin && (
            <>
              <NavLink
                to="/requests"
                onClick={() => setOpen(false)}
                className={navClass}
              >
                <Inbox className="h-4 w-4" />
                Requests
              </NavLink>
              <NavLink
                to="/real-estate"
                onClick={() => setOpen(false)}
                className={navClass}
              >
                <Building2 className="h-4 w-4" />
                Real Estate
              </NavLink>
              <NavLink
                to="/home-services"
                onClick={() => setOpen(false)}
                className={navClass}
              >
                <Wrench className="h-4 w-4" />
                Home Services
              </NavLink>
              <NavLink
                to="/insurance"
                onClick={() => setOpen(false)}
                className={navClass}
              >
                <ShieldCheck className="h-4 w-4" />
                Insurance
              </NavLink>
              <NavLink
                to="/digital-services"
                onClick={() => setOpen(false)}
                className={navClass}
              >
                <FileText className="h-4 w-4" />
                Digital Services
              </NavLink>
              <NavLink
                to="/loans"
                onClick={() => setOpen(false)}
                className={navClass}
              >
                <Wallet className="h-4 w-4" />
                Loans
              </NavLink>
              <NavLink
                to="/storage"
                onClick={() => setOpen(false)}
                className={navClass}
              >
                <Database className="h-4 w-4" />
                Storage
              </NavLink>
            </>
          )}
        </nav>
        <div className="mt-auto border-t border-white/10 p-3">
          <button
            type="button"
            onClick={logout}
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold text-white/70 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-subtle bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-lg border border-border-subtle p-2 text-charcoal lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <span className="text-sm font-extrabold tracking-tight text-charcoal">
              {isAdmin ? "Admin panel" : "Agent panel"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                type="button"
                onClick={openPanel}
                className="relative rounded-lg border border-border-subtle p-2 text-charcoal hover:border-gold/60 cursor-pointer"
                aria-label={
                  unreadCount > 0
                    ? `${unreadCount} unread notifications`
                    : "Notifications"
                }
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-extrabold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              className="flex items-center gap-2 cursor-pointer"
              aria-label="Open staff profile"
            >
              <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gold text-xs font-extrabold text-charcoal">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={staff?.name ? `${staff.name} profile photo` : "Profile"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initial
                )}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-bold text-charcoal">
                  {staff?.name || "Staff"}
                </span>
                <span className="block text-[10px] font-semibold capitalize text-muted">
                  {staff?.role} · {staff?.staffCode}
                </span>
              </span>
            </button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <ErrorBoundary resetKey={location.pathname}>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      <Toaster />
      {isAdmin && (
        <>
          <AdminNotificationToasts />
          <AdminNotificationPanel />
        </>
      )}
      <StaffProfilePanel
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </div>
  );
}
