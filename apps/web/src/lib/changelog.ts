/*
 * What changed, written for the people using it.
 *
 * Versions are semantic, so the number carries meaning: the major goes up
 * when something people relied on works differently, the minor when there is
 * something new to use, the patch when something that was broken stopped
 * being broken.
 *
 * The entries themselves are not written that way. "Fixed a null dereference
 * in the trip route resolver" tells a user nothing; "opening a trip could
 * show an error page" tells them whether the thing that annoyed them last
 * week is fixed. Internal work that changed nothing anyone can see does not
 * belong here at all, which is what the git history is for.
 *
 * Newest first. APP_VERSION is the top entry and must match package.json;
 * a test fails if they drift.
 */

export type ChangeKind = "new" | "better" | "fixed";

export interface Release {
  version: string;
  date: string;
  /** One line on what this release was about, when it was about something. */
  summary?: string;
  changes: { kind: ChangeKind; text: string }[];
}

export const RELEASES: Release[] = [
  {
    version: "1.2.0",
    date: "27 August 2026",
    summary: "Somewhere to keep your gear, a trip type for holidays, and less retyping.",
    changes: [
      {
        kind: "new",
        text: "A seventh kind of trip, for get-togethers. Thanksgiving at somebody's house is not a packing problem, so this one asks who is hosting, how many are coming and what everybody is bringing, laid out by day. It will tell you if four people have signed up to bring dessert and nobody has claimed a main.",
      },
      {
        kind: "new",
        text: "A garage, for the things you own between trips. Set a rig up once with its tank and mileage, and pick it on any trip instead of typing it out again. Save kits too: a camp kitchen, a carry-on, a trailside repair roll. One button drops a whole kit onto a trip's packing list, already grouped under its name.",
      },
      {
        kind: "new",
        text: "Pin the trips you keep coming back to, and they sit at the top of your list. Pin the sections you always check first, and they move to the top of every trip. Both are yours alone: pinning a shared trip does not move it for anyone else.",
      },
      {
        kind: "new",
        text: "Packing lists and prep checklists now suggest what you have added before, so the things you bring on every trip are one tap rather than typed out from scratch.",
      },
      {
        kind: "better",
        text: "When the app is slow to open after you have been away, it now says why. The server goes to sleep when nobody is using it, and waking it takes up to a minute. It was doing that before; it just did not tell you.",
      },
      {
        kind: "better",
        text: "The header is tidier. Your garage, your account and the way out are icons now, and the light and dark switch has moved into Settings, where it also tells you which one you are on and that the choice is saved on this device rather than on your account.",
      },
      {
        kind: "better",
        text: "Both sites have a proper icon in the browser tab, so they are findable in a row of twenty of them.",
      },
      {
        kind: "fixed",
        text: "On a phone there was no way to reach your account settings, which meant no way to delete your account. The account icon is now in the header at every size.",
      },
    ],
  },
  {
    version: "1.1.0",
    date: "19 August 2026",
    summary: "Calendars, a front page, and the two bugs people actually hit.",
    changes: [
      {
        kind: "new",
        text: "Send a trip to your calendar. The button on any trip downloads a file that Google Calendar, Proton, Apple and Outlook all understand, with the trip dates and every activity that has a day or a time.",
      },
      {
        kind: "new",
        text: "The site now explains itself before asking you to sign up, instead of opening on a login form.",
      },
      {
        kind: "new",
        text: "A privacy policy you can read, and a box to tick that means you have.",
      },
      {
        kind: "better",
        text: "Light theme is the default now. If you had already chosen dark, you keep it.",
      },
      {
        kind: "better",
        text: "The motocamping artwork looks like a dirt bike rather than a wheelchair, and the opening animations run a little slower so you can see them.",
      },
      {
        kind: "better",
        text: "Sharing the app copies just the link, so pasting it into an address bar opens the site instead of searching for a sentence.",
      },
      {
        kind: "fixed",
        text: "Opening or creating a trip could land on an error page. It no longer does.",
      },
      {
        kind: "fixed",
        text: "Inviting someone by email looked like it failed, and the form would not clear, even though the invite had been created. Invites now send properly and the form behaves.",
      },
    ],
  },
  {
    version: "1.0.0",
    date: "18 August 2026",
    summary: "The first version anyone else could use.",
    changes: [
      {
        kind: "new",
        text: "Six kinds of trip, each asking what that kind of trip needs: motocamping, camping, overlanding, backpacking, domestic and international.",
      },
      {
        kind: "new",
        text: "A day by day timeline, with times, places and to-do lists on each activity.",
      },
      {
        kind: "new",
        text: "A packing list that tracks weight and who is carrying what, and marks things required or optional.",
      },
      {
        kind: "new",
        text: "Costs, split between the people on the trip.",
      },
      {
        kind: "new",
        text: "Collaborators who plan with you and viewers who can follow along without changing anything.",
      },
      {
        kind: "new",
        text: "A daily journal on every trip, private to your account and to nobody else's.",
      },
      {
        kind: "new",
        text: "Somewhere to keep confirmations and screenshots, and a print-to-PDF version of the whole plan.",
      },
    ],
  },
];

export const APP_VERSION = RELEASES[0].version;

export const CHANGE_LABELS: Record<ChangeKind, string> = {
  new: "New",
  better: "Better",
  fixed: "Fixed",
};
