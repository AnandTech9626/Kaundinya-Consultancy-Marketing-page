import { useState } from "react";
import { Outlet } from "react-router-dom";
import { NotificationPanel } from "./NotificationPanel";
import { NotificationToasts } from "./NotificationToasts";
import { ProfilePanel } from "./ProfilePanel";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { NotificationsProvider } from "../lib/notifications";
import { MockRequestsProvider } from "../lib/mockRequests";

export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <NotificationsProvider>
      <MockRequestsProvider>
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
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
              <Outlet />
            </main>
          </div>
          <NotificationToasts />
          <NotificationPanel />
          <ProfilePanel
            open={profileOpen}
            onClose={() => setProfileOpen(false)}
          />
        </div>
      </MockRequestsProvider>
    </NotificationsProvider>
  );
}
