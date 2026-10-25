import { NextResponse } from "next/server";
import { hash, verify } from "@node-rs/bcrypt";
import { db, type DbRow } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { errorResponse } from "@/lib/http";

export async function PATCH(request: Request) {
  try {
    const session = await requireSession(); const body = await request.json() as Record<string,string>;
    if (!body.current_password || !body.password || body.password.length < 8 || body.password !== body.password_confirmation) return NextResponse.json({ message: "Provide your current password and a matching new password of at least 8 characters." }, { status: 422 });
    const [rows] = await db.query<DbRow[]>("SELECT password FROM users WHERE id=?", [session.id]);
    if (!rows[0] || !await verify(body.current_password, String(rows[0].password))) return NextResponse.json({ message: "The current password is incorrect." }, { status: 422 });
    await db.execute("UPDATE users SET password=?, remember_token=NULL, updated_at=NOW() WHERE id=?", [await hash(body.password, 12), session.id]);
    return NextResponse.json({ updated: true, message: "Your password has been changed." });
  } catch (error) { return errorResponse(error); }
}
