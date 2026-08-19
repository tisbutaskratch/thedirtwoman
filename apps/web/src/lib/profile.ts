/*
 * Real content for the personal site.
 *
 * Sourced from the 2025-2026 work retrospective and the three resume
 * variants. Two things this data deliberately gets right that the PDFs
 * don't, because the PDFs are stale:
 *
 *  1. The current role is Software Engineer, not Engineering Manager. The
 *     management chapter is history, and it ended by choice.
 *  2. Numbers are the ones with a source behind them. Nothing here is
 *     rounded up for effect.
 */

import { plannerUrl } from "@/lib/site";

export const profile = {
  name: "Saba Wilhelm",
  // Jira and GitLab still carry the maiden name; worth being findable under both.
  alsoKnownAs: "Saba Dasadawala",
  title: "Software Engineer",
  tagline: "I like hard problems and code you can build on.",
  location: "Kansas City, MO · Remote",
  summary:
    "I'm a software engineer at Loop Returns, on the shipping and logistics team. Carrier integrations, label generation, the part of a return that gets a package back to a warehouse. Before this I managed engineers for nearly three years, then went back to building, because that's the work I actually like doing.",
};

/** The one-liner a recruiter should leave with. */
export const positioning =
  "Ten years of production software, nearly three of them managing. I design before I build, ship in pieces small enough to undo, and stay on the hook when something breaks.";

export const about = {
  paragraphs: [
    "I like working on things that actually affect people, with people who know things I don't. And I care about helping people grow, which is most of why I enjoyed managing.",
    "At Loop I work on the shipping side of returns. My team owns carrier integrations and label generation, so when you send something back, we're the part that works out how it physically gets there.",
    "I started at Cerner in 2016 writing healthcare software. Nursing workflows, infusion pump interfaces, medication charting. You learn to be careful fast when a bug shows up in someone's chart.",
    "I joined Loop as an engineer, moved into a tech lead role, then managed for nearly three years across three product areas. I liked it and I was good at it. I ran the hackathons, set up a mentorship program that got four junior engineers promoted ahead of schedule, and held our area at 99.99% uptime.",
    "Then I went back to engineering. The parts of managing I looked forward to were always the technical ones, and I missed being close to the thing being built. It's a different job that happens to sit near code.",
    "Since coming back I've designed a carrier-choice system end to end and led a migration off three legacy integrations. I still plan and communicate like someone who has had to defend a roadmap, which turns out to be useful.",
    "I write the design down before I write the code. I ship behind flags and then go back and delete them. When I pick one approach over another I say why, so nobody has to guess a year later. I stay on my own bugs. And when something turns out not to be my bug, I prove it before handing it over.",
  ],
};

/* -------------------------------------------------- experience --------- */

export interface Role {
  title: string;
  company: string;
  location: string;
  start: string;
  end: string;
  /** Present roles get highlighted rather than sorted differently. */
  current?: boolean;
  summary: string;
  highlights: string[];
  /** The shape of the work, for scanning. */
  tags: string[];
}

