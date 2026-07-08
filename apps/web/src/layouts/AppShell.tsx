import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../store/auth";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/tasks", label: "Tareas" },
  { to: "/finance", label: "Finanzas" },
  { to: "/groups", label: "Colaborativo" },
  { to: "/notifications", label: "Alertas" },
  { to: "/fitness", label: "Salud" },
];

export function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-200 bg-white p-4 md:flex">
        <h1 className="mb-6 text-lg font-semibold text-slate-900">CRM Personal</h1>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium ${
                  isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-4 border-t border-slate-200 pt-4 text-sm text-slate-500">
          <p className="truncate">{user?.email}</p>
          <button onClick={logout} className="mt-2 text-slate-700 underline">
            Cerrar sesión
          </button>
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t border-slate-200 bg-white py-2 md:hidden">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `text-xs ${isActive ? "font-semibold text-slate-900" : "text-slate-500"}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <main className="flex-1 p-6 pb-20 md:pb-6">
        <Outlet />
      </main>
    </div>
  );
}
