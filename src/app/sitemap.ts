import type { MetadataRoute } from "next";
import { getPublicState } from "@/lib/content";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"; const state = await getPublicState();
  const fixed = ["", "/projects", "/services", "/insights", "/contact", "/privacy", "/terms"];
  const projects = ((state.projects || []) as Array<{slug:string}>).map(item => `/projects/${item.slug}`);
  const articles = ((state.articles || []) as Array<{slug:string;published?:boolean}>).filter(item => item.published !== false).map(item => `/insights/${item.slug}`);
  return [...fixed,...projects,...articles].map(route => ({ url: `${base}${route}`, lastModified: new Date() }));
}
