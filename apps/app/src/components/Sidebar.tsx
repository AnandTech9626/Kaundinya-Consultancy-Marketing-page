import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  User,
  Bell,
  LogOut,
  X,
} from "lucide-react";
import { SITE_INFO } from "@kaundinya/config";
import { useAuth } from "../lib/auth";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/requests", label: "My Requests", icon: ClipboardList },
  { to: "/services", label: "Request a Service", icon: PlusCircle },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const { logout } = useAuth();

  const handleLogout = () => {
    onClose();
    logout();
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-charcoal/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 bg-charcoal text-white flex flex-col transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 border-b border-charcoal-light flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gold text-charcoal font-extrabold flex items-center justify-center text-lg">
              K
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">{SITE_INFO.shortName}</p>
              <p className="text-[10px] text-ivory/60">Client Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="lg:hidden p-1.5 rounded-lg text-ivory/70 hover:bg-charcoal-light hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/dashboard"}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gold text-charcoal"
                    : "text-ivory/70 hover:bg-charcoal-light hover:text-white"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-charcoal-light">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ivory/70 hover:bg-charcoal-light hover:text-white transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
