import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { db, parseJson, type DbRow } from "@/lib/db";
import { getPublicState } from "@/lib/content";
import { getSession, requireSession } from "@/lib/session";
import { errorResponse } from "@/lib/http";
import { normalizeStoredMediaUrls } from "@/lib/media-url";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ state: await getPublicState(), authenticated: false });
    const [rows] = await db.query<DbRow[]>("SELECT payload FROM cms_states WHERE `key` = ? LIMIT 1", ["site"]);
    const state = rows[0] ? normalizeStoredMediaUrls(parseJson<Record<string, unknown>>(rows[0].payload)) : null;
    if (state) {
      const [leadRows, userRows, viewRows, clickRows] = await Promise.all([
        db.query<DbRow[]>("SELECT public_id,name,email,phone,company,type,budget,timeline,description,attachment,source,status,notes,created_at FROM leads ORDER BY created_at DESC"),
        db.query<DbRow[]>("SELECT id,name,email,is_owner,suspended_at,two_factor_confirmed_at,created_at FROM users ORDER BY name"),
        db.query<DbRow[]>("SELECT COUNT(*) total FROM analytics_events WHERE type='page_view'"),
        db.query<DbRow[]>("SELECT entity,COUNT(*) total FROM analytics_events WHERE type='cta_click' GROUP BY entity"),
      ]);
      state.leads = leadRows[0].map(lead => ({ id:String(lead.public_id),name:lead.name,email:lead.email,phone:lead.phone||"",company:lead.company||"",type:lead.type,budget:lead.budget,timeline:lead.timeline,description:lead.description,attachment:lead.attachment||"",source:lead.source||"",date:new Date(String(lead.created_at)).toISOString(),status:lead.status,notes:lead.notes||"" }));
      state.users = userRows[0].map((user,index) => ({ id:String(user.id),name:user.name,email:user.email,role:user.is_owner?"Super Administrator":"Administrator",status:user.suspended_at?"Invited":"Active",twoFA:Boolean(user.two_factor_confirmed_at),lastActive:user.suspended_at?"Suspended":"Active",logins:0,actions:0,week:[0,0,0,0,0,0,0],hue:["slate","amber","sky","emerald","violet"][index%5] }));
      state.pageViews = Number(viewRows[0][0]?.total || 0);
      state.ctaClicks = Object.fromEntries(clickRows[0].filter(row => row.entity).map(row => [String(row.entity),Number(row.total)]));
    }
    return NextResponse.json({ state, authenticated: true, user: session });
  } catch (error) { return errorResponse(error); }
}

export async function PUT(request: Request) {
  try {
    await requireSession();
    const body = await request.json() as { state?: Record<string, unknown> };
    if (!body.state || typeof body.state !== "object") return NextResponse.json({ message: "A valid state is required." }, { status: 422 });
    const { leads: _leads, users: _users, activity: _activity, ctaClicks: _ctaClicks, pageViews: _pageViews, ...state } = body.state;
    await db.execute("UPDATE cms_states SET payload = ?, updated_at = NOW() WHERE `key` = ?", [JSON.stringify(state), "site"]);
    revalidateTag("site-state", "max");
    return NextResponse.json({ saved: true });
  } catch (error) { return errorResponse(error); }
}
