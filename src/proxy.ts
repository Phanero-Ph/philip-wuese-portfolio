import { NextResponse, type NextRequest } from "next/server";

const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);

function firstHeaderValue(value: string | null) {
  return value?.split(",", 1)[0]?.trim() || null;
}

function addOrigin(origins: Set<string>, value: string | null) {
  if (!value) return;
  try { origins.add(new URL(value).origin); } catch { /* Ignore malformed proxy headers. */ }
}

function allowedOrigins(request: NextRequest) {
  const origins = new Set<string>([request.nextUrl.origin]);
  addOrigin(origins, process.env.NEXT_PUBLIC_APP_URL || null);

  const forwardedHost = firstHeaderValue(request.headers.get("x-forwarded-host"));
  const forwardedProto = firstHeaderValue(request.headers.get("x-forwarded-proto"));
  if (forwardedHost) addOrigin(origins, `${forwardedProto || "https"}://${forwardedHost}`);

  const host = firstHeaderValue(request.headers.get("host"));
  if (host) addOrigin(origins, `${forwardedProto || request.nextUrl.protocol.replace(":", "")}://${host}`);
  return origins;
}

export function proxy(request: NextRequest) {
  if (safeMethods.has(request.method)) return NextResponse.next();

  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") {
    return NextResponse.json({ message: "Cross-site requests are not allowed." }, { status: 403 });
  }
  if (origin && !allowedOrigins(request).has(origin)) {
    return NextResponse.json({ message: "The request origin is not allowed." }, { status: 403 });
  }
  return NextResponse.next();
}

export const config = { matcher: "/api/:path*" };
