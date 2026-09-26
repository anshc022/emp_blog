import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

import { HttpError } from "@/lib/api";
import { AUTH_COOKIE, AUTH_TTL_SECONDS, signAuthToken, verifyToken, type AuthUser, type Role } from "@/lib/jwt";

export { AUTH_COOKIE, signAuthToken, signSocketToken, verifyToken, type AuthUser } from "@/lib/jwt";

/** Read the signed-in user from the request cookie (or the current request in a server component). */
export async function getUser(req?: NextRequest): Promise<AuthUser | null> {
  const token = req ? req.cookies.get(AUTH_COOKIE)?.value : (await cookies()).get(AUTH_COOKIE)?.value;
  return verifyToken(token);
}

/** Require a signed-in user, optionally with one of the given roles. Throws 401/403. */
export async function requireRole(req: NextRequest, ...roles: Role[]): Promise<AuthUser> {
  const user = await getUser(req);
  if (!user) throw new HttpError(401, "Please log in to continue");
  if (roles.length && !roles.includes(user.role)) throw new HttpError(403, "You don't have access to this");
  return user;
}

export function setAuthCookie(res: NextResponse, user: AuthUser) {
  res.cookies.set(AUTH_COOKIE, signAuthToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "true",
    path: "/",
    maxAge: AUTH_TTL_SECONDS,
  });
}

export function clearAuthCookie(res: NextResponse) {
  res.cookies.set(AUTH_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export function toAuthUser(u: { _id: { toString(): string }; name: string; role: Role }): AuthUser {
  return { id: u._id.toString(), name: u.name, role: u.role };
}
