import { notFound } from "next/navigation";
import AppShell from "@/app-shell";
import { getPublicState } from "@/lib/content";

export const dynamic = "force-dynamic";

const topRoutes = new Set(["projects", "services", "insights", "contact", "privacy", "terms", "admin"]);

export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params;
  if (slug.length && !topRoutes.has(slug[0])) notFound();
  const state = await getPublicState();
  return <AppShell state={state} />;
}