export const roles: Role[] = [
  {
    title: "Software Engineer",
    company: "Loop Returns",
    location: "Remote · Kansas City, MO",
    start: "Jul 2025",
    end: "Present",
    current: true,
    summary:
      "Carrier integrations, label generation, and the shipping side of returns. I own the architecture on a customer-facing feature and on a platform migration, and I take support rotation for everything I ship.",
    highlights: [
      "Designed and built Carrier Choice, letting EU and UK shoppers pick their own return carrier. I wrote the provider-agnostic interface a year before the build started, and it went through a PRD, a formal spec, and implementation without needing to change.",
      "Built it as a four-layer domain module shipped one layer per merge request, with observability split into three separately releasable changes so a metrics bug could never be mistaken for a behaviour regression.",
      "Led the Nucleus to Synks migration, consolidating three legacy 3PL and warehouse integrations off an aging Node layer. Authored the execution plan, sequenced by risk, not by size, and went on site to pair with the engineer who originally wrote the platform.",
      "Designed a Strategy-pattern destination rules engine, then argued that shipping shouldn't own destinations at all. That got pushback. I made the case anyway and handed the domain to the team it belonged to.",
      "Root-caused a partner bug that was clawing back real customer money. It came down to a redundant API call that had been sitting there since 2021. A second, similar-looking bug turned out not to be ours, so I proved that and handed the other team something they could act on.",
      "Remediated roughly 37,800 shipping labels in one campaign, reworked into batched, rate-limit-aware jobs with a status doc so stakeholders could follow along without asking.",
      "Ran the release train end to end and led a carrier incident through investigation, comms, and a completed root-cause analysis.",
    ],
    tags: ["PHP / Laravel", "Domain-driven design", "Carrier APIs", "Architecture", "Incident response"],
  },
  {
    title: "Engineering Manager",
    company: "Loop Returns",
    location: "Remote · Kansas City, MO",
    start: "Oct 2022",
    end: "Jul 2025",
    summary:
      "Led cross-functional teams across three product areas. Shopper portal, point of sale, and the merchant administration platform.",
    highlights: [
      "Took Loop into physical retail with an in-store iPad returns app, adding 82,000 returns and reaching 197 merchants.",
      "Authored the team's product delivery lifecycle end to end: planning, implementation, launch, and post-launch, each phase with its own exit criteria, plus a Definition of Ready and separate Definitions of Done for features and for tickets.",
      "Turned testing coverage into something we actually tracked. Instrumented three codebases and drove admin coverage from 36% to 49% and the customer portal from 40% to 55% over a year, with core held above 78%.",
      "Built the engineering and support metrics the team ran on: velocity against a deliberate 30% technical-debt and 70% product split, ticket cycle time broken out by work type, security vulnerabilities by severity, and incident counts by severity and responder.",
      "Defined support SLAs by severity, from four hours to first update on a critical through to resolution targets per tier, and built the Jira dashboards that made them visible.",
      "Created the release process and automated release naming, and instrumented it so we could see release success, recovery time, and commit-to-deploy instead of guessing at them.",
      "Introduced break-it weeks: manual and automated testing scheduled into the timeline, so critical bugs turned up before a release instead of after.",
      "Cut bug tickets on the Exchanges feature by 80%, by paying down the technical debt and fixing the onboarding path instead of triaging symptoms one at a time.",
      "Held the product area at 99.99% uptime.",
      "Scored highest in engineering on employee experience surveys, with a 100% team engagement rating.",
      "Ran bi-annual hackathons at 95% engineering participation: 22 prototypes in 2024, 16 of which shipped as real features.",
      "Built a mentorship program pairing engineers for onboarding and career growth; four junior engineers earned accelerated promotions.",
      "Championed the Women in Engineering and Women at Loop employee resource groups, taking the case for career growth directly to executive leadership.",
    ],
    tags: [
      "Team leadership",
      "Delivery process",
      "Engineering KPIs",
      "SLAs and SLOs",
      "Roadmap planning",
      "Mentorship",
    ],
  },
  {
    title: "Tech Lead, Grow and Scale",
    company: "Loop Returns",
    location: "Remote · Kansas City, MO",
    start: "May 2022",
    end: "Oct 2022",
    summary:
      "Technical lead for Loop's point of sale iOS solution, from architecture through the App Store release cycle.",
    highlights: [
      "Led development of the POS iOS solution, making the key architectural decisions and setting the coding standards.",
      "Implemented metrics and observability to track performance: Datadog log dashboards, Hex dashboards for business metrics, and real-user monitoring.",
      "Mentored engineers, and spent time with merchants and store associates, which is usually how you find out what is actually wrong.",
      "Managed release cycles and CI/CD pipelines for the Apple App Store.",
      "Focused on scalability and long-term impact, adapting the solution as traffic grew with each release phase.",
    ],
    tags: ["iOS", "Architecture", "CI/CD", "Observability", "Mentorship"],
  },
  {
    title: "Software Engineer",
    company: "Loop Returns",
    location: "Remote · Kansas City, MO",
    start: "Nov 2021",
    end: "May 2022",
    summary:
      "My first stretch at Loop. Merchant-facing configuration, onboarding, and the internal tooling around both.",
    highlights: [
      "Improved the merchant onboarding process, replacing manual client-success steps with automated setup.",
      "Enhanced the merchant shop configuration platform.",
      "Upgraded internal developer and merchant-success tooling: an automated release bot, an in-house feature flag interface, and a configurable account type UI for plan changes.",
      "Automated the finance team's billing with a Lambda that reads return volumes, calculates what is owed, and files it to the billing platform for monthly invoicing.",
    ],
    tags: ["Internal tooling", "AWS Lambda", "Automation", "Merchant platform"],
  },
  {
    title: "Associate Senior Software Engineer",
    company: "Cerner Corporation (Oracle Health)",
    location: "Kansas City, MO",
    start: "Sep 2018",
    end: "Nov 2021",
    summary:
      "Promoted into the senior associate track on the Connect Nursing application, working across Android and Java microservices.",
    highlights: [
      "Resolved defects and built enhancements on Java microservices behind the Connect Nursing Android application.",
      "Migrated a native Android application to a React-based model so it could work across multiple platforms.",
      "Owned high-visibility work on the infusion pump interface.",
      "Subject matter expert for badge scanning, workflow auditing, and code caching to cut database reads.",
      "Drove unit test coverage to 100% across roughly 150 files, each over 2,000 lines.",
    ],
    tags: ["Java", "Android", "React", "Microservices", "REST"],
  },
  {
    title: "Software Engineer",
    company: "Cerner Corporation (Oracle Health)",
    location: "Kansas City, MO",
    start: "Jan 2016",
    end: "Sep 2018",
    summary:
      "Revenue cycle and medication administration. Claims, encounters, and insurance transactions, on software that clinicians use to do their jobs.",
    highlights: [
      "Designed and built functionality for patient claims, encounter modifications, and insurance transactions.",
      "Built Millennium Visualizer, a web app mapping every table and relationship in the Cerner Millennium database, on plain JavaScript, Node.js, and MongoDB with Sinon.js unit tests.",
      "Mentored new associates on team standards, gave direct code-review feedback, and ran knowledge-transfer sessions on nursing content and platform topics.",
      "Worked across Cerner's proprietary database language and Java services, plus a JavaScript front end for payment plan workflows.",
    ],
    tags: ["Java", "JavaScript", "Node.js", "MongoDB", "SQL", "Healthcare"],
  },
];

