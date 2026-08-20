import { Link } from "react-router-dom";
import Critter from "@/art/critters";
import { Icon } from "@/components/ui";
import { FEEDBACK_EMAIL } from "@/lib/support";
import { PRIVACY_POLICY_EFFECTIVE, PRIVACY_SECTIONS } from "@/lib/privacy";
import { useAuth } from "@/lib/AuthContext";
import { routes } from "@/lib/site";

/*
 * Reachable without an account, because the whole point is to read it
 * before deciding to make one.
 */
export default function Privacy() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
      <header className="relative flex flex-col gap-3">
        <Critter
          name="owl"
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
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Privacy</h1>
        <p className="text-base leading-relaxed text-content-muted">
          What Adventure Planner stores, who can see it, and how to get rid of it. In plain
          language, because a policy nobody can read is not consent.
        </p>
        <p className="text-sm text-content-subtle">In effect since {PRIVACY_POLICY_EFFECTIVE}</p>
      </header>

      <div className="flex flex-col gap-7">
        {PRIVACY_SECTIONS.map((section) => (
          <section key={section.heading} className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-content">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-sm leading-relaxed text-content-muted">
                {paragraph}
              </p>
            ))}
            {section.list && (
              <ul className="mt-1 flex flex-col gap-1.5">
                {section.list.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2.5 text-sm leading-relaxed text-content-muted"
                  >
                    <span
                      aria-hidden
                      className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <p className="rounded-card border border-edge bg-surface-raised p-4 text-sm leading-relaxed text-content-muted">
        Questions, or want your data removed by hand?{" "}
        <a
          href={`mailto:${FEEDBACK_EMAIL}`}
          className="font-medium text-accent underline-offset-4 hover:underline"
        >
          {FEEDBACK_EMAIL}
        </a>
      </p>
    </div>
  );
}
