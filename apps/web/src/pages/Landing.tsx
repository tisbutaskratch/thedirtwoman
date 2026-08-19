import { Link } from "react-router-dom";
import Critter from "@/art/critters";
import TripMark from "@/art/tripMarks";
import { Badge, Emoji, Icon, TONE_EDGE, TONE_SOFT } from "@/components/ui";
import { TRIP_TYPES, TRIP_TYPE_META } from "@/lib/tripTypes";
import { resumeUrl } from "@/lib/site";

/*
 * The planner's front door.
 *
 * Before this, a signed-out visitor landed on a login form with no
 * explanation, which asks people to have an account before telling them what
 * they would be an account for.
 *
 * The previews below are the real components with example data, not
 * screenshots. Screenshots of a UI you are still changing are stale the week
 * after you take them, they weigh several hundred kilobytes each, and they
 * blur on the displays most people read them on. Rendering the actual card
 * markup costs nothing, stays correct by construction, and is sharp
 * everywhere.
 */

/** The question each kind of trip turns on. This is the pitch. */
const TYPE_QUESTIONS: Record<string, string> = {
  motocamping: "How far on a tank, and where is the next fuel?",
  camping: "Is the site booked, and who is cooking on Saturday?",
  overlanding: "What is the range with jerry cans, and what happens if you get stuck?",
  backpacking: "What does it weigh, and where is the next water?",
  domestic: "One ticket or two, and how tight is the connection?",
  international: "Which documents, whose currency, what time is it there?",
};

const EXAMPLE_TRIPS = [
  { type: "motocamping" as const, title: "Ride to Rivendell", dates: "Sep 4 – Sep 7", away: "in 16d" },
  { type: "camping" as const, title: "Ozarks weekend", dates: "Oct 2 – Oct 4", away: "in 44d" },
  { type: "backpacking" as const, title: "Lost Coast Trail", dates: "Apr 18 – Apr 22", away: "in 242d" },
];

const FEATURES = [
  {
    glyph: "🗓️",
    title: "A day by day timeline",
    body: "Put activities on real days, with times, places and their own to-do lists. Send the whole thing to your calendar, or print it for the glovebox.",
  },
  {
    glyph: "🎒",
    title: "A packing list that adds up",
    body: "Give an item a weight and an owner and the total works itself out. Mark what is required, and who is carrying it.",
  },
  {
    glyph: "👥",
    title: "Bring people in, or just let them watch",
    body: "Editors plan alongside you. Viewers can see the trip but cannot change anything, which suits whoever only wants to know when you are leaving.",
  },
  {
    glyph: "📓",
    title: "A private journal",
    body: "Every trip has a daily journal that only you can read. Not the other editors, not anyone you shared it with.",
  },
];

export default function Landing() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-20 px-5 pb-20 pt-10 sm:px-8 sm:pt-16">
      {/* ------------------------------------------------------------ hero */}
      <header className="relative flex flex-col items-start gap-6">
        <Critter
          name="otter"
          size={44}
          className="absolute -top-4 right-0 hidden text-accent opacity-100 lg:block"
        />
        <span className="flex items-center gap-2 text-sm font-medium text-accent">
          <Emoji glyph="🧭" size="md" />
          Adventure Planner
        </span>

        <h1 className="max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
          Plan the whole trip in one place
        </h1>

        <p className="max-w-2xl text-lg leading-relaxed text-content-muted">
          Dates, packing, who is coming, what it costs, and the confirmation emails you will want
          at six in the morning. Pick the kind of trip you are taking and it asks about the right
          things. Fuel range on a motorcycle. Water on a thru-hike. How tight the connection is if
          you are changing trains.
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

        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-content-subtle">
          <span className="font-medium text-content-muted">Free.</span>
          <span>No ads, no upsells, nothing saved up for a paid tier.</span>
        </p>
      </header>

      {/* ------------------------------------------------- what it looks like */}
      <section className="flex flex-col gap-5">
        <h2 className="text-2xl font-bold tracking-tight">What it looks like</h2>
        <div
          aria-label="Example of the trip dashboard"
          className="grid grid-cols-1 gap-4 rounded-card border border-edge bg-surface-raised/40 p-4 sm:grid-cols-2 lg:grid-cols-3 sm:p-6"
        >
          {EXAMPLE_TRIPS.map((trip) => {
            const meta = TRIP_TYPE_META[trip.type];
            return (
              <div
                key={trip.title}
                className={`flex flex-col gap-3 rounded-card border border-edge border-l-4 bg-surface-raised p-4 ${TONE_EDGE[meta.tone]}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-card border ${TONE_SOFT[meta.tone]}`}
                  >
                    <TripMark type={trip.type} size={24} />
                  </span>
                  <Badge tone={meta.tone}>{meta.label}</Badge>
                </div>
                <div>
                  <h3 className="font-semibold leading-snug text-content">{trip.title}</h3>
                  <p className="mt-0.5 text-xs text-content-subtle">{meta.blurb}</p>
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-edge pt-2.5 text-xs">
                  <span className="text-content-muted">{trip.dates}</span>
                  <span className="font-medium tabular-nums text-accent">{trip.away}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------ trip types */}
      <section className="flex flex-col gap-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Six kinds of trip</h2>
            <Critter name="bee" size={26} className="text-accent opacity-100" />
          </div>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-content-muted">
            The packing list looks much the same whichever one you pick. Almost nothing else
            does.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TRIP_TYPES.map((type) => {
            const meta = TRIP_TYPE_META[type];
            return (
              <div
                key={type}
                className={`flex gap-3 rounded-card border border-edge bg-surface-raised p-4 ${TONE_EDGE[meta.tone]} border-l-4`}
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

      {/* --------------------------------------------------------- features */}
      <section className="flex flex-col gap-5">
        <h2 className="text-2xl font-bold tracking-tight">On every trip</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col gap-2 rounded-card border border-edge bg-surface-raised p-5"
            >
              <h3 className="flex items-center gap-2 text-base font-semibold text-content">
                <Emoji glyph={feature.glyph} size="md" />
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-content-muted">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------------- cta */}
      <section className="relative flex flex-col items-start gap-4 overflow-hidden rounded-card border border-edge bg-surface-raised p-6 sm:p-8">
        <Critter
          name="hedgehog"
          size={40}
          className="absolute right-6 top-6 hidden text-accent opacity-100 sm:block"
        />
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Start with the trip you are already thinking about
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-content-muted">
          Make an account, pick the kind of trip, and it is laid out for you. Invite the people
          coming with you whenever you want, or don't.
        </p>
        <Link
          to="/register"
          className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover"
        >
          Create an account
          <Icon name="collapse" size={15} />
        </Link>
        {/* Said once, at the end, where someone who read this far might care
            who is behind it. */}
        <p className="max-w-2xl text-sm leading-relaxed text-content-subtle">
          There are no ads here and nothing to buy. I built this planning my own trips, because
          nothing out there asked the right questions, and I keep it running because the planning
          should be the easy part of getting somewhere good.{" "}
          <a
            href={resumeUrl()}
            className="font-medium text-content-muted underline-offset-4 hover:text-accent hover:underline"
          >
            Saba Wilhelm
          </a>
        </p>
      </section>
    </div>
  );
}
