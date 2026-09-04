import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const REDIRECT_HOME = [
  "/login",
  "/signup",
  "/onboard",
  "/dashboard",
  "/admin-dashboard",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const shouldRedirect = REDIRECT_HOME.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  if (shouldRedirect) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/signup",
    "/onboard",
    "/onboard/:path*",
    "/dashboard/:path*",
    "/admin-dashboard/:path*",
  ],
};
