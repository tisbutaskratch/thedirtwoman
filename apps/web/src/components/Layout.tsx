import { NavLink, Outlet } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/skills", label: "Skills" },
  { to: "/projects", label: "Projects" },
  { to: "/contact", label: "Contact" },
];

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-surface text-content">
      <header className="border-b border-edge">
        <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <NavLink to="/" className="text-lg font-bold tracking-tight">
            Samwise Gamgee
          </NavLink>
          <div className="flex flex-wrap items-center gap-3">
            <ul className="flex flex-wrap gap-1">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `rounded-md px-3 py-1.5 text-sm transition-colors ${
                        isActive
                          ? "bg-emerald-500/10 text-accent"
                          : "text-content-muted hover:text-content"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <ThemeToggle />
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <Outlet />
      </main>

      <footer className="border-t border-edge px-6 py-6 text-center text-sm text-content-subtle">
        Bag End, Hobbiton, The Shire
      </footer>
    </div>
  );
}