/* -------------------------------------------------- skills ------------- */

export interface SkillGroup {
  category: string;
  glyph: string;
  items: string[];
}

export const skills: SkillGroup[] = [
  {
    category: "Languages",
    glyph: "⌨️",
    items: [
      "PHP",
      "TypeScript",
      "JavaScript",
      "Python",
      "Java",
      "Swift / iOS",
      "SQL",
      "HTML",
      "CSS",
    ],
  },
  {
    category: "Frameworks",
    glyph: "🧱",
    items: [
      "Laravel",
      "React 19",
      "Vue.js",
      "Node.js",
      "React Native",
      "FastAPI",
      "Pydantic",
      "SQLAlchemy",
      "Tailwind CSS",
      "Vite",
      "Shopify",
    ],
  },
  {
    category: "Architecture & patterns",
    glyph: "📐",
    items: [
      "Domain-driven design",
      "Bounded contexts",
      "CQRS",
      "SOLID principles",
      "Event-driven architecture",
      "Ports and adapters",
      "Strategy pattern",
      "Factory pattern",
      "Adapter pattern",
      "Capability interfaces",
      "Enforced module boundaries",
      "Design docs and ADRs",
    ],
  },
  {
    category: "APIs & integration",
    glyph: "🔌",
    items: [
      "REST",
      "GraphQL",
      "SOAP",
      "Webhooks",
      "API versioning",
      "Contract design",
      "Backward compatibility",
      "EasyPost",
      "Sendcloud",
      "UPS",
      "InPost",
      "Salesforce",
      "3PL and WMS platforms",
    ],
  },
  {
    category: "Scale & reliability",
    glyph: "⚙️",
    items: [
      "Distributed systems",
      "Message queues",
      "Async workers",
      "Idempotency",
      "Batched processing",
      "Rate limiting and backoff",
      "Retry semantics",
      "Graceful degradation",
      "Feature-flag rollout",
      "LaunchDarkly",
      "Phased data migration",
      "Incident response and RCA",
      "SLOs",
    ],
  },
  {
    category: "Data",
    glyph: "🗄️",
    items: [
      "MySQL",
      "PostgreSQL",
      "MongoDB",
      "DynamoDB",
      "Schema design",
      "Reversible migrations",
      "Analytics contracts",
    ],
  },
  {
    category: "Platform & delivery",
    glyph: "☁️",
    items: [
      "AWS Lambda",
      "Serverless",
      "Docker",
      "GitHub Actions",
      "GitLab CI",
      "Jenkins",
      "Gradle",
      "Maven",
      "Release management",
    ],
  },
  {
    category: "Observability",
    glyph: "📊",
    items: [
      "Datadog",
      "Segment",
      "CloudWatch",
      "Hex",
      "Real-user monitoring",
      "Mixpanel",
      "Structured logging",
      "Metrics and alerting",
      "Coverage tracking",
    ],
  },
  {
    category: "Testing & quality",
    glyph: "🧪",
    items: [
      "PHPUnit",
      "Pytest",
      "Vitest",
      "JUnit",
      "Mockito",
      "Jest",
      "WebdriverIO",
      "PHPStan",
      "Ruff",
      "ESLint",
      "Postman",
    ],
  },
  {
    category: "Craft",
    glyph: "🛠️",
    items: [
      "Code review at depth",
      "Mentorship",
      "Technical writing",
      "Delivery lifecycle design",
      "Definition of ready and done",
      "Engineering KPIs",
      "Roadmap planning",
      "WCAG contrast",
      "Accessible components",
    ],
  },
];

