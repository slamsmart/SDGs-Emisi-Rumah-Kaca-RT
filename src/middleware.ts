import { NextResponse, type NextRequest } from "next/server";

import { adminPrefix, publicPaths, sessionCookieName, verifySessionToken } from "@/auth.config";

const assetPrefixes = ["/_next", "/favicon.ico", "/manifest.webmanifest", "/sw.js", "/file.svg", "/globe.svg", "/next.svg", "/vercel.svg", "/window.svg"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (assetPrefixes.some((prefix) => pathname.startsWith(prefix)) || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const session = await verifySessionToken(request.cookies.get(sessionCookieName)?.value);

  if (!session && !publicPaths.includes(pathname) && pathname !== "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && pathname === "/login") {
    return NextResponse.redirect(new URL(session.role === "WARGA" ? "/beranda" : "/admin/dashboard", request.url));
  }

  if (pathname.startsWith(adminPrefix) && session?.role === "WARGA") {
    return NextResponse.redirect(new URL("/beranda", request.url));
  }

  if (!pathname.startsWith(adminPrefix) && pathname !== "/" && session && session.role !== "WARGA" && !publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
