import { Link } from "@/router";
import { useStore } from "@/store";
import {
  Icon,
  Monogram,
  ProjectPreview,
  Reveal,
  StatusBadge,
  TrackedCTA,
  btnGhost,
  btnPrimary,
} from "@/components/ui";
import ProjectCard from "@/components/ProjectCard";
import NotFound from "@/site-pages/NotFound";

export default function ProjectDetail({ slug }: { slug: string }) {
  const { state } = useStore();
  const project = state.projects.find((p) => p.slug === slug);

  if (!project) return <NotFound />;

  const related = state.projects.filter((p) => p.id !== project.id && p.category === project.category);
  const relatedFinal = (related.length > 0 ? related : state.projects.filter((p) => p.id !== project.id)).slice(0, 2);

  return (
    <div className="px-5 pb-28 pt-32 md:px-10 md:pt-40">
      <div className="mx-auto max-w-[1400px]">
        <Link
          to="/projects"
          className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-mist transition-colors hover:text-gold"
        >
          <Icon name="arrowRight" className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-1" />
          {state.publicText.commonAllProjects}
        </Link>

        {/* Hero */}
        <div className="mt-10 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <div className="flex items-center gap-4">
                <Monogram label={project.monogram} className="h-14 w-14 text-lg" />
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-dim">
                    {project.category} · {project.year}
                  </p>
                  <h1 className="mt-1 font-display text-4xl font-bold tracking-tight text-frost md:text-5xl">
                    {project.name}
                  </h1>
                </div>
              </div>
              <div className="mt-5">
                <StatusBadge status={project.status} />
              </div>
              <p className="mt-6 text-lg leading-relaxed text-mist">{project.tagline}</p>

              <dl className="mt-8 space-y-4 border-t border-line pt-6 text-sm">
                {[
                  { k: state.publicText.projectRole, v: project.role },
                  { k: state.publicText.projectClient, v: project.client },
                  {
                    k: state.publicText.projectTimeline,
                    v: project.startDate
                      ? `${project.startDate}${project.endDate ? " — " + project.endDate : ` — ${state.publicText.projectPresent}`}`
                      : project.year,
                  },
                  { k: state.publicText.projectStack, v: project.stack.join(", ") },
                ].map((row) => (
                  <div key={row.k} className="grid grid-cols-[110px_1fr] gap-4">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">{row.k}</dt>
                    <dd className="text-frost/90">{row.v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-8 flex flex-wrap gap-3">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={btnGhost}
                  >
                    <Icon name="external" className="h-4 w-4" />
                    {state.publicText.projectVisit}
                  </a>
                )}
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noreferrer" className={btnGhost}>
                    {state.publicText.projectCode}
                  </a>
                )}
                {project.appStoreUrl && (
                  <a href={project.appStoreUrl} target="_blank" rel="noreferrer" className={btnGhost}>
                    {state.publicText.projectAppStore}
                  </a>
                )}
                {project.googlePlayUrl && (
                  <a href={project.googlePlayUrl} target="_blank" rel="noreferrer" className={btnGhost}>
                    {state.publicText.projectGooglePlay}
                  </a>
                )}
              </div>
            </Reveal>
          </div>
          <div className="lg:col-span-7">
            <Reveal delay={150} className="group">
              <ProjectPreview project={project} tall />
              <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
                {state.publicText.projectLivePreview} — {project.domain}
              </p>
            </Reveal>
          </div>
        </div>

        {/* Body */}
        <div className="mt-20">
          <Reveal>
            <p className="max-w-3xl font-display text-2xl leading-relaxed text-frost md:text-3xl">
              {project.description}
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            <Reveal>
              <div className="h-full border border-line bg-panel/60 p-8">
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-cyan">{state.publicText.projectChallenge}</p>
                <p className="mt-4 leading-relaxed text-mist">{project.challenge}</p>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="h-full border border-gold/30 bg-gold/[0.04] p-8">
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-gold">{state.publicText.projectSolution}</p>
                <p className="mt-4 leading-relaxed text-mist">{project.solution}</p>
              </div>
            </Reveal>
          </div>

          {project.features.length > 0 && (
          <div className="mt-14">
            <Reveal>
              <h2 className="font-display text-2xl font-semibold text-frost md:text-3xl">{state.publicText.projectCapabilities}</h2>
            </Reveal>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {project.features.map((f, i) => (
                <Reveal key={f} delay={i * 80}>
                  <div className="flex items-start gap-3 border border-line bg-panel/40 p-5 transition-colors duration-300 hover:border-gold/40">
                    <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    <p className="text-sm text-frost/90">{f}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
          )}

          {project.results.length > 0 && (
          <div className="mt-14 grid grid-cols-3 gap-px overflow-hidden border border-line bg-line">
            {project.results.map((r, i) => (
              <div key={r.label} className="bg-midnight p-6 text-center md:p-8">
                <Reveal delay={i * 100}>
                  <p className="font-display text-2xl font-bold text-gold md:text-4xl">{r.value}</p>
                  <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.2em] text-dim md:text-[10px]">
                    {r.label}
                  </p>
                </Reveal>
              </div>
            ))}
          </div>
          )}

          <div className="mt-14">
            <Reveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-dim">{state.publicText.projectTechnologies}</p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {project.stack.map((t) => (
                  <span
                    key={t}
                    className="border border-line bg-panel/60 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-frost/80"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>

        {/* Related */}
        <div className="mt-24">
          <Reveal className="mb-8 flex items-center gap-4">
            <h2 className="font-display text-2xl font-semibold text-frost md:text-3xl">{state.publicText.projectRelated}</h2>
            <span className="h-px flex-1 bg-line" aria-hidden="true" />
          </Reveal>
          <div className="grid gap-6 md:grid-cols-2">
            {relatedFinal.map((p, i) => (
              <ProjectCard key={p.id} project={p} delay={i * 100} />
            ))}
          </div>
        </div>

        {/* CTA */}
        <Reveal className="mt-24">
          <div className="flex flex-col items-start justify-between gap-6 border border-line bg-panel/50 p-8 md:flex-row md:items-center md:p-10">
            <div>
              <h2 className="font-display text-2xl font-semibold text-frost md:text-3xl">
                {state.publicText.projectCtaPrefix} {project.name}?
              </h2>
              <p className="mt-2 text-mist">{state.publicText.projectInquiryBody}</p>
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
