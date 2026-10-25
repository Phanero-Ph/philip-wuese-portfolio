import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { type?: string; entity?: string };
  if (!new Set(["page_view", "cta_click"]).has(body.type || "")) return NextResponse.json({ message: "Invalid event." }, { status: 422 });
  const ua = request.headers.get("user-agent") || "";
  const forwarded = request.headers.get("x-forwarded-for") || "";
  const hash = (value: string) => createHash("sha256").update(value + (process.env.AUTH_SECRET || "")).digest("hex");
  const device = /mobile|android|iphone/i.test(ua) ? "Mobile" : /tablet|ipad/i.test(ua) ? "Tablet" : "Desktop";
  await db.execute("INSERT INTO analytics_events (type,entity,session_hash,ip_hash,device,source,created_at) VALUES (?,?,?,?,?,?,NOW())", [body.type ?? "page_view",body.entity || null,hash(ua),hash(forwarded),device,request.headers.get("referer") || "Direct"]);
  return NextResponse.json({ saved: true }, { status: 201 });
}
