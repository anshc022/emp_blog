import { NextResponse, type NextRequest } from "next/server";

import { AUTH_COOKIE, verifyToken } from "@/lib/jwt";

const homeFor = (role: "student" | "teacher") => (role === "teacher" ? "/teacher" : "/join");

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const user = verifyToken(req.cookies.get(AUTH_COOKIE)?.value);

  // Signed-in users don't need the auth pages.
  if (pathname === "/login" || pathname === "/register") {
    return user ? NextResponse.redirect(new URL(homeFor(user.role), req.url)) : NextResponse.next();
  }

  const needs: "student" | "teacher" | null = pathname.startsWith("/teacher")
    ? "teacher"
    : pathname.startsWith("/join") || pathname.startsWith("/session")
      ? "student"
      : null;
  if (!needs) return NextResponse.next();

  if (!user) {
    const login = new URL("/login", req.url);
    login.searchParams.set("next", pathname + search);
    return NextResponse.redirect(login);
  }
  if (user.role !== needs) return NextResponse.redirect(new URL(homeFor(user.role), req.url));
  return NextResponse.next();
}

export const config = {
  // Node runtime so we can verify the JWT with `jsonwebtoken` (stable since Next 15.5).
  runtime: "nodejs",
  matcher: ["/teacher/:path*", "/join/:path*", "/session/:path*", "/login", "/register"],
};
