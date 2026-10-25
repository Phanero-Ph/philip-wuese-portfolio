import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
import { useScramble } from "@/hooks";
import { Link } from "@/router";
import { useStore } from "@/store";
import { type SectionKey } from "@/data/site";
import {
  CountUp,
  Icon,
  Marquee,
  Reveal,
  SectionHead,
  Stars,
  TrackedCTA,
  btnGhost,
  btnPrimary,
} from "@/components/ui";
import ProjectCard from "@/components/ProjectCard";

function Sec({ k, className, children }: { k: SectionKey; className?: string; children: ReactNode }) {
  const { state } = useStore();
  if (!state.sections[k]) return null;
  return (
    <section className={cn("px-5 py-20 md:px-10 md:py-28", className)}>
      <div className="mx-auto max-w-[1400px]">{children}</div>
    </section>
  );
}

/* ============================ HERO ============================ */

function Hero() {
  const { state } = useStore();
  const accent = useScramble(state.hero.headlineAccent, 500);

  return (
    <section className="relative overflow-hidden pb-20 pt-32 md:pb-28 md:pt-44">
      <div
        aria-hidden="true"
        className="orb absolute -top-48 right-[-12%] h-[560px] w-[560px] rounded-full bg-gold/10 blur-[150px]"
      />
      <div
        aria-hidden="true"
        className="orb absolute bottom-[-35%] left-[-12%] h-[460px] w-[460px] rounded-full bg-cyan/[0.07] blur-[150px]"
        style={{ animationDelay: "-8s" }}
      />

      <div className="relative mx-auto grid max-w-[1400px] items-center gap-16 px-5 md:px-10 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Reveal>
            <p className="inline-flex items-center gap-2.5 border border-gold/40 bg-gold/10 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-gold">
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-gold" />
              {state.hero.badge}
            </p>
          </Reveal>

          <Reveal delay={120}>
            <h1 className="mt-8 font-display text-[2.4rem] font-bold leading-[1.1] tracking-tight text-frost sm:text-5xl xl:text-6xl">
              {state.hero.headlinePrefix}{" "}
              <span className="text-gold">{accent}</span>
            </h1>
          </Reveal>

          <Reveal delay={240}>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-mist">{state.hero.sub}</p>
          </Reveal>

          <Reveal delay={360}>
            <div className="mt-10 flex flex-wrap gap-4">
              <TrackedCTA id="hero-start" to="/contact" className={btnPrimary}>
                {state.hero.cta1}
                <Icon name="arrowRight" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </TrackedCTA>
              <TrackedCTA id="hero-work" to="/projects" className={btnGhost}>
                {state.hero.cta2}
              </TrackedCTA>
            </div>
          </Reveal>

          <Reveal delay={480}>
            <div className="mt-14 grid max-w-xl grid-cols-3 divide-x divide-line border-t border-line pt-6">
              {state.homeText.heroMetrics.map((s) => (
                <div key={s.label} className="px-4 first:pl-0">
                  <p className="font-display text-2xl font-bold text-frost md:text-3xl">{s.value}</p>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-dim">{s.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Owner image */}
        <div className="lg:col-span-6">
          <Reveal delay={200} className="relative mx-auto w-full max-w-md lg:ml-auto">
            <div aria-hidden="true" className="absolute -inset-8 -z-10 bg-gold/[0.13] blur-3xl" />
            <div aria-hidden="true" className="absolute -inset-5 -z-10">
              <svg viewBox="0 0 400 400" className="spin-slow h-full w-full">
                <circle
                  cx="200"
                  cy="200"
                  r="196"
                  fill="none"
                  stroke="rgba(233,180,91,0.28)"
                  strokeWidth="1"
                  strokeDasharray="3 12"
                />
              </svg>
            </div>

            <img
              src={state.profile.portrait}
              alt={`${state.profile.name} — ${state.profile.role}`}
              className="relative w-full border border-line object-cover shadow-[0_40px_120px_rgba(0,0,0,0.65)]"
            />

            <div className="absolute bottom-4 left-4 flex items-center gap-2.5 border border-line bg-midnight/90 px-4 py-2.5 backdrop-blur">
              <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-jade" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-frost">
                {state.homeText.availability}
              </span>
            </div>

            <div className="float-y absolute -right-5 top-10 hidden border border-line bg-panel px-4 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] sm:block">
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-dim">{state.homeText.coreStackLabel}</p>
              <p className="mt-1 font-mono text-[11px] text-gold">{state.homeText.coreStackValue}</p>
            </div>

            <div
              className="float-y absolute -left-7 bottom-20 hidden border border-line bg-panel px-4 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] sm:block"
              style={{ animationDelay: "-2.6s" }}
            >
              <p className="font-display text-xl font-bold text-frost">{state.homeText.shippedValue}</p>
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-dim">{state.homeText.shippedLabel}</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================ PAGES ============================ */

export default function Home() {
  const { state } = useStore();

  const services = state.services
    .filter((s) => s.visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .slice(0, 4);
  const featured = state.projects.filter((p) => p.featured).slice(0, 4);
  const shown = featured.length > 0 ? featured : state.projects.slice(0, 4);

  return (
    <>
      <Hero />
      <Marquee items={state.marquee} />

      {/* ---------- Introduction ---------- */}
      <Sec k="intro">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.35em] text-gold">
                <span className="h-px w-8 bg-gold/60" aria-hidden="true" />
                {state.intro.kicker}
              </p>
              <h2 className="font-display text-4xl font-semibold tracking-tight text-frost md:text-5xl">
                {state.intro.title}
              </h2>
              <p className="mt-6 font-display text-xl italic leading-relaxed text-gold md:text-2xl">
                “{state.intro.pull}”
              </p>
              <TrackedCTA
                id="intro-cta"
                to="/services"
                className={`${btnGhost} mt-9`}
              >
                {state.publicText.homeIntroAction}
                <Icon name="arrowRight" className="h-4 w-4" />
              </TrackedCTA>
            </Reveal>
          </div>
          <div className="lg:col-span-7">
            <div className="space-y-5 leading-relaxed text-mist">
              {state.intro.paragraphs.map((p, i) => (
                <Reveal key={i} delay={i * 120}>
                  <p>{p}</p>
                </Reveal>
              ))}
            </div>
            <Reveal delay={300}>
              <ul className="mt-10 grid gap-x-8 gap-y-4 border-t border-line pt-8 sm:grid-cols-2">
                {state.intro.checklist.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-frost/90">
                    <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </Sec>

      {/* ---------- Expertise ---------- */}
      <Sec k="expertise" className="bg-panel/30">
        <SectionHead
          kicker={state.publicText.homeExpertiseKicker}
          title={state.homeText.expertiseTitle}
          sub={state.homeText.expertiseSub}
        />
        <div className="grid gap-6 md:grid-cols-2">
          {state.expertise.map((group, i) => (
            <Reveal key={group.title} delay={i * 100}>
              <div className="group h-full border border-line bg-panel/60 p-8 transition-all duration-500 hover:-translate-y-1 hover:border-gold/40">
                <div className="flex h-12 w-12 items-center justify-center border border-gold/40 bg-gold/10 text-gold transition-colors duration-300 group-hover:bg-gold group-hover:text-midnight">
                  <Icon name={group.icon} className="h-6 w-6" />
                </div>
                <h3 className="mt-6 font-display text-2xl font-semibold text-frost">{group.title}</h3>
                <ul className="mt-5 space-y-2.5">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-sm text-mist transition-all duration-300 group-hover:text-frost/90"
                    >
                      <span className="font-mono text-[10px] text-gold" aria-hidden="true">
                        {"//"}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </Sec>

      {/* ---------- Technology stack ---------- */}
      <Sec k="tech">
        <SectionHead
          kicker={state.publicText.homeTechnologyKicker}
          title={state.homeText.techTitle}
          sub={state.homeText.techSub}
          right={
            <span className="hidden font-mono text-[11px] uppercase tracking-[0.25em] text-dim md:block">
              {state.techStack.length} {state.publicText.homeTechCount}
            </span>
          }
        />
        <Reveal>
          <div className="grid gap-x-10 gap-y-7 border border-line bg-panel/40 p-8 sm:grid-cols-2 lg:grid-cols-3 md:p-10">
            {state.techStack.map((t) => (
              <div key={t.name}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-semibold text-frost">{t.name}</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-dim">{t.note}</p>
                </div>
                <div className="mt-3 h-1 w-full bg-line">
                  <div
                    className="h-full bg-gradient-to-r from-gold/60 to-gold transition-all duration-700"
                    style={{ width: `${t.level}%` }}
                  />
                </div>
                <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.2em] text-dim">{t.category}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </Sec>

      {/* ---------- Selected projects ---------- */}
      <Sec k="projects" className="bg-panel/30">
        <SectionHead
          kicker={state.publicText.homeProjectsKicker}
          title={state.homeText.projectsTitle}
          sub={state.homeText.projectsSub}
          right={
            <TrackedCTA id="projects-all" to="/projects" className={btnGhost}>
              {state.publicText.homeAllProjects}
              <Icon name="arrowRight" className="h-4 w-4" />
            </TrackedCTA>
          }
        />
        <div className="grid gap-6 md:grid-cols-2">
          {shown.map((p, i) => (
            <ProjectCard key={p.id} project={p} delay={i * 100} />
          ))}
        </div>
      </Sec>

      {/* ---------- Services ---------- */}
      <Sec k="services">
        <SectionHead
          kicker={state.publicText.homeServicesKicker}
          title={state.homeText.servicesTitle}
          sub={state.homeText.servicesSub}
          right={
            <Link to="/services" className={btnGhost}>
              {state.publicText.homeAllServices}
              <Icon name="arrowRight" className="h-4 w-4" />
            </Link>
          }
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <Reveal key={s.slug} delay={i * 90} className="h-full">
              <Link
                to="/services"
                className="group flex h-full flex-col border border-line bg-panel/60 p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/40"
              >
                <div className="flex h-11 w-11 items-center justify-center border border-gold/40 bg-gold/10 text-gold transition-colors duration-300 group-hover:bg-gold group-hover:text-midnight">
                  <Icon name={s.icon} className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-frost">{s.name}</h3>
                <p className="mt-2.5 flex-1 text-sm leading-relaxed text-mist">{s.short}</p>
                <span className="mt-5 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-gold">
                  {state.publicText.commonLearnMore}
                  <Icon name="arrowRight" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Sec>

      {/* ---------- Process ---------- */}
      <Sec k="process" className="bg-panel/30">
        <SectionHead
          kicker={state.publicText.homeProcessKicker}
          title={state.homeText.processTitle}
          sub={state.homeText.processSub}
        />
        <div className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {state.process.map((step) => (
            <div key={step.num} className="group bg-midnight p-8 transition-colors duration-300 hover:bg-panel">
              <p className="font-display text-5xl font-bold text-gold/25 transition-colors duration-300 group-hover:text-gold/60">
                {step.num}
              </p>
              <h3 className="mt-4 font-display text-xl font-semibold text-frost">{step.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-mist">{step.text}</p>
            </div>
          ))}
        </div>
      </Sec>

      {/* ---------- Statistics ---------- */}
      <Sec k="stats">
        <div className="grid grid-cols-2 gap-y-12 border-y border-line py-14 md:grid-cols-5">
          {state.stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 90} className="px-4 text-center">
              <CountUp value={s.value} suffix={s.suffix} />
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-dim">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </Sec>

      {/* ---------- Experience ---------- */}
      <Sec k="experience" className="bg-panel/30">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <Reveal>
                <p className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.35em] text-gold">
                  <span className="h-px w-8 bg-gold/60" aria-hidden="true" />
                  {state.publicText.homeExperienceKicker}
                </p>
                <h2 className="font-display text-4xl font-semibold tracking-tight text-frost md:text-5xl">{state.homeText.experienceTitle}</h2>
                <p className="mt-6 max-w-sm leading-relaxed text-mist">{state.homeText.experienceSub}</p>
              </Reveal>
            </div>
          </div>
          <div className="lg:col-span-8">
            <ol className="border-l border-line">
              {state.experience.map((e, i) => (
                <li key={e.company} className="relative pb-12 pl-8 last:pb-0 md:pl-12">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full border-2 border-midnight bg-gold"
                  />
                  <Reveal delay={i * 100}>
                    <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-gold">{e.period}</p>
                    <h3 className="mt-2 font-display text-2xl font-semibold text-frost">
                      {e.role} <span className="text-mist">— {e.company}</span>
                    </h3>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-dim">{e.location}</p>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-mist">{e.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {e.tech.map((t) => (
                        <span
                          key={t}
                          className="border border-line bg-midnight px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.15em] text-dim"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Sec>

      {/* ---------- Testimonials ---------- */}
      <Sec k="testimonials">
        <SectionHead
          kicker={state.publicText.homeTestimonialsKicker}
          title={state.homeText.testimonialsTitle}
          sub={state.homeText.testimonialsSub}
        />
        <div className="grid gap-6 md:grid-cols-2">
          {state.testimonials.filter((t) => t.published !== false).map((t, i) => (
            <Reveal key={t.name} delay={i * 100} className="h-full">
              <figure className="flex h-full flex-col justify-between border border-line bg-panel/60 p-8 transition-all duration-500 hover:-translate-y-1 hover:border-gold/40">
                <div>
                  <Stars count={t.rating} />
                  <blockquote className="mt-5 leading-relaxed text-frost/90">“{t.quote}”</blockquote>
                </div>
                <figcaption className="mt-8 flex items-center gap-4 border-t border-line pt-5">
                  {t.photo ? (
                    <img src={t.photo} alt={t.name} className="h-11 w-11 rounded-full border border-gold/40 object-cover" />
                  ) : (
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-gold/10 font-display text-sm font-bold text-gold">
                      {t.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  )}
                  <span>
                    <span className="block text-sm font-semibold text-frost">{t.name}</span>
                    <span className="block font-mono text-[10px] uppercase tracking-[0.15em] text-dim">
                      {t.role}, {t.company}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Sec>

      {/* ---------- Insights ---------- */}
      <Sec k="insights" className="bg-panel/30">
        <SectionHead
          kicker={state.publicText.homeInsightsKicker}
          title={state.homeText.insightsTitle}
          sub={state.homeText.insightsSub}
          right={
            <Link to="/insights" className={btnGhost}>
              {state.publicText.commonAllInsights}
              <Icon name="arrowRight" className="h-4 w-4" />
            </Link>
          }
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {state.articles
            .filter((a) => a.published !== false)
            .slice(0, 4)
            .map((a, i) => (
            <Reveal key={a.slug} delay={i * 90} className="h-full">
              <Link
                to={`/insights/${a.slug}`}
                className="group flex h-full flex-col border border-line bg-panel/60 transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/40"
              >
                <div
                  className={cn(
                    "relative flex h-36 items-end overflow-hidden border-b border-line bg-gradient-to-br p-5",
                    a.hue === "gold" && "from-gold/25 to-panel",
                    a.hue === "cyan" && "from-cyan/20 to-panel",
                    a.hue === "jade" && "from-jade/20 to-panel",
                    a.hue === "sky" && "from-[#7aa7f5]/20 to-panel"
                  )}
                >
                  <span className="font-display text-6xl font-bold text-frost/10 transition-transform duration-700 group-hover:scale-110">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="absolute right-4 top-4 border border-line bg-midnight/80 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-mist">
                    {a.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
                    {a.date} · {a.read}
                  </p>
                  <h3 className="mt-2.5 font-display text-base font-semibold leading-snug text-frost transition-colors group-hover:text-gold">
                    {a.title}
                  </h3>
                  <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-mist">{a.excerpt}</p>
                  <span className="mt-auto pt-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-gold">
                    {state.publicText.commonReadArticle}
                    <Icon name="arrowRight" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Sec>

      {/* ---------- Primary CTA ---------- */}
      <Sec k="cta">
        <Reveal>
          <div className="relative overflow-hidden border border-gold/30 bg-gradient-to-b from-panel to-midnight px-6 py-16 text-center md:py-24">
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-[-120%] h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-gold/10 blur-[120px]"
            />
            <p className="relative font-mono text-[11px] uppercase tracking-[0.35em] text-gold">
              {state.homeText.ctaKicker}
            </p>
            <h2 className="relative mx-auto mt-5 max-w-3xl font-display text-4xl font-bold tracking-tight text-frost md:text-6xl">
              {state.homeText.ctaTitle}
              <br />
              <span className="text-gold">{state.homeText.ctaAccent}</span>
            </h2>
            <p className="relative mx-auto mt-6 max-w-xl leading-relaxed text-mist">
              {state.homeText.ctaBody}
            </p>
            <div className="relative mt-10 flex flex-wrap justify-center gap-4">
              <TrackedCTA id="cta-start" to="/contact" className={btnPrimary}>
                {state.publicText.commonStartProject}
                <Icon name="arrowRight" className="h-4 w-4" />
              </TrackedCTA>
              <TrackedCTA id="cta-consult" to={state.profile.calendly} className={btnGhost}>
                <Icon name="calendar" className="h-4 w-4" />
                {state.publicText.commonSchedule}
              </TrackedCTA>
            </div>
          </div>
        </Reveal>
      </Sec>

      {/* ---------- Contact options ---------- */}
      <Sec k="channels">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {state.contactChannels.map((c, i) => (
            <Reveal key={c.label} delay={i * 80} className="h-full">
              <a
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel={c.href.startsWith("http") ? "noreferrer" : undefined}
                className="group flex h-full flex-col border border-line bg-panel/60 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-gold/40"
              >
                <div className="flex items-center justify-between">
                  <Icon name={c.icon} className="h-5 w-5 text-gold" />
                  <Icon
                    name="arrowUpRight"
                    className="h-4 w-4 text-dim transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold"
                  />
                </div>
                <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.25em] text-dim">{c.label}</p>
                <p className="mt-1.5 text-sm font-semibold text-frost">{c.value}</p>
              </a>
            </Reveal>
          ))}
        </div>
      </Sec>
    </>
  );
}
