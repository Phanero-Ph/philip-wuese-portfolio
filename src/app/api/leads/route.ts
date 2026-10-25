import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { errorResponse } from "@/lib/http";

const leadSchema = z.object({
  name: z.string().trim().min(1).max(190), email: z.email().max(190), phone: z.string().max(100).optional().default(""),
  company: z.string().max(190).optional().default(""), type: z.string().min(1).max(190), budget: z.string().min(1).max(190),
  timeline: z.string().min(1).max(190), description: z.string().min(1).max(10000), attachment: z.string().max(1000).optional().default(""), source: z.string().max(190).optional().default(""),
});

export async function POST(request: Request) {
  try {
    const data = leadSchema.parse(await request.json());
    const id = randomBytes(8).toString("hex");
    await db.execute("INSERT INTO leads (public_id,name,email,phone,company,type,budget,timeline,description,attachment,source,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,'New',NOW(),NOW())", [id,data.name,data.email,data.phone,data.company,data.type,data.budget,data.timeline,data.description,data.attachment,data.source]);
    return NextResponse.json({ saved: true, id }, { status: 201 });
  } catch (error) { return errorResponse(error); }
}
