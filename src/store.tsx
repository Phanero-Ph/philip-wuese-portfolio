import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/api";
import {
  ARTICLES,
  CONTACT_CHANNELS,
  CTAS_DEFAULT,
  HERO_DEFAULT,
  INTRO,
  EXPERTISE,
  TECH_STACK,
  PROCESS,
  STATS,
  EXPERIENCE,
  LEGAL_DEFAULT,
  HOME_TEXT_DEFAULT,
  PAGE_TEXT_DEFAULT,
  PUBLIC_TEXT_DEFAULT,
  SEO_DEFAULT,
  PROJECT_TYPES,
  BUDGET_RANGES,
  TIMELINES,
  SOURCES,
  MARQUEE_ITEMS,
  PROFILE,
  SOCIALS,
  NAV_DEFAULT,
  PROJECTS_SEED,
  SERVICES,
  TESTIMONIALS_SEED,
  type Activity,
  type Article,
  type CtaItem,
  type HeroContent,
  type Lead,
  type LeadStatus,
  type NavItem,
  type Project,
  type ProjectStatus,
  type SectionKey,
  type Service,
  type Testimonial,
} from "@/data/site";
import { USERS_SEED, type AdminUser, type AdminUserRole } from "@/data/adminUsers";

export type SiteState = {
  hero: HeroContent;
  sections: Record<SectionKey, boolean>;
  projects: Project[];
  testimonials: Testimonial[];
  leads: Lead[];
  ctaClicks: Record<string, number>;
  activity: Activity[];
  pageViews: number;
  analytics: {
    visitors30: number;
    visitorsPrevious30: number;
    views7: Array<{ date: string; value: number }>;
    viewsPrevious7: number;
    cta7: Array<{ date: string; value: number }>;
    devices30: Array<{ label: string; value: number }>;
    sources30: Array<{ label: string; value: number }>;
  };
  users: AdminUser[];
  services: Service[];
  nav: NavItem[];
  ctas: CtaItem[];
  articles: Article[];
  settings: { accent: string };
  profile: typeof PROFILE;
  socials: Array<{ label: string; url: string }>;
  marquee: string[];
  intro: typeof INTRO;
  expertise: typeof EXPERTISE;
  techStack: typeof TECH_STACK;
  process: typeof PROCESS;
  stats: typeof STATS;
  experience: typeof EXPERIENCE;
  contactChannels: typeof CONTACT_CHANNELS;
  legal: typeof LEGAL_DEFAULT;
  homeText: typeof HOME_TEXT_DEFAULT;
  pageText: typeof PAGE_TEXT_DEFAULT;
  publicText: typeof PUBLIC_TEXT_DEFAULT;
  seo: typeof SEO_DEFAULT;
  projectTypes: string[];
  budgetRanges: string[];
  timelines: string[];
  sources: string[];
};

export type EntityKind = "services" | "nav" | "ctas" | "testimonials" | "users" | "projects" | "articles";

const allSectionsOn = (): Record<SectionKey, boolean> =>
  Object.fromEntries(
    (
      [
        "intro",
        "expertise",
        "tech",
        "projects",
        "services",
        "process",
        "stats",
        "experience",
        "testimonials",
        "insights",
        "cta",
        "channels",
      ] as SectionKey[]
    ).map((k) => [k, true])
  ) as Record<SectionKey, boolean>;

function seedState(): SiteState {
  return {
    hero: { ...HERO_DEFAULT },
    sections: allSectionsOn(),
    projects: structuredClone(PROJECTS_SEED),
    testimonials: structuredClone(TESTIMONIALS_SEED),
    leads: [],
    ctaClicks: {},
    activity: [
      {
        id: "a0",
        time: new Date().toISOString(),
        text: "CMS initialized with default content",
      },
    ],
    pageViews: 0,
    analytics: {
      visitors30: 0,
      visitorsPrevious30: 0,
      views7: [],
      viewsPrevious7: 0,
      cta7: [],
      devices30: [],
      sources30: [],
    },
    users: structuredClone(USERS_SEED),
    services: structuredClone(SERVICES),
    nav: structuredClone(NAV_DEFAULT),
    ctas: structuredClone(CTAS_DEFAULT),
    articles: structuredClone(ARTICLES),
    settings: { accent: "#e9b45b" },
    profile: structuredClone(PROFILE),
    socials: structuredClone(SOCIALS),
    marquee: structuredClone(MARQUEE_ITEMS),
    intro: structuredClone(INTRO),
    expertise: structuredClone(EXPERTISE),
    techStack: structuredClone(TECH_STACK),
    process: structuredClone(PROCESS),
    stats: structuredClone(STATS),
    experience: structuredClone(EXPERIENCE),
    contactChannels: structuredClone(CONTACT_CHANNELS),
    legal: structuredClone(LEGAL_DEFAULT),
    homeText: structuredClone(HOME_TEXT_DEFAULT),
    pageText: structuredClone(PAGE_TEXT_DEFAULT),
    publicText: structuredClone(PUBLIC_TEXT_DEFAULT),
    seo: structuredClone(SEO_DEFAULT),
    projectTypes: structuredClone(PROJECT_TYPES),
    budgetRanges: structuredClone(BUDGET_RANGES),
    timelines: structuredClone(TIMELINES),
    sources: structuredClone(SOURCES),
  };
}

