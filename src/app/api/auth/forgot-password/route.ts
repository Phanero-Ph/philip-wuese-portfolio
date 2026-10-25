import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { db, type DbRow } from "@/lib/db";
import { errorResponse } from "@/lib/http";

export async function POST(request:Request){
  try{
    const {email=""}=await request.json() as {email?:string}; const normalized=email.trim().toLowerCase();
    const [users]=await db.query<DbRow[]>("SELECT id FROM users WHERE LOWER(email)=? LIMIT 1",[normalized]);
    if(users[0]){
      const token=randomBytes(32).toString("hex"); const digest=createHash("sha256").update(token).digest("hex");
      await db.execute("DELETE FROM password_reset_tokens WHERE email=?",[normalized]);
      await db.execute("INSERT INTO password_reset_tokens (email,token,created_at) VALUES (?,?,NOW())",[normalized,digest]);
      if(process.env.SMTP_HOST){
        const transport=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:Number(process.env.SMTP_PORT)===465,auth:process.env.SMTP_USER?{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD}:undefined});
        const url=`${process.env.NEXT_PUBLIC_APP_URL||"http://localhost:3000"}/admin?reset_token=${encodeURIComponent(token)}&email=${encodeURIComponent(normalized)}`;
        await transport.sendMail({from:process.env.SMTP_FROM,to:normalized,subject:"Reset your administrator password",text:`Reset your password using this secure link (valid for 60 minutes): ${url}`});
      }
    }
    return NextResponse.json({sent:true,message:"If an administrator account matches that email, a password reset link has been sent."});
  }catch(error){return errorResponse(error)}
}
