import { NavLink, Outlet, useNavigate } from "react-router-dom";
import SupportFooter from "@/components/SupportFooter";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/lib/AuthContext";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import { Emoji, Icon } from "@/components/ui";
import { routes } from "@/lib/site";

export default function AppLayout() {
  const { logout } = useAuth();
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
            className="flex shrink-0 items-center gap-2 whitespace-nowrap text-base font-bold tracking-tight"
          >
            <Emoji glyph="🧭" size="lg" />
            Adventure Planner
          </NavLink>
          <div className="flex items-center gap-1 text-sm sm:gap-2">
            <NavLink
              to={routes.garage}
              title="Garage"
              aria-label="Garage"
              className="flex h-8 w-8 items-center justify-center rounded-md text-content-muted transition-colors hover:bg-surface-overlay hover:text-content"
            >
              <Icon name="garage" size={17} />
            </NavLink>
            <ThemeToggle />
            {/*
              * A person, next to the way out, which is where accounts live
              * in almost everything else. This is the only route to
              * settings, so it has to survive every screen size: hiding it
              * on a phone left no way to delete your account.
              */}
            <NavLink
              to={routes.settings}
              title="Your account"
              aria-label="Your account"
              className="flex h-8 w-8 items-center justify-center rounded-md text-content-muted transition-colors hover:bg-surface-overlay hover:text-content"
            >
              <Icon name="account" size={17} />
            </NavLink>
            {/*
              * The door with an arrow leaving it, which is the one glyph
              * everybody already reads as "log out". Tinted on hover rather
              * than boxed, because it is the only control here that ends
              * something, and that is worth a hint without shouting.
              */}
            <button
              onClick={handleLogout}
              title="Log out"
              aria-label="Log out"
              className="flex h-8 w-8 items-center justify-center rounded-md text-content-muted transition-colors hover:bg-rose-500/10 hover:text-rose-500"
            >
              <Icon name="logout" size={17} />
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
