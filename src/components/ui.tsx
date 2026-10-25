import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import { useCountUp } from "@/hooks";
import { Link } from "@/router";
import { useStore } from "@/store";
import type { Project, ProjectStatus } from "@/data/site";

/* ---------------- buttons ---------------- */

export const btnPrimary =
  "group inline-flex items-center justify-center gap-2.5 bg-gold px-7 py-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-midnight transition-all duration-300 hover:bg-goldsoft hover:shadow-[0_14px_44px_rgba(233,180,91,0.3)]";

export const btnGhost =
  "inline-flex items-center justify-center gap-2.5 border border-line bg-panel/40 px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.18em] text-frost transition-all duration-300 hover:border-gold/60 hover:text-gold";

/** CTA that records its click for the admin CTA-tracking dashboard. */
export function TrackedCTA({
  id,
  to,
  className,
  children,
}: {
  id: string;
  to: string;
  className?: string;
  children: ReactNode;
}) {
  const { trackCTA, state } = useStore();
  const cta = state.ctas.find((c) => c.id === id);
  if (cta && !cta.active) return null;
  const target = cta && cta.active && cta.to ? cta.to : to;
  return (
    <Link to={target} className={className} onClick={() => trackCTA(id)}>
      {cta?.label || children}
    </Link>
  );
}

/* ---------------- reveal on scroll ---------------- */

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          el.classList.add("is-in");
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={cn("reveal", className)} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  );
}

/* ---------------- section heading ---------------- */

export function SectionHead({
  kicker,
  title,
  sub,
  right,
}: {
  kicker: string;
  title: ReactNode;
  sub?: string;
  right?: ReactNode;
}) {
  return (
    <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-6 md:mb-16">
      <div className="max-w-3xl">
        <p className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.35em] text-gold">
          <span className="h-px w-8 bg-gold/60" aria-hidden="true" />
          {kicker}
        </p>
        <h2 className="font-display text-4xl font-semibold tracking-tight text-frost md:text-5xl">{title}</h2>
        {sub && <p className="mt-4 max-w-2xl leading-relaxed text-mist">{sub}</p>}
      </div>
      {right}
    </Reveal>
  );
}

/* ---------------- count up ---------------- */

export function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const { ref, value: current } = useCountUp(value);
  return (
    <div ref={ref} className="font-display text-4xl font-bold text-gold md:text-5xl">
      {current}
      {suffix}
    </div>
  );
}

/* ---------------- marquee ---------------- */

