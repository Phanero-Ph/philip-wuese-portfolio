import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { authenticator } from "otplib";
import { hash, verify } from "@node-rs/bcrypt";
import { db, type DbRow } from "@/lib/db";
import { clearPendingSession, createSession, getPendingUserId } from "@/lib/session";
import { decryptSecret } from "@/lib/secrets";
import { errorResponse } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const { code = "" } = await request.json() as { code?: string };
    const id = await getPendingUserId();
    if (!id) return NextResponse.json({ message: "Your sign-in attempt expired." }, { status: 419 });
    const [rows] = await db.query<DbRow[]>("SELECT id,name,email,is_owner,suspended_at,two_factor_secret,two_factor_confirmed_at,two_factor_recovery_codes FROM users WHERE id=? LIMIT 1", [id]);
    const user = rows[0];
    if (!user || user.suspended_at) return NextResponse.json({ message: "This administrator account is unavailable." }, { status: 403 });
    const verifier = authenticator.clone();
    verifier.options = { window: 1 };
    const normalizedCode = code.replace(/\s/g, "").toUpperCase();
    const validAuthenticator = Boolean(user.two_factor_secret) && verifier.check(normalizedCode, decryptSecret(String(user.two_factor_secret)));
    let recoveryHashes: string[] = [];
    if (user.two_factor_recovery_codes) {
      try {
        const parsed = typeof user.two_factor_recovery_codes === "string" ? JSON.parse(user.two_factor_recovery_codes) : user.two_factor_recovery_codes;
        if (Array.isArray(parsed)) recoveryHashes = parsed.map(String);
      } catch { /* Legacy encrypted recovery codes cannot be consumed by this runtime. */ }
    }
    let usedRecoveryIndex = -1;
    if (!validAuthenticator && user.two_factor_confirmed_at) {
      for (let index = 0; index < recoveryHashes.length; index += 1) {
        if (await verify(normalizedCode, recoveryHashes[index])) { usedRecoveryIndex = index; break; }
      }
    }
    if (!validAuthenticator && usedRecoveryIndex < 0) return NextResponse.json({ message: "The authenticator or recovery code is invalid. Wait for a new authenticator code and check that your device time is set automatically." }, { status: 422 });
    if (usedRecoveryIndex >= 0) {
      recoveryHashes.splice(usedRecoveryIndex, 1);
      await db.execute("UPDATE users SET two_factor_recovery_codes=?,updated_at=NOW() WHERE id=?", [JSON.stringify(recoveryHashes), id]);
    }
    let recoveryCodes: string[] | null = null;
    if (!user.two_factor_confirmed_at) {
      recoveryCodes = Array.from({ length: 8 }, () => `${randomBytes(4).toString("hex").toUpperCase()}-${randomBytes(4).toString("hex").toUpperCase()}`);
      const hashes = await Promise.all(recoveryCodes.map(codeValue => hash(codeValue, 12)));
      await db.execute("UPDATE users SET two_factor_confirmed_at=NOW(), two_factor_recovery_codes=?, updated_at=NOW() WHERE id=?", [JSON.stringify(hashes), id]);
    }
    const sessionUser = { id: Number(user.id), email: String(user.email), name: String(user.name), isOwner: Boolean(user.is_owner) };
    await createSession(sessionUser); await clearPendingSession();
    return NextResponse.json({ authenticated: true, user: sessionUser, recovery_codes: recoveryCodes });
  } catch (error) { return errorResponse(error); }
}
