import { NextResponse } from "next/server";
import { db,type DbRow } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { errorResponse } from "@/lib/http";
export async function GET(){try{await requireSession();const[revisions]=await db.query<DbRow[]>("SELECT * FROM cms_revisions ORDER BY created_at DESC LIMIT 50");return NextResponse.json({revisions})}catch(error){return errorResponse(error)}}
