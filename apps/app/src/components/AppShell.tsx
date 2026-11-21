import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ErrorBoundary } from "./ErrorBoundary";
import { NotificationPanel } from "./NotificationPanel";
import { NotificationToasts } from "./NotificationToasts";
import { ProfilePanel } from "./ProfilePanel";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { NotificationsProvider } from "../lib/notifications";

export function AppShell() {
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <NotificationsProvider>
      <div className="min-h-screen bg-surface-muted flex">
          <Sidebar
            mobileOpen={mobileNavOpen}
            onClose={() => setMobileNavOpen(false)}
          />
          <div className="flex-1 flex flex-col min-w-0">
            <Topbar
              onMenuClick={() => setMobileNavOpen(true)}
              onProfileClick={() => setProfileOpen(true)}
            />
            <main className="flex-1 p-3 sm:p-5 lg:p-6">
              <ErrorBoundary resetKey={location.pathname}>
                <Outlet />
              </ErrorBoundary>
            </main>
          </div>
          <NotificationToasts />
          <NotificationPanel />
          <ProfilePanel
            open={profileOpen}
            onClose={() => setProfileOpen(false)}
          />
        </div>
    </NotificationsProvider>
  );
}
