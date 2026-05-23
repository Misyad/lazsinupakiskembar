import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session-cookie";

const protectedRoutes = [
  "/dashboard",
  "/houses",
  "/coin-boxes",
  "/withdrawals",
  "/finance",
  "/reports",
  "/settings",
  "/audit-logs"
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const isProtectedRoute = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (isProtectedRoute && !hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/houses/:path*",
    "/coin-boxes/:path*",
    "/withdrawals/:path*",
    "/finance/:path*",
    "/reports/:path*",
    "/settings/:path*",
    "/audit-logs/:path*"
  ]
};
