import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Basic-auth gate for /admin. Set ADMIN_PASSWORD (and optionally ADMIN_USER). */
export function middleware(req: NextRequest) {
  const pass = process.env.ADMIN_PASSWORD;
  if (!pass) {
    return new NextResponse("Admin is not configured.", { status: 503 });
  }
  const user = process.env.ADMIN_USER || "admin";
  const expected = "Basic " + btoa(`${user}:${pass}`);
  if (req.headers.get("authorization") !== expected) {
    return new NextResponse("Authentication required.", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Pivotum admin", charset="UTF-8"' },
    });
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
