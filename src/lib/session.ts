import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { HttpError } from "@/lib/http";
import { db, type DbRow } from "@/lib/db";

const name = "portfolio_session";
const pendingName = "portfolio_2fa_pending";
const secret = () => {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) throw new Error("AUTH_SECRET must contain at least 32 characters.");
  return new TextEncoder().encode(value);
};

export type SessionUser = { id: number; email: string; name: string; isOwner: boolean };

export async function createSession(user: SessionUser) {
  const token = await new SignJWT(user).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("8h").sign(secret());
  (await cookies()).set(name, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(name)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as SessionUser;
  } catch { return null; }
}

export async function requireSession() {
  const user = await getSession();
  if (!user) throw new HttpError("Your administrator session has expired. Sign in again.", 401);
  const [rows] = await db.query<DbRow[]>(
    "SELECT id,email,name,is_owner,suspended_at FROM users WHERE id=? LIMIT 1",
    [user.id],
  );
  const current = rows[0];
  if (!current || current.suspended_at) {
    await destroySession();
    throw new HttpError(
      current ? "This administrator account has been suspended." : "This administrator account no longer exists.",
      401,
    );
  }
  return {
    id: Number(current.id),
    email: String(current.email),
    name: String(current.name),
    isOwner: Boolean(current.is_owner),
  } satisfies SessionUser;
}

export async function destroySession() { (await cookies()).delete(name); }

export async function createPendingSession(userId: number) {
  const token = await new SignJWT({ userId, purpose: "2fa" }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("10m").sign(secret());
  (await cookies()).set(pendingName, token, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 600 });
}

export async function getPendingUserId() {
  const token = (await cookies()).get(pendingName)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.purpose === "2fa" ? Number(payload.userId) : null;
  } catch { return null; }
}

export async function clearPendingSession() { (await cookies()).delete(pendingName); }
