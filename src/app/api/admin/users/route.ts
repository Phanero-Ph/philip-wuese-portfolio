import { NextResponse } from "next/server";
import { hash } from "@node-rs/bcrypt";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { errorResponse } from "@/lib/http";

const schema = z.object({ name: z.string().trim().min(2).max(190), email: z.email().max(190), password: z.string().min(8).max(1024) });
export async function POST(request: Request) {
  try {
    const owner = await requireSession(); if (!owner.isOwner) return NextResponse.json({ message: "Only the owner can create administrators." }, { status: 403 });
    const data = schema.parse(await request.json());
    await db.execute("INSERT INTO users (name,email,is_owner,two_factor_required,password,created_at,updated_at) VALUES (?,?,0,1,?,NOW(),NOW())", [data.name,data.email.toLowerCase(),await hash(data.password,12)]);
    return NextResponse.json({ created: true }, { status: 201 });
  } catch (error) { return errorResponse(error); }
}
