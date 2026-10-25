import ownerImg from "@/assets/owner.jpg";
import novaImg from "@/assets/proj-nova.jpg";
import habitatImg from "@/assets/proj-habitat.jpg";
import fleetlyImg from "@/assets/proj-fleetly.jpg";
import medioImg from "@/assets/proj-medio.jpg";

export { ownerImg };

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type ProjectStatus = "ongoing" | "completed";
export type PreviewKind = "browser" | "terminal" | "phone";

export type Project = {
  id: string;
  slug: string;
  name: string;
  monogram: string;
  tagline: string;
  category: string;
  status: ProjectStatus;
  year: string;
  role: string;
  client: string;
  stack: string[];
  liveUrl?: string;
  githubUrl?: string;
  appStoreUrl?: string;
  googlePlayUrl?: string;
  cover?: string;
  preview: PreviewKind;
  domain: string;
  startDate?: string;
  endDate?: string;
  seoTitle?: string;
  seoDesc?: string;
  description: string;
  challenge: string;
  solution: string;
  features: string[];
  results: { value: string; label: string }[];
  featured?: boolean;
};

export type Service = {
  name: string;
  slug: string;
  icon: string;
  visible?: boolean;
  short: string;
  description: string;
  features: string[];
  tech: string[];
  ctaLabel?: string;
  ctaUrl?: string;
  featured?: boolean;
  order?: number;
};

export type Article = {
  slug: string;
  title: string;
  category: string;
  hue: "gold" | "cyan" | "jade" | "sky";
  excerpt: string;
  date: string;
  read: string;
  tags: string[];
  body: (string | string[])[];
  published?: boolean;
  cover?: string;
};

export type Experience = {
  period: string;
  role: string;
  company: string;
  location: string;
  description: string;
  tech: string[];
};

export type Testimonial = {
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
  published?: boolean;
  photo?: string;
  project?: string;
};

export type Tech = { name: string; category: string; level: number; note: string };
export type Stat = { value: number; suffix: string; label: string };
export type LegalItem = { h: string; p: string };
export type ContactChannel = { icon: string; label: string; value: string; href: string; sub: string };

export type LeadStatus = "New" | "Contacted" | "Qualified" | "Proposal" | "Won" | "Lost";
export const LEAD_STATUSES: LeadStatus[] = ["New", "Contacted", "Qualified", "Proposal", "Won", "Lost"];

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  type: string;
  budget: string;
  timeline: string;
  description: string;
  attachment: string;
  source: string;
  date: string;
  status: LeadStatus;
  notes: string;
};

export type Activity = { id: string; time: string; text: string };

export type HeroContent = {
  badge: string;
  headlinePrefix: string;
  headlineAccent: string;
  sub: string;
  cta1: string;
  cta2: string;
};

export type SectionKey =
  | "intro"
  | "expertise"
  | "tech"
  | "projects"
  | "services"
  | "process"
  | "stats"
  | "experience"
  | "testimonials"
  | "insights"
  | "cta"
  | "channels";

/* ------------------------------------------------------------------ */
/* Profile & contact                                                   */
/* ------------------------------------------------------------------ */

export const PROFILE = {
  name: "Wuese Philip",
  monogram: "WP",
  role: "Full-Stack Software Engineer",
  designation: "SaaS Builder · Product Engineer · Technical Consultant",
  email: "hello@alexrivera.dev",
  phone: "+49 30 1234 5678",
  whatsapp: "https://wa.me/493012345678",
  calendly: "https://calendly.com/alexrivera/consultation",
  location: "Berlin, Germany",
  responseTime: "Replies within 24 hours",
  portrait: ownerImg.src,
  footerBio: "Full-stack software engineer building SaaS platforms, marketplaces and business applications — from first commit to long-term maintenance.",
};

export const SOCIALS = [
  { label: "LinkedIn", url: "https://www.linkedin.com/in/alexrivera" },
  { label: "GitHub", url: "https://github.com/alexrivera" },
  { label: "X / Twitter", url: "https://x.com/alexrivera" },
  { label: "Telegram", url: "https://t.me/alexrivera" },
];

export const MARQUEE_ITEMS = [
  "Next.js",
  "TypeScript",
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "PostgreSQL",
  "MySQL",
  "Redis",
  "Docker",
  "Stripe",
  "GraphQL",
  "AWS",
  "Tailwind CSS",
];

/* ------------------------------------------------------------------ */
/* Homepage content                                                    */
/* ------------------------------------------------------------------ */

export const HERO_DEFAULT: HeroContent = {
  badge: "Available for new projects — Q4 2026",
  headlinePrefix: "I build software that turns ideas into",
  headlineAccent: "digital products.",
  sub: "Full-stack engineer with 7 years shipping SaaS platforms, marketplaces and business applications end to end — from architecture and database design to polished, production-ready interfaces.",
  cta1: "Start a Project",
  cta2: "Explore My Work",
};

export const INTRO = {
  kicker: "About",
  title: "More than a programmer.",
  pull: "I don't just write code. I build digital products and technology solutions.",
  paragraphs: [
    "For the past seven years I've helped founders, startups and established businesses turn rough ideas into products people pay for. I sit at the intersection of engineering and product thinking — which means I care as much about the business problem as the database schema.",
    "My work spans the full stack: system architecture and API design, secure backend systems in Next.js and Node, database design, payment integrations, deployment pipelines — and the front-end experience that makes all of it feel effortless.",
    "Whether you need a single well-scoped feature or a complete platform built from zero, the outcome is the same: a product that is reliable, maintainable, and built to grow with your business.",
  ],
  checklist: [
    "Business problem → system architecture",
    "API design & database architecture",
    "Integrations: payments, auth, email, 3rd-party",
    "Deployment, monitoring & long-term maintenance",
  ],
};

