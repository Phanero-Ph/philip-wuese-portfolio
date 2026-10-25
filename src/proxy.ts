import { NextResponse, type NextRequest } from "next/server";

const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);

export function proxy(request: NextRequest) {
  if (safeMethods.has(request.method)) return NextResponse.next();

  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") {
    return NextResponse.json({ message: "Cross-site requests are not allowed." }, { status: 403 });
  }
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ message: "The request origin is not allowed." }, { status: 403 });
  }
  return NextResponse.next();
}

export const config = { matcher: "/api/:path*" };
