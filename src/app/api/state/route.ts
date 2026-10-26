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
      const [leadRows, userRows, viewRows, clickRows, visitorRows, dailyViewRows, previousViewRows, dailyCtaRows, deviceRows, sourceRows] = await Promise.all([
        db.query<DbRow[]>("SELECT public_id,name,email,phone,company,type,budget,timeline,description,attachment,source,status,notes,created_at FROM leads ORDER BY created_at DESC"),
        db.query<DbRow[]>("SELECT id,name,email,is_owner,suspended_at,two_factor_confirmed_at,created_at FROM users ORDER BY name"),
        db.query<DbRow[]>("SELECT COUNT(*) total FROM analytics_events WHERE type='page_view'"),
        db.query<DbRow[]>("SELECT entity,COUNT(*) total FROM analytics_events WHERE type='cta_click' GROUP BY entity"),
        db.query<DbRow[]>("SELECT COUNT(DISTINCT CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN CONCAT(session_hash, ':', ip_hash) END) current_total, COUNT(DISTINCT CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 60 DAY) AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY) THEN CONCAT(session_hash, ':', ip_hash) END) previous_total FROM analytics_events WHERE type='page_view'"),
        db.query<DbRow[]>("SELECT DATE(created_at) event_date, COUNT(*) total FROM analytics_events WHERE type='page_view' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) GROUP BY DATE(created_at) ORDER BY event_date"),
        db.query<DbRow[]>("SELECT COUNT(*) total FROM analytics_events WHERE type='page_view' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 13 DAY) AND created_at < DATE_SUB(CURDATE(), INTERVAL 6 DAY)"),
        db.query<DbRow[]>("SELECT DATE(created_at) event_date, COUNT(*) total FROM analytics_events WHERE type='cta_click' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY) GROUP BY DATE(created_at) ORDER BY event_date"),
        db.query<DbRow[]>("SELECT COALESCE(NULLIF(device,''),'Unknown') label, COUNT(*) total FROM analytics_events WHERE type='page_view' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY device ORDER BY total DESC"),
        db.query<DbRow[]>("SELECT COALESCE(NULLIF(source,''),'Direct') label, COUNT(*) total FROM analytics_events WHERE type='page_view' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY source ORDER BY total DESC"),
      ]);
      state.leads = leadRows[0].map(lead => ({ id:String(lead.public_id),name:lead.name,email:lead.email,phone:lead.phone||"",company:lead.company||"",type:lead.type,budget:lead.budget,timeline:lead.timeline,description:lead.description,attachment:lead.attachment||"",source:lead.source||"",date:new Date(String(lead.created_at)).toISOString(),status:lead.status,notes:lead.notes||"" }));
      state.users = userRows[0].map((user,index) => ({ id:String(user.id),name:user.name,email:user.email,role:user.is_owner?"Super Administrator":"Administrator",status:user.suspended_at?"Invited":"Active",twoFA:Boolean(user.two_factor_confirmed_at),lastActive:user.suspended_at?"Suspended":"Active",logins:0,actions:0,week:[0,0,0,0,0,0,0],hue:["slate","amber","sky","emerald","violet"][index%5] }));
      state.pageViews = Number(viewRows[0][0]?.total || 0);
      state.ctaClicks = Object.fromEntries(clickRows[0].filter(row => row.entity).map(row => [String(row.entity),Number(row.total)]));
      const fillDays = (rows: DbRow[]) => {
        const totals = new Map(rows.map(row => [new Date(String(row.event_date)).toISOString().slice(0, 10), Number(row.total)]));
        return Array.from({ length: 7 }, (_, offset) => {
          const date = new Date();
          date.setHours(12, 0, 0, 0);
          date.setDate(date.getDate() - (6 - offset));
          const key = date.toISOString().slice(0, 10);
          return { date: key, value: totals.get(key) ?? 0 };
        });
      };
      const sources = new Map<string, number>();
      for (const row of sourceRows[0]) {
        const raw = String(row.label || "Direct");
        let label = "Direct";
        if (raw !== "Direct") {
          try { label = new URL(raw).hostname.replace(/^www\./, ""); }
          catch { label = raw; }
        }
        sources.set(label, (sources.get(label) ?? 0) + Number(row.total));
      }
      state.analytics = {
        visitors30: Number(visitorRows[0][0]?.current_total || 0),
        visitorsPrevious30: Number(visitorRows[0][0]?.previous_total || 0),
        views7: fillDays(dailyViewRows[0]),
        viewsPrevious7: Number(previousViewRows[0][0]?.total || 0),
        cta7: fillDays(dailyCtaRows[0]),
        devices30: deviceRows[0].map(row => ({ label: String(row.label), value: Number(row.total) })),
        sources30: [...sources.entries()].sort((a,b) => b[1]-a[1]).slice(0, 5).map(([label,value]) => ({ label,value })),
      };
    }
    return NextResponse.json({ state, authenticated: true, user: session });
  } catch (error) { return errorResponse(error); }
}

export async function PUT(request: Request) {
  try {
    await requireSession();
    const body = await request.json() as { state?: Record<string, unknown> };
    if (!body.state || typeof body.state !== "object") return NextResponse.json({ message: "A valid state is required." }, { status: 422 });
    const { leads: _leads, users: _users, activity: _activity, ctaClicks: _ctaClicks, pageViews: _pageViews, analytics: _analytics, ...state } = body.state;
    await db.execute("UPDATE cms_states SET payload = ?, updated_at = NOW() WHERE `key` = ?", [JSON.stringify(state), "site"]);
    revalidateTag("site-state", "max");
    return NextResponse.json({ saved: true });
  } catch (error) { return errorResponse(error); }
}
