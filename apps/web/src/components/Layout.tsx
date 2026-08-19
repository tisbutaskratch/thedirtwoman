import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import Critter from "@/art/critters";
import ThemeToggle from "@/components/ThemeToggle";
import { Icon, IconButton } from "@/components/ui";
import { contactLinks, profile } from "@/lib/profile";
import { plannerUrl } from "@/lib/site";
import { useDocumentTitle } from "@/lib/useDocumentTitle";

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/experience", label: "Experience" },
  { to: "/projects", label: "Projects" },
  { to: "/skills", label: "Skills" },
  { to: "/contact", label: "Contact" },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-md px-3 py-2 text-sm transition-colors sm:py-1.5 ${
    isActive ? "bg-accent-muted font-medium text-accent" : "text-content-muted hover:text-content"
  }`;

export default function Layout() {
  // Six destinations is more than fits across a phone, so below sm the nav
  // collapses behind a toggle rather than wrapping into three cramped rows.
  const [menuOpen, setMenuOpen] = useState(false);
  useDocumentTitle(`${profile.name} · ${profile.title}`);
  const email = contactLinks.find((l) => l.label === "Email");

  return (
    <div className="flex min-h-screen flex-col bg-surface text-content">
      <header className="sticky top-0 z-30 border-b border-edge bg-surface/90 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-6">
          <NavLink
            to="/"
            className="flex items-center gap-2 text-base font-bold tracking-tight"
            onClick={() => setMenuOpen(false)}
          >
            <Critter name="dragonfly" size={22} className="text-accent opacity-100" />
            {profile.name}
          </NavLink>

          <div className="flex items-center gap-1">
            <ul className="hidden sm:flex sm:items-center sm:gap-0.5">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} end={item.end} className={linkClass}>
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <ThemeToggle />
            <span className="sm:hidden">
              <IconButton
                onClick={() => setMenuOpen((o) => !o)}
                title={menuOpen ? "Close menu" : "Open menu"}
                icon={menuOpen ? "close" : "expand"}
              />
            </span>
          </div>
        </nav>

        {menuOpen && (
          <ul className="flex flex-col gap-0.5 border-t border-edge px-4 py-2 sm:hidden">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={linkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-6 sm:py-14">
        <Outlet />
      </main>

      <footer className="border-t border-edge">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 py-6 text-center sm:flex-row sm:justify-between sm:px-6 sm:text-left">
          <p className="flex items-center gap-2 text-sm text-content-muted">
            <Critter name="puffin" size={22} className="text-accent opacity-100" />
            <span>{profile.location}</span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
            {email && (
              <a
                href={email.href}
                className="inline-flex items-center gap-1.5 text-content-muted underline-offset-4 transition-colors hover:text-accent hover:underline"
              >
                <Icon name="feedback" size={15} />
                {email.value}
              </a>
            )}
            {/*
             * The way across to the app. A recruiter who lands on the resume
             * should be one click from the thing it talks about, and the
             * planner's own footer links back the other way.
             */}
            <a
              href={plannerUrl()}
              className="inline-flex items-center gap-1.5 font-medium text-accent underline-offset-4 transition-colors hover:underline"
            >
              <Icon name="share" size={15} />
              Adventure Planner
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
