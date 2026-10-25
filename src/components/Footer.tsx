import { Link } from "@/router";
import { useStore } from "@/store";
import { Icon, TrackedCTA } from "@/components/ui";

export default function Footer() {
  const { state } = useStore();
  return (
    <footer className="border-t border-line bg-abyss">
      <div className="mx-auto max-w-[1400px] px-5 py-16 md:px-10">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Link to="/" className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center border border-gold/50 bg-gold/10 font-display text-sm font-bold text-gold">
                {state.profile.monogram}
              </span>
              <span className="font-display text-lg font-semibold text-frost">{state.profile.name}</span>
            </Link>
            <p className="mt-5 max-w-sm leading-relaxed text-mist">
              {state.profile.footerBio}
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              {state.socials.map((s) => (
                <Link
                  key={s.label}
                  to={s.url}
                  className="link-underline font-mono text-[11px] uppercase tracking-[0.2em] text-mist transition-colors hover:text-gold"
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim">{state.publicText.footerExplore}</p>
            <ul className="mt-4 space-y-2.5">
              {state.nav.filter((item) => item.active).map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-mist transition-colors hover:text-gold">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim">{state.publicText.footerServices}</p>
            <ul className="mt-4 space-y-2.5">
              {state.services
                .filter((s) => s.visible !== false)
                .slice(0, 6)
                .map((s) => (
                <li key={s.slug}>
                  <Link to="/services" className="text-sm text-mist transition-colors hover:text-gold">
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim">{state.publicText.footerContact}</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <a href={`mailto:${state.profile.email}`} className="text-mist transition-colors hover:text-gold">
                  {state.profile.email}
                </a>
              </li>
              <li>
                <a href={`tel:${String(state.profile.phone ?? "").replace(/\s/g, "")}`} className="text-mist transition-colors hover:text-gold">
                  {state.profile.phone}
                </a>
              </li>
              <li className="text-dim">{state.profile.location}</li>
              <li className="pt-2">
                <TrackedCTA
                  id="cta-consult"
                  to={state.profile.calendly}
                  className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-gold hover:text-goldsoft"
                >
                  <Icon name="calendar" className="h-3.5 w-3.5" /> {state.publicText.footerBookCall}
                </TrackedCTA>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-line pt-7 md:flex-row">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
            © {new Date().getFullYear()} {state.profile.name} — {state.profile.location}. {state.publicText.footerRights}
          </p>
          <div className="flex items-center gap-7">
            <Link to="/privacy" className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim transition-colors hover:text-gold">
              {state.publicText.footerPrivacy}
            </Link>
            <Link to="/terms" className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim transition-colors hover:text-gold">
              {state.publicText.footerTerms}
            </Link>
            <Link to="/admin" className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim transition-colors hover:text-gold">
              {state.publicText.footerAdmin}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
