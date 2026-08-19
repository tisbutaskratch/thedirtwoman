import { NavLink, Outlet, useNavigate } from "react-router-dom";
import SupportFooter from "@/components/SupportFooter";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/lib/AuthContext";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import { Emoji } from "@/components/ui";
import { routes } from "@/lib/site";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  useDocumentTitle("Adventure Planner");

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface text-content">
      <header className="border-b border-edge bg-surface/90 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <NavLink
            to={routes.dashboard}
            className="flex items-center gap-2 text-base font-bold tracking-tight"
          >
            <Emoji glyph="🧭" size="lg" />
            Adventure Planner
          </NavLink>
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden text-content-muted sm:inline">{user?.name}</span>
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="rounded-md border border-edge px-3 py-1.5 text-content-muted transition-colors hover:border-edge-strong hover:text-content"
            >
              Log out
            </button>
          </div>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
      <SupportFooter />
    </div>
  );
}
