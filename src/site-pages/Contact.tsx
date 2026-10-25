import { useState, type FormEvent } from "react";
import { useRoute } from "@/router";
import { useStore } from "@/store";
import { Icon, Reveal, SectionHead, btnPrimary } from "@/components/ui";

const inputClass =
  "w-full border border-line bg-panel/60 px-4 py-3 text-sm text-frost outline-none transition-colors placeholder:text-dim/70 focus:border-gold/70";
const labelClass = "mb-2 block font-mono text-[10px] uppercase tracking-[0.25em] text-dim";

type FormState = {
  name: string;
  email: string;
  phone: string;
  company: string;
  type: string;
  budget: string;
  timeline: string;
  description: string;
  attachment: string;
  source: string;
};

export default function Contact() {
  const { query } = useRoute();
  const { addLead, trackCTA, state } = useStore();
  const prefillService = query.get("service") ?? "";

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    company: "",
    type: state.projectTypes.includes(prefillService) ? prefillService : state.projectTypes[0],
    budget: state.budgetRanges[1] ?? state.budgetRanges[0],
    timeline: state.timelines[1] ?? state.timelines[0],
    description: "",
    attachment: "",
    source: state.sources[0],
  });
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const set = (key: keyof FormState) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (form.name.trim().length < 2) {
      setError(state.publicText.contactErrorName);
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError(state.publicText.contactErrorEmail);
      return;
    }
    if (form.description.trim().length < 10) {
      setError(state.publicText.contactErrorDescription);
      return;
    }
    setError(null);
    addLead({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      company: form.company.trim(),
      type: form.type,
      budget: form.budget,
      timeline: form.timeline,
      description: form.description.trim(),
      attachment: form.attachment,
      source: form.source,
    });
    trackCTA("contact-submit");
    setSent(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="px-5 pb-28 pt-32 md:px-10 md:pt-40">
      <div className="mx-auto max-w-[1400px]">
        <SectionHead
          kicker={state.publicText.contactKicker}
          title={state.pageText.contactTitle}
          sub={state.pageText.contactSub}
        />

        <div className="grid gap-14 lg:grid-cols-12">
          {/* Channels */}
          <div className="lg:col-span-5">
            <div className="space-y-4">
              {state.contactChannels.map((c, i) => (
                <Reveal key={c.label} delay={i * 80}>
                  <a
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel={c.href.startsWith("http") ? "noreferrer" : undefined}
                    className="group flex items-center gap-5 border border-line bg-panel/60 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/50"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center border border-gold/40 bg-gold/10 text-gold transition-colors duration-300 group-hover:bg-gold group-hover:text-midnight">
                      <Icon name={c.icon} className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-[10px] uppercase tracking-[0.25em] text-dim">{c.label}</span>
                      <span className="block truncate text-sm font-semibold text-frost">{c.value}</span>
                      <span className="block text-xs text-mist">{c.sub}</span>
                    </span>
                    <Icon
                      name="arrowUpRight"
                      className="h-4 w-4 shrink-0 text-dim transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold"
                    />
                  </a>
                </Reveal>
              ))}
            </div>

            <Reveal delay={300}>
              <div className="mt-8 border border-line bg-panel/40 p-6">
                <div className="flex items-center gap-3">
                  <span className="pulse-dot h-2 w-2 rounded-full bg-jade" />
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-frost">
                    {state.profile.responseTime}
                  </p>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-mist">
                  {state.publicText.contactBasedPrefix} {state.profile.location} — {state.publicText.contactBasedSuffix}
                  {" "}{state.publicText.contactAvailabilityPrefix} <span className="text-gold">{state.publicText.contactAvailability}</span>.
                </p>
              </div>
            </Reveal>
          </div>

          {/* Form */}
          <Reveal delay={150} className="lg:col-span-7">
            {sent ? (
              <div className="flex h-full flex-col items-start justify-center border border-jade/40 bg-jade/[0.06] p-10">
                <span className="flex h-14 w-14 items-center justify-center border border-jade/50 bg-jade/10 text-jade">
                  <Icon name="check" className="h-7 w-7" />
                </span>
                <h2 className="mt-6 font-display text-3xl font-semibold text-frost">
                  {state.publicText.contactSuccessTitle}, {form.name.split(" ")[0]}.
                </h2>
                <p className="mt-4 max-w-lg leading-relaxed text-mist">
                  {state.publicText.contactSuccessBody} <span className="text-frost">{form.email}</span>.
                </p>
                <div className="mt-8 w-full max-w-md space-y-2 border border-line bg-midnight/60 p-5 font-mono text-[11px] leading-relaxed text-dim">
                  <p>
                    <span className="text-gold">→</span> {state.publicText.contactSaved}
                  </p>
                  <p>
                    <span className="text-gold">→</span> {state.publicText.contactOwnerNotified}: {state.profile.email}
                  </p>
                  <p>
                    <span className="text-gold">→</span> {state.publicText.contactConfirmation}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setForm((f) => ({ ...f, description: "", attachment: "" }));
                  }}
                  className="link-underline mt-8 font-mono text-[10px] uppercase tracking-[0.25em] text-gold"
                >
                  {state.publicText.contactAnother}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="border border-line bg-panel/40 p-7 md:p-9">
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-gold">{state.publicText.contactInquiry}</p>

                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="cf-name" className={labelClass}>
                      {state.publicText.contactName} *
                    </label>
                    <input id="cf-name" type="text" value={form.name} onChange={set("name")} placeholder={state.publicText.contactNamePlaceholder} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="cf-email" className={labelClass}>
                      {state.publicText.contactEmail} *
                    </label>
                    <input id="cf-email" type="email" value={form.email} onChange={set("email")} placeholder={state.publicText.contactEmailPlaceholder} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="cf-phone" className={labelClass}>
                      {state.publicText.contactPhone}
                    </label>
                    <input id="cf-phone" type="tel" value={form.phone} onChange={set("phone")} placeholder={state.publicText.contactPhonePlaceholder} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="cf-company" className={labelClass}>
                      {state.publicText.contactCompany}
                    </label>
                    <input id="cf-company" type="text" value={form.company} onChange={set("company")} placeholder={state.publicText.contactCompanyPlaceholder} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="cf-type" className={labelClass}>
                      {state.publicText.contactType}
                    </label>
                    <select id="cf-type" value={form.type} onChange={set("type")} className={inputClass}>
                      {state.projectTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="cf-budget" className={labelClass}>
                      {state.publicText.contactBudget}
                    </label>
                    <select id="cf-budget" value={form.budget} onChange={set("budget")} className={inputClass}>
                      {state.budgetRanges.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="cf-timeline" className={labelClass}>
                      {state.publicText.contactTimeline}
                    </label>
                    <select id="cf-timeline" value={form.timeline} onChange={set("timeline")} className={inputClass}>
                      {state.timelines.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="cf-source" className={labelClass}>
                      {state.publicText.contactSource}
                    </label>
                    <select id="cf-source" value={form.source} onChange={set("source")} className={inputClass}>
                      {state.sources.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-5">
                  <label htmlFor="cf-desc" className={labelClass}>
                    {state.publicText.contactDescription} *
                  </label>
                  <textarea
                    id="cf-desc"
                    rows={5}
                    value={form.description}
                    onChange={set("description")}
                    placeholder={state.publicText.contactDescriptionPlaceholder}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <div className="mt-5">
                  <label htmlFor="cf-attach" className={labelClass}>
                    {state.publicText.contactAttachment}
                  </label>
                  <input
                    id="cf-attach"
                    type="file"
                    onChange={(e) => setForm((f) => ({ ...f, attachment: e.target.files?.[0]?.name ?? "" }))}
                    className="block w-full cursor-pointer border border-line bg-panel/60 px-4 py-3 font-mono text-[11px] text-mist file:mr-4 file:border-0 file:bg-gold file:px-4 file:py-1.5 file:font-mono file:text-[10px] file:font-bold file:uppercase file:tracking-[0.15em] file:text-midnight"
                  />
                  {form.attachment && (
                    <p className="mt-2 font-mono text-[10px] text-jade">✓ {state.publicText.contactAttached}: {form.attachment}</p>
                  )}
                </div>

                {error && (
                  <p role="alert" className="mt-5 border border-[#f26d6d]/40 bg-[#f26d6d]/10 p-4 font-mono text-xs text-[#f2a0a0]">
                    ⚠ {error}
                  </p>
                )}

                <button type="submit" className={`${btnPrimary} mt-7 w-full sm:w-auto`}>
                  {state.publicText.contactSubmit}
                  <Icon name="arrowRight" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                <p className="mt-4 font-mono text-[10px] leading-relaxed text-dim">
                  * {state.publicText.contactRequired}
                </p>
              </form>
            )}
          </Reveal>
        </div>
      </div>
    </div>
  );
}
