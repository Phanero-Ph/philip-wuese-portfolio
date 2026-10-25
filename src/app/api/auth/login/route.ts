import { NextResponse } from "next/server";
import { verify } from "@node-rs/bcrypt";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import { z } from "zod";
import { db, type DbRow } from "@/lib/db";
import { createPendingSession, createSession } from "@/lib/session";
import { decryptSecret, encryptSecret } from "@/lib/secrets";
import { errorResponse } from "@/lib/http";

const schema = z.object({ email: z.email().max(190), password: z.string().min(1).max(1024) });

export async function POST(request: Request) {
  try {
    const credentials = schema.parse(await request.json());
    const [rows] = await db.query<DbRow[]>("SELECT id,name,email,password,is_owner,suspended_at,two_factor_required,two_factor_secret,two_factor_confirmed_at FROM users WHERE LOWER(email)=LOWER(?) LIMIT 1", [credentials.email]);
    const user = rows[0];
    if (!user || !await verify(credentials.password, String(user.password))) return NextResponse.json({ message: "The supplied credentials are invalid." }, { status: 422 });
    if (user.suspended_at) return NextResponse.json({ message: "This administrator account has been suspended. Contact the owner." }, { status: 403 });
    const sessionUser = { id: Number(user.id), email: String(user.email), name: String(user.name), isOwner: Boolean(user.is_owner) };
    if (!user.two_factor_required) {
      await createSession(sessionUser);
      return NextResponse.json({ authenticated: true, requires_two_factor: false, user: sessionUser });
    }
    const setup = !user.two_factor_confirmed_at;
    let secret = "";
    if (setup && user.two_factor_secret) {
      try {
        secret = decryptSecret(String(user.two_factor_secret));
      } catch {
        // An unfinished enrollment is safe to replace because no authenticator
        // has been confirmed for it yet.
        await db.execute("UPDATE users SET two_factor_secret=NULL,two_factor_recovery_codes=NULL,updated_at=NOW() WHERE id=?", [user.id]);
      }
    }
    if (setup && !secret) {
      secret = authenticator.generateSecret();
      await db.execute("UPDATE users SET two_factor_secret=?, updated_at=NOW() WHERE id=?", [encryptSecret(secret), user.id]);
    }
    await createPendingSession(Number(user.id));
    const response: Record<string, unknown> = { authenticated: false, requires_two_factor: true, setup };
    if (setup) {
      const [cms] = await db.query<DbRow[]>("SELECT JSON_UNQUOTE(JSON_EXTRACT(payload, '$.settings.applicationName')) application_name FROM cms_states WHERE `key`='site' LIMIT 1");
      const applicationName = String(cms[0]?.application_name || "Portfolio CMS");
      const uri = authenticator.keyuri(String(user.email), applicationName, secret);
      response.secret = secret;
      response.qr_code = await QRCode.toDataURL(uri, { width: 220, margin: 1 });
    }
    return NextResponse.json(response);
  } catch (error) { return errorResponse(error); }
}
