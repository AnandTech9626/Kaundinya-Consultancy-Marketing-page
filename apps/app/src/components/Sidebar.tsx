import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Wrench,
  FileText,
  ShieldCheck,
  Coins,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { BrandLockup } from "./BrandLockup";
import { SocialLinks } from "./SocialLinks";

const NAV: { to: string; label: string; icon: LucideIcon; tag?: string }[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/real-estate", label: "Real Estate", icon: Building2 },
  { to: "/home-services", label: "Home Services", icon: Wrench },
  { to: "/digital-services", label: "Digital Services", icon: FileText },
  { to: "/insurance", label: "Insurance", icon: ShieldCheck, tag: "Demo" },
  { to: "/loans", label: "Loans", icon: Coins, tag: "Demo" },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

const COLLAPSE_KEY = "kaundinya.sidebar.collapsed";

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(COLLAPSE_KEY) === "1";
  });

  useEffect(() => {
    window.localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  const handleLogout = () => {
    onClose();
    logout();
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-inverse/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 shrink-0 bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          collapsed ? "lg:w-24" : "lg:w-72"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div
          className={`flex h-24 items-center justify-between border-b border-sidebar-border px-4 ${
            collapsed ? "lg:justify-center lg:px-2" : ""
          }`}
        >
          <BrandLockup size="md" collapsed={collapsed} />
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="lg:hidden p-1.5 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-hover hover:text-sidebar-foreground transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className={`flex-1 p-3 space-y-1 overflow-y-auto ${collapsed ? "lg:px-2" : ""}`}>
          {NAV.map(({ to, label, icon: Icon, tag }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/dashboard"}
              onClick={onClose}
              aria-label={collapsed ? `${label}${tag ? " (Demo)" : ""}` : undefined}
              title={collapsed ? `${label}${tag ? " (Demo)" : ""}` : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  collapsed ? "lg:justify-center lg:px-0" : ""
                } ${
                  isActive
                    ? "bg-brand text-on-brand"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-hover hover:text-sidebar-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className={`flex-1 ${collapsed ? "lg:hidden" : ""}`}>
                    {label}
                  </span>
                  {tag && (
                    <span
                      className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
                        collapsed ? "lg:hidden" : ""
                      } ${
                        isActive
                          ? "border-on-brand/20 bg-on-brand/10 text-on-brand"
                          : "border-brand/30 bg-brand/15 text-brand"
                      }`}
                    >
                      {tag}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div
          className={`border-t border-sidebar-border p-3 ${
            collapsed ? "lg:px-2" : ""
          }`}
        >
          <p
            className={`px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/50 ${
              collapsed ? "lg:hidden" : ""
            }`}
          >
            Stay connected
          </p>
          <SocialLinks collapsed={collapsed} onNavigate={onClose} />
        </div>

        <div
          className={`p-3 border-t border-sidebar-border flex items-center gap-1 ${
            collapsed ? "lg:p-2" : ""
          }`}
        >
          <button
            onClick={handleLogout}
            aria-label={collapsed ? "Sign out" : undefined}
            title={collapsed ? "Sign out" : undefined}
            className={`flex flex-1 items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-hover hover:text-sidebar-foreground transition-colors cursor-pointer ${
              collapsed ? "lg:justify-center lg:gap-0 lg:px-2" : ""
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className={collapsed ? "lg:hidden" : ""}>Sign out</span>
          </button>

          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden lg:inline-flex shrink-0 items-center justify-center rounded-lg p-2.5 text-sidebar-foreground/70 hover:bg-sidebar-hover hover:text-sidebar-foreground transition-colors cursor-pointer"
          >
            {collapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