export function Marquee({ items, duration = 32 }: { items: string[]; duration?: number }) {
  const row = [...items, ...items];
  return (
    <div className="overflow-hidden border-y border-line bg-abyss/60">
      <div className="marquee-track flex w-max items-center" style={{ "--marquee-duration": `${duration}s` } as CSSProperties}>
        {row.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center gap-8 whitespace-nowrap py-3.5 pr-8 font-mono text-[11px] uppercase tracking-[0.3em] text-mist"
          >
            {item}
            <span className="text-gold" aria-hidden="true">
              ◆
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- status badge ---------------- */

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const { state } = useStore();
  if (status === "ongoing") {
    return (
      <span className="inline-flex items-center gap-2 border border-cyan/30 bg-cyan/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan">
        <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-cyan" />
        {state.publicText.statusOngoing}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 border border-jade/30 bg-jade/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-jade">
      <Icon name="check" className="h-3 w-3" />
      {state.publicText.statusCompleted}
    </span>
  );
}

/* ---------------- icons ---------------- */

const ICON_PATHS: Record<string, ReactNode> = {
  code: (
    <>
      <path d="M8 7l-5 5 5 5" />
      <path d="M16 7l5 5-5 5" />
      <path d="M13 4l-2 16" />
    </>
  ),
  box: (
    <>
      <path d="M12 2.5l8.5 4.9v9.2L12 21.5l-8.5-4.9V7.4L12 2.5z" />
      <path d="M3.5 7.4L12 12.3l8.5-4.9" />
      <path d="M12 12.3v9.2" />
    </>
  ),
  plug: (
    <>
      <path d="M9 7V3M15 7V3" />
      <path d="M6 7h12v3a6 6 0 01-12 0V7z" />
      <path d="M12 16v5" />
    </>
  ),
  server: (
    <>
      <rect x="3" y="3.5" width="18" height="7" rx="1.5" />
      <rect x="3" y="13.5" width="18" height="7" rx="1.5" />
      <path d="M7 7h.01M7 17h.01" />
    </>
  ),
  layers: (
    <>
      <path d="M12 3l9 4.8-9 4.8-9-4.8L12 3z" />
      <path d="M3 12.6l9 4.8 9-4.8" />
      <path d="M3 17l9 4.8 9-4.8" />
    </>
  ),
  api: (
    <>
      <circle cx="5" cy="12" r="2.2" />
      <circle cx="19" cy="5.5" r="2.2" />
      <circle cx="19" cy="18.5" r="2.2" />
      <path d="M7.2 12H12m0 0l4.9-5M12 12l4.9 5.5" />
    </>
  ),
  cart: (
    <>
      <circle cx="9.5" cy="19.5" r="1.4" />
      <circle cx="17" cy="19.5" r="1.4" />
      <path d="M3 4h2.5L8 15.5h11L21 7.5H6" />
    </>
  ),
  phone: (
    <>
      <rect x="7" y="2.5" width="10" height="19" rx="2" />
      <path d="M10.5 18.5h3" />
    </>
  ),
  card: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="M2.5 9.5h19" />
      <path d="M6 15h4.5" />
    </>
  ),
  blueprint: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <path d="M3 9.5h18M10 21V9.5" />
    </>
  ),
  bolt: <path d="M13 2.5L4.5 13.5H11l-1.5 8 8.5-11H11l2-8z" />,
  arrowRight: (
    <>
      <path d="M4 12h16" />
      <path d="M14 6l6 6-6 6" />
    </>
  ),
  arrowUpRight: (
    <>
      <path d="M7 17L17 7" />
      <path d="M9 7h8v8" />
    </>
  ),
  check: <path d="M4.5 12.5l5 5L19.5 6.5" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  user: (
    <>
      <circle cx="12" cy="8" r="3.8" />
      <path d="M19.5 20.5a7.5 7.5 0 00-15 0" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8.5a6 6 0 10-12 0c0 6.5-2.5 8-2.5 8h17s-2.5-1.5-2.5-8" />
      <path d="M13.7 20.5a2 2 0 01-3.4 0" />
    </>
  ),
  shield: <path d="M12 2.5l7.5 3v6c0 5-3.2 8.3-7.5 10-4.3-1.7-7.5-5-7.5-10v-6l7.5-3z" />,
  pencil: <path d="M17 3l4 4L8 20l-5.5 1.5L4 16 17 3z" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.5 7.5L12 13.5l8.5-6" />
    </>
  ),
  phoneCall: (
    <path d="M4 4h4l2 5-2.5 1.5a12.5 12.5 0 006 6L15 14l5 2v4a2 2 0 01-2 2A17 17 0 012 6a2 2 0 012-2z" />
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  external: (
    <>
      <path d="M14 5h5v5" />
      <path d="M19 5l-9 9" />
      <path d="M11 5H6a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1v-5" />
    </>
  ),
};

export function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {ICON_PATHS[name] ?? ICON_PATHS.code}
    </svg>
  );
}

export function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-1 text-gold" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" className={cn("h-3.5 w-3.5", i < count ? "fill-current" : "fill-current opacity-25")}>
          <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5-5.9-3.2-5.9 3.2 1.2-6.5L2.5 9.4l6.6-.9 2.9-6z" />
        </svg>
      ))}
    </div>
  );
}

/* ---------------- project preview mockups ---------------- */

function WindowDots() {
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      <span className="h-2.5 w-2.5 rounded-full bg-[#f26d6d]/70" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#f2c14e]/70" />
      <span className="h-2.5 w-2.5 rounded-full bg-[#5bd68b]/70" />
    </div>
  );
}

