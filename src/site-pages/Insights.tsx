import { cn } from "@/utils/cn";
import { Link } from "@/router";
import { type Article } from "@/data/site";
import { useStore } from "@/store";
import { Icon, Reveal, SectionHead } from "@/components/ui";

const HUE_COVER: Record<Article["hue"], string> = {
  gold: "from-gold/25 to-panel",
  cyan: "from-cyan/20 to-panel",
  jade: "from-jade/20 to-panel",
  sky: "from-[#7aa7f5]/20 to-panel",
};

export function ArticleCover({ article, index, className }: { article: Article; index: number; className?: string }) {
  return (
    <div
      className={cn(
        "relative flex items-end overflow-hidden border-b border-line bg-gradient-to-br p-5",
        HUE_COVER[article.hue],
        className
      )}
    >
      {article.cover && <img src={article.cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />}
      <span className="font-display text-7xl font-bold text-frost/10">{String(index + 1).padStart(2, "0")}</span>
      <span className="absolute right-4 top-4 border border-line bg-midnight/80 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-mist">
        {article.category}
      </span>
    </div>
  );
}

export default function Insights() {
  const { state } = useStore();
  const articles = state.articles.filter((a) => a.published !== false);

  if (articles.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-5 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-gold">{state.publicText.insightsEmptyKicker}</p>
        <h1 className="mt-4 font-display text-4xl font-bold text-frost">{state.publicText.insightsEmptyTitle}</h1>
        <p className="mt-3 max-w-sm leading-relaxed text-mist">{state.publicText.insightsEmptyBody}</p>
      </div>
    );
  }

  const [featured, ...rest] = articles;

  return (
    <div className="px-5 pb-28 pt-32 md:px-10 md:pt-40">
      <div className="mx-auto max-w-[1400px]">
        <SectionHead
          kicker={state.publicText.homeInsightsKicker}
          title={state.pageText.insightsTitle}
          sub={state.pageText.insightsSub}
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Featured */}
          <Reveal className="lg:col-span-2">
            <Link
              to={`/insights/${featured.slug}`}
              className="group flex h-full flex-col border border-line bg-panel/60 transition-all duration-500 hover:-translate-y-1.5 hover:border-gold/40"
            >
              <ArticleCover article={featured} index={0} className="h-56 md:h-64" />
              <div className="flex flex-1 flex-col p-7 md:p-9">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
                  {state.publicText.insightsFeatured} · {featured.date} · {featured.read}
                </p>
                <h2 className="mt-3 font-display text-2xl font-semibold leading-snug text-frost transition-colors group-hover:text-gold md:text-3xl">
                  {featured.title}
                </h2>
                <p className="mt-4 leading-relaxed text-mist">{featured.excerpt}</p>
                <span className="mt-auto pt-6 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-gold">
                  {state.publicText.commonReadArticle}
                  <Icon name="arrowRight" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </Reveal>

          {/* List */}
          <div className="flex flex-col gap-6">
            {rest.map((a, i) => (
              <Reveal key={a.slug} delay={i * 100} className="flex-1">
                <Link
                  to={`/insights/${a.slug}`}
                  className="group flex h-full flex-col border border-line bg-panel/60 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-gold/40"
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
                    {a.category} · {a.read}
                  </p>
                  <h3 className="mt-2.5 font-display text-lg font-semibold leading-snug text-frost transition-colors group-hover:text-gold">
                    {a.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-mist">{a.excerpt}</p>
                  <span className="mt-auto pt-4 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-gold">
                    {state.publicText.commonRead}
                    <Icon name="arrowRight" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ArticleView({ slug }: { slug: string }) {
  const { state } = useStore();
  const article = state.articles.find((a) => a.slug === slug);
  if (!article) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-gold">{state.publicText.insightsNotFoundKicker}</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-frost">{state.publicText.insightsNotFoundTitle}</h1>
        <Link to="/insights" className="link-underline mt-6 font-mono text-[11px] uppercase tracking-[0.25em] text-gold">
          {state.publicText.insightsBack}
        </Link>
      </div>
    );
  }

  const related = state.articles.filter((a) => a.slug !== slug).slice(0, 2);

  return (
    <div className="px-5 pb-28 pt-32 md:px-10 md:pt-40">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/insights"
          className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-mist transition-colors hover:text-gold"
        >
          <Icon name="arrowRight" className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-1" />
          {state.publicText.commonAllInsights}
        </Link>

        <Reveal className="mt-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-gold">
            {article.category} · {article.date} · {article.read}
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight text-frost md:text-5xl">
            {article.title}
          </h1>
          <p className="mt-6 font-display text-xl italic leading-relaxed text-mist">{article.excerpt}</p>

          <div className="mt-8 flex items-center gap-4 border-y border-line py-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-gold/10 font-display text-sm font-bold text-gold">
              {state.profile.monogram}
            </span>
            <div>
              <p className="text-sm font-semibold text-frost">{state.profile.name}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">{state.profile.role}</p>
            </div>
            <div className="ml-auto flex flex-wrap gap-2">
              {article.tags.map((t) => (
                <span key={t} className="border border-line px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.15em] text-dim">
                  #{t}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-10 space-y-7">
            {article.body.map((block, i) =>
              typeof block === "string" ? (
                <p key={i} className="leading-[1.85] text-frost/85">
                  {block}
                </p>
              ) : (
                <ul key={i} className="space-y-3 border border-line bg-panel/50 p-6">
                  {block.map((line) => (
                    <li key={line} className="flex gap-3 text-sm leading-relaxed text-mist">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                      {line}
                    </li>
                  ))}
                </ul>
              )
            )}
          </div>
        </Reveal>

        <Reveal className="mt-16">
          <div className="flex items-center justify-between gap-6 border border-line bg-panel/50 p-6">
            <div>
              <p className="font-display text-lg font-semibold text-frost">{state.publicText.insightsUsefulTitle}</p>
              <p className="mt-1 text-sm text-mist">{state.publicText.insightsUsefulBody}</p>
            </div>
            <Link
              to="/contact"
              className="shrink-0 border border-gold/60 bg-gold/10 px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gold transition-colors duration-300 hover:bg-gold hover:text-midnight"
            >
              {state.publicText.commonStartProject}
            </Link>
          </div>
        </Reveal>

        {related.length > 0 && (
          <div className="mt-16">
            <Reveal className="mb-6 flex items-center gap-4">
              <h2 className="font-display text-2xl font-semibold text-frost">{state.publicText.insightsKeepReading}</h2>
              <span className="h-px flex-1 bg-line" aria-hidden="true" />
            </Reveal>
            <div className="grid gap-5 sm:grid-cols-2">
              {related.map((a, i) => (
                <Reveal key={a.slug} delay={i * 100}>
                  <Link
                    to={`/insights/${a.slug}`}
                    className="group block border border-line bg-panel/60 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-gold/40"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">{a.category}</p>
                    <h3 className="mt-2 font-display text-base font-semibold leading-snug text-frost transition-colors group-hover:text-gold">
                      {a.title}
                    </h3>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-dim">{a.read}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
