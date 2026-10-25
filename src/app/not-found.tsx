import Link from "next/link";

export default function NotFound() {
  return <main className="flex min-h-screen items-center justify-center bg-midnight px-6 text-frost"><div className="max-w-xl border border-line bg-panel/60 p-10 text-center"><p className="font-mono text-xs uppercase tracking-[.3em] text-gold">404</p><h1 className="mt-4 font-display text-4xl font-bold">Page not found</h1><p className="mt-4 text-mist">The requested page does not exist or is no longer available.</p><Link className="mt-8 inline-flex bg-gold px-6 py-3 font-mono text-xs font-bold uppercase tracking-[.2em] text-midnight" href="/">Return home</Link></div></main>;
}
