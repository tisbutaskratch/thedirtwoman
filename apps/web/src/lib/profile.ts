// Mock content for Phase 2 (personal site). Swap for real content later.

export const profile = {
  name: "Samwise Gamgee",
  title: "Gardener · Ring-bearer's Companion · Ninth Walker",
  tagline: "I grow things, carry heavy loads, and finish what I start.",
  location: "Bag End, Hobbiton, The Shire",
};

export const about = {
  paragraphs: [
    "I'm a gardener by trade — first for old Mr. Bilbo Baggins, then for Mr. Frodo — and I like to think I know a thing or two about coaxing something good out of stubborn ground.",
    "A while back I got talked into a rather longer walk than I'd planned: out of the Shire, through Moria, over the mountains, and eventually up a very unpleasant hill in Mordor. I carried what needed carrying, cooked what needed cooking, and made sure Mr. Frodo got where he was going, even the last bit when I had to carry him too.",
    "These days I'm back to gardening, mostly — replanted the Party Tree, brought the Shire back after the Troubles, that sort of thing. I also serve as Mayor, which mostly means I'm good at listening to complaints and handing out potatoes.",
    "I keep good notes. I finish what I start. And I've found that most problems get smaller once you've had a proper breakfast.",
  ],
};

export interface SkillGroup {
  category: string;
  items: string[];
}

export const skills: SkillGroup[] = [
  {
    category: "Core Skills",
    items: [
      "Gardening & Horticulture",
      "Cooking & Provisioning",
      "Wilderness Navigation",
      "Loyalty Under Pressure",
      "Load-Bearing (literal)",
    ],
  },
  {
    category: "Tools",
    items: ["Trowel", "Cooking Pot", "Sting (borrowed)", "Elven Rope", "Mithril Vest (borrowed)"],
  },
  {
    category: "Languages",
    items: ["Westron (native)", "Sindarin (conversational)", "Entish (listening only)"],
  },
  {
    category: "Leadership",
    items: ["Mayor of the Shire (7 terms)", "Deputy Ring-bearer", "Master of Bag End"],
  },
];

export interface Project {
  title: string;
  role: string;
  status: "Completed" | "Ongoing";
  description: string;
  outcome?: string;
}

export const projects: Project[] = [
  {
    title: "Fellowship of the Ring",
    role: "Logistics & Support",
    status: "Completed",
    description:
      "Escorted the Ring-bearer from the Shire to Rivendell and beyond, handling provisions, camp setup, and morale.",
    outcome: "Fellowship formed; journey continued south.",
  },
  {
    title: "Destruction of the One Ring",
    role: "Co-lead, Final Ascent",
    status: "Completed",
    description:
      "Co-led the final push up Mount Doom. Carried Mr. Frodo the last stretch when he couldn't walk any further.",
    outcome: "The Ring was destroyed. Sauron defeated.",
  },
  {
    title: "Restoration of the Shire",
    role: "Lead Gardener",
    status: "Completed",
    description:
      "Replanted the Party Tree and restored the Shire after the Troubles, using a gift of soil and a mallorn seed from the Lady Galadriel.",
    outcome: "1420 became the most remarkable year for produce on record.",
  },
  {
    title: "The Red Book of Westmarch",
    role: "Author / Editor",
    status: "Ongoing",
    description: "Completing Bilbo and Frodo's memoirs, with my own account added at the end.",
  },
];

export interface ContactLink {
  label: string;
  value: string;
  href: string;
}

export const contactLinks: ContactLink[] = [
  { label: "Email", value: "samwise@bagend.shire", href: "mailto:samwise@bagend.shire" },
  { label: "GitHub", value: "github.com/samwise-gamgee", href: "https://github.com/samwise-gamgee" },
  { label: "Location", value: "Bag End, Hobbiton, The Shire", href: "#" },
];