export const EXPERTISE = [
  {
    icon: "code",
    title: "Software Engineering",
    items: ["Full-Stack Development", "Backend Development", "API Development", "Database Architecture", "System Architecture"],
  },
  {
    icon: "box",
    title: "Product Development",
    items: ["SaaS Platforms", "MVP Development", "Business Applications", "Marketplace Platforms", "Digital Products"],
  },
  {
    icon: "plug",
    title: "Integrations",
    items: ["Payment Gateways", "Third-Party APIs", "Authentication", "Email Systems", "External Services"],
  },
  {
    icon: "server",
    title: "Infrastructure",
    items: ["Deployment & CI/CD", "Git Workflow", "Docker", "Server Configuration", "Application Maintenance"],
  },
];

export const TECH_STACK: Tech[] = [
  { name: "Next.js / TypeScript", category: "Full stack", level: 95, note: "7 yrs" },
  { name: "JavaScript / TypeScript", category: "Frontend", level: 92, note: "7 yrs" },
  { name: "React", category: "Frontend", level: 90, note: "6 yrs" },
  { name: "Next.js", category: "Frontend", level: 86, note: "5 yrs" },
  { name: "Node.js", category: "Backend", level: 88, note: "6 yrs" },
  { name: "MySQL", category: "Database", level: 92, note: "7 yrs" },
  { name: "PostgreSQL", category: "Database", level: 88, note: "6 yrs" },
  { name: "Redis", category: "Caching", level: 82, note: "5 yrs" },
  { name: "Docker", category: "DevOps", level: 80, note: "5 yrs" },
  { name: "Git", category: "DevOps", level: 95, note: "9 yrs" },
  { name: "REST & GraphQL APIs", category: "APIs", level: 93, note: "7 yrs" },
  { name: "Stripe & Payment APIs", category: "APIs", level: 87, note: "6 yrs" },
  { name: "Tailwind CSS", category: "Frontend", level: 90, note: "5 yrs" },
  { name: "AWS", category: "DevOps", level: 76, note: "4 yrs" },
];

