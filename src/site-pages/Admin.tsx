import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { cn } from "@/utils/cn";
import { Link } from "@/router";
import { useStore } from "@/store";
import {
  BUDGET_RANGES,
  CTA_REGISTRY,
  LEAD_STATUSES,
  PROJECT_TYPES,
  SECTION_LABELS,
  SOURCES,
  TIMELINES,
  type LeadStatus,
  type ProjectStatus,
  type SectionKey,
} from "@/data/site";
import { USER_ROLES, type AdminUser, type AdminUserRole } from "@/data/adminUsers";
import { Icon, Monogram, Stars } from "@/components/ui";
import { api, apiForm } from "@/api";

/* ---------- light theme primitives ---------- */

const card = "rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]";
const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15";
const labelCls = "mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500";
const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40";
const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50";
const iconBtn =
  "rounded-lg border border-slate-200 bg-white p-2 text-slate-400 transition-colors hover:border-slate-300 hover:text-slate-900";
const dangerBtn =
  "rounded-lg border border-slate-200 bg-white p-2 text-slate-400 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600";
const miniBtn =
  "rounded border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-500 transition-colors hover:text-slate-900";
const pillToggle = (on: boolean) =>
  cn(
    "rounded-lg border px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.12em] transition-colors",
    on
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
      : "border-slate-200 bg-slate-50 text-slate-400 hover:bg-slate-100"
  );

const STATUS_STYLES: Record<LeadStatus, string> = {
  New: "border-amber-200 bg-amber-50 text-amber-700",
  Contacted: "border-sky-200 bg-sky-50 text-sky-700",
  Qualified: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Proposal: "border-violet-200 bg-violet-50 text-violet-700",
  Won: "border-emerald-300 bg-emerald-100 text-emerald-800",
  Lost: "border-slate-200 bg-slate-100 text-slate-500",
};

const STATUS_DOT: Record<LeadStatus, string> = {
  New: "bg-amber-500",
  Contacted: "bg-sky-500",
  Qualified: "bg-emerald-500",
  Proposal: "bg-violet-500",
  Won: "bg-emerald-600",
  Lost: "bg-slate-400",
};

const HUE_BG: Record<AdminUser["hue"], string> = {
  slate: "bg-slate-800",
  amber: "bg-amber-500",
  sky: "bg-sky-500",
  emerald: "bg-emerald-500",
  violet: "bg-violet-500",
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "item";
const uniqSlug = (existing: string[], base: string) => {
  let slug = base;
  let n = 2;
  while (existing.includes(slug)) slug = `${base}-${n++}`;
  return slug;
};
const newId = (p: string) => `${p}${Date.now().toString(36)}`;
const serializeBody = (body: (string | string[])[]) =>
  body.map((b) => (typeof b === "string" ? b : b.map((l) => "• " + l).join("\n"))).join("\n\n");
const parseBody = (text: string): (string | string[])[] =>
  text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => {
      const lines = b.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length > 1 && lines.every((l) => l.startsWith("•"))) return lines.map((l) => l.slice(1).trim());
      return lines.join(" ");
    });

const PROJECT_CATEGORIES = ["SaaS", "Web Applications", "Marketplaces", "APIs", "Mobile Applications", "Business Platforms", "Other"];
const ARTICLE_CATEGORIES = ["Software Engineering", "Technology", "AI", "SaaS", "Product Development", "Tutorials", "Case Studies", "Business Technology"];
const SERVICE_ICONS = ["code", "layers", "api", "cart", "phone", "card", "blueprint", "bolt", "plug", "server", "box", "mail"];

type Editing = { index: number } | null;

/* ============================ MODAL & FORM PRIMITIVES ============================ */

