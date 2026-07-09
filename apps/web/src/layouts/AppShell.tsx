import { NavLink, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, CheckSquare, Wallet, Users, Bell, HeartPulse, Sprout, LogOut } from "lucide-react";
import { useAuth } from "../store/auth";
import { api } from "../lib/apiClient";
import { Avatar } from "../components/ui";
import { cn } from "../components/ui/cn";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/tasks", label: "Tareas", icon: CheckSquare },
  { to: "/finance", label: "Finanzas", icon: Wallet },
  { to: "/groups", label: "Colaborativo", icon: Users },
  { to: "/notifications", label: "Alertas", icon: Bell },
  { to: "/fitness", label: "Salud", icon: HeartPulse },
];

export function AppShell() {
  const { user, logout } = useAuth();
  const { data: unread } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => api.notifications.list("?read=false&pageSize=1"),
    refetchInterval: 60_000,
  });
  const unreadCount = unread?.total ?? 0;

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-surface px-4 py-6 md:flex">
        <div className="mb-8 flex items-center gap-2.5 px-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-lime text-white">
            <Sprout size={20} />
          </span>
          <span className="text-lg font-semibold text-ink font-display">GrowVibe</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive ? "bg-primary text-white shadow-sm" : "text-muted hover:bg-primary-soft/50 hover:text-ink",
                )
              }
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {to === "/notifications" && unreadCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1.5 text-xs font-semibold text-white">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-line p-3">
          <Avatar name={user?.name ?? "?"} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{user?.name}</p>
            <p className="truncate text-xs text-muted">{user?.email}</p>
          </div>
          <button onClick={logout} aria-label="Cerrar sesión" title="Cerrar sesión" className="rounded-lg p-1.5 text-muted hover:bg-coral-soft hover:text-coral">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Bottom nav móvil */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-line bg-surface/95 px-1 py-1.5 backdrop-blur md:hidden">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn("flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[10px] font-medium", isActive ? "text-primary" : "text-muted")
            }
          >
            <div className="relative">
              <Icon size={20} />
              {to === "/notifications" && unreadCount > 0 && (
                <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[9px] font-semibold text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            {label}
          </NavLink>
        ))}
      </nav>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 sm:px-6 md:pb-8">
        <Outlet />
      </main>
    </div>
  );
}
