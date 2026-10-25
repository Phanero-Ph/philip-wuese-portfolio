import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { errorResponse } from "@/lib/http";

export async function PATCH(request: Request) {
  try {
    const session = await requireSession(); const { enabled } = await request.json() as { enabled?: boolean };
    if (typeof enabled !== "boolean") return NextResponse.json({ message: "A valid 2FA preference is required." }, { status: 422 });
    await db.execute("UPDATE users SET two_factor_required=?,two_factor_secret=NULL,two_factor_recovery_codes=NULL,two_factor_confirmed_at=NULL,updated_at=NOW() WHERE id=?", [enabled,session.id]);
    return NextResponse.json({ updated: true, enabled, message: enabled ? "Two-factor authentication is enabled. Enroll during your next sign-in." : "Two-factor authentication is disabled." });
  } catch (error) { return errorResponse(error); }
}