export const PROJECTS_SEED: Project[] = [
  {
    id: "p1",
    slug: "novapay",
    name: "NovaPay",
    monogram: "NP",
    tagline: "Billing & payments platform for B2B SaaS companies.",
    category: "SaaS",
    status: "completed",
    year: "2024",
    role: "Lead Full-Stack Engineer",
    client: "NovaPay GmbH",
    stack: ["Next.js", "React", "PostgreSQL", "Stripe", "Redis"],
    liveUrl: "https://novapay.example.com",
    githubUrl: "https://github.com/alexrivera/novapay",
    cover: novaImg.src,
    preview: "browser",
    domain: "app.novapay.io",
    description:
      "A multi-tenant billing and payments platform handling subscriptions, invoices and dunning for over 3,000 B2B customers. I led the full rebuild of the platform from a legacy monolith to a modern Next.js + React stack with Stripe as the payment backbone.",
    challenge:
      "The legacy system processed invoices in batches overnight, billing errors were found by customers rather than the team, and adding a new payment method took weeks of fragile work.",
    solution:
      "I designed an event-driven billing core: every charge, refund and subscription change flows through a single command pipeline with idempotency keys, webhooks are reconciled automatically, and a React dashboard gives finance teams live visibility into cash flow.",
    features: [
      "Multi-tenant subscriptions with usage-based billing",
      "Stripe + PayPal + SEPA direct debit",
      "Automatic dunning and revenue recovery flows",
      "Real-time revenue dashboard with anomaly alerts",
    ],
    results: [
      { value: "-42%", label: "Failed payments" },
      { value: "3,000+", label: "Active customers" },
      { value: "99.98%", label: "Billing uptime" },
    ],
    featured: true,
  },
  {
    id: "p2",
    slug: "habitat-market",
    name: "Habitat Market",
    monogram: "HM",
    tagline: "Multi-vendor marketplace for home & interior brands.",
    category: "Marketplaces",
    status: "ongoing",
    year: "2025 — now",
    role: "Technical Lead",
    client: "Habitat GmbH",
    stack: ["Next.js", "TypeScript", "MySQL", "Redis", "S3"],
    liveUrl: "https://habitatmarket.example.com",
    githubUrl: "https://github.com/alexrivera/habitat-market",
    cover: habitatImg.src,
    preview: "browser",
    domain: "habitatmarket.eu",
    description:
      "A growing B2C marketplace connecting 400+ independent interior brands with buyers across DACH. I lead the platform team: vendor onboarding, catalogue search, order routing and the split-payment settlement engine.",
    challenge:
      "Marketplaces fail on the boring parts: search quality at vendor scale, reliable order routing between sellers, and payment settlement that vendors can actually audit.",
    solution:
      "I'm building a faceted Elasticsearch-free search layer on Postgres full-text with tuned ranking, a deterministic order-routing service, and a settlement ledger where every cent a vendor earns is traceable to an invoice.",
    features: [
      "Vendor onboarding with automated KYC",
      "Faceted catalogue search at 200k+ SKUs",
      "Split payments with per-vendor settlement ledger",
      "Real-time order routing & logistics handoff",
    ],
    results: [
      { value: "400+", label: "Active vendors" },
      { value: "200k+", label: "Products indexed" },
      { value: "€4.2M", label: "GMV run-rate" },
    ],
    featured: true,
  },
  {
    id: "p3",
    slug: "fleetly",
    name: "Fleetly",
    monogram: "FL",
    tagline: "Fleet & logistics operations platform for delivery companies.",
    category: "Business Platforms",
    status: "completed",
    year: "2023",
    role: "Software Engineer",
    client: "Fleetly Logistics BV",
    stack: ["Next.js", "React", "PostgreSQL", "WebSockets", "Mapbox"],
    liveUrl: "https://fleetly.example.com",
    githubUrl: "https://github.com/alexrivera/fleetly",
    cover: fleetlyImg.src,
    preview: "browser",
    domain: "ops.fleetly.app",
    description:
      "An operations dashboard used by dispatchers to plan routes, track 1,200+ vehicles in real time and manage driver shifts. Built for a logistics company outgrowing spreadsheets and whiteboards.",
    challenge:
      "Dispatchers were juggling four tools and a phone tree. Live vehicle positions arrived over 30 websockets per dispatcher terminal, and the old map UI froze at 500 tracked points.",
    solution:
      "I built a Next.js backend with a WebSocket broadcast layer and a React map front-end that virtualizes vehicle markers, batching telemetry into 5-second windows. Route planning moved from 25 minutes per shift to under 6.",
    features: [
      "Real-time vehicle tracking over WebSockets",
      "Drag-and-drop shift & route planning",
      "Driver mobile companion with offline mode",
      "Operational KPIs: on-time rate, load factor, costs",
    ],
    results: [
      { value: "-61%", label: "Planning time" },
      { value: "1,200+", label: "Vehicles tracked" },
      { value: "12", label: "Cities covered" },
    ],
    featured: true,
  },
  {
    id: "p4",
    slug: "medio-health",
    name: "Medio Health",
    monogram: "MH",
    tagline: "Patient portal & scheduling for private clinic groups.",
    category: "Web Applications",
    status: "ongoing",
    year: "2025 — now",
    role: "Senior Backend Engineer",
    client: "Medio Health Group",
    stack: ["Next.js", "React", "MySQL", "Queue Workers", "SMTP APIs"],
    liveUrl: "https://medio.health.example.com",
    githubUrl: "https://github.com/alexrivera/medio-health",
    cover: medioImg.src,
    preview: "browser",
    domain: "portal.medio.health",
    description:
      "A GDPR-compliant patient portal for a 12-clinic group: appointments, e-prescriptions, lab results and secure messaging, plus a staff console for clinicians. Currently in rollout across the clinic network.",
    challenge:
      "Healthcare software lives or dies on trust: strict GDPR, audit logging on every record access, and zero tolerance for a patient seeing someone else's results.",
    solution:
      "I architected a row-level scoped data layer where tenant isolation is enforced at the query level, every access is written to an immutable audit log, and all third-party communication (email, SMS) flows through signed, retried queue jobs.",
    features: [
      "GDPR-compliant patient data vault with audit trail",
      "Clinician console with smart scheduling rules",
      "Secure patient messaging & e-prescriptions",
      "Automatic reminders over email and SMS",
    ],
    results: [
      { value: "12", label: "Clinics in rollout" },
      { value: "-38%", label: "No-show rate" },
      { value: "0", label: "Data incidents" },
    ],
    featured: true,
  },
  {
    id: "p5",
    slug: "relay-api",
    name: "Relay API",
    monogram: "RA",
    tagline: "Real-time messaging & notifications API for product teams.",
    category: "APIs",
    status: "completed",
    year: "2022",
    role: "Founder / Engineer",
    client: "Self-initiated",
    stack: ["Node.js", "PostgreSQL", "Redis", "WebSockets", "Docker"],
    githubUrl: "https://github.com/alexrivera/relay-api",
    preview: "terminal",
    domain: "api.relayapi.dev",
    description:
      "A developer-facing API that gives product teams reliable in-app messaging, email and push notifications behind one endpoint. Rate-limited, versioned, and documented — the kind of API I wish existed when I built my first SaaS.",
    challenge:
      "Teams waste weeks wiring three notification providers, handling retries, and chasing delivery guarantees. The API had to make that boring to use.",
    solution:
      "One POST endpoint, provider-agnostic delivery pipelines, automatic retries with exponential backoff, and delivery webhooks. Ships as a single Docker container and a typed SDK for Node and TypeScript.",
    features: [
      "Unified in-app / email / push delivery",
      "Automatic retries & delivery webhooks",
      "Usage-based metering & API keys",
      "Typed SDKs for Node.js and TypeScript",
    ],
    results: [
      { value: "2.1M", label: "Messages / month" },
      { value: "99.99%", label: "Delivery rate" },
      { value: "140+", label: "Teams using it" },
    ],
  },
  {
    id: "p6",
    slug: "pawmate",
    name: "Pawmate",
    monogram: "PM",
    tagline: "Companion app for pet clinics, sitters and groomers.",
    category: "Mobile Applications",
    status: "completed",
    year: "2022",
    role: "Full-Stack Developer",
    client: "Pawmate UG",
    stack: ["React Native", "Node.js", "MySQL", "FCM", "Stripe"],
    githubUrl: "https://github.com/alexrivera/pawmate",
    preview: "phone",
    domain: "pawmate.pet",
    description:
      "A booking and care-log app connecting pet owners with local clinics, sitters and groomers. I built the entire product: React Native client, booking engine, payments and the review system.",
    challenge:
      "Local services apps fail on trust and no-shows. Pet owners needed verifiable reviews; providers needed deposits to protect their schedule.",
    solution:
      "Verified booking profiles, Stripe deposit flows for no-show protection, and a care log that travels with the pet between providers. Shipped to both app stores within five months.",
    features: [
      "Verified provider profiles & reviews",
      "Deposit-based booking with Stripe",
      "Shared pet care log across providers",
      "Push scheduling & reminders",
    ],
    results: [
      { value: "30k+", label: "Downloads" },
      { value: "4.7★", label: "Store rating" },
      { value: "-52%", label: "No-shows" },
    ],
  },
];

