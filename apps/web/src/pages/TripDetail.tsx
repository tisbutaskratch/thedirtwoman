import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ApiError } from "@/api/client";
import { emailTripCalendar, type CalendarRecipients } from "@/api/calendar";
import { leaveTrip } from "@/api/sharing";
import { deleteTrip, downloadTripCalendar, getTrip, updateTrip } from "@/api/trips";
import type { Trip } from "@/api/types";
import ActivitiesSection from "@/components/trip/ActivitiesSection";
import AssignmentsSection from "@/components/trip/AssignmentsSection";
import ExpensesSection from "@/components/trip/ExpensesSection";
import FilesSection from "@/components/trip/FilesSection";
import ContributionsSection from "@/components/trip/ContributionsSection";
import SectionFrame from "@/components/trip/SectionFrame";
import GearSection from "@/components/trip/GearSection";
import JournalSection from "@/components/trip/JournalSection";
import LocationsSection from "@/components/trip/LocationsSection";
import MembersSection from "@/components/trip/MembersSection";
import NotesSection from "@/components/trip/NotesSection";
import PhotosSection from "@/components/trip/PhotosSection";
import TasksSection from "@/components/trip/TasksSection";
import {
  Badge,
  ConfirmDialog,
  Icon,
  IconButton,
  TONE_SOFT,
  WakingNotice,
  inputClass,
} from "@/components/ui";
import { useAuth } from "@/lib/AuthContext";
import TripBackdrop from "@/art/TripBackdrop";
import TripLoader from "@/art/TripLoader";
import TripMark from "@/art/tripMarks";
import { TRIP_TYPE_META } from "@/lib/tripTypes";
import BackpackingPanel from "@/modes/backpacking/BackpackingPanel";
import CampingPanel from "@/modes/camping/CampingPanel";
import DomesticPanel from "@/modes/domestic/DomesticPanel";
import GatheringPanel from "@/modes/gathering/GatheringPanel";
import InternationalPanel from "@/modes/international/InternationalPanel";
import OverlandingPanel from "@/modes/overlanding/OverlandingPanel";
import { routes } from "@/lib/site";
import { useSlowLoad } from "@/lib/useSlowLoad";
import { listPinnedSections, pinSection, unpinSection } from "@/api/pins";
import type { SectionKey } from "@/api/types";

function formatRange(start: string | null, end: string | null) {
  if (!start && !end) return "No dates set";
  const fmt = (d: string) =>
    new Date(`${d}T00:00:00Z`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });
  if (start && end) return `${fmt(start)} → ${fmt(end)}`;
  return fmt((start ?? end) as string);
}

/**
 * Day and month only, for the condensed header.
 *
 * The year is the first thing worth dropping: you already know roughly when
 * your own trip is, and it costs the width that the title needs.
 */
