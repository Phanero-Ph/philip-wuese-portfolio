"use client";

import { useEffect } from "react";
import { useRoute } from "@/router";
import { StoreProvider, useStore } from "@/store";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Home from "@/site-pages/Home";
import Projects from "@/site-pages/Projects";
import ProjectDetail from "@/site-pages/ProjectDetail";
import Services from "@/site-pages/Services";
import Insights, { ArticleView } from "@/site-pages/Insights";
import Contact from "@/site-pages/Contact";
import Legal from "@/site-pages/Legal";
import Admin from "@/site-pages/Admin";
import NotFound from "@/site-pages/NotFound";

const NOISE_SVG =
  "%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

function Background() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="bg-grid absolute inset-x-0 top-0 h-[130vh]" />
      <div className="absolute left-[-10%] top-[-15%] h-[520px] w-[520px] rounded-full bg-gold/[0.06] blur-[140px]" />
      <div className="absolute right-[-12%] top-[35%] h-[460px] w-[460px] rounded-full bg-cyan/[0.05] blur-[140px]" />
    </div>
  );
}

function Noise() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] opacity-[0.04] mix-blend-overlay"
      style={{ backgroundImage: `url("data:image/svg+xml,${NOISE_SVG}")` }}
    />
  );
}

function Shell() {
  const { path, segments } = useRoute();
  const { bumpPageView, state, ready } = useStore();

  useEffect(() => {
    bumpPageView();
    // once per session load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    const project = segments[0] === "projects" && segments[1];
    const article = segments[0] === "insights" && segments[1];
    document.title = project
      ? `Project: ${segments[1]} — ${state.profile.name}`
      : article
        ? `Insight: ${segments[1]} — ${state.profile.name}`
        : state.seo[path] ?? state.seo.notFound;
  }, [path, segments, state.profile.name, state.seo]);

  const isAdmin = path === "/admin";

  if (!ready) return <div className="min-h-screen bg-midnight" aria-busy="true" />;

  let page: React.ReactNode;
  if (path === "/") page = <Home />;
  else if (path === "/projects") page = <Projects />;
  else if (segments[0] === "projects" && segments[1]) page = <ProjectDetail slug={segments[1]} />;
  else if (path === "/services") page = <Services />;
  else if (path === "/insights") page = <Insights />;
  else if (segments[0] === "insights" && segments[1]) page = <ArticleView slug={segments[1]} />;
  else if (path === "/contact") page = <Contact />;
  else if (path === "/privacy") page = <Legal kind="privacy" />;
  else if (path === "/terms") page = <Legal kind="terms" />;
  else if (path === "/admin") page = <Admin />;
  else page = <NotFound />;

  return (
    <div className="relative min-h-screen overflow-x-clip bg-midnight text-frost">
      <Background />
      <Noise />
      {!isAdmin && <Nav />}
      <main className="relative z-10">{page}</main>
      {!isAdmin && <Footer />}
    </div>
  );
}

export default function App({ initialState }: { initialState: Record<string, unknown> }) {
  return (
    <StoreProvider initialState={initialState}>
      <Shell />
    </StoreProvider>
  );
}