export function ProjectPreview({ project, tall = false }: { project: Project; tall?: boolean }) {
  const { state } = useStore();
  if (project.preview === "terminal") {
    return (
      <div className="overflow-hidden rounded-lg border border-line bg-abyss">
        <div className="flex items-center gap-3 border-b border-line bg-panel/70 px-4 py-2.5">
          <WindowDots />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">{state.publicText.previewTerminal}</span>
        </div>
        <div className={cn("space-y-2.5 p-5 font-mono text-[11px] leading-relaxed md:text-xs", tall ? "py-8" : "")}>
          <p className="text-mist">
            <span className="text-gold">$</span> {state.publicText.previewCommand} {state.publicText.previewProtocol}{project.domain}{state.publicText.previewEndpoint} \
          </p>
          <p className="pl-4 text-mist">
            {state.publicText.previewHeaderFlag} <span className="text-cyan">{state.publicText.previewAuth}</span> \
          </p>
          <p className="pl-4 text-mist">
            {state.publicText.previewDataFlag}{" "}
            <span className="text-cyan">
              {state.publicText.previewPayload}
            </span>
          </p>
          <p className="pt-2 text-dim">
            → <span className="text-gold">{state.publicText.previewResult}</span>
          </p>
          <p className="text-jade">✓ {state.publicText.previewDelivered}</p>
        </div>
      </div>
    );
  }

  if (project.preview === "phone") {
    return (
      <div className="flex items-center justify-center rounded-lg border border-line bg-abyss py-6">
        <div className="w-44 rounded-[1.6rem] border border-line bg-panel p-2.5 shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
          <div className="rounded-[1.2rem] bg-midnight p-3.5">
            <div className="flex items-center justify-between">
              <span className="font-display text-sm font-bold text-frost">{state.publicText.previewApp}</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 font-mono text-[9px] text-gold">{state.publicText.previewUser}</span>
            </div>
            <div className="mt-3 rounded-lg border border-line bg-raised p-2.5">
              <div className="h-2 w-16 rounded-full bg-gold/70" />
              <div className="mt-2 h-1.5 w-24 rounded-full bg-line" />
              <div className="mt-1.5 h-1.5 w-20 rounded-full bg-line" />
              <div className="mt-3 flex items-center justify-between">
                <span className="rounded-full bg-gold px-2 py-0.5 font-mono text-[8px] font-bold text-midnight">{state.publicText.previewBooked}</span>
                <span className="font-mono text-[8px] text-dim">{state.publicText.previewPrice}</span>
              </div>
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-line bg-raised p-2">
                <div className="h-1.5 w-10 rounded-full bg-cyan/60" />
                <div className="mt-1.5 h-1 w-8 rounded-full bg-line" />
              </div>
              <div className="rounded-lg border border-line bg-raised p-2">
                <div className="h-1.5 w-10 rounded-full bg-jade/60" />
                <div className="mt-1.5 h-1 w-8 rounded-full bg-line" />
              </div>
            </div>
            <div className="mt-3 flex justify-around border-t border-line pt-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              <span className="h-1.5 w-1.5 rounded-full bg-line" />
              <span className="h-1.5 w-1.5 rounded-full bg-line" />
              <span className="h-1.5 w-1.5 rounded-full bg-line" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-abyss">
      <div className="flex items-center gap-3 border-b border-line bg-panel/70 px-4 py-2.5">
        <WindowDots />
        <div className="mx-auto flex items-center gap-2 rounded-full bg-midnight px-4 py-1 font-mono text-[10px] text-dim">
          <span className="h-1.5 w-1.5 rounded-full bg-jade" aria-hidden="true" />
          {project.domain}
        </div>
      </div>
      <div className="overflow-hidden">
        {project.cover ? (
          <img
            src={project.cover}
            alt={`${project.name} ${state.publicText.previewAltSuffix}`}
            loading="lazy"
            className={cn("w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]", tall ? "h-72 md:h-96" : "h-52 md:h-56")}
          />
        ) : (
          <div
            className={cn(
              "flex w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-raised to-midnight",
              tall ? "h-72 md:h-96" : "h-52 md:h-56"
            )}
          >
            <Monogram label={project.monogram} className="h-14 w-14 text-lg" />
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-dim">{state.publicText.previewSoon}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- logo monogram tile ---------------- */

export function Monogram({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-11 w-11 shrink-0 items-center justify-center border border-gold/40 bg-gold/10 font-display text-sm font-bold text-gold",
        className
      )}
    >
      {label}
    </span>
  );
}