/* -------------------------------------------------- projects ----------- */

export interface Project {
  title: string;
  role: string;
  period: string;
  status: "Shipped" | "In flight" | "Side project";
  description: string;
  outcome?: string;
  /** Set for the project you can actually go and use. */
  href?: string;
  linkLabel?: string;
  tags: string[];
}

export const projects: Project[] = [
  {
    title: "Adventure Planner",
    role: "Solo, design through deploy",
    period: "2026",
    status: "Side project",
    description:
      "A trip planner for motocamping, camping, overlanding, backpacking, and travel. Each trip type asks the questions that discipline needs. Tank range and fuel stops for a motorcycle, water carry against the longest dry stretch for a thru-hike, seat reservations versus rail passes for a train. Editor and viewer roles enforced server side, a private per-trip journal, print-to-PDF export, and a cast of hand-drawn critters hiding in the margins. This portfolio site is the same codebase and the same design system.",
    outcome:
      "Live and usable, and built the way I build at work: domain modules, migrations reviewed by hand and smoke-tested up and down, features behind flags, and accessibility contrast measured, not eyeballed.",
    href: plannerUrl(),
    linkLabel: "Open the app",
    tags: [
      "React 19",
      "TypeScript",
      "Vite",
      "Tailwind v4",
      "React Router",
      "FastAPI",
      "SQLAlchemy 2.0",
      "Alembic",
      "Pydantic",
      "PostgreSQL",
      "JWT auth",
      "Vitest",
      "Pytest",
      "Docker",
    ],
  },
  {
    title: "Carrier Choice",
    role: "Architect and lead engineer",
    period: "2025 - 2026",
    status: "Shipped",
    description:
      "Let EU and UK shoppers choose their own return carrier instead of having one picked for them. A provider-agnostic domain interface designed a full year before the build, then formalised into a four-layer module shipped one layer at a time.",
    outcome:
      "Unblocked merchant launches that had been waiting on it. The original interface never needed to change.",
    tags: ["Domain-driven design", "Sendcloud", "InPost", "Observability"],
  },
  {
    title: "Nucleus to Synks Migration",
    role: "Execution plan author and migrating engineer",
    period: "2025 - present",
    status: "In flight",
    description:
      "Consolidating three legacy 3PL and warehouse integrations off an aging Node integration layer onto a newer platform. Sequenced by risk, not size. We piloted on the least volatile integration first, and fixed known debt on the way across so we weren't just moving it.",
    outcome:
      "I did not own this system before and now I am the one documenting and standardising it.",
    tags: ["Migration", "SOAP / REST / GraphQL", "Integration platforms"],
  },
  {
    title: "Native Label Customizations",
    role: "Architect and lead engineer",
    period: "2025 - present",
    status: "In flight",
    description:
      "Replacing per-carrier hardcoded label fields with a provider-agnostic customization model. Ran a discovery and audit phase before writing any schema, and published a written library assessment with a reproducible test harness before committing to a build.",
    outcome:
      "Required a formal security review before adopting any third-party label library, and self-hosting over a hosted renderer, because these labels carry customer data.",
    tags: ["Schema design", "Security review", "ZPL", "Capability framework"],
  },
  {
    title: "In-Store Returns iPad App",
    role: "Engineering manager",
    period: "2022 - 2024",
    status: "Shipped",
    description:
      "Took Loop from online-only into physical retail with a point-of-sale returns application for in-store staff. We went and did the research in person: bought things, returned them, and watched what store associates did. Our assumptions were wrong. We had planned a toolkit for deciding whether to restock, ship to a warehouse, or courier between stores, and the associates did not care about any of it. They wanted the return done fast. The persona changed on the strength of that research and the product became a QR code and a short, seamless flow.",
    outcome:
      "82,000 additional returns processed across 197 merchants. We sunset it on purpose once it had done its job, instead of keeping it alive out of sunk cost.",
    tags: ["iOS", "Point of sale", "Field research", "Retail"],
  },
];