const uid = () => Math.random().toString(36).slice(2, 10);

type Store = {
  ready: boolean;
  state: SiteState;
  patchHero: (p: Partial<HeroContent>) => void;
  setSection: (key: SectionKey, visible: boolean) => void;
  updateProject: (id: string, p: Partial<Project>) => void;
  setProjectStatus: (id: string, status: ProjectStatus) => void;
  toggleTestimonial: (index: number) => void;
  addLead: (lead: Omit<Lead, "id" | "date" | "status" | "notes">) => void;
  setLeadStatus: (id: string, status: LeadStatus) => void;
  setLeadNotes: (id: string, notes: string) => void;
  removeLead: (id: string) => void;
  trackCTA: (id: string) => void;
  bumpPageView: () => void;
  log: (text: string) => void;
  reset: () => void;
  addInvite: (name: string, email: string, role: AdminUserRole) => void;
  updateEntity: (kind: EntityKind, index: number, patch: Record<string, unknown>) => void;
  addEntity: (kind: EntityKind, item: Record<string, unknown>) => void;
  deleteEntity: (kind: EntityKind, index: number) => void;
  importContent: (raw: unknown) => boolean;
  moveEntity: (index: number, dir: -1 | 1) => void;
  setAccent: (color: string) => void;
  deleteTestimonial: (index: number) => void;
  patchContent: (patch: Partial<SiteState>) => void;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children, initialState }: { children: ReactNode; initialState: Record<string, unknown> }) {
  const [state, setState] = useState<SiteState>(() => ({ ...seedState(), ...(initialState as Partial<SiteState>) }));
  const [ready, setReady] = useState(true);
  const hydrated = useRef(true);
  const authenticated = useRef(false);

  useEffect(() => {
    let active = true;
    if (window.location.pathname !== "/admin") return;
    const loadState = (initial = false) => api<{ state: SiteState | null; authenticated: boolean }>("/api/state")
      .then(async (result) => {
        const defaults = seedState();
        const candidate = result.state ? { ...defaults, ...result.state } : defaults;
        const loaded = candidate;
        if (!active) return;
        authenticated.current = result.authenticated;
        setState((previous) => initial
          ? { ...seedState(), ...loaded }
          : {
              ...previous,
              analytics: loaded.analytics,
              pageViews: loaded.pageViews,
              ctaClicks: loaded.ctaClicks,
              leads: loaded.leads,
            });
        hydrated.current = true;
        setReady(true);
      })
      .catch(() => setReady(true));
    void loadState(true);
    const interval = window.setInterval(() => { void loadState(false); }, 30_000);
    return () => { active = false; window.clearInterval(interval); };
  }, []);

  useEffect(() => {
    if (!hydrated.current || !authenticated.current) return;
    const timer = window.setTimeout(() => {
      void api("/api/state", { method: "PUT", body: JSON.stringify({ state }) });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [state]);

  /* Live brand accent — overrides the design token across the whole site */
  useEffect(() => {
    document.documentElement.style.setProperty("--color-gold", state.settings.accent);
  }, [state.settings.accent]);

  const store = useMemo<Store>(() => {
    const log = (text: string) => ({
      id: uid(),
      time: new Date().toISOString(),
      text,
    });

    const push = (
      prev: SiteState,
      next: Partial<SiteState>,
      action?: string
    ): SiteState => ({
      ...prev,
      ...next,
      activity: action
        ? [log(action), ...prev.activity].slice(0, 100)
        : prev.activity,
    });

    return {
      ready,
      state,
      patchHero: (p) =>
        setState((prev) => push(prev, { hero: { ...prev.hero, ...p } }, "Updated hero content")),
      setSection: (key, visible) =>
        setState((prev) =>
          push(
            prev,
            { sections: { ...prev.sections, [key]: visible } },
            `${visible ? "Enabled" : "Disabled"} homepage section: ${key}`
          )
        ),
      updateProject: (id, p) =>
        setState((prev) =>
          push(
            prev,
            {
              projects: prev.projects.map((pr) => (pr.id === id ? { ...pr, ...p } : pr)),
            },
            `Updated project: ${p.name ?? id}`
          )
        ),
      setProjectStatus: (id, status) =>
        setState((prev) =>
          push(
            prev,
            {
              projects: prev.projects.map((pr) =>
                pr.id === id ? { ...pr, status } : pr
              ),
            },
            `Set project status to "${status}"`
          )
        ),
      toggleTestimonial: (index) =>
        setState((prev) =>
          push(
            prev,
            {
              testimonials: prev.testimonials.map((t, i) =>
                i === index ? { ...t, published: t.published === false } : t
              ),
            },
            "Toggled a testimonial"
          )
        ),
      deleteTestimonial: (index) =>
        setState((prev) =>
          push(
            prev,
            { testimonials: prev.testimonials.filter((_, i) => i !== index) },
            "Deleted a testimonial"
          )
        ),
      addLead: (lead) =>
        setState((prev) => {
          void api("/api/leads", { method: "POST", body: JSON.stringify(lead) });
          return (
          push(
            prev,
            {
              leads: [
                {
                  ...lead,
                  id: uid(),
                  date: new Date().toISOString(),
                  status: "New",
                  notes: "",
                },
                ...prev.leads,
              ],
            },
            `New lead from ${lead.name || "anonymous"}`
          ));
        }),
      setLeadStatus: (id, status) =>
        setState((prev) =>
          push(
            prev,
            {
              leads: prev.leads.map((l) => (l.id === id ? { ...l, status } : l)),
            },
            `Lead status → ${status}`
          )
        ),
      setLeadNotes: (id, notes) =>
        setState((prev) => ({
          ...prev,
          leads: prev.leads.map((l) => (l.id === id ? { ...l, notes } : l)),
        })),
      removeLead: (id) =>
        setState((prev) => push(prev, { leads: prev.leads.filter((l) => l.id !== id) }, "Deleted a lead")),
      trackCTA: (id) =>
        setState((prev) => {
          void api("/api/analytics", { method: "POST", body: JSON.stringify({ type: "cta_click", entity: id }) });
          return ({
          ...prev,
          ctaClicks: { ...prev.ctaClicks, [id]: (prev.ctaClicks[id] ?? 0) + 1 },
          });
        }),
      bumpPageView: () => setState((prev) => {
        void api("/api/analytics", { method: "POST", body: JSON.stringify({ type: "page_view" }) });
        return { ...prev, pageViews: prev.pageViews + 1 };
      }),
      log: (text) => setState((prev) => push(prev, {}, text)),
      addInvite: (name, email, role) =>
        setState((prev) =>
          push(
            prev,
            {
              users: [
                ...prev.users,
                {
                  id: uid(),
                  name,
                  email,
                  role,
                  status: "Invited",
                  twoFA: false,
                  lastActive: "Invitation pending",
                  logins: 0,
                  actions: 0,
                  week: [0, 0, 0, 0, 0, 0, 0],
                  hue: "emerald",
                },
              ],
            },
            `Invited ${name} as ${role}`
          )
        ),
      updateEntity: (kind, index, patch) =>
        setState((prev) => {
          const list = prev[kind] as Array<Record<string, unknown>>;
          return push(
            prev,
            { [kind]: list.map((item, i) => (i === index ? { ...item, ...patch } : item)) } as Partial<SiteState>,
            `Updated ${kind} — item ${index + 1}`
          );
        }),
      addEntity: (kind, item) =>
        setState((prev) =>
          push(
            prev,
            { [kind]: [...(prev[kind] as unknown[]), item] } as Partial<SiteState>,
            `Created new ${kind} entry`
          )
        ),
      deleteEntity: (kind, index) =>
        setState((prev) =>
          push(
            prev,
            { [kind]: (prev[kind] as unknown[]).filter((_, i) => i !== index) } as Partial<SiteState>,
            `Deleted a ${kind} entry`
          )
        ),
      importContent: (raw) => {
        if (!raw || typeof raw !== "object") return false;
        const parsed = raw as Partial<SiteState>;
        if (!parsed.hero || !Array.isArray(parsed.projects) || !Array.isArray(parsed.articles)) return false;
        setState((prev) => {
          const fresh = seedState();
          return {
            ...fresh,
            ...parsed,
            activity: [
              { id: uid(), time: new Date().toISOString(), text: "Content imported from JSON backup" },
              ...prev.activity,
            ].slice(0, 100),
          };
        });
        return true;
      },
      moveEntity: (index, dir) =>
        setState((prev) => {
          const list = [...prev.nav];
          const j = index + dir;
          if (j < 0 || j >= list.length) return prev;
          [list[index], list[j]] = [list[j], list[index]];
          return push(prev, { nav: list }, "Reordered navigation");
        }),
      setAccent: (color) =>
        setState((prev) =>
          push(prev, { settings: { ...prev.settings, accent: color } }, "Updated brand accent color")
        ),
      patchContent: (patch) =>
        setState((prev) => push(prev, patch, "Updated global website content")),
      reset: () =>
        setState((prev) => {
          const fresh = seedState();
          fresh.leads = prev.leads; // leads survive a content reset
          fresh.users = prev.users; // team survives a content reset
          fresh.activity = [
            { id: uid(), time: new Date().toISOString(), text: "All content reset to defaults" },
            ...prev.activity,
          ].slice(0, 100);
          return fresh;
        }),
    };
  }, [state, ready]);

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