export const SERVICES: Service[] = [
  {
    name: "Software Development",
    slug: "software-development",
    icon: "code",
    short: "Custom web applications and business platforms built to last.",
    description:
      "Complete web applications designed around your business processes — internal tools, customer portals, admin systems. Clean architecture, automated tests, and documentation your team can actually maintain.",
    features: ["Custom web applications", "Customer & admin portals", "Internal business tools", "Legacy modernization"],
    tech: ["Next.js", "React", "PostgreSQL", "Docker"],
  },
  {
    name: "SaaS Development",
    slug: "saas-development",
    icon: "layers",
    short: "Subscription-based software products, from architecture to billing.",
    description:
      "Multi-tenant SaaS platforms with the hard parts solved: tenant isolation, subscription and usage-based billing, role-based access, and infrastructure that scales from 10 to 100,000 users without rewrites.",
    features: ["Multi-tenant architecture", "Subscription & usage billing", "Role-based access control", "Growth-ready infrastructure"],
    tech: ["Next.js", "TypeScript", "Stripe", "Redis"],
  },
  {
    name: "API & Backend Development",
    slug: "api-backend",
    icon: "api",
    short: "Secure backend systems and APIs that other products can build on.",
    description:
      "Versioned, documented APIs with authentication, rate limiting and observability baked in. Whether it powers your front-end, a mobile app or partner integrations — the backend should be the most boring part of your stack.",
    features: ["REST & GraphQL APIs", "Auth, scopes & rate limiting", "Webhooks & event streams", "API documentation & SDKs"],
    tech: ["Node.js", "Next.js", "PostgreSQL", "GraphQL"],
  },
  {
    name: "Marketplace Development",
    slug: "marketplace",
    icon: "cart",
    short: "Multi-vendor platforms with the settlement engine done right.",
    description:
      "Marketplaces live or die on vendor trust. I build the full loop: onboarding and KYC, catalogue and search, order routing, and a settlement ledger where every cent a vendor earns is traceable.",
    features: ["Vendor onboarding & KYC", "Catalogue & faceted search", "Order routing engines", "Split payments & settlements"],
    tech: ["Next.js", "Elasticsearch", "Stripe Connect", "Redis"],
  },
  {
    name: "Mobile Application Development",
    slug: "mobile",
    icon: "phone",
    short: "Cross-platform mobile apps and companion applications.",
    description:
      "React Native applications that share your backend logic, push reliably, and work offline when the network doesn't. Ideal as companion apps to existing web products.",
    features: ["iOS & Android from one codebase", "Offline-first data sync", "Push notification architecture", "App store release management"],
    tech: ["React Native", "Node.js", "FCM / APNs"],
  },
  {
    name: "Payment Integration",
    slug: "payments",
    icon: "card",
    short: "Gateways, recurring billing and financial workflows that never lose a cent.",
    description:
      "Idempotent charge pipelines, webhook reconciliation, dunning and refund automation. I treat money movement like it's on fire — because it is. Audited, tested, and documented to the penny.",
    features: ["Stripe, PayPal & SEPA", "Recurring & usage-based billing", "Webhook reconciliation", "Refund & dispute workflows"],
    tech: ["Stripe", "PayPal", "SEPA", "Ledger design"],
  },
  {
    name: "System Architecture",
    slug: "architecture",
    icon: "blueprint",
    short: "Technical architecture for complex applications and teams.",
    description:
      "Architecture reviews, data modeling and technology strategy for products outgrowing their foundations. You get a written architecture decision record, a migration plan, and a team that understands why.",
    features: ["Architecture reviews & ADRs", "Database modeling & migration", "Performance & scaling plans", "Technology strategy"],
    tech: ["System design", "PostgreSQL", "Kafka (where it earns it)", "AWS"],
  },
  {
    name: "MVP Development",
    slug: "mvp",
    icon: "bolt",
    short: "Idea to validated product in weeks, not quarters.",
    description:
      "Ruthlessly scoped MVPs that test the riskiest assumption first. I build fast, but I build on foundations — the goal is to not throw the codebase away when the product takes off.",
    features: ["Scope to the core hypothesis", "4–8 week delivery windows", "Foundations that scale", "Post-launch roadmap"],
    tech: ["Next.js", "React", "Tailwind", "Docker"],
  },
];

export const PROCESS = [
  { num: "01", title: "Discovery", text: "Understand the business, users and objectives. What problem are we actually solving, and how will we know it's solved?" },
  { num: "02", title: "Strategy", text: "Define requirements, architecture and technology. A written plan you can hold me to." },
  { num: "03", title: "Design", text: "Create the user experience and interface — functional, clear, and consistent with your brand." },
  { num: "04", title: "Development", text: "Build, integrate and test the product in weekly increments. You see progress every week, not at the end." },
  { num: "05", title: "Launch", text: "Deploy with monitoring, error tracking and rollback safety. Go live is a checkpoint, not a cliff." },
  { num: "06", title: "Improve", text: "Maintain, monitor and continuously improve based on real usage data. The product is a living system." },
];

