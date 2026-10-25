import { Link } from "@/router";
import { useStore } from "@/store";
import { Icon, Reveal, SectionHead, TrackedCTA, btnGhost, btnPrimary } from "@/components/ui";

export default function Services() {
  const { state } = useStore();
  const services = state.services
    .filter((s) => s.visible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return (
    <div className="px-5 pb-28 pt-32 md:px-10 md:pt-40">
      <div className="mx-auto max-w-[1400px]">
        <SectionHead
          kicker={state.publicText.homeServicesKicker}
          title={state.pageText.servicesTitle}
          sub={state.pageText.servicesSub}
        />

        <div className="grid gap-6 md:grid-cols-2">
          {services.map((s, i) => (
            <Reveal key={s.slug} delay={(i % 2) * 100} className="h-full">
              <article className="group flex h-full flex-col border border-line bg-panel/60 p-8 transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/40 hover:shadow-[0_30px_80px_rgba(0,0,0,0.5)] md:p-10">
                <div className="flex items-center gap-4">
                  <div className="flex h-13 w-13 shrink-0 items-center justify-center border border-gold/40 bg-gold/10 p-3 text-gold transition-colors duration-300 group-hover:bg-gold group-hover:text-midnight">
                    <Icon name={s.icon} className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-frost">{s.name}</h2>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-dim">{s.short}</p>
                  </div>
                </div>

                <p className="mt-6 leading-relaxed text-mist">{s.description}</p>

                <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-frost/90">
                      <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-7 flex flex-wrap gap-2">
                  {s.tech.map((t) => (
                    <span
                      key={t}
                      className="border border-line bg-midnight px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.15em] text-dim"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-8">
                  <Link
                    to={s.ctaUrl ?? `/contact?service=${encodeURIComponent(s.name)}`}
                    className="link-underline inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-gold"
                  >
                    {s.ctaLabel ?? state.publicText.servicesDiscuss}
                    <Icon name="arrowRight" className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Engagement model */}
        <Reveal className="mt-24">
          <div className="border border-line bg-panel/40 p-8 md:p-12">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-gold">{state.publicText.servicesHow}</p>
                <h2 className="mt-3 font-display text-3xl font-semibold text-frost md:text-4xl">
                  {state.publicText.servicesStepsSub}
                </h2>
              </div>
              <TrackedCTA id="cta-consult" to={state.profile.calendly} className={btnGhost}>
                <Icon name="calendar" className="h-4 w-4" />
                {state.publicText.commonSchedule}
              </TrackedCTA>
            </div>
            <div className="mt-10 grid gap-px overflow-hidden border border-line bg-line md:grid-cols-3">
              {state.pageText.servicesEngagementSteps.map((step) => (
                <div key={step.num} className="bg-midnight p-8">
                  <p className="font-display text-4xl font-bold text-gold/30">{step.num}</p>
                  <h3 className="mt-3 font-display text-lg font-semibold text-frost">{step.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-mist">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal className="mt-16">
          <div className="flex flex-col items-start justify-between gap-6 border border-gold/30 bg-gradient-to-b from-panel to-midnight p-8 md:flex-row md:items-center md:p-10">
            <div>
              <h2 className="font-display text-2xl font-semibold text-frost md:text-3xl">
                {state.publicText.servicesUnsure}
              </h2>
              <p className="mt-2 text-mist">{state.publicText.servicesInquiryBody}</p>
            </div>
            <TrackedCTA id="cta-start" to="/contact" className={btnPrimary}>
              {state.publicText.commonStartProject}
              <Icon name="arrowRight" className="h-4 w-4" />
            </TrackedCTA>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
