import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { hash } from "@node-rs/bcrypt";
import { db, type DbRow } from "@/lib/db";
import { errorResponse } from "@/lib/http";
export async function POST(request:Request){
  try{const body=await request.json() as Record<string,string>;if(!body.token||!body.email||!body.password||body.password.length<8||body.password!==body.password_confirmation)return NextResponse.json({message:"The reset details are invalid."},{status:422});const email=body.email.toLowerCase();const[rows]=await db.query<DbRow[]>("SELECT token,created_at FROM password_reset_tokens WHERE email=? LIMIT 1",[email]);const row=rows[0];const supplied=createHash("sha256").update(body.token).digest("hex");const fresh=row&&new Date(String(row.created_at)).getTime()>Date.now()-3600000;const valid=fresh&&timingSafeEqual(Buffer.from(supplied),Buffer.from(String(row.token)));if(!valid)return NextResponse.json({message:"This password reset link is invalid or expired."},{status:422});await db.execute("UPDATE users SET password=?,remember_token=NULL,updated_at=NOW() WHERE LOWER(email)=?",[await hash(body.password,12),email]);await db.execute("DELETE FROM password_reset_tokens WHERE email=?",[email]);return NextResponse.json({reset:true,message:"Your password has been reset. You can now sign in."})}catch(error){return errorResponse(error)}
}
