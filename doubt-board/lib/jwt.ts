import jwt from "jsonwebtoken";

// Pure token helpers with no Next.js imports, so they can be used by the custom
// server (Socket.io auth) and middleware as well as route handlers.

export type Role = "student" | "teacher";
export type AuthUser = { id: string; name: string; role: Role };
export type TokenType = "auth" | "socket";
type TokenPayload = { sub: string; name: string; role: Role; typ: TokenType };

export const AUTH_COOKIE = "ldb_token";
export const AUTH_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const SOCKET_TTL_SECONDS = 60 * 5; // only needs to survive the handshake

function secret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("JWT_SECRET is not set. Copy .env.example to .env.local and fill it in.");
  return s;
}

function sign(user: AuthUser, typ: TokenType, expiresIn: number) {
  const payload: TokenPayload = { sub: user.id, name: user.name, role: user.role, typ };
  return jwt.sign(payload, secret(), { expiresIn, algorithm: "HS256" });
}

export const signAuthToken = (user: AuthUser) => sign(user, "auth", AUTH_TTL_SECONDS);
export const signSocketToken = (user: AuthUser) => sign(user, "socket", SOCKET_TTL_SECONDS);

/** Verify a token of the given type. Returns null for anything invalid or expired. */
export function verifyToken(token: string | undefined | null, typ: TokenType = "auth"): AuthUser | null {
  if (!token) return null;
  try {
    const p = jwt.verify(token, secret(), { algorithms: ["HS256"] }) as TokenPayload;
    if (p.typ !== typ || !p.sub || (p.role !== "student" && p.role !== "teacher")) return null;
    return { id: p.sub, name: p.name, role: p.role };
  } catch {
    return null;
  }
}
