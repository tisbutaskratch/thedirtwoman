import { Link } from "react-router-dom";
import Critter from "@/art/critters";
import TripMark from "@/art/tripMarks";
import { Emoji, Icon, TONE_EDGE, TONE_SOFT } from "@/components/ui";
import { TRIP_TYPES, TRIP_TYPE_META } from "@/lib/tripTypes";
import { resumeUrl } from "@/lib/site";

/*
 * The planner's front door.
 *
 * Kept to about a screen and a half. Someone signed out is deciding whether
 * to bother, not reading a brochure, so this says what it is, shows the one
 * thing that makes it different, lists what every trip gets in a line each,
 * and asks once.
 *
 * The trip cards are the real components with example data rather than
 * screenshots, so they serve as both the picture of the product and the
 * pitch. That is how five sections became three.
 */

/** The question each kind of trip turns on. This is the pitch. */
const TYPE_QUESTIONS: Record<string, string> = {
  motocamping: "How far on a tank, and where is the next fuel?",
  camping: "Is the site booked, and who is cooking on Saturday?",
  overlanding: "What is the range with jerry cans, and what if you get stuck?",
  backpacking: "What does it weigh, and where is the next water?",
  domestic: "One ticket or two, and how tight is the connection?",
  international: "Which documents, whose currency, what time is it there?",
};

const FEATURES = [
  { glyph: "🗓️", text: "A day by day timeline, straight into your calendar" },
  { glyph: "🎒", text: "A packing list that weighs itself and knows who is carrying what" },
  { glyph: "🧾", text: "Costs split between people, without the spreadsheet" },
  { glyph: "👥", text: "Editors who plan with you, viewers who can only watch" },
  { glyph: "📓", text: "A daily journal only you can read" },
  { glyph: "📎", text: "Somewhere to keep the confirmations and screenshots" },
];

export default function Landing() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-14 px-5 pb-16 pt-10 sm:px-8 sm:pt-16">
      {/* ------------------------------------------------------------ hero */}
      <header className="relative flex flex-col items-start gap-5">
        <Critter
          name="otter"
          size={42}
          className="absolute -top-3 right-0 hidden text-accent opacity-100 lg:block"
        />
        <span className="flex items-center gap-2 text-sm font-medium text-accent">
          <Emoji glyph="🧭" size="md" />
          Adventure Planner
        </span>

        <h1 className="max-w-2xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
          Plan the whole trip in one place
        </h1>

        <p className="max-w-xl text-lg leading-relaxed text-content-muted">
          Dates, packing, who is coming and what it costs. Pick the kind of trip you are taking and
          it asks about the right things, which is not the same list for a motorcycle as for a
          thru-hike.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover"
          >
            Create an account
            <Icon name="collapse" size={15} />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-md border border-edge px-5 py-2.5 text-sm font-medium text-content-muted transition-colors hover:border-edge-strong hover:text-content"
          >
            Log in
          </Link>
        </div>

        <p className="text-sm text-content-subtle">
          <span className="font-medium text-content-muted">Free.</span> No ads, no upsells, nothing
          saved up for a paid tier.
        </p>
      </header>

      {/* --------------------------- the six types, which are also the demo */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold tracking-tight">Six kinds of trip</h2>
          <Critter name="bee" size={24} className="text-accent opacity-100" />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TRIP_TYPES.map((type) => {
            const meta = TRIP_TYPE_META[type];
            return (
              <div
                key={type}
                className={`flex gap-3 rounded-card border border-edge border-l-4 bg-surface-raised p-4 ${TONE_EDGE[meta.tone]}`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-card border ${TONE_SOFT[meta.tone]}`}
                >
                  <TripMark type={type} size={22} />
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold text-content">{meta.label}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-content-muted">
                    {TYPE_QUESTIONS[type]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------------------------------------------------- what you get */}
      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold tracking-tight">On every trip</h2>
        <ul className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <li key={feature.text} className="flex items-start gap-2.5 text-sm text-content-muted">
              <Emoji glyph={feature.glyph} size="md" />
              <span className="leading-relaxed">{feature.text}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* ------------------------------------------------------------ note */}
      <section className="relative overflow-hidden rounded-card border border-edge bg-surface-raised p-5 sm:p-6">
        <Critter
          name="hedgehog"
          size={36}
          className="absolute right-5 top-5 hidden text-accent opacity-100 sm:block"
        />
        {/* No second button. Asking twice on a page this short reads as
            pushing, and the one in the hero is a scroll away. */}
        <p className="max-w-2xl text-sm leading-relaxed text-content-muted">
          There are no ads here and nothing to buy. I built this planning my own trips, because
          nothing out there asked the right questions, and I keep it running because the planning
          should be the easy part of getting somewhere good.{" "}
          <a
            href={resumeUrl()}
            className="font-medium text-content underline-offset-4 hover:text-accent hover:underline"
          >
            Saba Wilhelm
          </a>
        </p>
      </section>
    </div>
  );
}
