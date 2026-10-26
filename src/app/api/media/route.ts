import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { db, type DbRow } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { errorResponse } from "@/lib/http";
import { normalizeMediaUrl } from "@/lib/media-url";

const signatures: Array<{ mime: string; ext: string; valid: (b: Buffer) => boolean }> = [
  { mime: "image/jpeg", ext: "jpg", valid: b => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: "image/png", ext: "png", valid: b => b.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) },
  { mime: "image/gif", ext: "gif", valid: b => ["GIF87a","GIF89a"].includes(b.subarray(0,6).toString()) },
  { mime: "image/webp", ext: "webp", valid: b => b.subarray(0,4).toString() === "RIFF" && b.subarray(8,12).toString() === "WEBP" },
];

export async function GET() {
  try { await requireSession(); const [media] = await db.query<DbRow[]>("SELECT * FROM media ORDER BY created_at DESC"); return NextResponse.json({ media: media.map(item => ({ ...item, path: normalizeMediaUrl(String(item.path || "")), url: normalizeMediaUrl(String(item.url || item.path || "")) })) }); }
  catch (error) { return errorResponse(error); }
}

export async function POST(request: Request) {
  try {
    const user = await requireSession();
    const form = await request.formData(); const file = form.get("file");
    if (!(file instanceof File) || !file.size || file.size > 5 * 1024 * 1024) return NextResponse.json({ message: "Choose an image no larger than 5 MB." }, { status: 422 });
    const buffer = Buffer.from(await file.arrayBuffer()); const signature = signatures.find(item => item.valid(buffer));
    if (!signature) return NextResponse.json({ message: "Only valid JPG, PNG, WebP, and GIF images are accepted." }, { status: 422 });
    const now = new Date(); const relative = `/uploads/${now.getUTCFullYear()}/${String(now.getUTCMonth()+1).padStart(2,"0")}/${randomBytes(18).toString("hex")}.${signature.ext}`;
    const absolute = path.join(process.cwd(), "public", ...relative.split("/").filter(Boolean));
    await mkdir(path.dirname(absolute), { recursive: true }); await writeFile(absolute, buffer, { flag: "wx" });
    const alt = String(form.get("alt") || "").slice(0, 255); const name = file.name.slice(0, 255);
    const [result] = await db.execute("INSERT INTO media (user_id,name,path,url,mime,size,alt,created_at,updated_at) VALUES (?,?,?,?,?,?,?,NOW(),NOW())", [user.id,name,relative,relative,signature.mime,file.size,alt]);
    const id = (result as { insertId: number }).insertId;
    return NextResponse.json({ media: { id,user_id:user.id,name,path:relative,url:relative,mime:signature.mime,size:file.size,alt } }, { status: 201 });
  } catch (error) { return errorResponse(error); }
}
