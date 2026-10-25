import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
export async function GET() { const user = await getSession(); return NextResponse.json({ authenticated: Boolean(user), user }); }
