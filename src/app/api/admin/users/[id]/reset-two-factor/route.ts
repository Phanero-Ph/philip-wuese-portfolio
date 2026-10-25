import { NextResponse } from "next/server";
import { db, type DbRow } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { errorResponse } from "@/lib/http";
export async function POST(_:Request,{params}:{params:Promise<{id:string}>}){
  try{const owner=await requireSession();if(!owner.isOwner)return NextResponse.json({message:"Only the owner can reset 2FA."},{status:403});const{id}=await params;const[rows]=await db.query<DbRow[]>("SELECT id FROM users WHERE id=?",[id]);if(!rows[0])return NextResponse.json({message:"Administrator not found."},{status:404});await db.execute("UPDATE users SET two_factor_secret=NULL,two_factor_recovery_codes=NULL,two_factor_confirmed_at=NULL,two_factor_required=1,updated_at=NOW() WHERE id=?",[id]);return NextResponse.json({reset:true})}catch(error){return errorResponse(error)}
}