function Modal({
  title,
  subtitle,
  onClose,
  children,
  footer,
  wide = false,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6">
      <div className="fade-in absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "modal-in relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl",
          wide ? "sm:max-w-3xl" : "sm:max-w-xl"
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close dialog" className={iconBtn}>
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

function Field({ label, required, hint, children, className }: { label: string; required?: boolean; hint?: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
          {label}
          {required && <span className="ml-0.5 text-rose-500">*</span>}
        </span>
        {hint && <span className="text-[9px] font-semibold text-slate-400">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function FormSection({ title }: { title: string }) {
  return (
    <p className="mt-6 border-b border-slate-100 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 first:mt-0">
      {title}
    </p>
  );
}

/* ============================ LOGIN ============================ */

function Login({ onSuccess }: { onSuccess: () => void }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [setup, setSetup] = useState<{ qr_code: string; secret: string } | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [verifying, setVerifying] = useState(false);
  const verifyingRef = useRef(false);
  const lastAutoCode = useRef("");

  const submitCreds = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const result = await api<{ setup: boolean; qr_code?: string; secret?: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      setError(null);
      setSetup(result.setup && result.qr_code && result.secret ? { qr_code: result.qr_code, secret: result.secret } : null);
      setStep(2);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to continue.");
    }
  };

  const submitCode = async (e?: FormEvent, submittedCode = code) => {
    e?.preventDefault();
    const normalizedCode = submittedCode.replace(/\s/g, "");
    if (verifyingRef.current || normalizedCode.length !== 6) return;
    verifyingRef.current = true;
    setVerifying(true);
    setError(null);
    try {
      const result = await api<{ recovery_codes: string[] | null }>("/api/auth/verify", {
        method: "POST",
        body: JSON.stringify({ code: normalizedCode }),
      });
      if (result.recovery_codes?.length) {
        setRecoveryCodes(result.recovery_codes);
        setStep(3);
      } else onSuccess();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to sign in.");
    } finally {
      verifyingRef.current = false;
      setVerifying(false);
    }
  };

  useEffect(() => {
    if (step !== 2 || !/^\d{6}$/.test(code) || code === lastAutoCode.current) return;
    lastAutoCode.current = code;
    void submitCode(undefined, code);
  }, [code, step]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-16">
      <div className="w-full max-w-md">
        <div className={cn(card, "p-8 md:p-10")}>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 font-display text-sm font-bold text-amber-400">
              WP
            </span>
            <div>
              <p className="font-display text-lg font-bold text-slate-900">Wuese Philip</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                {step === 1 ? "Step 1 — Credentials" : step === 2 ? "Step 2 — Authenticator" : "Setup complete"}
              </p>
            </div>
          </div>

          {step === 1 ? (
            <form onSubmit={submitCreds} className="mt-8 space-y-4">
              <div>
                <label htmlFor="ad-email" className={labelCls}>
                  Email
                </label>
                <input id="ad-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="admin@…" autoComplete="username" />
              </div>
              <div>
                <label htmlFor="ad-pass" className={labelCls}>
                  Password
                </label>
                <input id="ad-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="••••••••" autoComplete="current-password" />
              </div>
              {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-600">{error}</p>}
              <button type="submit" className={cn(btnPrimary, "w-full py-3")}>
                Continue
              </button>
            </form>
          ) : step === 2 ? (
            <form onSubmit={submitCode} className="mt-8 space-y-4">
              {setup && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                  <p className="mb-3 text-xs font-semibold text-slate-600">Scan this QR code with your authenticator app.</p>
                  <img src={setup.qr_code} alt="Authenticator setup QR code" className="mx-auto h-48 w-48 rounded-lg bg-white p-2" />
                  <p className="mt-3 text-[10px] text-slate-500">Manual setup key</p>
                  <code className="mt-1 block break-all rounded bg-white px-2 py-1.5 font-mono text-xs font-bold text-slate-800">{setup.secret}</code>
                </div>
              )}
              <div>
                <label htmlFor="ad-code" className={labelCls}>
                  Authenticator Code
                </label>
                <input
                  id="ad-code"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => {
                    const nextCode = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setError(null);
                    setCode(nextCode);
                  }}
                  placeholder="000000"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  aria-describedby="authenticator-code-status"
                  disabled={verifying}
                  className={cn(inputCls, "text-center font-mono text-xl tracking-[0.5em]")}
                />
              </div>
              <p id="authenticator-code-status" aria-live="polite" className="text-center text-[10px] font-semibold text-slate-400">
                {verifying ? "Verifying code…" : "Verification starts automatically after six digits."}
              </p>
              {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-600">{error}</p>}
              <button type="submit" disabled={verifying || code.length !== 6} className={cn(btnPrimary, "w-full py-3")}>
                {verifying ? "Verifying…" : setup ? "Confirm Setup & Sign In" : "Verify & Sign In"}
              </button>
            </form>
          ) : (
            <div className="mt-8">
              <p className="text-sm leading-relaxed text-slate-600">Save these one-time recovery codes somewhere secure. They will not be shown again.</p>
              <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4">
                {recoveryCodes.map((item) => <code key={item} className="font-mono text-xs font-bold text-amber-900">{item}</code>)}
              </div>
              <button type="button" onClick={onSuccess} className={cn(btnPrimary, "mt-5 w-full py-3")}>I saved them — Enter CMS</button>
            </div>
          )}
        </div>

        <Link to="/" className="mt-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 transition-colors hover:text-slate-900">
          <Icon name="arrowRight" className="h-3.5 w-3.5 rotate-180" /> Back to website
        </Link>
      </div>
    </div>
  );
}

/* ============================ CHART PRIMITIVES ============================ */

function Spark({ data, className }: { data: number[]; className?: string }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${25 - ((v - min) / range) * 20}`).join(" ");
  return (
    <svg viewBox="0 0 100 28" preserveAspectRatio="none" className={cn("h-7 w-full", className)} aria-hidden="true">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function Panel({ title, hint, children, className }: { title: string; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn(card, "flex h-full flex-col p-5 md:p-6", className)}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-base font-bold text-slate-900 md:text-lg">{title}</h3>
        {hint}
      </div>
      {children}
    </section>
  );
}

/* ============================ DASHBOARD ============================ */

function Dashboard() {
  const { state } = useStore();
  const ctaTotal = Object.values(state.ctaClicks).reduce((a, b) => a + b, 0);
  const newLeads = state.leads.filter((l) => l.status === "New").length;
  const ongoing = state.projects.filter((p) => p.status === "ongoing").length;
  const maxClicks = Math.max(1, ...CTA_REGISTRY.map((c) => state.ctaClicks[c.id] ?? 0));
  const topCta = CTA_REGISTRY.reduce(
    (best, c) => ((state.ctaClicks[c.id] ?? 0) > (state.ctaClicks[best.id] ?? 0) ? c : best),
    CTA_REGISTRY[0]
  );

  const days = state.analytics.views7.map((item) => ({
    d: new Date(`${item.date}T12:00:00`).toLocaleDateString("en-GB", { weekday: "short" }),
    v: item.value,
  }));
  const maxDay = Math.max(1, ...days.map((x) => x.v));
  const weekTotal = days.reduce((a, b) => a + b.v, 0);
  const change = (current: number, previous: number) => previous > 0 ? ((current - previous) / previous) * 100 : null;
  const trendText = (current: number, previous: number, period: string) => {
    const value = change(current, previous);
    if (value === null) return previous === 0 && current > 0 ? `New activity · ${period}` : `No change · ${period}`;
    return `${value >= 0 ? "▲" : "▼"} ${Math.abs(value).toFixed(1)}% vs ${period}`;
  };
  const visitorsTrend = change(state.analytics.visitors30, state.analytics.visitorsPrevious30);
  const viewsTrend = change(weekTotal, state.analytics.viewsPrevious7);
  const publishedThisMonth = state.articles.filter((article) => {
    if (article.published === false) return false;
    const date = new Date(article.date);
    const now = new Date();
    return !Number.isNaN(date.getTime()) && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;
  const leadTrend = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - offset));
    return state.leads.filter((lead) => {
      const created = new Date(lead.date);
      return created.getFullYear() === date.getFullYear() && created.getMonth() === date.getMonth() && created.getDate() === date.getDate();
    }).length;
  });
  const deviceTotal = state.analytics.devices30.reduce((sum, item) => sum + item.value, 0);
  const devices = state.analytics.devices30.map((item) => ({
    ...item,
    pct: deviceTotal ? Math.round((item.value / deviceTotal) * 100) : 0,
    icon: item.label === "Mobile" ? "phone" : item.label === "Tablet" ? "layers" : "blueprint",
  }));
  const sourceTotal = state.analytics.sources30.reduce((sum, item) => sum + item.value, 0);
  const trafficSources = state.analytics.sources30.map((item) => ({ ...item, pct: sourceTotal ? Math.round((item.value / sourceTotal) * 100) : 0 }));

  const statusCounts = LEAD_STATUSES.map((s) => state.leads.filter((l) => l.status === s).length);
  const maxStatus = Math.max(1, ...statusCounts);

  const kpis = [
    { label: "Visitors · 30 days", value: state.analytics.visitors30.toLocaleString(), sub: trendText(state.analytics.visitors30, state.analytics.visitorsPrevious30, "previous 30 days"), tone: visitorsTrend !== null && visitorsTrend < 0 ? "text-rose-600" : "text-emerald-600", spark: [] },
    { label: "Page views · 7 days", value: String(weekTotal), sub: trendText(weekTotal, state.analytics.viewsPrevious7, "previous 7 days"), tone: viewsTrend !== null && viewsTrend < 0 ? "text-rose-600" : "text-emerald-600", spark: days.map((d) => d.v) },
    { label: "New leads", value: String(newLeads), sub: `${state.leads.length} total in pipeline`, tone: "text-amber-600", spark: leadTrend },
    { label: "Projects", value: String(state.projects.length), sub: `${ongoing} ongoing now`, tone: "text-slate-500", spark: [] },
    { label: "Articles", value: String(state.articles.length), sub: `${publishedThisMonth} published this month`, tone: "text-slate-500", spark: [] },
    { label: "CTA clicks", value: String(ctaTotal), sub: ctaTotal > 0 ? `Top: ${topCta.label}` : "No clicks recorded", tone: "text-slate-500", spark: state.analytics.cta7.map((item) => item.value) },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => (
          <div key={k.label} className={cn(card, "p-4 transition-shadow hover:shadow-md md:p-5")}>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{k.label}</p>
            <div className="mt-2 flex items-end justify-between gap-2">
              <p className="font-display text-[26px] font-bold leading-none text-slate-900 md:text-3xl">{k.value}</p>
              <div className="w-14 shrink-0 text-amber-500/80">
                <Spark data={k.spark} />
              </div>
            </div>
            <p className={cn("mt-2 truncate text-[11px] font-semibold", k.tone)}>{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Panel
            title="Page Views"
            hint={
              <span className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-700">
                <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live
              </span>
            }
          >
            <div className="mt-6 flex h-44 items-end gap-2">
              {days.map((d) => (
                <div key={d.d} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-[9px] font-semibold text-slate-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {d.v}
                  </span>
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-amber-500 to-amber-400 transition-all duration-500 group-hover:from-slate-800 group-hover:to-slate-700"
                      style={{ height: `${(d.v / maxDay) * 100}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">{d.d}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
              <span>Last 7 days</span>
              <span>
                {weekTotal} views · avg {Math.round(weekTotal / days.length)}/day
              </span>
            </div>
          </Panel>
        </div>

        <Panel title="Devices" hint={<span className="text-[10px] font-bold text-slate-400">30 days</span>}>
          <div className="mt-6 space-y-6">
            {devices.map((d) => (
              <div key={d.label}>
                <div className="flex items-center justify-between gap-3">
                  <p className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
                    <Icon name={d.icon} className="h-4 w-4 text-slate-400" />
                    {d.label}
                  </p>
                  <p className="text-xs font-bold text-slate-900">{d.pct}%</p>
                </div>
                <div className="mt-2.5 h-1.5 w-full rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-slate-700 to-slate-900" style={{ width: `${d.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-auto pt-6 text-[11px] leading-relaxed text-slate-400">{deviceTotal ? `${deviceTotal} tracked page views in the last 30 days.` : "No device data recorded yet."}</p>
        </Panel>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <Panel
          title="Lead Pipeline"
          hint={
            <Link to="/contact" className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-600 hover:text-amber-700">
              + New inquiry
            </Link>
          }
        >
          <div className="mt-6 space-y-4">
            {LEAD_STATUSES.map((s, i) => (
              <div key={s}>
                <div className="flex items-center justify-between gap-3">
                  <p className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
                    <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[s])} aria-hidden="true" />
                    {s}
                  </p>
                  <p className="text-xs font-bold text-slate-900">{statusCounts[i]}</p>
                </div>
                <div className="mt-2 h-1 w-full rounded-full bg-slate-100">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", STATUS_DOT[s])}
                    style={{ width: statusCounts[i] > 0 ? `${Math.max(8, (statusCounts[i] / maxStatus) * 100)}%` : "0%" }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-auto pt-6 text-[11px] leading-relaxed text-slate-400">
            {state.leads.length === 0
              ? "Submit the contact form — leads appear here in real time."
              : `${state.leads.length} leads · ${newLeads} awaiting first contact.`}
          </p>
        </Panel>

        <Panel title="Traffic Sources" hint={<span className="text-[10px] font-bold text-slate-400">30 days</span>}>
          <div className="mt-6 space-y-4">
            {trafficSources.map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-700">{s.label}</p>
                  <p className="text-xs font-bold text-slate-900">{s.pct}%</p>
                </div>
                <div className="mt-2 h-1 w-full rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-sky-400" style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-auto pt-6 text-[11px] leading-relaxed text-slate-400">{sourceTotal ? `${sourceTotal} sourced page views in the last 30 days.` : "No traffic-source data recorded yet."}</p>
        </Panel>

        <Panel title="CTA Performance" hint={<span className="text-[10px] font-bold text-slate-400">{ctaTotal} total</span>}>
          <div className="mt-6 space-y-4">
            {CTA_REGISTRY.slice(0, 6).map((c) => {
              const count = state.ctaClicks[c.id] ?? 0;
              return (
                <div key={c.id}>
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-sm font-medium text-slate-700">
                      {c.label} <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">· {c.location}</span>
                    </p>
                    <p className="text-xs font-bold text-slate-900">{count}</p>
                  </div>
                  <div className="mt-1.5 h-1 w-full rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500"
                      style={{ width: count > 0 ? `${Math.max(6, (count / maxClicks) * 100)}%` : "0%" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-auto pt-6 text-[11px] leading-relaxed text-slate-400">
            Clicks are recorded automatically on every public CTA.
          </p>
        </Panel>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel title="Most Viewed Projects" hint={<span className="text-[10px] font-bold text-slate-400">30 days</span>}>
          <ul className="mt-4 space-y-1">
            {state.projects.slice(0, 5).map((p, i) => (
              <li key={p.id}>
                <Link to={`/projects/${p.slug}`} className="group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50">
                  <span className="text-[10px] font-bold text-slate-400">{String(i + 1).padStart(2, "0")}</span>
                  <Monogram label={p.monogram} className="h-8 w-8 border-amber-200 bg-amber-50 text-[10px] text-amber-700" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-800 transition-colors group-hover:text-slate-900">{p.name}</span>
                    <span className="block text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">{p.category}</span>
                  </span>
                  <span className="text-xs font-bold text-amber-600">{620 - i * 93}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Popular Articles" hint={<span className="text-[10px] font-bold text-slate-400">all time</span>}>
          <ul className="mt-4 space-y-1">
            {state.articles.slice(0, 4).map((a, i) => (
              <li key={a.slug}>
                <Link to={`/insights/${a.slug}`} className="group flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50">
                  <span className="mt-0.5 text-[10px] font-bold text-slate-400">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-sm font-semibold leading-snug text-slate-800 transition-colors group-hover:text-slate-900">
                      {a.title}
                    </span>
                    <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                      {a.category} · {a.read}
                    </span>
                  </span>
                  <span className="text-xs font-bold text-amber-600">{214 - i * 31}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Recent Inquiries">
          <div className="mt-4 space-y-2.5">
            {state.leads.length === 0 && (
              <p className="py-8 text-center text-xs font-medium leading-relaxed text-slate-400">
                No inquiries yet.
                <br />
                They land here the moment the contact form is submitted.
              </p>
            )}
            {state.leads.slice(0, 4).map((l) => (
              <div key={l.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="min-w-0 truncate text-sm font-bold text-slate-900">{l.name}</p>
                  <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em]", STATUS_STYLES[l.status])}>
                    {l.status}
                  </span>
                </div>
                <p className="mt-1 truncate text-[10px] font-semibold text-slate-500">
                  {l.type} · {l.budget} · {fmt(l.date)}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Recent Activity" hint={<span className="text-[10px] font-bold text-slate-400">Every admin action is recorded</span>}>
        <ul className="mt-4 grid gap-x-10 md:grid-cols-2">
          {state.activity.slice(0, 8).map((a) => (
            <li key={a.id} className="flex items-start gap-3 border-b border-slate-100 py-3 text-sm last:border-0 md:[&:nth-last-child(2)]:border-0">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden="true" />
              <span className="text-slate-600">{a.text}</span>
              <span className="ml-auto shrink-0 text-[10px] font-semibold text-slate-400">{fmt(a.time)}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

/* ============================ LEADS ============================ */

function LeadForm({ onClose }: { onClose: () => void }) {
  const { addLead } = useStore();
  const [f, setF] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    type: PROJECT_TYPES[0],
    budget: BUDGET_RANGES[1],
    timeline: TIMELINES[1],
    source: SOURCES[0],
    description: "",
  });
  const [err, setErr] = useState<string | null>(null);

  const save = () => {
    if (f.name.trim().length < 2) {
      setErr("Enter the lead's name.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(f.email)) {
      setErr("Enter a valid email address.");
      return;
    }
    if (f.description.trim().length < 5) {
      setErr("Add a short description.");
      return;
    }
    addLead({
      name: f.name.trim(),
      email: f.email.trim(),
      phone: f.phone.trim(),
      company: f.company.trim(),
      type: f.type,
      budget: f.budget,
      timeline: f.timeline,
      description: f.description.trim(),
      attachment: "",
      source: f.source,
    });
    onClose();
  };

  return (
    <Modal
      wide
      title="New lead"
      subtitle="Manually record an inquiry — saved with status “New” and reflected in the dashboard instantly."
      onClose={onClose}
      footer={
        <>
          {err && <span className="mr-auto text-xs font-semibold text-rose-600">{err}</span>}
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button type="button" onClick={save} className={btnPrimary}>
            Save lead
          </button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" required>
          <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Jane Doe" className={inputCls} />
        </Field>
        <Field label="Email" required>
          <input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="jane@company.com" className={inputCls} />
        </Field>
        <Field label="Phone">
          <input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+49 …" className={inputCls} />
        </Field>
        <Field label="Company">
          <input value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} placeholder="Acme GmbH" className={inputCls} />
        </Field>
        <Field label="Project type">
          <select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })} className={inputCls}>
            {PROJECT_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="Budget range">
          <select value={f.budget} onChange={(e) => setF({ ...f, budget: e.target.value })} className={inputCls}>
            {BUDGET_RANGES.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </Field>
        <Field label="Expected timeline">
          <select value={f.timeline} onChange={(e) => setF({ ...f, timeline: e.target.value })} className={inputCls}>
            {TIMELINES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="Source">
          <select value={f.source} onChange={(e) => setF({ ...f, source: e.target.value })} className={inputCls}>
            {SOURCES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Description" required hint="How did they reach out?" className="sm:col-span-2">
          <textarea rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="Wants a SaaS billing module…" className={cn(inputCls, "resize-none")} />
        </Field>
      </div>
    </Modal>
  );
}

function LeadsView() {
  const { state, setLeadStatus, setLeadNotes, removeLead } = useStore();
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {LEAD_STATUSES.map((s) => (
            <span key={s} className={cn("rounded-full border px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em]", STATUS_STYLES[s])}>
              {s} · {state.leads.filter((l) => l.status === s).length}
            </span>
          ))}
        </div>
        <button type="button" onClick={() => setAdding(true)} className={btnPrimary}>
          + Add lead
        </button>
      </div>

      {state.leads.length === 0 && (
        <div className={cn(card, "p-12 text-center")}>
          <p className="font-display text-xl font-bold text-slate-900">No leads yet.</p>
          <p className="mt-2 text-xs text-slate-500">
            Submit the contact form on the <Link to="/contact" className="font-bold text-amber-600">Contact page</Link>, or add one manually — both appear here in real time.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {state.leads.map((l) => (
          <div key={l.id} className={cn(card, "p-5 md:p-6")}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-display text-base font-bold text-slate-900">
                  {l.name} {l.company && <span className="font-sans text-sm font-medium text-slate-500">— {l.company}</span>}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {l.email}
                  {l.phone && ` · ${l.phone}`}
                  {l.attachment && ` · attached: ${l.attachment}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={l.status}
                  onChange={(e) => setLeadStatus(l.id, e.target.value as LeadStatus)}
                  aria-label={`Status for lead ${l.name}`}
                  className={cn("rounded-lg border bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] outline-none", STATUS_STYLES[l.status])}
                >
                  {LEAD_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={() => removeLead(l.id)} aria-label={`Delete lead ${l.name}`} className={dangerBtn}>
                  <Icon name="close" className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 border-t border-slate-100 pt-4 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 lg:grid-cols-4">
              <p>Type: <span className="text-slate-700 normal-case">{l.type}</span></p>
              <p>Budget: <span className="text-slate-700 normal-case">{l.budget}</span></p>
              <p>Timeline: <span className="text-slate-700 normal-case">{l.timeline}</span></p>
              <p>Source: <span className="text-slate-700 normal-case">{l.source} · {fmt(l.date)}</span></p>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-slate-600">{l.description}</p>

            <input
              value={l.notes}
              onChange={(e) => setLeadNotes(l.id, e.target.value)}
              placeholder="Add internal notes…"
              className={cn(inputCls, "mt-4 bg-slate-50/70")}
            />
          </div>
        ))}
      </div>

      {adding && <LeadForm onClose={() => setAdding(false)} />}
    </div>
  );
}

/* ============================ PROJECTS ============================ */

function ProjectForm({ editing, onClose }: { editing: Editing; onClose: () => void }) {
  const { state, addEntity, updateEntity } = useStore();
  const editIndex = editing ? editing.index : null;
  const p = editIndex !== null ? state.projects[editIndex] : null;
  const [f, setF] = useState(() => ({
    name: p?.name ?? "",
    slug: p?.slug ?? "",
    monogram: p?.monogram ?? "",
    tagline: p?.tagline ?? "",
    description: p?.description ?? "",
    challenge: p?.challenge ?? "",
    solution: p?.solution ?? "",
    features: (p?.features ?? []).join("\n"),
    results: (p?.results ?? []).map((r) => `${r.value} | ${r.label}`).join("\n"),
    category: p?.category ?? PROJECT_CATEGORIES[0],
    status: p?.status ?? ("completed" as ProjectStatus),
    year: p?.year ?? String(new Date().getFullYear()),
    preview: p?.preview ?? "browser",
    startDate: p?.startDate ?? "",
    endDate: p?.endDate ?? "",
    role: p?.role ?? "Full-Stack Engineer",
    client: p?.client ?? "",
    stack: (p?.stack ?? []).join(", "),
    domain: p?.domain ?? "",
    liveUrl: p?.liveUrl ?? "",
    githubUrl: p?.githubUrl ?? "",
    appStoreUrl: p?.appStoreUrl ?? "",
    googlePlayUrl: p?.googlePlayUrl ?? "",
    seoTitle: p?.seoTitle ?? "",
    seoDesc: p?.seoDesc ?? "",
    cover: p?.cover ?? "",
    featured: !!p?.featured,
  }));
  const [err, setErr] = useState<string | null>(null);

  const save = () => {
    if (f.name.trim().length < 2) {
      setErr("Enter a project name.");
      return;
    }
    const tagline = f.tagline.trim();
    const desc = f.description.trim();
    const payload = {
      name: f.name.trim(),
      monogram: (f.monogram.trim() || initials(f.name)).slice(0, 2).toUpperCase(),
      tagline: tagline || "New project — add a tagline.",
      description: desc || tagline || "New project.",
      category: f.category,
      status: f.status,
      year: f.year.trim() || String(new Date().getFullYear()),
      role: f.role.trim() || "Full-Stack Engineer",
      client: f.client.trim() || "—",
      stack: f.stack.split(",").map((s) => s.trim()).filter(Boolean),
      domain: f.domain.trim() || "project.local",
      liveUrl: f.liveUrl.trim() || undefined,
      githubUrl: f.githubUrl.trim() || undefined,
      appStoreUrl: f.appStoreUrl.trim() || undefined,
      googlePlayUrl: f.googlePlayUrl.trim() || undefined,
      seoTitle: f.seoTitle.trim() || undefined,
      seoDesc: f.seoDesc.trim() || undefined,
      startDate: f.startDate.trim() || undefined,
      endDate: f.endDate.trim() || undefined,
      featured: f.featured,
      challenge: f.challenge.trim() || desc,
      solution: f.solution.trim() || desc,
      features: f.features.split("\n").map((line) => line.trim()).filter(Boolean),
      results: f.results.split("\n").map((line) => { const [value, ...label] = line.split("|"); return { value: value.trim(), label: label.join("|").trim() }; }).filter((item) => item.value && item.label),
      preview: f.preview,
      cover: f.cover.trim() || undefined,
    };
    if (p && editIndex !== null) {
      updateEntity("projects", editIndex, payload);
    } else if (!p) {
      addEntity("projects", { id: newId("p"), slug: uniqSlug(state.projects.map((x) => x.slug), f.slug.trim() || slugify(f.name)), ...payload } as unknown as Record<string, unknown>);
    }
    onClose();
  };

  return (
    <Modal
      wide
      title={p ? `Edit project — ${p.name}` : "New project"}
      subtitle={p ? `Currently live at /projects/${p.slug}` : "Creates a full project record with its own public page."}
      onClose={onClose}
      footer={
        <>
          {err && <span className="mr-auto text-xs font-semibold text-rose-600">{err}</span>}
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button type="button" onClick={save} className={btnPrimary}>
            {p ? "Save changes" : "Create project"}
          </button>
        </>
      }
    >
      <FormSection title="Identity" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Project name" required>
          <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Orbit CRM" className={inputCls} />
        </Field>
        <Field label="Slug / URL" hint={`/projects/${f.slug.trim() || slugify(f.name || "name")}`}>
          <input value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} placeholder="orbit-crm" className={cn(inputCls, "font-mono text-xs")} />
        </Field>
        <Field label="Logo initials" hint="2 characters">
          <input value={f.monogram} onChange={(e) => setF({ ...f, monogram: e.target.value })} placeholder="OC" maxLength={2} className={cn(inputCls, "font-mono")} />
        </Field>
        <Field label="Cover image URL" hint="Select or upload in Media Library" className="sm:col-span-2">
          <input value={f.cover} onChange={(e) => setF({ ...f, cover: e.target.value })} placeholder="/storage/media/…" className={cn(inputCls, "font-mono text-xs")} />
        </Field>
        <Field label="Category">
          <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} className={inputCls}>
            {PROJECT_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Short description" required hint="Shown on cards">
          <input value={f.tagline} onChange={(e) => setF({ ...f, tagline: e.target.value })} placeholder="CRM that closes the loop" className={inputCls} />
        </Field>
        <Field label="Status">
          <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as ProjectStatus })} className={inputCls}>
            <option value="completed">Completed</option>
            <option value="ongoing">Ongoing</option>
          </select>
        </Field>
        <Field label="Year">
          <input value={f.year} onChange={(e) => setF({ ...f, year: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Preview style">
          <select value={f.preview} onChange={(e) => setF({ ...f, preview: e.target.value as "browser" | "terminal" | "phone" })} className={inputCls}>
            <option value="browser">Browser / cover image</option>
            <option value="terminal">Terminal</option>
            <option value="phone">Phone</option>
          </select>
        </Field>
        <Field label="Full description" className="sm:col-span-2" hint="Opens the detail page">
          <textarea rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className={cn(inputCls, "resize-none")} />
        </Field>
      </div>

      <FormSection title="Case study content" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Challenge"><textarea rows={5} value={f.challenge} onChange={(e) => setF({ ...f, challenge: e.target.value })} className={inputCls} /></Field>
        <Field label="Solution"><textarea rows={5} value={f.solution} onChange={(e) => setF({ ...f, solution: e.target.value })} className={inputCls} /></Field>
        <Field label="Key capabilities" hint="One per line"><textarea rows={5} value={f.features} onChange={(e) => setF({ ...f, features: e.target.value })} className={cn(inputCls, "font-mono text-xs")} /></Field>
        <Field label="Results" hint="Value | Label, one per line"><textarea rows={5} value={f.results} onChange={(e) => setF({ ...f, results: e.target.value })} className={cn(inputCls, "font-mono text-xs")} /></Field>
      </div>

      <FormSection title="Engagement" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Start date" hint="e.g. Mar 2025">
          <input value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} placeholder="Jan 2026" className={inputCls} />
        </Field>
        <Field label="Completion date" hint="blank = ongoing">
          <input value={f.endDate} onChange={(e) => setF({ ...f, endDate: e.target.value })} placeholder="Jun 2026" className={inputCls} />
        </Field>
        <Field label="Your role">
          <input value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Client / organization">
          <input value={f.client} onChange={(e) => setF({ ...f, client: e.target.value })} placeholder="Acme GmbH" className={inputCls} />
        </Field>
        <Field label="Technologies" hint="Comma separated" className="sm:col-span-2">
          <input value={f.stack} onChange={(e) => setF({ ...f, stack: e.target.value })} placeholder="Next.js, TypeScript, PostgreSQL" className={inputCls} />
        </Field>
      </div>

      <FormSection title="Links" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Preview domain" hint="Shown in the mock browser bar">
          <input value={f.domain} onChange={(e) => setF({ ...f, domain: e.target.value })} placeholder="app.orbitcrm.io" className={cn(inputCls, "font-mono text-xs")} />
        </Field>
        <Field label="Live URL">
          <input value={f.liveUrl} onChange={(e) => setF({ ...f, liveUrl: e.target.value })} placeholder="https://…" className={cn(inputCls, "font-mono text-xs")} />
        </Field>
        <Field label="GitHub URL">
          <input value={f.githubUrl} onChange={(e) => setF({ ...f, githubUrl: e.target.value })} placeholder="https://github.com/…" className={cn(inputCls, "font-mono text-xs")} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="App Store">
            <input value={f.appStoreUrl} onChange={(e) => setF({ ...f, appStoreUrl: e.target.value })} placeholder="https://apps.apple.com/…" className={cn(inputCls, "font-mono text-[11px]")} />
          </Field>
          <Field label="Google Play">
            <input value={f.googlePlayUrl} onChange={(e) => setF({ ...f, googlePlayUrl: e.target.value })} placeholder="https://play.google.com/…" className={cn(inputCls, "font-mono text-[11px]")} />
          </Field>
        </div>
      </div>

      <FormSection title="SEO & display" />
      <div className="grid gap-4">
        <Field label="SEO title">
          <input value={f.seoTitle} onChange={(e) => setF({ ...f, seoTitle: e.target.value })} placeholder="Orbit CRM — case study" className={inputCls} />
        </Field>
        <Field label="SEO description">
          <input value={f.seoDesc} onChange={(e) => setF({ ...f, seoDesc: e.target.value })} placeholder="One sentence for search results" className={inputCls} />
        </Field>
        <label className="flex w-fit cursor-pointer items-center gap-2.5 text-xs font-semibold text-slate-700">
          <input type="checkbox" checked={f.featured} onChange={(e) => setF({ ...f, featured: e.target.checked })} className="h-4 w-4 rounded accent-amber-600" />
          Featured on the homepage
        </label>
      </div>
    </Modal>
  );
}

function ProjectRow({ id, index }: { id: string; index: number }) {
  const { state, updateProject, setProjectStatus, deleteEntity } = useStore();
  const p = state.projects.find((x) => x.id === id);
  const [name, setName] = useState(p?.name ?? "");
  const [editing, setEditing] = useState(false);
  if (!p) return null;

  return (
    <div className={cn(card, "grid items-center gap-4 p-5 md:grid-cols-[1fr_auto]")}>
      <div className="flex items-center gap-4">
        <Monogram label={p.monogram} className="h-10 w-10 border-amber-200 bg-amber-50 text-xs text-amber-700" />
        <div className="min-w-0">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => {
              if (name.trim() && name !== p.name) updateProject(p.id, { name: name.trim() });
            }}
            aria-label={`Rename project ${p.name}`}
            className="w-full max-w-xs border-b border-transparent bg-transparent font-display text-base font-bold text-slate-900 outline-none transition-colors hover:border-slate-200 focus:border-amber-500"
          />
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
            /projects/{p.slug} · {p.category}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={p.status}
          onChange={(e) => setProjectStatus(p.id, e.target.value as ProjectStatus)}
          aria-label={`Status for ${p.name}`}
          className={cn(
            "rounded-lg border bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] outline-none",
            p.status === "ongoing" ? "border-sky-200 bg-sky-50 text-sky-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"
          )}
        >
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
        </select>
        <label className="flex cursor-pointer items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
          <input type="checkbox" checked={!!p.featured} onChange={(e) => updateProject(p.id, { featured: e.target.checked })} className="h-4 w-4 accent-amber-600" />
          Featured
        </label>
        <Link to={`/projects/${p.slug}`} className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-amber-600 hover:text-amber-700">
          View <Icon name="external" className="h-3.5 w-3.5" />
        </Link>
        <button type="button" onClick={() => setEditing(true)} className={cn(btnGhost, "px-3 py-2")}>
          <Icon name="pencil" className="h-3.5 w-3.5" /> Edit
        </button>
        <button type="button" aria-label={`Delete project ${p.name}`} onClick={() => deleteEntity("projects", index)} className={dangerBtn}>
          <Icon name="close" className="h-3.5 w-3.5" />
        </button>
      </div>

      {editing && <ProjectForm editing={{ index }} onClose={() => setEditing(false)} />}
    </div>
  );
}

function ProjectsView() {
  const { state } = useStore();
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-xs leading-relaxed text-slate-500">
          Create, edit, and remove projects. Every change publishes to the public site instantly.
        </p>
        <button type="button" onClick={() => setCreating(true)} className={btnPrimary}>
          + New project
        </button>
      </div>
      {state.projects.map((p, i) => (
        <ProjectRow key={p.id} id={p.id} index={i} />
      ))}
      {creating && <ProjectForm editing={null} onClose={() => setCreating(false)} />}
    </div>
  );
}

/* ============================ SERVICES ============================ */

function ServiceForm({ editing, onClose }: { editing: Editing; onClose: () => void }) {
  const { state, addEntity, updateEntity } = useStore();
  const editIndex = editing ? editing.index : null;
  const s = editIndex !== null ? state.services[editIndex] : null;
  const [f, setF] = useState(() => ({
    name: s?.name ?? "",
    slug: s?.slug ?? "",
    icon: s?.icon ?? "code",
    short: s?.short ?? "",
    description: s?.description ?? "",
    features: (s?.features ?? []).join("\n"),
    tech: (s?.tech ?? []).join(", "),
    ctaLabel: s?.ctaLabel ?? "",
    ctaUrl: s?.ctaUrl ?? "",
    featured: !!s?.featured,
    order: String(s?.order ?? 0),
  }));
  const [err, setErr] = useState<string | null>(null);

  const save = () => {
    if (f.name.trim().length < 2) {
      setErr("Enter a service name.");
      return;
    }
    const short = f.short.trim();
    const payload = {
      name: f.name.trim(),
      icon: f.icon,
      short: short || "New service — add a one-liner.",
      description: f.description.trim() || short || "New service — add a full description.",
      features: f.features.split("\n").map((l) => l.trim()).filter(Boolean),
      tech: f.tech.split(",").map((t) => t.trim()).filter(Boolean),
      ctaLabel: f.ctaLabel.trim() || undefined,
      ctaUrl: f.ctaUrl.trim() || undefined,
      featured: f.featured,
      order: Number(f.order) || 0,
    };
    if (s && editIndex !== null) {
      updateEntity("services", editIndex, payload);
    } else if (!s) {
      addEntity("services", { ...payload, slug: uniqSlug(state.services.map((x) => x.slug), f.slug.trim() || slugify(f.name)) });
    }
    onClose();
  };

  return (
    <Modal
      wide
      title={s ? `Edit service — ${s.name}` : "New service"}
      subtitle="Services render on the public Services page and homepage."
      onClose={onClose}
      footer={
        <>
          {err && <span className="mr-auto text-xs font-semibold text-rose-600">{err}</span>}
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button type="button" onClick={save} className={btnPrimary}>
            {s ? "Save changes" : "Create service"}
          </button>
        </>
      }
    >
      <FormSection title="Identity" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Service name" required>
          <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Consulting" className={inputCls} />
        </Field>
        <Field label="Slug / URL" hint={`/${f.slug.trim() || slugify(f.name || "name")}`}>
          <input value={f.slug} onChange={(e) => setF({ ...f, slug: e.target.value })} placeholder="consulting" className={cn(inputCls, "font-mono text-xs")} />
        </Field>
        <Field label="Short description" hint="Card summary" className="sm:col-span-2">
          <input value={f.short} onChange={(e) => setF({ ...f, short: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Full description" className="sm:col-span-2">
          <textarea rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className={cn(inputCls, "resize-none")} />
        </Field>
      </div>

      <FormSection title="Icon" />
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
        {SERVICE_ICONS.map((ic) => (
          <button
            key={ic}
            type="button"
            aria-label={`Use icon ${ic}`}
            onClick={() => setF({ ...f, icon: ic })}
            className={cn(
              "flex h-10 items-center justify-center rounded-lg border transition-colors",
              f.icon === ic ? "border-amber-500 bg-amber-50 text-amber-600" : "border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600"
            )}
          >
            <Icon name={ic} className="h-4 w-4" />
          </button>
        ))}
      </div>

      <FormSection title="Details" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Features" hint="One per line">
          <textarea rows={4} value={f.features} onChange={(e) => setF({ ...f, features: e.target.value })} placeholder={"Subscription billing\nWebhook reconciliation"} className={cn(inputCls, "resize-none font-mono text-xs")} />
        </Field>
        <Field label="Technologies" hint="Comma separated">
          <textarea rows={4} value={f.tech} onChange={(e) => setF({ ...f, tech: e.target.value })} placeholder="Stripe, PayPal, SEPA" className={cn(inputCls, "resize-none font-mono text-xs")} />
        </Field>
        <Field label="CTA label" hint="Defaults to “Discuss this service”">
          <input value={f.ctaLabel} onChange={(e) => setF({ ...f, ctaLabel: e.target.value })} className={inputCls} />
        </Field>
        <Field label="CTA URL" hint="Defaults to the contact form">
          <input value={f.ctaUrl} onChange={(e) => setF({ ...f, ctaUrl: e.target.value })} placeholder="/contact or https://…" className={cn(inputCls, "font-mono text-xs")} />
        </Field>
        <Field label="Display order" hint="Lower shows first">
          <input type="number" min={0} value={f.order} onChange={(e) => setF({ ...f, order: e.target.value })} className={inputCls} />
        </Field>
        <label className="flex cursor-pointer items-center gap-2.5 self-end pb-2.5 text-xs font-semibold text-slate-700">
          <input type="checkbox" checked={f.featured} onChange={(e) => setF({ ...f, featured: e.target.checked })} className="h-4 w-4 rounded accent-amber-600" />
          Mark as featured
        </label>
      </div>
    </Modal>
  );
}

function ServicesView() {
  const { state, updateEntity, deleteEntity } = useStore();
  const [editing, setEditing] = useState<Editing>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-xs leading-relaxed text-slate-500">
          Full service records: icon, copy, features, technologies, CTA and order. Changes publish instantly.
        </p>
        <button type="button" onClick={() => setEditing(null)} className={btnPrimary}>
          + New service
        </button>
      </div>
      {state.services.map((s, i) => {
        const visible = s.visible !== false;
        return (
          <div key={s.slug} className={cn(card, "flex flex-col gap-4 p-5 sm:flex-row sm:items-center", !visible && "opacity-60")}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500">
              <Icon name={s.icon} className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-base font-bold text-slate-900">{s.name}</p>
              <p className="mt-0.5 truncate text-xs text-slate-500">{s.short}</p>
            </div>
            <span className="hidden text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400 md:block">order {s.order ?? 0}</span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => updateEntity("services", i, { visible: !visible })} className={pillToggle(visible)}>
                {visible ? "Published" : "Hidden"}
              </button>
              <button type="button" onClick={() => setEditing({ index: i })} className={cn(btnGhost, "px-3 py-2")}>
                <Icon name="pencil" className="h-3.5 w-3.5" /> Edit
              </button>
              <button type="button" aria-label={`Delete service ${s.name}`} onClick={() => deleteEntity("services", i)} className={dangerBtn}>
                <Icon name="close" className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}
      {editing !== null && <ServiceForm editing={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

/* ============================ TESTIMONIALS ============================ */

function TestimonialForm({ editing, onClose }: { editing: Editing; onClose: () => void }) {
  const { state, addEntity, updateEntity } = useStore();
  const editIndex = editing ? editing.index : null;
  const t = editIndex !== null ? state.testimonials[editIndex] : null;
  const [f, setF] = useState(() => ({
    name: t?.name ?? "",
    role: t?.role ?? "",
    company: t?.company ?? "",
    quote: t?.quote ?? "",
    rating: String(t?.rating ?? 5),
    photo: t?.photo ?? "",
    project: t?.project ?? "",
  }));
  const [err, setErr] = useState<string | null>(null);

  const save = () => {
    if (f.name.trim().length < 2) {
      setErr("Enter the client's name.");
      return;
    }
    if (f.quote.trim().length < 5) {
      setErr("Enter the quote.");
      return;
    }
    const payload = {
      name: f.name.trim(),
      role: f.role.trim() || "Client",
      company: f.company.trim() || "—",
      quote: f.quote.trim(),
      rating: Math.min(5, Math.max(1, Number(f.rating) || 5)),
      photo: f.photo.trim() || undefined,
      project: f.project.trim() || undefined,
      published: t ? t.published !== false : true,
    };
    if (t && editIndex !== null) updateEntity("testimonials", editIndex, payload);
    else if (!t) addEntity("testimonials", payload);
    onClose();
  };

  return (
    <Modal
      title={t ? `Edit testimonial — ${t.name}` : "New testimonial"}
      subtitle="Social proof on the public homepage."
      onClose={onClose}
      footer={
        <>
          {err && <span className="mr-auto text-xs font-semibold text-rose-600">{err}</span>}
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button type="button" onClick={save} className={btnPrimary}>
            {t ? "Save changes" : "Create testimonial"}
          </button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Client name" required>
          <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Jane Doe" className={inputCls} />
        </Field>
        <Field label="Job title">
          <input value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })} placeholder="CTO" className={inputCls} />
        </Field>
        <Field label="Company">
          <input value={f.company} onChange={(e) => setF({ ...f, company: e.target.value })} placeholder="Acme GmbH" className={inputCls} />
        </Field>
        <Field label="Rating">
          <select value={f.rating} onChange={(e) => setF({ ...f, rating: e.target.value })} className={inputCls}>
            {["5", "4", "3", "2", "1"].map((r) => (
              <option key={r} value={r}>
                {r} stars
              </option>
            ))}
          </select>
        </Field>
        <Field label="Profile photo URL" hint="Optional — monogram used if empty" className="sm:col-span-2">
          <input value={f.photo} onChange={(e) => setF({ ...f, photo: e.target.value })} placeholder="https://…/avatar.jpg" className={cn(inputCls, "font-mono text-xs")} />
        </Field>
        <Field label="Related project" className="sm:col-span-2">
          <select value={f.project} onChange={(e) => setF({ ...f, project: e.target.value })} className={inputCls}>
            <option value="">— None —</option>
            {state.projects.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Quote" required className="sm:col-span-2">
          <textarea rows={4} value={f.quote} onChange={(e) => setF({ ...f, quote: e.target.value })} className={cn(inputCls, "resize-none")} />
        </Field>
      </div>
    </Modal>
  );
}

function TestimonialsView() {
  const { state, toggleTestimonial, deleteEntity } = useStore();
  const [editing, setEditing] = useState<Editing>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-xs leading-relaxed text-slate-500">
          Hidden testimonials disappear from the homepage instantly. Deleted ones can be restored with “Reset content”.
        </p>
        <button type="button" onClick={() => setEditing(null)} className={btnPrimary}>
          + New testimonial
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {state.testimonials.map((t, i) => {
          const on = t.published !== false;
          return (
            <div key={t.name} className={cn(card, "p-5", !on && "opacity-60")}>
              <div className="flex items-start justify-between gap-3">
                <Stars count={t.rating} />
                {t.project && (
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500">
                    {t.project}
                  </span>
                )}
              </div>
              <blockquote className="mt-3 text-sm leading-relaxed text-slate-600">“{t.quote}”</blockquote>
              <p className="mt-4 text-sm font-bold text-slate-900">{t.name}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                {t.role}, {t.company}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                <button type="button" onClick={() => toggleTestimonial(i)} className={pillToggle(on)}>
                  {on ? "Published" : "Hidden"}
                </button>
                <button type="button" onClick={() => setEditing({ index: i })} className={cn(btnGhost, "px-3 py-2")}>
                  <Icon name="pencil" className="h-3.5 w-3.5" /> Edit
                </button>
                <button type="button" aria-label={`Delete testimonial from ${t.name}`} onClick={() => deleteEntity("testimonials", i)} className={cn(dangerBtn, "ml-auto")}>
                  <Icon name="close" className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {editing !== null && <TestimonialForm editing={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

/* ============================ USERS ============================ */

function UserCard({ user, index }: { user: AdminUser; index: number }) {
  const { updateEntity, deleteEntity } = useStore();
  const max = Math.max(...user.week, 1);
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const invited = user.status === "Invited";
  const setSuspended = async () => {
    if (!window.confirm(`${invited ? "Reactivate" : "Suspend"} ${user.name}?`)) return;
    await api(`/api/admin/users/${user.id}`, { method: "PATCH", body: JSON.stringify({ suspended: !invited }) });
    updateEntity("users", index, { status: invited ? "Active" : "Invited", lastActive: invited ? "Active" : "Suspended" });
  };
  const resetTwoFactor = async () => {
    if (!window.confirm(`Reset two-factor authentication for ${user.name}?`)) return;
    await api(`/api/admin/users/${user.id}/reset-two-factor`, { method: "POST" });
    updateEntity("users", index, { twoFA: false });
  };
  const remove = async () => {
    if (!window.confirm(`Permanently delete ${user.name}?`)) return;
    await api(`/api/admin/users/${user.id}`, { method: "DELETE" }); deleteEntity("users", index);
  };

  return (
    <div className={cn(card, "p-5 transition-all duration-300 hover:shadow-md md:p-6", invited && "border-dashed bg-slate-50/50")}>
      <div className="flex items-start gap-4">
        <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold text-white", HUE_BG[user.hue])}>
          {initials(user.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base font-bold text-slate-900">{user.name}</p>
          <p className="truncate text-xs text-slate-500">{user.email}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-600">
              {user.role}
            </span>
            <span
              className={cn(
                "flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em]",
                user.twoFA ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-400"
              )}
            >
              <Icon name="check" className="h-2.5 w-2.5" /> 2FA {user.twoFA ? "on" : "off"}
            </span>
          </div>
        </div>
        <span
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em]",
            invited ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", invited ? "bg-amber-500" : "pulse-dot bg-emerald-500")} />
          {user.status}
        </span>
      </div>

      <div className="mt-5 rounded-lg border border-slate-100 bg-slate-50/70 p-4">
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">Actions · last 7 days</p>
          <p className="text-[10px] font-bold text-slate-700">{user.actions} total</p>
        </div>
        <div className="mt-3 flex h-14 items-end gap-1.5">
          {user.week.map((v, i) => (
            <div key={i} className="group flex h-full flex-1 flex-col items-center justify-end gap-1">
              <div className="flex w-full flex-1 items-end">
                <div
                  className={cn(
                    "w-full rounded-sm transition-all duration-500",
                    v > 0 && v === max ? "bg-amber-500 group-hover:bg-amber-600" : v > 0 ? "bg-slate-300 group-hover:bg-slate-400" : "bg-slate-200/70"
                  )}
                  style={{ height: `${v > 0 ? Math.max(12, (v / max) * 100) : 6}%` }}
                />
              </div>
              <span className="text-[8px] font-bold text-slate-400">{days[i]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
        <select
          value={user.role}
          onChange={(e) => updateEntity("users", index, { role: e.target.value })}
          aria-label={`Role for ${user.name}`}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-600 outline-none"
        >
          {USER_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={resetTwoFactor}
          className={pillToggle(user.twoFA)}
        >
          {user.twoFA ? "Reset 2FA" : "Require 2FA"}
        </button>
        {invited ? (
          <button
            type="button"
            onClick={setSuspended}
            className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-amber-700 transition-colors hover:bg-amber-100"
          >
            Mark active
          </button>
        ) : (
          <button
            type="button"
            onClick={setSuspended}
            className={pillToggle(false)}
          >
            Suspend
          </button>
        )}
        <button
          type="button"
          aria-label={`Remove ${user.name}`}
          onClick={remove}
          className={cn(dangerBtn, "ml-auto")}
        >
          <Icon name="close" className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 divide-x divide-slate-100">
        <div className="pr-3">
          <p className="font-display text-lg font-bold text-slate-900">{user.logins}</p>
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Logins</p>
        </div>
        <div className="px-3">
          <p className="font-display text-lg font-bold text-slate-900">{user.actions}</p>
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Actions</p>
        </div>
        <div className="pl-3">
          <p className="truncate text-[11px] font-bold text-slate-700">{user.lastActive}</p>
          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">Last seen</p>
        </div>
      </div>
    </div>
  );
}

function InviteModal({ onClose }: { onClose: () => void }) {
  const { state, addInvite } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminUserRole>(USER_ROLES[1]);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (name.trim().length < 2) {
      setErr("Enter the person's full name.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErr("Enter a valid email address.");
      return;
    }
    if (state.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      setErr("That email is already on the team.");
      return;
    }
    if (password.length < 8) { setErr("The temporary password must contain at least 8 characters."); return; }
    setSaving(true); setErr(null);
    try {
      await api("/api/admin/users", { method: "POST", body: JSON.stringify({ name: name.trim(), email: email.trim(), password }) });
      addInvite(name.trim(), email.trim(), role); onClose();
    } catch (error) { setErr(error instanceof Error ? error.message : "Unable to create administrator."); setSaving(false); }
  };

  return (
    <Modal
      title="Invite a team member"
      subtitle="Role-based access — invited users appear as “Invited” until they activate."
      onClose={onClose}
      footer={
        <>
          {err && <span className="mr-auto text-xs font-semibold text-rose-600">{err}</span>}
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button type="button" onClick={save} disabled={saving} className={btnPrimary}>
            <Icon name="mail" className="h-4 w-4" /> {saving ? "Creating…" : "Create administrator"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Full name" required>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" className={inputCls} />
        </Field>
        <Field label="Email" required>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@company.com" className={inputCls} />
        </Field>
        <Field label="Temporary password" hint="At least 8 characters" required>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" className={inputCls} />
        </Field>
        <Field label="Role" hint="PRD §44 role hierarchy">
          <select value={role} onChange={(e) => setRole(e.target.value as AdminUserRole)} className={inputCls}>
            {USER_ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </Modal>
  );
}

function UsersView() {
  const { state } = useStore();
  const [inviting, setInviting] = useState(false);

  const active = state.users.filter((u) => u.status === "Active").length;
  const invited = state.users.filter((u) => u.status === "Invited").length;
  const twoFA = state.users.filter((u) => u.twoFA).length;

  const summary = [
    { label: "Total users", value: String(state.users.length), icon: "user" },
    { label: "Active", value: String(active), icon: "check" },
    { label: "2FA enabled", value: `${twoFA}/${state.users.length}`, icon: "shield" },
    { label: "Pending invites", value: String(invited), icon: "mail" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summary.map((s) => (
          <div key={s.label} className={cn(card, "flex items-center gap-4 p-4 md:p-5")}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500">
              <Icon name={s.icon} className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-2xl font-bold leading-none text-slate-900">{s.value}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button type="button" onClick={() => setInviting(true)} className={btnPrimary}>
          + Invite user
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {state.users.map((u, i) => (
          <UserCard key={u.id} user={u} index={i} />
        ))}
      </div>

      {inviting && <InviteModal onClose={() => setInviting(false)} />}
    </div>
  );
}

/* ============================ HOMEPAGE ============================ */

function HomepageView() {
  const { state, patchHero, setSection, reset } = useStore();
  const [hero, setHero] = useState({ ...state.hero });
  const [saved, setSaved] = useState(false);
  const dirty = JSON.stringify(hero) !== JSON.stringify(state.hero);

  const save = () => {
    patchHero(hero);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Panel title="Hero Content" hint={<span className="text-[10px] font-bold text-slate-400">Homepage headline & CTAs</span>}>
        <div className="mt-5 space-y-4">
          {(
            [
              ["badge", "Availability Badge"],
              ["headlinePrefix", "Headline (part 1)"],
              ["headlineAccent", "Headline (accent)"],
              ["sub", "Supporting description"],
              ["cta1", "Primary CTA label"],
              ["cta2", "Secondary CTA label"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className={labelCls}>{label}</label>
              {key === "sub" ? (
                <textarea rows={3} value={hero[key]} onChange={(e) => setHero({ ...hero, [key]: e.target.value })} className={cn(inputCls, "resize-none")} />
              ) : (
                <input value={hero[key]} onChange={(e) => setHero({ ...hero, [key]: e.target.value })} className={inputCls} />
              )}
            </div>
          ))}
          <div className="flex items-center gap-4">
            <button type="button" onClick={save} disabled={!dirty} className={btnPrimary}>
              Save hero
            </button>
            {saved && <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-600">✓ Saved & published</span>}
          </div>
        </div>
      </Panel>

      <div className="space-y-5">
        <Panel title="Homepage Sections" hint={<span className="text-[10px] font-bold text-slate-400">Toggle independently</span>}>
          <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {(Object.entries(SECTION_LABELS) as [SectionKey, string][]).map(([key, label]) => {
              const on = state.sections[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSection(key, !on)}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm font-medium transition-all duration-300",
                    on ? "border-emerald-200 bg-emerald-50/60 text-slate-900" : "border-slate-200 bg-white text-slate-400"
                  )}
                >
                  {label}
                  <span className={cn("relative h-4 w-8 shrink-0 rounded-full transition-colors duration-300", on ? "bg-emerald-500" : "bg-slate-200")}>
                    <span className={cn("absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-all duration-300", on ? "left-4" : "left-0.5")} />
                  </span>
                </button>
              );
            })}
          </div>
        </Panel>

        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-6">
          <h3 className="font-display text-base font-bold text-slate-900">Danger Zone</h3>
          <p className="mt-1 text-sm text-slate-500">Restore content, hero copy and section settings to defaults. Leads and team members are preserved.</p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-4 rounded-lg border border-rose-300 bg-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] text-rose-600 transition-colors hover:bg-rose-100"
          >
            Reset content
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================ SITE SETTINGS ============================ */

const ACCENTS = [
  { name: "Champagne", value: "#e9b45b" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Copper", value: "#c2700e" },
  { name: "Coral", value: "#e85d3d" },
  { name: "Muted Gold", value: "#b9a15f" },
];

function SiteView() {
  const { state, updateEntity, moveEntity, setAccent, addEntity, deleteEntity, importContent, log } = useStore();
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [importOk, setImportOk] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const [navLabel, setNavLabel] = useState("");
  const [navTo, setNavTo] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaTo, setCtaTo] = useState("");

  const addNav = () => {
    const to = navTo.trim();
    if (navLabel.trim().length < 2 || (!to.startsWith("/") && !to.startsWith("http"))) return;
    addEntity("nav", { id: newId("nav"), label: navLabel.trim(), to, active: true });
    setNavLabel("");
    setNavTo("");
  };

  const addCta = () => {
    if (ctaLabel.trim().length < 2) return;
    addEntity("ctas", {
      id: uniqSlug(state.ctas.map((c) => c.id), slugify(ctaLabel)),
      label: ctaLabel.trim(),
      to: ctaTo.trim(),
      active: true,
    });
    setCtaLabel("");
    setCtaTo("");
  };

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <Panel title="Navigation" hint={<span className="text-[10px] font-bold text-slate-400">Labels, targets, order, visibility</span>}>
        <div className="mt-5 space-y-3">
          {state.nav.map((n, i) => (
            <div key={n.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/60 p-3">
              <div className="flex gap-1">
                <button type="button" aria-label="Move up" onClick={() => moveEntity(i, -1)} className={miniBtn}>↑</button>
                <button type="button" aria-label="Move down" onClick={() => moveEntity(i, 1)} className={miniBtn}>↓</button>
              </div>
              <input
                value={n.label}
                onChange={(e) => updateEntity("nav", i, { label: e.target.value })}
                aria-label="Nav label"
                className={cn(inputCls, "w-28 py-2 text-[13px]")}
              />
              <input
                value={n.to}
                onChange={(e) => updateEntity("nav", i, { to: e.target.value })}
                aria-label="Nav target"
                className={cn(inputCls, "min-w-24 flex-1 py-2 font-mono text-xs")}
              />
              <button type="button" onClick={() => updateEntity("nav", i, { active: !n.active })} className={pillToggle(n.active)}>
                {n.active ? "On" : "Off"}
              </button>
              <button type="button" aria-label="Remove link" onClick={() => deleteEntity("nav", i)} className={cn(miniBtn, "hover:text-rose-500")}>
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-slate-200 p-3">
          <input value={navLabel} onChange={(e) => setNavLabel(e.target.value)} placeholder="Label (e.g. Blog)" className={cn(inputCls, "w-40 py-2 text-[13px]")} />
          <input value={navTo} onChange={(e) => setNavTo(e.target.value)} placeholder="/blog or https://…" className={cn(inputCls, "min-w-32 flex-1 py-2 font-mono text-xs")} />
          <button type="button" onClick={addNav} className={btnPrimary}>
            Add link
          </button>
        </div>
      </Panel>

      <Panel title="Calls to Action" hint={<span className="text-[10px] font-bold text-slate-400">Centralized CTA registry</span>}>
        <div className="mt-5 space-y-3">
          {state.ctas.map((c, i) => (
            <div key={c.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/60 p-3">
              <span className="w-28 truncate font-mono text-[10px] font-bold text-amber-600">{c.id}</span>
              <input
                value={c.label}
                onChange={(e) => updateEntity("ctas", i, { label: e.target.value })}
                aria-label="CTA label"
                className={cn(inputCls, "w-36 py-2 text-[13px]")}
              />
              <input
                value={c.to}
                onChange={(e) => updateEntity("ctas", i, { to: e.target.value })}
                aria-label="CTA target"
                className={cn(inputCls, "min-w-20 flex-1 py-2 font-mono text-xs")}
              />
              <button type="button" onClick={() => updateEntity("ctas", i, { active: !c.active })} className={pillToggle(c.active)}>
                {c.active ? "On" : "Off"}
              </button>
              <button type="button" aria-label="Remove CTA" onClick={() => deleteEntity("ctas", i)} className={cn(miniBtn, "hover:text-rose-500")}>
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-slate-200 p-3">
          <input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} placeholder="Button label" className={cn(inputCls, "w-44 py-2 text-[13px]")} />
          <input value={ctaTo} onChange={(e) => setCtaTo(e.target.value)} placeholder="/contact or https://…" className={cn(inputCls, "min-w-32 flex-1 py-2 font-mono text-xs")} />
          <button type="button" onClick={addCta} className={btnPrimary}>
            Add CTA
          </button>
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-slate-400">
          Turning a CTA off keeps the button visible but reverts it to its default destination.
        </p>
      </Panel>

      <Panel title="Brand Accent" hint={<span className="text-[10px] font-bold text-emerald-600">Applies live</span>} className="xl:col-span-2">
        <p className="mt-1 text-xs text-slate-500">
          The accent color drives buttons, highlights, charts and links across the public site and this admin — changes apply instantly and persist.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {ACCENTS.map((a) => {
            const current = state.settings.accent.toLowerCase() === a.value.toLowerCase();
            return (
              <button
                key={a.value}
                type="button"
                onClick={() => setAccent(a.value)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3 pr-5 transition-all duration-200",
                  current ? "border-slate-900 bg-slate-900 text-white shadow-md" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                )}
              >
                <span className="h-8 w-8 rounded-lg border border-white/20 shadow-inner" style={{ background: a.value }} />
                <span className="text-left">
                  <span className="block text-xs font-bold">{a.name}</span>
                  <span className={cn("block font-mono text-[9px] uppercase tracking-[0.1em]", current ? "text-white/60" : "text-slate-400")}>
                    {a.value}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </Panel>

      <Panel title="Backup & Transfer" hint={<span className="text-[10px] font-bold text-slate-400">Content snapshot · JSON</span>}>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Export everything you&apos;ve managed — projects, services, articles, testimonials, leads, navigation, CTAs, settings — as a single
          JSON file. Import it on any other device or hand it to the production backend as your seed data.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `wuese-philip-cms-backup-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
              log("Exported content backup (JSON)");
            }}
            className={btnPrimary}
          >
            <Icon name="box" className="h-4 w-4" /> Export content
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} className={btnGhost}>
            Import content
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                try {
                  const ok = importContent(JSON.parse(String(reader.result)));
                  setImportOk(ok);
                  setImportMsg(
                    ok
                      ? "✓ Content imported — the site updated instantly."
                      : "Import failed — that file doesn't look like a CMS content backup."
                  );
                } catch {
                  setImportOk(false);
                  setImportMsg("Import failed — invalid JSON file.");
                }
                window.setTimeout(() => setImportMsg(null), 5000);
              };
              reader.readAsText(file);
              e.target.value = "";
            }}
          />
        </div>
        {importMsg && (
          <p
            role="status"
            className={cn(
              "mt-3 rounded-lg border p-3 text-xs font-semibold",
              importOk ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-600"
            )}
          >
            {importMsg}
          </p>
        )}
      </Panel>
    </div>
  );
}

/* ============================ ARTICLES ============================ */

function ArticleForm({ editing, onClose }: { editing: Editing; onClose: () => void }) {
  const { state, addEntity, updateEntity } = useStore();
  const editIndex = editing ? editing.index : null;
  const a = editIndex !== null ? state.articles[editIndex] : null;
  const [f, setF] = useState(() => ({
    title: a?.title ?? "",
    category: a?.category ?? ARTICLE_CATEGORIES[0],
    date: a?.date ?? new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    read: a?.read ?? "5 min read",
    tags: (a?.tags ?? []).join(", "),
    excerpt: a?.excerpt ?? "",
    body: a ? serializeBody(a.body) : "",
    published: a ? a.published !== false : false,
    cover: a?.cover ?? "",
  }));
  const [err, setErr] = useState<string | null>(null);

  const save = () => {
    if (f.title.trim().length < 3) {
      setErr("Enter a title of at least 3 characters.");
      return;
    }
    const payload = {
      title: f.title.trim(),
      category: f.category,
      date: f.date.trim() || "—",
      read: f.read.trim() || "5 min read",
      tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean),
      excerpt: f.excerpt.trim() || "New article — edit the excerpt from the admin panel.",
      body: parseBody(f.body || `${f.title.trim()}\n\nReplace this placeholder with the real content.`),
      published: f.published,
      cover: f.cover.trim() || undefined,
    };
    if (a && editIndex !== null) {
      updateEntity("articles", editIndex, payload);
    } else if (!a) {
      addEntity("articles", {
        slug: uniqSlug(state.articles.map((x) => x.slug), slugify(f.title)),
        hue: (["gold", "cyan", "jade", "sky"] as const)[state.articles.length % 4],
        ...payload,
      } as unknown as Record<string, unknown>);
    }
    onClose();
  };

  return (
    <Modal
      wide
      title={a ? `Edit article — ${a.title}` : "New article"}
      subtitle={a ? `Live at /insights/${a.slug}` : "New articles are created as drafts and hidden until published."}
      onClose={onClose}
      footer={
        <>
          {err && <span className="mr-auto text-xs font-semibold text-rose-600">{err}</span>}
          <button type="button" onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button type="button" onClick={save} className={btnPrimary}>
            {a ? "Save changes" : "Create article"}
          </button>
        </>
      }
    >
      <FormSection title="Metadata" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title" required className="sm:col-span-2">
          <input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Shipping fast without shipping debt" className={inputCls} />
        </Field>
        <Field label="Category">
          <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} className={inputCls}>
            {ARTICLE_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Date">
            <input value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} className={inputCls} />
          </Field>
          <Field label="Reading time">
            <input value={f.read} onChange={(e) => setF({ ...f, read: e.target.value })} className={inputCls} />
          </Field>
        </div>
        <Field label="Tags" hint="Comma separated" className="sm:col-span-2">
          <input value={f.tags} onChange={(e) => setF({ ...f, tags: e.target.value })} placeholder="SaaS, Product" className={inputCls} />
        </Field>
        <Field label="Excerpt" hint="Shown on cards" className="sm:col-span-2">
          <input value={f.excerpt} onChange={(e) => setF({ ...f, excerpt: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Cover image URL" hint="Select or upload in Media Library" className="sm:col-span-2">
          <input value={f.cover} onChange={(e) => setF({ ...f, cover: e.target.value })} placeholder="/storage/media/…" className={cn(inputCls, "font-mono text-xs")} />
        </Field>
      </div>

      <FormSection title="Content" />
      <Field label="Body" hint="Blank line = new paragraph · “• ” at line start = list item">
        <textarea rows={9} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} className={cn(inputCls, "resize-none font-mono text-xs")} />
      </Field>

      <label className="mt-5 flex w-fit cursor-pointer items-center gap-2.5 text-xs font-semibold text-slate-700">
        <input type="checkbox" checked={f.published} onChange={(e) => setF({ ...f, published: e.target.checked })} className="h-4 w-4 rounded accent-amber-600" />
        Published (visible on the public Insights pages)
      </label>
    </Modal>
  );
}

function ArticleRow({ index, onEdit }: { index: number; onEdit: () => void }) {
  const { state, updateEntity, deleteEntity } = useStore();
  const a = state.articles[index];
  if (!a) return null;
  const on = a.published !== false;

  return (
    <div className={cn(card, "p-5", !on && "opacity-60")}>
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-[10px] font-bold text-slate-400">{String(index + 1).padStart(2, "0")}</span>
        <div className="min-w-0 flex-1">
          <input
            value={a.title}
            onChange={(e) => updateEntity("articles", index, { title: e.target.value })}
            aria-label="Article title"
            className="w-full border-b border-transparent bg-transparent font-display text-base font-bold text-slate-900 outline-none transition-colors hover:border-slate-200 focus:border-amber-500"
          />
          <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
            /insights/{a.slug} · {a.date} · {a.read}
          </p>
        </div>
        <input
          value={a.category}
          onChange={(e) => updateEntity("articles", index, { category: e.target.value })}
          aria-label="Article category"
          className={cn(inputCls, "w-36 py-2 text-[13px]")}
        />
        <button type="button" onClick={() => updateEntity("articles", index, { published: !on })} className={pillToggle(on)}>
          {on ? "Published" : "Draft"}
        </button>
        <button type="button" onClick={onEdit} className={cn(btnGhost, "px-3 py-2")}>
          <Icon name="pencil" className="h-3.5 w-3.5" /> Edit
        </button>
        <button type="button" aria-label={`Delete article ${a.title}`} onClick={() => deleteEntity("articles", index)} className={dangerBtn}>
          <Icon name="close" className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function ArticlesView() {
  const { state } = useStore();
  const [editing, setEditing] = useState<Editing>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-xs leading-relaxed text-slate-500">
          Full workflow: create drafts, edit content, publish or unpublish, delete. Each article has its own public URL at /insights/
          <span className="font-mono text-slate-400">&lt;slug&gt;</span>.
        </p>
        <button type="button" onClick={() => setEditing(null)} className={btnPrimary}>
          + New article
        </button>
      </div>
      {state.articles.map((a, i) => (
        <ArticleRow key={a.slug} index={i} onEdit={() => setEditing({ index: i })} />
      ))}
      {editing !== null && <ArticleForm editing={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

/* ============================ ACTIVITY ============================ */

function ActivityView() {
  const { state } = useStore();
  return (
    <div className={card}>
      <div className="border-b border-slate-100 px-5 py-4 md:px-6">
        <h3 className="font-display text-base font-bold text-slate-900">Activity Log</h3>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Last {state.activity.length} admin actions</p>
      </div>
      <ul className="divide-y divide-slate-100">
        {state.activity.map((a) => (
          <li key={a.id} className="flex items-center gap-4 px-5 py-3.5 text-sm md:px-6">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden="true" />
            <span className="text-slate-700">{a.text}</span>
            <span className="ml-auto shrink-0 text-[10px] font-semibold text-slate-400">{fmt(a.time)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function JsonContentEditor({
  title,
  value,
  onSave,
}: {
  title: string;
  value: unknown;
  onSave: (value: unknown) => void;
}) {
  const [draft, setDraft] = useState(() => JSON.stringify(value, null, 2));
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => setDraft(JSON.stringify(value, null, 2)), [value]);

  return (
    <Panel title={title} hint="Database-backed structured content">
      <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={12} className={cn(inputCls, "font-mono text-xs leading-relaxed")} />
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className={cn("text-xs", message?.startsWith("Invalid") ? "text-rose-600" : "text-emerald-600")}>{message}</p>
        <button type="button" className={btnPrimary} onClick={() => {
          try {
            onSave(JSON.parse(draft));
            setMessage("Saved to database");
          } catch {
            setMessage("Invalid JSON — check commas and brackets");
          }
        }}>Save {title}</button>
      </div>
    </Panel>
  );
}

function ContentView() {
  const { state, patchContent } = useStore();
  const profileFields: Array<[keyof typeof state.profile, string]> = [
    ["name", "Name"], ["monogram", "Monogram"], ["role", "Role"], ["designation", "Designation"],
    ["email", "Email"], ["phone", "Phone"], ["whatsapp", "WhatsApp URL"], ["calendly", "Calendly URL"],
    ["location", "Location"], ["responseTime", "Response time"], ["portrait", "Portrait image URL"], ["footerBio", "Footer biography"],
  ];
  const save = <K extends keyof typeof state>(key: K) => (value: unknown) => patchContent({ [key]: value } as Pick<typeof state, K>);

  return (
    <div className="space-y-6">
      <Panel title="Profile & Brand Identity" hint="Used across the homepage, articles, footer and contact pages">
        <div className="grid gap-4 md:grid-cols-2">
          {profileFields.map(([key, label]) => (
            <Field key={key} label={label} className={key === "footerBio" ? "md:col-span-2" : undefined}>
              {key === "footerBio" ? (
                <textarea value={state.profile[key]} rows={3} className={inputCls} onChange={(e) => patchContent({ profile: { ...state.profile, [key]: e.target.value } })} />
              ) : (
                <input value={state.profile[key]} className={inputCls} onChange={(e) => patchContent({ profile: { ...state.profile, [key]: e.target.value } })} />
              )}
            </Field>
          ))}
        </div>
      </Panel>
      <div className="grid gap-6 xl:grid-cols-2">
        <JsonContentEditor title="Social Links" value={state.socials} onSave={save("socials")} />
        <JsonContentEditor title="Contact Channels" value={state.contactChannels} onSave={save("contactChannels")} />
        <JsonContentEditor title="Technology Marquee" value={state.marquee} onSave={save("marquee")} />
        <JsonContentEditor title="Introduction" value={state.intro} onSave={save("intro")} />
        <JsonContentEditor title="Expertise" value={state.expertise} onSave={save("expertise")} />
        <JsonContentEditor title="Technology Stack" value={state.techStack} onSave={save("techStack")} />
        <JsonContentEditor title="Development Process" value={state.process} onSave={save("process")} />
        <JsonContentEditor title="Statistics" value={state.stats} onSave={save("stats")} />
        <JsonContentEditor title="Experience" value={state.experience} onSave={save("experience")} />
        <JsonContentEditor title="Legal Pages" value={state.legal} onSave={save("legal")} />
        <JsonContentEditor title="Homepage Labels & Headings" value={state.homeText} onSave={save("homeText")} />
        <JsonContentEditor title="Page Labels & Headings" value={state.pageText} onSave={save("pageText")} />
        <JsonContentEditor title="Interface Text" value={state.publicText} onSave={save("publicText")} />
        <JsonContentEditor title="SEO Page Titles" value={state.seo} onSave={save("seo")} />
        <JsonContentEditor title="Project Type Options" value={state.projectTypes} onSave={save("projectTypes")} />
        <JsonContentEditor title="Budget Options" value={state.budgetRanges} onSave={save("budgetRanges")} />
        <JsonContentEditor title="Timeline Options" value={state.timelines} onSave={save("timelines")} />
        <JsonContentEditor title="Lead Source Options" value={state.sources} onSave={save("sources")} />
      </div>
    </div>
  );
}

type MediaItem = { id: number; name: string; url: string; alt: string; caption?: string; mime: string; size: number; width?: number; height?: number };

function MediaView() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const load = () => void api<{ media: MediaItem[] }>("/api/media").then((result) => setItems(result.media));
  useEffect(load, []);

  const upload = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    const form = new FormData();
    form.append("file", file);
    form.append("alt", alt);
    try {
      await apiForm("/api/media", form);
      setFile(null); setAlt(""); setMessage("Image uploaded to the database-backed media library"); load();
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : "Upload failed"); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <Panel title="Upload Media" hint="JPG, PNG, WebP, GIF or SVG · maximum 5 MB">
        <form onSubmit={upload} className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <Field label="Image" required><input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className={inputCls} /></Field>
          <Field label="Alternative text" required><input value={alt} onChange={(e) => setAlt(e.target.value)} className={inputCls} placeholder="Describe the image" /></Field>
          <button disabled={!file || busy} className={btnPrimary}>{busy ? "Uploading…" : "Upload image"}</button>
        </form>
        {message && <p className="mt-3 text-xs text-slate-500">{message}</p>}
      </Panel>
      <Panel title="Media Library" hint={`${items.length} uploaded assets`}>
        {items.length === 0 ? <p className="py-10 text-center text-sm text-slate-400">No uploaded media yet.</p> : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <img src={item.url} alt={item.alt} className="h-44 w-full bg-white object-cover" />
                <div className="p-4">
                  <p className="truncate text-xs font-bold text-slate-800">{item.name}</p>
                  <p className="mt-1 text-[10px] text-slate-400">{item.width}×{item.height} · {Math.round(item.size / 1024)} KB</p>
                  <input value={item.alt} aria-label="Alternative text" className={cn(inputCls, "mt-3")} onChange={(e) => setItems((all) => all.map((m) => m.id === item.id ? { ...m, alt: e.target.value } : m))} onBlur={() => void api(`/api/media/${item.id}`, { method: "PATCH", body: JSON.stringify({ alt: item.alt, caption: item.caption ?? "" }) })} />
                  <div className="mt-3 flex gap-2">
                    <button type="button" className={miniBtn} onClick={() => void navigator.clipboard.writeText(item.url)}>Copy URL</button>
                    <button type="button" className={dangerBtn} onClick={async () => { if (!window.confirm("Delete this media file?")) return; await api(`/api/media/${item.id}`, { method: "DELETE" }); load(); }}><Icon name="close" className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

/* ============================ SHELL ============================ */

type Tab =
  | "dashboard"
  | "leads"
  | "projects"
  | "services"
  | "articles"
  | "testimonials"
  | "users"
  | "homepage"
  | "site"
  | "activity"
  | "content"
  | "media";

const NAV_GROUPS: { label: string; items: { key: Tab; label: string; icon: string }[] }[] = [
  { label: "Overview", items: [{ key: "dashboard", label: "Dashboard", icon: "blueprint" }] },
  {
    label: "Management",
    items: [
      { key: "leads", label: "Leads", icon: "card" },
      { key: "projects", label: "Projects", icon: "box" },
      { key: "services", label: "Services", icon: "code" },
      { key: "articles", label: "Articles", icon: "mail" },
      { key: "testimonials", label: "Testimonials", icon: "layers" },
      { key: "homepage", label: "Homepage", icon: "api" },
      { key: "content", label: "Global Content", icon: "layers" },
      { key: "media", label: "Media Library", icon: "box" },
      { key: "site", label: "Site Settings", icon: "plug" },
    ],
  },
  {
    label: "Team & System",
    items: [
      { key: "users", label: "Users", icon: "user" },
      { key: "activity", label: "Activity", icon: "bolt" },
    ],
  },
];

export default function Admin() {
  const { state, log } = useStore();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("dashboard");
  const [drawer, setDrawer] = useState(false);

  const newLeads = state.leads.filter((l) => l.status === "New").length;
  const today = new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });

  useEffect(() => {
    void api<{ authenticated: boolean }>("/api/auth/user")
      .then((result) => setAuthed(result.authenticated))
      .catch(() => setAuthed(false));
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawer]);

  if (authed === null) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50 font-mono text-xs uppercase tracking-[0.2em] text-slate-500">Loading CMS…</div>;
  }

  if (!authed) {
    return (
      <Login
        onSuccess={() => {
          setAuthed(true);
          log("Admin signed in (credentials + 2FA verified)");
          window.location.reload();
        }}
      />
    );
  }

  const signOut = async () => {
    await api("/api/auth/logout", { method: "POST" });
    setAuthed(false);
  };

  const navItems = (onSelect?: () => void) =>
    NAV_GROUPS.map((group) => (
      <div key={group.label} className="mb-5">
        <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400">{group.label}</p>
        <div className="space-y-0.5">
          {group.items.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setTab(item.key);
                onSelect?.();
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-all duration-200",
                tab === item.key ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon name={item.icon} className={cn("h-4 w-4", tab === item.key ? "text-amber-400" : "text-slate-400")} />
              {item.label}
              {item.key === "leads" && state.leads.length > 0 && (
                <span
                  className={cn(
                    "ml-auto rounded-full px-2 py-0.5 text-[9px] font-bold",
                    tab === item.key ? "bg-white/20 text-white" : "bg-amber-100 text-amber-700"
                  )}
                >
                  {state.leads.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    ));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* ---------- top bar ---------- */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="flex h-16 items-center gap-3 px-4 md:px-6">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setDrawer(true)}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 lg:hidden"
          >
            <Icon name="menu" className="h-4 w-4" />
          </button>

          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-amber-600">/admin/{tab}</p>
            <h1 className="truncate font-display text-base font-bold leading-tight text-slate-900">
              {NAV_GROUPS.flatMap((g) => g.items).find((i) => i.key === tab)?.label}
            </h1>
          </div>

          <div className="ml-auto flex items-center gap-2 md:gap-3">
            <span className="hidden rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 sm:block">
              {today}
            </span>
            <Link
              to="/"
              className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 md:inline-flex"
            >
              View site <Icon name="external" className="h-3 w-3" />
            </Link>
            <button
              type="button"
              aria-label={`Notifications — ${newLeads} new leads`}
              onClick={() => setTab("leads")}
              className="relative rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900"
            >
              <Icon name="bell" className="h-4 w-4" />
              {newLeads > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                  {newLeads}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={signOut}
              className="hidden rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 sm:block"
            >
              Sign out
            </button>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-amber-400" title="Wuese Philip — Super Administrator">
              WP
            </span>
          </div>
        </div>
      </header>

      {/* ---------- mobile drawer ---------- */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fade-in absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDrawer(false)} />
          <div className="modal-in absolute inset-y-0 left-0 w-72 overflow-y-auto border-r border-slate-200 bg-white p-5 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-amber-400">WP</span>
                <div>
                  <p className="font-display text-sm font-bold text-slate-900">Wuese Philip</p>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">Production</p>
                </div>
              </div>
              <button type="button" aria-label="Close menu" onClick={() => setDrawer(false)} className={iconBtn}>
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>
            {navItems(() => setDrawer(false))}
            <button
              type="button"
              onClick={signOut}
              className="flex w-full items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
            >
              <Icon name="arrowUpRight" className="h-4 w-4 rotate-[135deg]" />
              Sign out
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto flex max-w-[1440px] gap-6 px-4 py-6 md:px-6 lg:px-8">
        {/* ---------- sidebar ---------- */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-[88px]">
            <div className="mb-6 flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-amber-400">WP</span>
              <div>
                <p className="font-display text-sm font-bold text-slate-900">Wuese Philip</p>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">Production</p>
              </div>
            </div>
            {navItems()}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-amber-400">WP</span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-slate-900">Wuese Philip</p>
                  <p className="truncate text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">Super Administrator</p>
                </div>
                <button type="button" onClick={signOut} aria-label="Sign out" className="ml-auto text-slate-400 transition-colors hover:text-rose-500">
                  <Icon name="close" className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* ---------- content ---------- */}
        <main className="min-w-0 flex-1 pb-10">
          {tab === "dashboard" && <Dashboard />}
          {tab === "leads" && <LeadsView />}
          {tab === "projects" && <ProjectsView />}
          {tab === "services" && <ServicesView />}
          {tab === "articles" && <ArticlesView />}
          {tab === "testimonials" && <TestimonialsView />}
          {tab === "users" && <UsersView />}
          {tab === "homepage" && <HomepageView />}
          {tab === "content" && <ContentView />}
          {tab === "media" && <MediaView />}
          {tab === "site" && <SiteView />}
          {tab === "activity" && <ActivityView />}
        </main>
      </div>
    </div>
  );
}