export const STATS: Stat[] = [
  { value: 8, suffix: "+", label: "Years of Experience" },
  { value: 60, suffix: "+", label: "Projects Delivered" },
  { value: 40, suffix: "+", label: "Clients & Partners" },
  { value: 25, suffix: "+", label: "Technologies Mastered" },
  { value: 6, suffix: "", label: "Products Shipped to Market" },
];

export const EXPERIENCE: Experience[] = [
  {
    period: "2022 — Present",
    role: "Senior Full-Stack Engineer",
    company: "Northwind Labs",
    location: "Berlin",
    description: "Leading engineering on a multi-tenant SaaS suite: billing, tenant architecture and a React design system used by four product teams.",
    tech: ["Next.js", "React", "PostgreSQL", "AWS"],
  },
  {
    period: "2020 — 2022",
    role: "Full-Stack Developer",
    company: "Stackline GmbH",
    location: "Hamburg",
    description: "Built and shipped the company's flagship logistics platform from MVP to 1,200 tracked vehicles. First engineer hire after the founding team.",
    tech: ["Next.js", "Node.js", "WebSockets", "Docker"],
  },
  {
    period: "2018 — 2020",
    role: "Software Developer",
    company: "Kite & Co",
    location: "Copenhagen",
    description: "Delivered 20+ client projects: web apps, e-commerce, integrations. Learned that most 'technical' problems are scope problems in disguise.",
    tech: ["TypeScript", "JavaScript", "MySQL", "Vue"],
  },
  {
    period: "2016 — 2018",
    role: "Junior Web Developer",
    company: "Pixelwerk",
    location: "Munich",
    description: "Cut my teeth on agency work: WordPress, landing pages, and 4 a.m. launches. Where the discipline for deadlines was built.",
    tech: ["TypeScript", "WordPress", "jQuery", "CSS"],
  },
];

export const TESTIMONIALS_SEED: Testimonial[] = [
  {
    name: "Mara Lindqvist",
    role: "CEO",
    company: "NovaPay GmbH",
    quote:
      "Alex rebuilt our billing engine while it was live, processing millions in monthly volume. Zero incidents, zero lost invoices. The kind of engineer you build a company around.",
    rating: 5,
  },
  {
    name: "Daniel Okafor",
    role: "Founder",
    company: "Fleetly Logistics",
    quote:
      "He didn't just build the dashboard — he redesigned how our dispatchers work. Planning a shift went from 25 minutes to 6. That's the difference between a developer and a product engineer.",
    rating: 5,
  },
  {
    name: "Sofia Marchetti",
    role: "COO",
    company: "Medio Health Group",
    quote:
      "Healthcare means zero margin for error. Alex built compliance into the architecture instead of bolting it on. Our auditors were impressed, which never happens.",
    rating: 5,
  },
  {
    name: "Jonas Weber",
    role: "CTO",
    company: "Habitat GmbH",
    quote:
      "We've worked with agencies and freelancers for a decade. Alex is the first one who pushed back on the roadmap to save us from ourselves — and was right every time.",
    rating: 5,
  },
];

