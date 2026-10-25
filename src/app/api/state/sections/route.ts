import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { db, parseJson, type DbRow } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { errorResponse } from "@/lib/http";

const allowed = new Set(["hero","homeText","intro","expertise","techStack","process","stats","experience","profile","nav","ctas","pageText","publicText","seo","legal","settings","sections","socials","contactChannels","marquee","projectTypes","budgetRanges","timelines","sources","projects","services","articles","testimonials"]);

export async function PUT(request: Request) {
  const connection = await db.getConnection();
  try {
    const user = await requireSession();
    const { sections } = await request.json() as { sections?: Record<string, unknown> };
    const changes = Object.entries(sections || {}).filter(([key]) => allowed.has(key));
    if (!changes.length) return NextResponse.json({ message: "No editable sections were supplied." }, { status: 422 });
    await connection.beginTransaction();
    const [rows] = await connection.query<DbRow[]>("SELECT payload FROM cms_states WHERE `key` = ? FOR UPDATE", ["site"]);
    const payload = parseJson<Record<string, unknown>>(rows[0].payload);
    for (const [section, value] of changes) {
      await connection.execute("INSERT INTO cms_revisions (user_id, section, payload, action, created_at, updated_at) VALUES (?, ?, ?, 'update', NOW(), NOW())", [user.id, section, JSON.stringify({ [section]: payload[section] ?? null })]);
      payload[section] = value;
    }
    await connection.execute("UPDATE cms_states SET payload = ?, updated_at = NOW() WHERE `key` = ?", [JSON.stringify(payload), "site"]);
    await connection.commit();
    revalidateTag("site-state", "max");
    return NextResponse.json({ saved: true, sections: changes.map(([key]) => key) });
  } catch (error) { await connection.rollback(); return errorResponse(error); }
  finally { connection.release(); }
}
