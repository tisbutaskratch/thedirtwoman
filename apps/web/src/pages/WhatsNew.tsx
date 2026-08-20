import { Link } from "react-router-dom";
import Critter from "@/art/critters";
import { Badge, Icon } from "@/components/ui";
import { CHANGE_LABELS, RELEASES, type ChangeKind } from "@/lib/changelog";
import { useAuth } from "@/lib/AuthContext";
import { routes } from "@/lib/site";

/*
 * Reachable without an account, so a link to it can go anywhere.
 */

/** New reads as good news, fixed as a relief, better as neither. */
const KIND_TONE: Record<ChangeKind, "emerald" | "cyan" | "violet"> = {
  new: "emerald",
  better: "cyan",
  fixed: "violet",
};

export default function WhatsNew() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
      <header className="relative flex flex-col gap-3">
        <Critter
          name="squirrel"
          size={38}
          className="absolute -top-2 right-0 hidden text-accent opacity-100 sm:block"
        />
        <Link
          to={isAuthenticated ? routes.dashboard : "/"}
          className="inline-flex w-fit items-center gap-1.5 text-sm text-content-muted transition-colors hover:text-content"
        >
          <Icon name="back" size={14} />
          {isAuthenticated ? "Back to trips" : "Back"}
        </Link>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">What's new</h1>
        <p className="text-base leading-relaxed text-content-muted">
          Everything that has changed, newest first.
        </p>
      </header>

      <div className="flex flex-col gap-8">
        {RELEASES.map((release) => (
          <section key={release.version} className="flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-edge pb-2">
              <h2 className="text-lg font-semibold text-content">{release.version}</h2>
              <span className="text-sm text-content-subtle">{release.date}</span>
            </div>

            {release.summary && (
              <p className="text-sm leading-relaxed text-content-muted">{release.summary}</p>
            )}

            <ul className="flex flex-col gap-2.5">
              {release.changes.map((change) => (
                <li key={change.text} className="flex flex-col gap-1 sm:flex-row sm:gap-3">
                  <span className="shrink-0 sm:w-16">
                    <Badge tone={KIND_TONE[change.kind]}>{CHANGE_LABELS[change.kind]}</Badge>
                  </span>
                  <span className="text-sm leading-relaxed text-content-muted">{change.text}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