export const ARTICLES: Article[] = [
  {
    slug: "saas-mvps-fail",
    title: "Why most SaaS MVPs fail before launch (and the 3 that saved mine)",
    category: "Product Development",
    hue: "gold",
    excerpt:
      "After shipping six products to market, I've seen the same three patterns kill MVPs: building features instead of hypotheses, underestimating the billing complexity, and no exit strategy for technical debt.",
    date: "Aug 04, 2026",
    read: "7 min read",
    tags: ["SaaS", "MVP", "Product"],
    body: [
      "Every failed MVP I've dissected dies the same way: the team built a product, but never an experiment. The code is rarely the problem — the missing hypothesis is.",
      [
        "1. Build the hypothesis, not the feature list.",
        "2. Charge real money before writing real code.",
        "3. Pick the stack for the next 18 months, not the first 6 weeks.",
      ],
      "The billing pattern deserves its own warning. Teams scope 'payments' as a form field and discover in month three that subscriptions, proration, dunning and refunds are their own engineering discipline. If your MVP has recurring revenue, budget 20% of the build for it. You will use every hour.",
      "None of this means 'never build.' It means build the thing that would prove you wrong fastest. Every product I've shipped that survived launch was the one where we were closest to being embarrassed by our own assumption.",
    ],
  },
  {
    slug: "apis-that-document-themselves",
    title: "Designing APIs that don't need documentation",
    category: "Software Engineering",
    hue: "cyan",
    excerpt:
      "Good documentation is a symptom of a good API. When endpoints are self-evident, error messages are instructions, and consistency is enforced, the docs become a changelog instead of a manual.",
    date: "Jul 12, 2026",
    read: "6 min read",
    tags: ["APIs", "Backend", "DX"],
    body: [
      "I've interviewed for roles where the first take-home was 'integrate our API.' The best engineers I've hired finished in under an hour. Not because they were faster — because the API respected them.",
      "An API that documents itself has four properties: predictable resource naming, errors that tell you what to do next (not just what went wrong), consistent pagination and filtering, and idempotency where it matters. Boring on purpose.",
      [
        "Error: payment_method_invalid — 'Card was declined. Ask the customer to retry with a different card or update it via POST /customers/:id/payment_method.'",
        "GET /invoices?status=failed&from=2026-06-01&to=2026-07-01&page=2",
      ],
      "The second property is the one teams skip. A status code and 'Internal error' is a shrug. An error that names the fix converts your support queue into a self-service flow. I've measured it: clear error copy cut our support tickets by a third.",
      "Write the API your worst-day on-call wants to read at 3 a.m. If it reads well there, it reads well everywhere.",
    ],
  },
  {
    slug: "postgres-mysql-2026",
    title: "PostgreSQL vs MySQL in 2026: a pragmatic take",
    category: "Technology",
    hue: "jade",
    excerpt:
      "Both are excellent. The interesting question isn't which is better — it's which failure modes you can't recover from, and which hire will maintain your choice in five years.",
    date: "Jun 21, 2026",
    read: "8 min read",
    tags: ["PostgreSQL", "MySQL", "Databases"],
    body: [
      "I've run both in production for years: MySQL on logistics fleets taking 5,000 writes a second, Postgres on a multi-tenant SaaS with 40 custom fields per tenant. My honest position: both are right 95% of the time.",
      "The decision usually resolves to three questions. What shape is your data — relational with JSON islands, or relational with heavy array/geometric types? Who maintains it in five years — your senior engineer, or the next hire you find on LinkedIn? And what will you regret — replication pain, or schema rigidity?",
      [
        "Postgres when: multi-tenant SaaS, JSONB flexibility, full-text search, one-database-answers-everything pragmatism.",
        "MySQL when: classic transactional workloads, a strong ops culture already in place, or the team knows it cold.",
      ],
      "The real risk in both cases isn't the engine — it's migrating away later. Keep your domain logic out of stored procedures, your IDs portable, and your migrations reversible. The database should be the least exciting decision on your architecture diagram.",
    ],
  },
  {
    slug: "monolith-first",
    title: "Monolith first: why I rarely let startups 'plan' for scale",
    category: "SaaS",
    hue: "sky",
    excerpt:
      "Most startup infrastructure is a monument to problems that don't exist yet. A well-structured monolith with clean module boundaries will embarrass a premature microservice architecture at 10x the traffic.",
    date: "May 30, 2026",
    read: "5 min read",
    tags: ["Architecture", "Scaling", "Next.js"],
    body: [
      "I've been asked to 'design a scalable architecture' on day one of projects with four users. Here's what I tell them: at that scale, your scalability problem is a feature-priority problem wearing a costume.",
      "A modular monolith gives you the structure of a microservice world — enforced boundaries, per-module ownership, clean APIs between modules — with the operational cost of a single deploy. When a module genuinely needs to scale or be owned by a different team, you extract it. The boundary was already there.",
      "The exceptions are real but narrow: teams with 50+ engineers who can't coordinate a monolith deploy, workloads with wildly different scaling curves (real-time streaming next to CRUD), or compliance walls that require separate trust domains. If you don't match those, 'microservices' is a luxury you pay for in on-call misery.",
      "Boring architecture is a feature. The most impressive thing an engineering org can do at 50,000 users is deploy a monolith on a Friday and have nothing happen.",
    ],
  },
];

export const PROJECT_TYPES = [
  "SaaS Platform",
  "Web Application",
  "Marketplace",
  "Mobile App",
  "API / Backend",
  "MVP",
  "Payment Integration",
  "Support / Maintenance",
  "Other",
];

export const BUDGET_RANGES = ["Under €10k", "€10k — €25k", "€25k — €50k", "€50k+", "Not sure yet"];
export const TIMELINES = ["ASAP", "1 — 3 months", "3 — 6 months", "6+ months", "Flexible"];
export const SOURCES = ["Google", "LinkedIn", "X / Twitter", "GitHub", "Referral", "Other"];

export const CONTACT_CHANNELS: ContactChannel[] = [
  { icon: "mail", label: "Email", value: PROFILE.email, href: `mailto:${PROFILE.email}`, sub: "For detailed briefs & proposals" },
  { icon: "phoneCall", label: "Phone", value: PROFILE.phone, href: `tel:${PROFILE.phone.replace(/\s/g, "")}`, sub: "Mon – Fri, 9:00 – 18:00 CET" },
  { icon: "phone", label: "WhatsApp", value: "Message directly", href: PROFILE.whatsapp, sub: "Fastest for quick questions" },
  { icon: "calendar", label: "Calendly", value: "Book a 30-min intro call", href: PROFILE.calendly, sub: "Pick a slot that works for you" },
];

export const LEGAL_DEFAULT: { updated: string; privacy: LegalItem[]; terms: LegalItem[] } = {
  updated: "August 17, 2026",
  privacy: [
    { h: "1. Data I collect", p: "When you send an inquiry through the contact form, I store the fields you provide — name, email, phone, company and your project description — so I can respond to you." },
    { h: "2. How it's used", p: "Your data is used exclusively to answer your inquiry, prepare proposals and manage an agreed engagement. It is never sold or used for advertising." },
    { h: "3. Analytics", p: "This site records minimal aggregate engagement metrics to understand how the site is used. No individual visitor profiles are created." },
    { h: "4. Your rights", p: "You may request access to, correction of, or deletion of your data at any time using the contact details on this website." },
  ],
  terms: [
    { h: "1. Services", p: "Software engineering, product development and technology consulting services are provided under written agreements." },
    { h: "2. Proposals & payment", p: "Scope, timeline, pricing and payment milestones are defined in a proposal and confirmed before work begins." },
    { h: "3. Intellectual property", p: "Upon full payment, agreed deliverables transfer to the client. Pre-existing tools and libraries remain reusable." },
    { h: "4. Changes & liability", p: "Scope changes are documented and priced before implementation. Liability is limited as defined in the written agreement." },
  ],
};

