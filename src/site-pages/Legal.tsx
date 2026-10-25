import { Reveal } from "@/components/ui";
import { useStore } from "@/store";

export default function Legal({ kind }: { kind: "privacy" | "terms" }) {
  const { state } = useStore();
  const items = state.legal[kind];
  const title = kind === "privacy" ? "Privacy Policy" : "Terms & Conditions";

  return (
    <div className="px-5 pb-28 pt-32 md:px-10 md:pt-40">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-gold">{state.publicText.legalKicker}</p>
          <h1 className="mt-4 font-display text-5xl font-bold tracking-tight text-frost">{title}</h1>
          <p className="mt-4 text-sm text-mist">{state.publicText.legalUpdated}: {state.legal.updated} · {state.profile.name}, {state.profile.location}</p>
        </Reveal>
        <div className="mt-12 space-y-10 border-t border-line pt-10">
          {items.map((item, i) => (
            <Reveal key={item.h} delay={i * 80}>
              <h2 className="font-display text-xl font-semibold text-frost">{item.h}</h2>
              <p className="mt-3 leading-relaxed text-mist">{item.p}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
