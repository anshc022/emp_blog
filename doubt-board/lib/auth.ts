import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

import { HttpError } from "@/lib/api";
import type { Role } from "@/models/User";

export const AUTH_COOKIE = "ldb_token";
const AUTH_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const SOCKET_TTL_SECONDS = 60 * 5; // only needs to survive the handshake

export type AuthUser = { id: string; name: string; role: Role };
type TokenPayload = { sub: string; name: string; role: Role; typ: "auth" | "socket" };

function secret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET is not set. Copy .env.example to .env.local and fill it in.");
  return s;
}

function sign(user: AuthUser, typ: TokenPayload["typ"], expiresIn: number) {
  const payload: TokenPayload = { sub: user.id, name: user.name, role: user.role, typ };
  return jwt.sign(payload, secret(), { expiresIn, algorithm: "HS256" });
}

export const signAuthToken = (user: AuthUser) => sign(user, "auth", AUTH_TTL_SECONDS);
export const signSocketToken = (user: AuthUser) => sign(user, "socket", SOCKET_TTL_SECONDS);

/** Verify a token of the given type. Returns null for anything invalid or expired. */
export function verifyToken(token: string | undefined | null, typ: TokenPayload["typ"] = "auth"): AuthUser | null {
  if (!token) return null;
  try {
    const p = jwt.verify(token, secret(), { algorithms: ["HS256"] }) as TokenPayload;
    if (p.typ !== typ || !p.sub || (p.role !== "student" && p.role !== "teacher")) return null;
    return { id: p.sub, name: p.name, role: p.role };
  } catch {
    return null;
  }
}

/** Read the signed-in user from the request cookie (or the current request in a route handler). */
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
