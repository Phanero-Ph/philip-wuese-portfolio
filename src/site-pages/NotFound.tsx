import { Link } from "@/router";
import { Icon, btnGhost, btnPrimary } from "@/components/ui";
import { useStore } from "@/store";

export default function NotFound() {
  const { state } = useStore();
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 pt-24 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-gold">{state.publicText.notFoundKicker}</p>
      <h1 className="mt-4 font-display text-6xl font-bold tracking-tight text-frost md:text-8xl">{state.publicText.notFoundTitle}</h1>
      <p className="mt-5 max-w-md leading-relaxed text-mist">{state.publicText.notFoundBody}</p>
      <div className="mt-9 flex flex-wrap justify-center gap-4">
        <Link to="/" className={btnPrimary}>
          {state.publicText.notFoundAction}
        </Link>
        <Link to="/projects" className={btnGhost}>
          {state.publicText.notFoundProjects}
          <Icon name="arrowRight" className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