/* -------------------------------------------------- competencies ------- */

export interface Competency {
  name: string;
  glyph: string;
  /** What the bar actually means, in plain terms. */
  meaning: string;
  /** Concrete things that happened, not adjectives. */
  evidence: string[];
}

/**
 * The senior / staff / tech-lead case, made with evidence instead of
 * adjectives. Each row is a competency, what it means, and what actually
 * happened.
 *
 * Deliberately no performance-review ratings or manager quotes: those come
 * out of private HR documents, and citing your own review on a public page
 * reads as boasting even when it's true. The work stands on its own.
 */
export const competencies: Competency[] = [
  {
    name: "System design ownership",
    glyph: "📐",
    meaning: "Owning the architecture of a real slice of the system, not just the tickets inside it.",
    evidence: [
      "Designed the Carrier Choice interface a full year before the build, and it never needed to change through a PRD, a formal spec, and implementation.",
      "Owns two domain modules end to end, each built layer by layer, with boundaries the tooling enforces so nobody has to remember them.",
      "Caught an architectural violation mid-build and went back and fixed the foundation before building on top of it.",
    ],
  },
  {
    name: "Turning ambiguity into a plan",
    glyph: "🧭",
    meaning: "Taking a vague problem and coming back with a sequenced, de-risked plan, without being told what shape it should be.",
    evidence: [
      "Ran a discovery and audit phase before writing any schema for label customizations, and published a written library assessment with a reproducible test harness first.",
      "Authored a full migration execution plan for a platform I did not own: abstract, risks, named tech debt, three phases, and a timeline.",
      "Root-caused why a cancelled feature had failed, then came back a year later with a different design that shipped.",
    ],
  },
  {
    name: "Documented technical judgment",
    glyph: "⚖️",
    meaning: "Making real tradeoffs and writing down the options you rejected, so the next person inherits the reasoning.",
    evidence: [
      "Weighed a decorator seam against caller orchestration and wrote down why neither fit, so the decision is not a mystery later.",
      "Required a security review before adopting a third-party label library, and insisted on self-hosting because those labels can carry customer data.",
      "Kept the design docs from a cancelled attempt on record so the successor explicitly supersedes them.",
      "Talked a team out of a full data importer between two structurally different systems, shipped the smallest thing that would test the assumption instead, and turned three months of planned work into two days. Nobody ever used the feature, which was the answer we needed.",
    ],
  },
  {
    name: "Influence across team boundaries",
    glyph: "🤝",
    meaning: "Changing what another team believes it owns, by arguing it, not by outranking anyone.",
    evidence: [
      "Argued that shipping should not own destination routing at all, absorbed live pushback, made the counter-case, and got the room to commit to a decision.",
      "Followed it through to an actual handoff with a technical design and a recorded walkthrough, not just a meeting that went well.",
      "Posted schema changes to other teams before merging and explicitly invited objections while the change was still cheap.",
    ],
  },
  {
    name: "Operational ownership",
    glyph: "🚨",
    meaning: "Owning what happens when the thing you built breaks at 2am, not only whether it shipped.",
    evidence: [
      "Roughly a quarter of hands-on ticket load is support for my own domain, and it spikes right after my own launches because I pick it up.",
      "Ran the release train end to end: monitoring, coordinating merges, working pipeline failures with infra, clean handoff.",
      "Led a carrier incident through investigation, stakeholder comms, and a completed root-cause analysis before closing it out.",
      "As a manager, defined support SLAs by severity and built the dashboards that made them visible, so response and resolution targets were measured.",
    ],
  },
  {
    name: "Systems at scale",
    glyph: "⚙️",
    meaning:
      "Building things that stay correct under load, across services you do not control, and while data is moving underneath you.",
    evidence: [
      "Remediated roughly 37,800 shipping labels by reworking a job that processed a whole merchant at once into batches of 100, sized against the timeouts we actually saw and not a number that looked tidy.",
      "Added deliberate backoff against a third-party rate limit, and leaned on existing idempotency guards so a partial re-run could not double-process anything.",
      "Moved a synchronous side effect onto an async listener with a no-op guard, restoring the event-driven boundary a new feature was about to be built on top of.",
      "Planned a three-integration platform migration across SOAP, REST, and GraphQL back ends, with a parallel-run period, a rollback plan, and success criteria defined before starting.",
      "Held a product area at 99.99% uptime as its engineering manager, and shipped an in-store returns app across 197 merchants.",
    ],
  },
  {
    name: "Decomposition at scale",
    glyph: "🧩",
    meaning: "Breaking a multi-month initiative into shippable, individually reversible pieces.",
    evidence: [
      "A feature shipped as seven independently mergeable, flag-gated slices, with one throwaway draft used purely to preview the whole stack first.",
      "Observability split into three changes that each ship on their own.",
      "Feature flags added, verified in production, then deleted in a dedicated follow-up so they never rot into permanent complexity.",
    ],
  },
  {
    name: "Quality as a system",
    glyph: "🧪",
    meaning:
      "Making quality something the process produces, so it does not depend on individuals remembering.",
    evidence: [
      "Turned testing coverage into a tracked program across three codebases, moving two of them 13 and 15 points in a year. Before that it was a number nobody owned.",
      "Wrote a Definition of Ready and separate Definitions of Done for features and tickets, so 'done' meant observability added, regression tests passing, and compliance documented, not 'it works on my branch'.",
      "Scheduled break-it weeks into the delivery timeline, pairing manual and automated testing so critical bugs surfaced before release.",
      "Built and instrumented the release process, automating release naming and tracking commit-to-deploy time, so delivery health was a number we could look at.",
      "I treat what a system should do and what it should be as two separate questions, and I measure the second one as carefully as the first.",
    ],
  },
  {
    name: "Multiplying other engineers",
    glyph: "🌱",
    meaning: "Raising the bar for people who are not you: review depth, tooling, standards others adopt.",
    evidence: [
      "Consistently the team's highest-volume code reviewer, and the one leaving real comments, not just approvals.",
      "Proposed a dry-run-first standard for any script touching production data, built the templates, and engineers on other teams used them.",
      "Built self-serve internal tooling that took engineering out of a recurring support loop entirely, then followed up to check people were using it.",
      "As a manager, built the mentorship program that got four junior engineers promoted early.",
    ],
  },
  {
    name: "Written communication",
    glyph: "📝",
    meaning: "Documents that let someone else pick the work up without booking a meeting.",
    evidence: [
      "Three design documents across one project's life, each tighter than the last as ambiguity resolved.",
      "Formal design and decision records attached to every sub-ticket of a cross-cutting initiative.",
      "A written handoff doc, branch and commits and reviewer status included, for a teammate taking over mid-stream.",
    ],
  },
];

