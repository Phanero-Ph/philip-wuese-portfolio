import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { errorResponse } from "@/lib/http";
const statuses=new Set(["New","Contacted","Qualified","Proposal","Won","Lost"]);
export async function PUT(request:Request){const connection=await db.getConnection();try{await requireSession();const{leads=[]}=await request.json() as {leads:Array<{id:string;status:string;notes?:string}>};await connection.beginTransaction();for(const lead of leads){if(!statuses.has(lead.status))continue;await connection.execute("UPDATE leads SET status=?,notes=?,updated_at=NOW() WHERE public_id=?",[lead.status,(lead.notes||"").slice(0,10000),lead.id])}await connection.commit();return NextResponse.json({saved:true})}catch(error){await connection.rollback();return errorResponse(error)}finally{connection.release()}}
