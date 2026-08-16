import { NavLink, Outlet, useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/lib/AuthContext";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800">
        <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <NavLink to="/app/dashboard" className="text-lg font-bold tracking-tight">
            Adventure Planner
          </NavLink>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-400">{user?.name}</span>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="rounded-md border border-slate-700 px-3 py-1.5 text-slate-300 transition-colors hover:border-slate-500"
            >
              Log out
            </button>
          </div>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
