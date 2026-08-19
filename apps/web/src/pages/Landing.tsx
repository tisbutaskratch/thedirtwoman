import { Link } from "react-router-dom";
import Critter from "@/art/critters";
import TripMark from "@/art/tripMarks";
import { Emoji, Icon, TONE_EDGE, TONE_SOFT } from "@/components/ui";
import { TRIP_TYPES, TRIP_TYPE_META } from "@/lib/tripTypes";
import { resumeUrl } from "@/lib/site";

/*
 * The planner's front door.
 *
 * Someone signed out is deciding whether to bother, not reading a brochure,
 * so this is short: a heading, why it exists in the builder's own words, one
 * ask, and then the six trip cards.
 *
 * Those cards are the real components with example data rather than
 * screenshots, so they show the product and make the argument at once. A
 * paragraph describing them would only repeat what they already say, which
 * is why there isn't one.
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

        {/*
         * Her words, up front rather than buried at the bottom. They say what
         * this is and that it is free without a separate line claiming either,
         * and the six cards below show the product better than a paragraph
         * describing them would.
         */}
        <blockquote className="max-w-xl border-l-2 border-accent/50 pl-4">
          <p className="text-lg leading-relaxed text-content-muted">
            No ads, nothing to buy. I made this for my own trips and then my friends and family
            ended up on it too, which has honestly been the nicest part. It is so much easier when
            everyone can see the same plan. Come and use it, and take someone with you.
          </p>
          <footer className="mt-2 text-sm text-content-subtle">
            <a
              href={resumeUrl()}
              className="font-medium text-content-muted underline-offset-4 hover:text-accent hover:underline"
            >
              Saba Wilhelm
            </a>{" "}
            <Emoji glyph="💙" size="sm" />
          </footer>
        </blockquote>

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
            className="inline-flex items-center gap-2 rounded-md border border-accent/60 px-5 py-2.5 text-sm font-medium text-accent transition-colors hover:border-accent hover:bg-accent-muted"
          >
            Log in
          </Link>
        </div>
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
    </div>
  );
}
