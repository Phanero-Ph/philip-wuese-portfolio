import { useMemo, useState } from "react";
import { cn } from "@/utils/cn";
import { useStore } from "@/store";
import type { ProjectStatus } from "@/data/site";
import { SectionHead } from "@/components/ui";
import ProjectCard from "@/components/ProjectCard";

export default function Projects() {
  const { state } = useStore();
  const [status, setStatus] = useState<"all" | ProjectStatus>("all");
  const [category, setCategory] = useState("__all__");
  const statusFilters: { key: "all" | ProjectStatus; label: string }[] = [
    { key: "all", label: state.publicText.projectsAll },
    { key: "ongoing", label: state.publicText.projectsOngoing },
    { key: "completed", label: state.publicText.projectsCompleted },
  ];

  const categories = useMemo(
    () => [{ key: "__all__", label: state.publicText.projectsAll }, ...Array.from(new Set(state.projects.map((p) => p.category))).map((value) => ({ key: value, label: value }))],
    [state.projects]
  );

  const filtered = state.projects.filter(
    (p) => (status === "all" || p.status === status) && (category === "__all__" || p.category === category)
  );

  return (
    <div className="px-5 pb-28 pt-32 md:px-10 md:pt-40">
      <div className="mx-auto max-w-[1400px]">
        <SectionHead
          kicker={state.publicText.homeProjectsKicker}
          title={state.pageText.projectsTitle}
          sub={state.pageText.projectsSub}
        />

        <div className="mb-10 flex flex-col gap-5 border-b border-line pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((f) => {
              const count =
                f.key === "all"
                  ? state.projects.length
                  : state.projects.filter((p) => p.status === f.key).length;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setStatus(f.key)}
                  className={cn(
                    "border px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-all duration-300",
                    status === f.key
                      ? "border-gold bg-gold font-bold text-midnight"
                      : "border-line text-mist hover:border-gold/50 hover:text-frost"
                  )}
                >
                  {f.label} <span className={status === f.key ? "opacity-60" : "text-dim"}>({count})</span>
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                className={cn(
                  "border px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.15em] transition-all duration-300",
                  category === c.key
                    ? "border-gold/60 bg-gold/10 text-gold"
                    : "border-transparent text-dim hover:text-frost"
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <p className="mb-8 font-mono text-[11px] uppercase tracking-[0.25em] text-dim" role="status">
          {state.publicText.projectsShowing} {filtered.length} {state.publicText.projectsOf} {state.projects.length} {state.publicText.projectsNoun}
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map((p, i) => (
            <ProjectCard key={p.id} project={p} delay={i * 80} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="border border-line bg-panel/40 p-16 text-center">
            <p className="font-display text-2xl text-frost">{state.publicText.projectsEmpty}</p>
            <p className="mt-2 text-sm text-mist">{state.publicText.projectsEmptyBody}</p>
          </div>
        )}
      </div>
    </div>
  );
}