export const HOME_TEXT_DEFAULT = {
  heroMetrics: [{ value: "7", label: "Years Experience" }, { value: "60+", label: "Projects Delivered" }, { value: "4.9/5", label: "Client Rating" }],
  availability: "Open for Q4 2026",
  coreStackLabel: "Core Stack",
  coreStackValue: "Next.js · React · Node",
  shippedValue: "60+",
  shippedLabel: "Products Shipped",
  expertiseTitle: "What I Bring to the Table",
  expertiseSub: "Four disciplines, one goal: software your business can rely on for years — not just launch week.",
  techTitle: "Technology Stack",
  techSub: "Production-proven tools chosen for the job.",
  projectsTitle: "Selected Projects",
  projectsSub: "Platforms in production today — with the numbers to prove it.",
  servicesTitle: "What I Can Build for You",
  servicesSub: "Engagements scoped from a single integration to a full product build.",
  processTitle: "How I Work",
  processSub: "A transparent process from discovery through continuous improvement.",
  experienceTitle: "Seven years, four teams.",
  experienceSub: "From agency sprints to product teams that ship for a living.",
  testimonialsTitle: "What Clients Say",
  testimonialsSub: "Founders, CTOs and operators I've shipped with.",
  insightsTitle: "Writing on Engineering & Product",
  insightsSub: "Notes from the field: architecture decisions, launch post-mortems and lessons learned.",
  ctaKicker: "Ready when you are",
  ctaTitle: "Have an idea?",
  ctaAccent: "Let's build it.",
  ctaBody: "Tell me what you're trying to build. You'll get a straight answer on scope, cost and timing.",
};

export const PAGE_TEXT_DEFAULT = {
  projectsTitle: "Projects",
  projectsSub: "Production systems, measurable outcomes, and the engineering behind them.",
  servicesTitle: "Services",
  servicesSub: "Engineering engagements shaped around your product and business goals.",
  insightsTitle: "Insights & Technical Notes",
  insightsSub: "Long-form writing on software engineering, product development and building technology.",
  contactTitle: "Have an idea? Let's talk.",
  contactSub: "Tell me what you're building. I read every inquiry personally and reply with an honest assessment.",
  servicesEngagementSteps: [
    { num: "1", title: "Free consultation", text: "We scope your problem and establish whether the engagement is a fit." },
    { num: "2", title: "Fixed proposal", text: "You receive a written proposal covering scope, architecture, timing and price." },
    { num: "3", title: "Build & launch", text: "Weekly demonstrations, transparent progress and a carefully managed launch." },
  ],
};

export const PUBLIC_TEXT_DEFAULT = {
  navRole: "Full-Stack Engineer",
  footerExplore: "Explore", footerServices: "Services", footerContact: "Contact", footerBookCall: "Book a call", footerRights: "All rights reserved.",
  homeExpertiseKicker: "Expertise", homeTechnologyKicker: "Technology", homeProjectsKicker: "Portfolio", homeServicesKicker: "Services", homeProcessKicker: "Process", homeTestimonialsKicker: "Testimonials", homeInsightsKicker: "Insights",
  contactKicker: "Contact", contactAvailabilityPrefix: "Current availability:", contactAvailability: "Q4 2026 engagements", contactInquiry: "Project Inquiry",
  contactName: "Name", contactEmail: "Email", contactPhone: "Phone", contactCompany: "Company", contactType: "Project type", contactBudget: "Budget", contactTimeline: "Timeline", contactDescription: "Project description", contactSource: "How did you find me?", contactSubmit: "Send Inquiry",
  contactNamePlaceholder: "Jane Doe", contactEmailPlaceholder: "jane@company.com", contactPhonePlaceholder: "+49 ...", contactCompanyPlaceholder: "Company GmbH", contactDescriptionPlaceholder: "What are you building, who is it for, and what does success look like?",
  contactBasedPrefix: "Based in", contactBasedSuffix: "working with clients across Europe and worldwide.", contactSuccessTitle: "Inquiry received", contactSuccessBody: "Thanks for the details. Your project inquiry has been recorded and will receive a personal reply within 24 hours.", contactSaved: "Saved to the lead pipeline", contactOwnerNotified: "Notification queued", contactConfirmation: "Confirmation email queued to you", contactAnother: "Send another inquiry", contactAttachment: "Attachment (optional)", contactRequired: "Required. Your data is used solely to respond to this inquiry — see the Privacy Policy.",
  contactErrorName: "Please enter your name.", contactErrorEmail: "That email address doesn't look valid.", contactErrorDescription: "Please describe your project in at least a sentence.",
  insightsEmptyKicker: "Insights", insightsEmptyTitle: "Nothing published yet.", insightsEmptyBody: "New articles appear here when published from the admin panel.", insightsNotFoundKicker: "Not found", insightsNotFoundTitle: "Article not found", insightsUsefulTitle: "Found this useful?", insightsUsefulBody: "The best way to say thanks is a project worth building.", insightsKeepReading: "Keep Reading",
  legalKicker: "Legal", legalUpdated: "Last updated",
  projectChallenge: "The Challenge", projectSolution: "The Solution", projectCapabilities: "Key Capabilities", projectTechnologies: "Technologies", projectRelated: "Related Projects", projectInquiryBody: "Tell me about your project and I'll get back within 24 hours.",
  projectsAll: "All", projectsOngoing: "Ongoing", projectsCompleted: "Completed", projectsEmpty: "No projects match this filter.", projectsEmptyBody: "Try a different status or category.",
  servicesHow: "How it works", servicesInquiryBody: "Describe the problem — I'll map it to the right engagement.",
  notFoundKicker: "Error 404", notFoundTitle: "404", notFoundBody: "This page doesn't exist — or it's still in the backlog. Let me take you somewhere useful.", notFoundAction: "Back to Home", notFoundProjects: "View Projects",
  previewTerminal: "terminal — relay api", previewCommand: "curl -X POST", previewProtocol: "https://", previewEndpoint: "/v1/messages", previewHeaderFlag: "-H", previewDataFlag: "-d", previewAuth: "Authorization: Bearer rk_live_••••", previewPayload: "{to: ops@acme.io, channel: email}", previewResult: "201 Created · delivery queued", previewDelivered: "delivered successfully", previewApp: "Pawmate", previewUser: "JD", previewBooked: "Booked ✓", previewPrice: "€45", previewSoon: "Preview coming soon", previewAltSuffix: "website preview",
  commonViewProject: "View Project", commonStartProject: "Start a Project", commonSchedule: "Schedule a Consultation", commonAllProjects: "All Projects", commonAllInsights: "All Insights", commonRead: "Read", commonReadArticle: "Read article", commonLearnMore: "Learn more",
  homeIntroAction: "See How I Work", homeTechCount: "core technologies", homeAllProjects: "View All Projects", homeAllServices: "All Services", homeExperienceKicker: "Experience",
  insightsFeatured: "Featured", insightsBack: "Back to Insights", insightsAuthorMonogram: "WP",
  projectRole: "Role", projectClient: "Client", projectTimeline: "Timeline", projectStack: "Stack", projectPresent: "present", projectVisit: "Visit Live Site", projectCode: "View Code", projectAppStore: "App Store", projectGooglePlay: "Google Play", projectLivePreview: "Live preview", projectCtaPrefix: "Want to build something like",
  projectsShowing: "Showing", projectsOf: "of", projectsNoun: "projects",
  servicesStepsSub: "Three steps. No surprises.", servicesUnsure: "Not sure which service you need?", servicesDiscuss: "Discuss this service",
  footerPrivacy: "Privacy Policy", footerTerms: "Terms", footerAdmin: "Admin",
  statusOngoing: "Ongoing", statusCompleted: "Completed",
  contactAttached: "Attached",
};

