import { Link } from "@/router";
import type { Project } from "@/data/site";
import { useStore } from "@/store";
import { Icon, Monogram, ProjectPreview, Reveal, StatusBadge } from "@/components/ui";

export default function ProjectCard({ project, delay = 0 }: { project: Project; delay?: number }) {
  const { state } = useStore();
  return (
    <Reveal delay={delay} className="h-full">
      <article className="group flex h-full flex-col border border-line bg-panel/60 transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/40 hover:shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
        <ProjectPreview project={project} />
        <div className="flex flex-1 flex-col p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Monogram label={project.monogram} className="h-10 w-10 text-xs" />
              <div>
                <h3 className="font-display text-xl font-semibold text-frost transition-colors group-hover:text-gold">
                  {project.name}
                </h3>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
                  {project.category} · {project.year}
                </p>
              </div>
            </div>
            <StatusBadge status={project.status} />
          </div>

          <p className="mt-4 text-sm leading-relaxed text-mist">{project.tagline}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {project.stack.slice(0, 4).map((t) => (
              <span
                key={t}
                className="border border-line bg-midnight px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.15em] text-dim"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
            <Link
              to={`/projects/${project.slug}`}
              className="link-underline inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-gold"
            >
            {state.publicText.commonViewProject}
              <Icon name="arrowRight" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`Visit ${project.name} live site`}
                className="text-dim transition-colors hover:text-gold"
              >
                <Icon name="external" className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </article>
    </Reveal>
  );
}
