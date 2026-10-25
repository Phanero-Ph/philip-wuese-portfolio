import { unlink } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { db, type DbRow } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { errorResponse } from "@/lib/http";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireSession();
    const { id } = await params;
    const body = await request.json() as { alt?: unknown; caption?: unknown };
    if (typeof body.alt !== "string" || body.alt.length > 255 || (body.caption != null && typeof body.caption !== "string")) {
      return NextResponse.json({ message: "Alternative text must be text no longer than 255 characters." }, { status: 422 });
    }
    const [result] = await db.execute("UPDATE media SET alt=?, caption=?, updated_at=NOW() WHERE id=?", [body.alt.trim(), String(body.caption || "").slice(0, 10000), id]);
    if ((result as { affectedRows: number }).affectedRows === 0) return NextResponse.json({ message: "Media not found." }, { status: 404 });
    return NextResponse.json({ updated: true });
  } catch (error) { return errorResponse(error); }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireSession(); const { id } = await params;
    const [rows] = await db.query<DbRow[]>("SELECT path FROM media WHERE id=? LIMIT 1", [id]);
    if (!rows[0]) return NextResponse.json({ message: "Media not found." }, { status: 404 });
    const relative = String(rows[0].path); const base = path.resolve(process.cwd(), "public", "uploads"); const target = path.resolve(process.cwd(), "public", relative.replace(/^\//, ""));
    if (!target.startsWith(base + path.sep)) return NextResponse.json({ message: "Invalid media path." }, { status: 422 });
    await db.execute("DELETE FROM media WHERE id=?", [id]); await unlink(target).catch(() => undefined);
    return NextResponse.json({ deleted: true });
  } catch (error) { return errorResponse(error); }
}