/* -------------------------------------------------- numbers ------------ */

export interface Stat {
  label: string;
  value: string;
  hint?: string;
}

/*
 * Only numbers with a real source behind them, and only ones that mean
 * something to someone outside the company. Domain-specific volume metrics
 * ("labels remediated") and internal productivity dashboards read as jargon
 * to a recruiter, so they live in the evidence section where there is room
 * to explain them, not in a hero tile that has to land in two seconds.
 */
export const stats: Stat[] = [
  { label: "Years shipping software", value: "10+", hint: "Healthcare, then commerce" },
  { label: "Uptime held", value: "99.99%", hint: "Across a full product area" },
  { label: "Fewer bug tickets", value: "80%", hint: "After paying down the debt behind them" },
  { label: "Prototypes shipped", value: "16 of 22", hint: "Hackathon builds that became real features" },
];

/* -------------------------------------------------- contact ------------ */

export interface ContactLink {
  label: string;
  value: string;
  href: string;
  icon: "feedback" | "share" | "address" | "phone";
  external?: boolean;
}

export const contactLinks: ContactLink[] = [
  {
    label: "Email",
    value: "sabacareer@proton.me",
    href: "mailto:sabacareer@proton.me",
    icon: "feedback",
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/sabawilhelm",
    href: "https://www.linkedin.com/in/sabawilhelm",
    icon: "share",
    external: true,
  },
  {
    label: "Location",
    value: "Kansas City, MO · Remote",
    href: "#",
    icon: "address",
  },
];

export interface Degree {
  degree: string;
  school: string;
}

/*
 * Deliberately no graduation years and no campus locations.
 *
 * A graduation year is an age proxy and a campus location is a
 * national-origin proxy. Both are well-documented screening biases, and
 * neither says anything about whether someone can do the job. The degree
 * and the institution carry all the signal that matters.
 */
export const education: Degree[] = [
  {
    degree: "Masters in Computer Science",
    school: "Illinois Institute of Technology",
  },
];
