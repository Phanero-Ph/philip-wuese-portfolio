import { NextResponse } from "next/server";
import { db, type DbRow } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { errorResponse } from "@/lib/http";

async function target(id: string) { const [rows] = await db.query<DbRow[]>("SELECT id,is_owner FROM users WHERE id=?", [id]); return rows[0]; }
export async function PATCH(request: Request, { params }: { params: Promise<{id:string}> }) {
  try {
    const owner=await requireSession(); if(!owner.isOwner)return NextResponse.json({message:"Only the owner can manage administrators."},{status:403});
    const {id}=await params; const user=await target(id); if(!user)return NextResponse.json({message:"Administrator not found."},{status:404});
    if(user.is_owner)return NextResponse.json({message:"The owner account cannot be suspended."},{status:422});
    const {suspended}=await request.json() as {suspended?:boolean}; if(typeof suspended!=="boolean")return NextResponse.json({message:"Invalid status."},{status:422});
    await db.execute("UPDATE users SET suspended_at=?,updated_at=NOW() WHERE id=?",[suspended?new Date():null,id]); return NextResponse.json({updated:true});
  } catch(error){return errorResponse(error)}
}
export async function DELETE(_: Request, { params }: { params: Promise<{id:string}> }) {
  try {
    const owner=await requireSession(); if(!owner.isOwner)return NextResponse.json({message:"Only the owner can delete administrators."},{status:403});
    const {id}=await params; const user=await target(id); if(!user)return NextResponse.json({message:"Administrator not found."},{status:404});
    if(user.is_owner||Number(id)===owner.id)return NextResponse.json({message:"The owner account cannot be deleted."},{status:422});
    await db.execute("DELETE FROM users WHERE id=?",[id]); return NextResponse.json({deleted:true});
  } catch(error){return errorResponse(error)}
}
