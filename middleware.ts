import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, isAuthorized } from "@/lib/admin-auth";

// Public traffic must keep working: the home page reads GET /api/guests,
// and visitors post to /api/rsvp and /api/visitors.
function isProtectedApi(pathname: string, method: string): boolean {
  if (pathname === "/api/visitors") return method === "GET";
  if (pathname === "/api/guests") return method !== "GET";
  if (pathname === "/api/seating") return true;
  if (pathname === "/api/updates") return true;
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authed = isAuthorized(request.cookies.get(ADMIN_COOKIE)?.value);

  if (pathname === "/admin-login") {
    return authed
      ? NextResponse.redirect(new URL("/admin", request.url))
      : NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (authed) return NextResponse.next();
    const login = new URL("/admin-login", request.url);
    login.searchParams.set("from", pathname);
    return NextResponse.redirect(login);
  }

  if (isProtectedApi(pathname, request.method) && !authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/admin-login",
    "/api/visitors",
    "/api/guests",
    "/api/seating",
    "/api/updates",
  ],
};
