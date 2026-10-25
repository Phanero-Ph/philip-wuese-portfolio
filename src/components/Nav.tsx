import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";
import { Link, useRoute } from "@/router";
import { useStore } from "@/store";
import { Icon, TrackedCTA } from "@/components/ui";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { path } = useRoute();
  const { state } = useStore();
  const items = state.nav.filter((n) => n.active);
  const navCta = state.ctas.find((c) => c.id === "nav-cta");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (to: string) => (to === "/" ? path === "/" : path.startsWith(to));

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-all duration-300",
          scrolled || open
            ? "border-b border-line bg-midnight/85 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        )}
      >
        <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 md:px-10">
          <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <span className="flex h-10 w-10 items-center justify-center border border-gold/50 bg-gold/10 font-display text-sm font-bold text-gold">
              {state.profile.monogram}
            </span>
            <span className="hidden flex-col leading-tight sm:flex">
              <span className="font-display text-sm font-semibold tracking-wide text-frost">{state.profile.name}</span>
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-dim">{state.publicText.navRole}</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            {items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                data-active={isActive(item.to)}
                className={cn(
                  "link-underline font-mono text-[11px] uppercase tracking-[0.25em] transition-colors",
                  isActive(item.to) ? "text-gold" : "text-mist hover:text-frost"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <TrackedCTA
              id="nav-cta"
              to="/contact"
              className="hidden items-center gap-2 border border-gold/60 bg-gold/10 px-5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gold transition-all duration-300 hover:bg-gold hover:text-midnight md:inline-flex"
            >
              {navCta?.label ?? "Let's Work Together"}
            </TrackedCTA>
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center border border-line text-frost transition-colors hover:border-gold/60 hover:text-gold lg:hidden"
            >
              <Icon name={open ? "close" : "menu"} className="h-5 w-5" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-0 z-30 flex flex-col justify-center bg-abyss/95 px-8 backdrop-blur-xl transition-all duration-300 lg:hidden",
          open ? "visible opacity-100" : "invisible opacity-0"
        )}
      >
        <div className="space-y-2">
          {items.map((item, i) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={cn(
                "block border-b border-line py-4 font-display text-3xl font-semibold transition-all duration-500",
                open ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0",
                isActive(item.to) ? "text-gold" : "text-frost"
              )}
              style={{ transitionDelay: open ? `${100 + i * 60}ms` : "0ms" }}
            >
              <span className="mr-4 font-mono text-xs text-dim">0{i + 1}</span>
              {item.label}
            </Link>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3">
          {state.socials.map((s) => (
            <Link key={s.label} to={s.url} className="font-mono text-[11px] uppercase tracking-[0.2em] text-mist hover:text-gold">
              {s.label}
            </Link>
          ))}
        </div>
        <TrackedCTA
          id="nav-cta"
          to="/contact"
          className="mt-10 inline-flex items-center gap-2 bg-gold px-7 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-midnight"
        >
          {navCta?.label ?? "Let's Work Together"} <Icon name="arrowUpRight" className="h-4 w-4" />
        </TrackedCTA>
      </div>
    </>
  );
}