export const SEO_DEFAULT: Record<string, string> = {
  "/": "Wuese Philip — Full-Stack Software Engineer & SaaS Builder",
  "/projects": "Projects — Wuese Philip", "/services": "Services — Wuese Philip", "/insights": "Insights — Wuese Philip", "/contact": "Contact — Wuese Philip",
  "/privacy": "Privacy Policy — Wuese Philip", "/terms": "Terms & Conditions — Wuese Philip", "/admin": "Admin — Wuese Philip", "notFound": "Page not found — Wuese Philip",
};

/* ------------------------------------------------------------------ */
/* Section registry (used by the CMS section manager)                  */
/* ------------------------------------------------------------------ */

export const SECTION_LABELS: Record<SectionKey, string> = {
  intro: "Professional Introduction",
  expertise: "Expertise",
  tech: "Technology Stack",
  projects: "Selected Projects",
  services: "Services",
  process: "Development Process",
  stats: "Statistics",
  experience: "Experience",
  testimonials: "Testimonials",
  insights: "Insights",
  cta: "Primary CTA",
  channels: "Contact Options",
};

export const CTA_REGISTRY = [
  { id: "nav-cta", label: "Let's Work Together", location: "Navigation" },
  { id: "hero-start", label: "Start a Project", location: "Hero" },
  { id: "hero-work", label: "Explore My Work", location: "Hero" },
  { id: "intro-cta", label: "See How I Work", location: "Introduction" },
  { id: "projects-all", label: "View All Projects", location: "Projects" },
  { id: "cta-start", label: "Start a Project", location: "Primary CTA" },
  { id: "cta-consult", label: "Schedule a Consultation", location: "Primary CTA" },
  { id: "contact-submit", label: "Send Inquiry", location: "Contact Form" },
];

/* ------------------------------------------------------------------ */
/* Navigation & CTA registry (CMS-managed)                             */
/* ------------------------------------------------------------------ */

export type NavItem = { id: string; label: string; to: string; active: boolean };

export const NAV_DEFAULT: NavItem[] = [
  { id: "home", label: "Home", to: "/", active: true },
  { id: "projects", label: "Projects", to: "/projects", active: true },
  { id: "services", label: "Services", to: "/services", active: true },
  { id: "insights", label: "Insights", to: "/insights", active: true },
  { id: "contact", label: "Contact", to: "/contact", active: true },
];

export type CtaItem = { id: string; label: string; to: string; active: boolean };

export const CTAS_DEFAULT: CtaItem[] = [
  { id: "nav-cta", label: "Let's Work Together", to: "/contact", active: true },
  { id: "hero-start", label: "Start a Project", to: "/contact", active: true },
  { id: "hero-work", label: "Explore My Work", to: "/projects", active: true },
  { id: "intro-cta", label: "See How I Work", to: "/services", active: true },
  { id: "projects-all", label: "View All Projects", to: "/projects", active: true },
  { id: "cta-start", label: "Start a Project", to: "/contact", active: true },
  { id: "cta-consult", label: "Schedule a Consultation", to: PROFILE.calendly, active: true },
  { id: "contact-submit", label: "Send Inquiry", to: "", active: true },
];
