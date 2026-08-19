/*
 * The privacy policy, as data.
 *
 * Written to be read rather than to be legally impenetrable. Someone
 * deciding whether to put their trips in here should be able to find out
 * what happens to them in under a minute, so this says what is stored, who
 * can see it, what leaves the building, and how to get rid of it.
 *
 * It is deliberately specific about the things policies usually fudge: that
 * nothing beyond passwords is encrypted at the application level, and which
 * companies hold the data. Vagueness there is what makes people distrust
 * these documents.
 *
 * PRIVACY_POLICY_VERSION must match app/core/policy.py. Registration sends
 * this value and the API rejects a mismatch, so a stale page cannot record
 * agreement to a policy nobody read.
 */
export const PRIVACY_POLICY_VERSION = "2026-08-19";

export const PRIVACY_POLICY_EFFECTIVE = "19 August 2026";

export interface PolicySection {
  heading: string;
  paragraphs: string[];
  list?: string[];
}

export const PRIVACY_SECTIONS: PolicySection[] = [
  {
    heading: "What is stored",
    paragraphs: [
      "Only what the app needs to work. There is no tracking, no analytics, and no third-party scripts on any page.",
    ],
    list: [
      "Your email address and name, so you can sign in and so collaborators know who you are.",
      "Your password, hashed with bcrypt. It cannot be read back, including by me.",
      "Your trips: titles, dates, timelines, packing lists, locations, costs and notes.",
      "Anything you upload, such as confirmations and screenshots.",
      "Your journal entries, which no other person can read.",
      "The date you agreed to this policy, and which version of it.",
    ],
  },
  {
    heading: "Who can see it",
    paragraphs: [
      "People you invite to a trip can see that trip. Editors can change it, viewers can only read it. Nobody can see a trip they were not invited to.",
      "Journal entries are the exception: they are private to the account that wrote them. Not to the trip, and not to its editors. That is enforced in the database queries, not just hidden in the interface.",
      "I can technically read what is in the database, as anyone running a service can. I do not, other than when fixing something specific and only as far as that requires.",
    ],
  },
  {
    heading: "What is not encrypted",
    paragraphs: [
      "Passwords are hashed and unreadable. Everything else is stored as plain text in the database.",
      "The hosting provider encrypts its disks, which protects against someone physically stealing a drive. It does not protect against someone obtaining database credentials, because the database decrypts transparently for anyone authorised to query it.",
      "Being straight about this matters more than sounding reassuring: if you would not want a journal entry read by someone who breached the server, do not put it here.",
    ],
  },
  {
    heading: "Who else holds it",
    paragraphs: [
      "Running this means using other companies. Each holds only what its job requires.",
    ],
    list: [
      "Render hosts the API and the database.",
      "Netlify serves the site itself and receives no account data.",
      "Resend sends invitation emails, so it sees the recipient address and the trip title.",
      "Cloudflare R2 stores uploaded files in a private bucket, reachable only through short-lived links the API issues after checking your access.",
    ],
  },
  {
    heading: "Selling and advertising",
    paragraphs: [
      "Neither happens. Your data is not sold, rented, or shared for advertising, and there is nobody to sell it to. There are no ads on any page.",
    ],
  },
  {
    heading: "Deleting your account",
    paragraphs: [
      "You can delete your account from your settings, which removes your trips, journal entries and uploads.",
      "Trips you created with other people on them are handled separately, because deleting them would delete other people's planning too. You choose what happens to those when you delete.",
      "Backups may hold copies for a short period after deletion, because that is what a backup is. They are overwritten on their normal cycle.",
    ],
  },
  {
    heading: "Changes to this policy",
    paragraphs: [
      "If what is collected, who sees it, or where it goes changes, the version at the top of this page changes with it and you will be asked to read it again. Fixing a typo will not trigger that.",
    ],
  },
  {
    heading: "Asking about any of this",
    paragraphs: [
      "Email is the way. I am one person, not a support department, and I will answer.",
    ],
  },
];