function formatRangeCompact(start: string | null, end: string | null) {
  if (!start && !end) return null;
  const fmt = (d: string) =>
    new Date(`${d}T00:00:00Z`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  if (start && end) return `${fmt(start)} → ${fmt(end)}`;
  return fmt((start ?? end) as string);
}

/** Which destructive action the confirmation modal is currently guarding. */
type PendingAction = "delete" | "archive" | "unarchive" | "leave" | null;

export default function TripDetail() {
  const { tripId } = useParams<{ tripId: string }>();
  const id = Number(tripId);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingAction>(null);
  const [editingTrip, setEditingTrip] = useState(false);
  /*
   * Once you've scrolled into the plan, the sticky header earns its keep by
   * being small. On a phone it drops to just the way back, which trip you're
   * in, and a way to the top; the dates and the destructive controls belong
   * to the top of the page, where you were when you needed them.
   */
  const [scrolled, setScrolled] = useState(false);
  const [draft, setDraft] = useState({ title: "", start: "", end: "" });

  // The opener needs a trip type before the trip has loaded. The dashboard
  // hands one over on navigation; failing that we fall back to a neutral
  // spinner rather than guessing wrong and animating the wrong animal.
  const hintedType = (location.state as { tripType?: Trip["trip_type"] } | null)?.tripType;

  /*
   * The opener runs for its full second when you arrive from the trip list.
   * Locally the fetch resolves in a few milliseconds, so without a floor the
   * animation would flash and vanish. Deep links and refreshes skip it
   * entirely, there is no hinted type then, and nobody wants an artificial
   * wait on a page they loaded directly.
   */
  const [openerDone, setOpenerDone] = useState(hintedType === undefined);
  // Three ways to get the calendar out is one too many for three icons, so
  // they share one button and a small menu.
  const [calendarMenuOpen, setCalendarMenuOpen] = useState(false);
  const [calendarNotice, setCalendarNotice] = useState<string | null>(null);
  // The opener finishing is not the same as the trip arriving; only the
  // fetch itself is worth explaining a long wait for.
  const waking = useSlowLoad(trip === null && error === null);
  /*
   * Sections this person keeps at the top, on every trip rather than this
   * one. "I always look at the packing list first" is a fact about how
   * somebody uses the app, not about one holiday.
   */
  const [pinnedSections, setPinnedSections] = useState<SectionKey[]>([]);

  useEffect(() => {
    listPinnedSections()
      .then(setPinnedSections)
      .catch(() => setPinnedSections([]));
  }, []);

  async function toggleSection(section: SectionKey) {
    const isPinned = pinnedSections.includes(section);
    // Optimistic: reordering your own page should not wait on a round trip.
    setPinnedSections((current) =>
      isPinned ? current.filter((s) => s !== section) : [...current, section],
    );
    try {
      await (isPinned ? unpinSection(section) : pinSection(section));
    } catch {
      setPinnedSections((current) =>
        isPinned ? [...current, section] : current.filter((s) => s !== section),
      );
    }
  }
  /*
   * How many days the trip runs, so day pickers offer real days instead of
   * an open-ended number box. Computed before the early return below,
   * because hooks cannot be conditional. A trip with no dates still gets one
   * day, so there is always somewhere to hang the first thing.
   */
  const tripDayCount = useMemo(() => {
    if (!trip?.start_date || !trip?.end_date) return 1;
    const start = Date.parse(`${trip.start_date}T00:00:00Z`);
    const end = Date.parse(`${trip.end_date}T00:00:00Z`);
    return Math.max(Math.round((end - start) / 86_400_000) + 1, 1);
  }, [trip?.start_date, trip?.end_date]);

  useEffect(() => {
    if (hintedType === undefined) return;
    // Matches trip-traveller-cross in index.css. Shorter and the opener is
    // cut off mid-stride; longer and the page sits waiting on nothing.
    const timer = setTimeout(() => setOpenerDone(true), 1300);
  return () => clearTimeout(timer);
  }, [hintedType]);

  const refreshTrip = useCallback(() => {
    getTrip(id)
      .then(setTrip)
      .catch(() => setError("Could not load this trip."));
  }, [id]);

  useEffect(() => {
    refreshTrip();
  }, [refreshTrip]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleConfirm() {
    const action = pending;
    setPending(null);
    if (action === "leave") {
      await handleLeave(trip!);
      return;
    }
    if (action === "delete") {
      await deleteTrip(id);
      navigate(routes.dashboard);
      return;
    }
    if (action === "archive" || action === "unarchive") {
      setTrip(await updateTrip(id, { archived: action === "archive" }));
    }
  }

  function startEditTrip() {
    if (!trip) return;
    setDraft({
      title: trip.title,
      start: trip.start_date ?? "",
      end: trip.end_date ?? "",
    });
    setEditingTrip(true);
  }

  async function saveTrip() {
    if (!draft.title.trim()) return;
    setTrip(
      await updateTrip(id, {
        title: draft.title.trim(),
        start_date: draft.start || null,
        end_date: draft.end || null,
      }),
    );
    setEditingTrip(false);
  }

  if (error) return <p className="text-rose-400">{error}</p>;
  if (!trip || !openerDone) {
    return (
      <div className="flex flex-col items-center gap-3">
        {hintedType ? (
          <TripLoader type={hintedType} />
        ) : (
          <p className="animate-pulse text-content-subtle">Loading trip…</p>
        )}
        {waking && <WakingNotice />}
      </div>
    );
  }

  /*
   * Sections, as rows.
   *
   * They were inline JSX before pinning existed. Now they need to be data,
   * because a pinned section has to lift out of wherever it normally sits
   * and move to the top. The row shape is what preserves the original
   * layout thinking: anything unbounded gets a full row, and only pairs
   * that grow at a similar rate and are read together share a two-column
   * split. When pinning empties half a pair, the survivor goes full width
   * rather than sitting beside a column of dead space.
   */
  function renderSections() {
    const nodes: Partial<Record<SectionKey, React.ReactNode>> = {
      members: <MembersSection tripId={id} isOwner={isOwner} />,
      timeline: (
        <ActivitiesSection tripId={id} onChange={refreshTrip} tripStartDate={trip!.start_date} />
      ),
      files: <FilesSection tripId={id} />,
      contributions:
        trip!.trip_type === "gathering" ? (
          <ContributionsSection
            tripId={id}
            startDate={trip!.start_date}
            dayCount={tripDayCount}
            canEdit={canEdit}
            onChange={refreshTrip}
          />
        ) : undefined,
      packing: <GearSection tripId={id} onChange={refreshTrip} />,
      tasks: <TasksSection tripId={id} onChange={refreshTrip} />,
      expenses: <ExpensesSection tripId={id} />,
      locations: <LocationsSection tripId={id} onChange={refreshTrip} />,
      notes: <NotesSection tripId={id} onChange={refreshTrip} />,
      journal: <JournalSection tripId={id} />,
      photos: <PhotosSection tripId={id} />,
      assignments: <AssignmentsSection tripId={id} />,
    };

    const rows: SectionKey[][] = [
      ["members"],
      ["timeline"],
      ["files"],
      ["contributions"],
      ["packing"],
      // Prep and spend: both grow with the trip, and both are checklists.
      ["tasks", "expenses"],
      // Where you're going and what you jotted down about it.
      ["locations", "notes"],
      // The private counterpart to Notes: same act of writing, different
      // audience, so it gets its own row.
      ["journal"],
      ["photos"],
      // The roll-up goes last: it summarises everything above it.
      ["assignments"],
    ];

    const present = (key: SectionKey) => nodes[key] !== undefined;
    const pinnedKeys = pinnedSections.filter(present);

    // Tooltip wording, so "Pin packing to the top" reads like the section
    // people are looking at rather than like a database key.
    const LABELS: Record<SectionKey, string> = {
      members: "the crew",
      timeline: "the timeline",
      files: "files",
      contributions: "who's bringing what",
      packing: "the packing list",
      tasks: "the prep checklist",
      expenses: "expenses",
      locations: "locations",
      notes: "notes",
      journal: "the journal",
      photos: "screenshots",
      assignments: "who's doing what",
    };

    const wrap = (key: SectionKey) => (
      <SectionFrame
        key={key}
        section={key}
        label={LABELS[key]}
        pinned={pinnedSections.includes(key)}
        onToggle={() => toggleSection(key)}
      >
        {nodes[key]}
      </SectionFrame>
    );

    return (
      <>
        {pinnedKeys.length > 0 && (
          <div className="flex flex-col gap-8 rounded-card border border-dashed border-edge p-4">
            {pinnedKeys.map(wrap)}
          </div>
        )}
        {rows.map((row) => {
          const rest = row.filter((k) => present(k) && !pinnedSections.includes(k));
          if (rest.length === 0) return null;
          if (rest.length === 1) return wrap(rest[0]);
          return (
            <div
              key={row.join("-")}
              className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-2"
            >
              {rest.map(wrap)}
            </div>
          );
        })}
      </>
    );
  }

  const meta = TRIP_TYPE_META[trip.trip_type];
  const isOwner = trip.user_id === user?.id;
  // Viewers see the whole plan but get no controls that would 403 on submit.
  const canEdit = trip.my_role === "editor";
  const isArchived = trip.archived_at !== null;
  // Only condense once out of the way of the top, and never mid-edit, where
  // the controls being yanked away would be alarming.
  const condensed = scrolled && !editingTrip;
  const compactRange = formatRangeCompact(trip.start_date, trip.end_date);

  const confirmCopy = {
    leave: {
      title: "Leave this trip?",
      body: `You will be removed from “${trip.title}” and your private journal entries for it go with you. The trip stays for everyone else, and is deleted only once the last person leaves.`,
      confirmLabel: "Leave trip",
      tone: "rose" as const,
    },
    delete: {
      title: "Delete this trip?",
      body: `“${trip.title}” and everything in it (timeline, packing list, expenses, screenshots) will be permanently removed. This cannot be undone.`,
      confirmLabel: "Delete trip",
      tone: "rose" as const,
    },
    archive: {
      title: "Archive this trip?",
      body: "It moves to your past trips. Nothing is deleted, and you can bring it back any time.",
      confirmLabel: "Archive",
      tone: "amber" as const,
    },
    unarchive: {
      title: "Bring this trip back?",
      body: "It returns to your list of upcoming trips.",
      confirmLabel: "Unarchive",
      tone: "amber" as const,
    },
  };

  // Takes the trip rather than closing over it: this is a hoisted function
  // declaration, so the null check above does not narrow inside it.
  async function handleLeave(current: Trip) {
    try {
      await leaveTrip(current.id);
      navigate(routes.dashboard, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not leave this trip.");
    }
  }

  async function handleCalendarDownload(current: Trip) {
    setCalendarMenuOpen(false);
    try {
      await downloadTripCalendar(current.id, current.title);
    } catch {
      setError("Could not build the calendar file.");
    }
  }

  async function handleCalendarEmail(current: Trip, to: CalendarRecipients) {
    setCalendarMenuOpen(false);
    setCalendarNotice(null);
    try {
      const result = await emailTripCalendar(current.id, to);
      // Say what happened rather than "sent": a message that never left
      // looks exactly like one that did until somebody asks.
      if (result.failed > 0 && result.sent === 0) {
        setCalendarNotice("The calendar could not be emailed. Download it instead.");
      } else if (result.failed > 0) {
        setCalendarNotice(
          `Sent to ${result.sent} of ${result.recipients.length}. The rest did not go.`,
        );
      } else {
        setCalendarNotice(
          to === "me"
            ? "Sent to your email."
            : `Sent to everyone on this trip (${result.sent}).`,
        );
      }
    } catch (err) {
      setCalendarNotice(
        err instanceof ApiError ? err.message : "Could not email the calendar.",
      );
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Trip header, sticky so the way back is always one click away. */}
      {/*
       * Trip header: sticky, so it has to stay short. On a phone it is two
       * rows: the back link shares its line with the actions, and the title
       * block gets everything below. Stacking those separately cost roughly
       * a quarter of the viewport before you saw any of the plan.
       */}
      <header
        className={`sticky top-0 z-20 -mx-4 overflow-hidden border-b border-edge bg-surface/85 px-4 backdrop-blur transition-[padding] sm:-mx-6 sm:px-6 sm:py-4 ${
          condensed ? "py-1.5" : "py-2.5"
        }`}
      >
        <TripBackdrop type={trip.trip_type} />

        <div className="relative flex items-center justify-between gap-2">
          <Link
            to={routes.dashboard}
            className="inline-flex shrink-0 items-center gap-1.5 text-sm text-content-muted transition-colors hover:text-accent"
          >
            <Icon name="back" size={14} /> All trips
          </Link>

          {/* Condensed on a phone, this whole cluster gives way to one
              scroll-to-top control. */}
          <div
            className={`shrink-0 items-center gap-0.5 sm:flex sm:gap-1 ${
              condensed ? "hidden" : "flex"
            }`}
          >
            {/*
             * Export runs through the browser's own print-to-PDF: the print
             * stylesheet flattens the grid and hides the controls, so the PDF
             * has selectable text and real page breaks.
             */}
            <IconButton onClick={() => window.print()} title="Download as PDF" icon="download" />
            {/* An .ics file rather than a provider link: Google, Proton,
                Apple and Outlook all read it, and no provider's own URL
                scheme works anywhere but that provider. */}
            <IconButton
              onClick={() => setCalendarMenuOpen((open) => !open)}
              title="Calendar"
              icon="calendar"
            />
            {canEdit && !editingTrip && (
              <IconButton onClick={startEditTrip} title="Rename or change dates" icon="edit" />
            )}
            {!isOwner && (
              // Leaving is the counterpart of archive and delete for someone
              // who was invited: the way out of something you joined.
              <IconButton
                onClick={() => setPending("leave")}
                title="Leave this trip"
                icon="close"
              />
            )}
            {isOwner && (
              <>
                <IconButton
                  onClick={() => setPending(isArchived ? "unarchive" : "archive")}
                  title={isArchived ? "Unarchive trip" : "Archive trip"}
                  icon="archive"
                />
                <IconButton
                  onClick={() => setPending("delete")}
                  title="Delete trip"
                  variant="danger"
                  icon="delete"
                />
              </>
            )}
          </div>

          {condensed && (
            // Phone only: on a wider screen the full controls never go away,
            // so there is nothing for this to stand in for.
            <span className="sm:hidden">
              <IconButton
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                title="Back to top"
                icon="toTop"
              />
            </span>
          )}
        </div>

        <div
          className={`relative flex min-w-0 items-center gap-2.5 sm:mt-2 sm:gap-3 ${
            condensed ? "mt-0.5" : "mt-1.5"
          }`}
        >
          <span
            className={`flex shrink-0 items-center justify-center rounded-card border sm:h-11 sm:w-11 ${
              condensed ? "h-7 w-7" : "h-9 w-9"
            } ${TONE_SOFT[meta.tone]}`}
          >
            <TripMark
              type={trip.trip_type}
              size={condensed ? 18 : 22}
              className="sm:hidden"
            />
            <TripMark type={trip.trip_type} size={26} className="hidden sm:block" />
          </span>
          <div className="min-w-0 flex-1">
            {editingTrip ? (
              <div className="flex flex-col gap-1.5">
                <input
                  type="text"
                  autoFocus
                  aria-label="Trip name"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  className={`${inputClass} font-semibold`}
                />
                <div className="flex flex-wrap items-center gap-1.5">
                  <input
                    type="date"
                    aria-label="Start date"
                    value={draft.start}
                    onChange={(e) => setDraft({ ...draft, start: e.target.value })}
                    className={`${inputClass} w-auto py-1 text-xs`}
                  />
                  <input
                    type="date"
                    aria-label="End date"
                    value={draft.end}
                    onChange={(e) => setDraft({ ...draft, end: e.target.value })}
                    className={`${inputClass} w-auto py-1 text-xs`}
                  />
                  <IconButton onClick={() => setEditingTrip(false)} title="Cancel" icon="close" />
                  <IconButton
                    onClick={saveTrip}
                    title="Save"
                    variant="confirm"
                    icon="confirm"
                    size={19}
                  />
                </div>
              </div>
            ) : (
              <>
                <h1
                  className={`flex items-center gap-x-2 font-bold leading-tight tracking-tight text-content sm:flex-wrap sm:text-2xl lg:text-3xl ${
                    condensed ? "flex-nowrap text-sm" : "flex-wrap text-lg"
                  }`}
                >
                  <span className={`min-w-0 ${condensed ? "truncate" : "break-words"}`}>
                    {trip.title}
                  </span>
                  {isArchived && <Badge tone="amber">Archived</Badge>}
                  {/* Condensed only: the slack beside a short title is free
                      real estate, so the dates ride along in a lighter weight
                      rather than costing their own row. */}
                  {condensed && compactRange && (
                    <span className="shrink-0 text-xs font-normal text-content-subtle sm:hidden">
                      {compactRange}
                    </span>
                  )}
                </h1>
                {/* Type and dates on one line: both are just context, and the
                    first thing worth dropping when the header has to shrink. */}
                <p
                  className={`mt-0.5 truncate text-xs text-content-muted sm:block sm:text-sm ${
                    condensed ? "hidden" : "block"
                  }`}
                >
                  {meta.label} · {formatRange(trip.start_date, trip.end_date)}
                </p>
              </>
            )}
          </div>
        </div>
      </header>

      {/*
       * Calendar actions, in a panel rather than a dropdown: the sticky
       * header clips its own overflow to contain the backdrop art, so a menu
       * anchored inside it gets cut off. This also gives the options room to
       * be readable on a phone.
       */}
      {calendarMenuOpen && (
        <div className="flex flex-wrap gap-2 rounded-card border border-edge bg-surface-raised p-3">
          <button
            onClick={() => handleCalendarDownload(trip)}
            className="rounded-md border border-edge px-3 py-1.5 text-sm text-content-muted transition-colors hover:border-edge-strong hover:text-content"
          >
            Download the file
          </button>
          <button
            onClick={() => handleCalendarEmail(trip, "me")}
            className="rounded-md border border-edge px-3 py-1.5 text-sm text-content-muted transition-colors hover:border-edge-strong hover:text-content"
          >
            Email it to me
          </button>
          {canEdit && (
            <button
              onClick={() => handleCalendarEmail(trip, "everyone")}
              className="rounded-md border border-edge px-3 py-1.5 text-sm text-content-muted transition-colors hover:border-edge-strong hover:text-content"
            >
              Email everyone on this trip
            </button>
          )}
        </div>
      )}

      {/* The result of a calendar action. Dismissible, because it is
          information rather than a problem to solve. */}
      {calendarNotice && (
        <button
          onClick={() => setCalendarNotice(null)}
          className="w-full rounded-card border border-edge bg-surface-raised px-4 py-2 text-left text-sm text-content-muted transition-colors hover:text-content"
        >
          {calendarNotice}
        </button>
      )}

      {/* Mode essentials: the one section that differs per trip type. */}
      {trip.trip_type === "backpacking" && <BackpackingPanel tripId={id} onChange={refreshTrip} />}
      {trip.trip_type === "overlanding" && <OverlandingPanel tripId={id} onChange={refreshTrip} />}
      {trip.trip_type === "camping" && <CampingPanel tripId={id} onChange={refreshTrip} />}
      {trip.trip_type === "international" && (
        <InternationalPanel tripId={id} onChange={refreshTrip} />
      )}
      {trip.trip_type === "domestic" && <DomesticPanel tripId={id} onChange={refreshTrip} />}
      {trip.trip_type === "gathering" && <GatheringPanel tripId={id} onChange={refreshTrip} />}

      {/*
       * Sections are grouped by how much content they actually hold, not
       * packed into one uniform grid: a long list next to a short one leaves
       * a column of dead space. Anything unbounded (timeline, packing list,
       * photos) gets a full row; only pairs that grow at a similar rate,
       * and that you read together, share a two-column split.
       */}
      {!canEdit && (
        <p className="rounded-card border border-dashed border-edge px-3 py-2 text-xs text-content-subtle">
          You have view-only access to this trip. You can see everything, but
          changes are up to the collaborators.
        </p>
      )}

      {renderSections()}

      <ConfirmDialog
        open={pending !== null}
        {...(pending ? confirmCopy[pending] : confirmCopy.delete)}
        onConfirm={handleConfirm}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}
