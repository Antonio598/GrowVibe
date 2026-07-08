import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "../layouts/AppShell";
import { Login } from "../pages/Login";
import { AcceptInvite } from "../pages/AcceptInvite";
import { Dashboard } from "../pages/Dashboard";
import { Tasks } from "../pages/Tasks";
import { Finance } from "../pages/Finance";
import { Groups } from "../pages/Groups";
import { GroupDetail } from "../pages/GroupDetail";
import { Notifications } from "../pages/Notifications";
import { Fitness } from "../pages/Fitness";
import { useAuth } from "../store/auth";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="p-6 text-slate-500">Cargando...</p>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/accept-invite" element={<AcceptInvite />} />

      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/groups/:id" element={<GroupDetail />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/fitness" element={<Fitness />} />
      </Route>
    </Routes>
  );
}
