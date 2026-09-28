import "server-only";
import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { getUserByTeamDeskId } from "./db";

/**
 * Requests that come from TeamDesk's admin page, through TeamDesk's app proxy.
 *
 * TeamDesk forwards them with the signed-in person in `x-teamdesk-*` headers and this app's key in
 * the `key` query parameter. The key is what makes the headers believable: anyone can send an
 * `x-teamdesk-role: ADMIN` header to the public site, but only TeamDesk knows the key. Without both
 * a matching key and an admin role, these routes answer as if they did not exist.
 */
export type TeamDeskAdmin = { teamdeskId: string; name: string; localUserId: number };

function sameKey(given: string, expected: string) {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function teamdeskAdmin(request: NextRequest): TeamDeskAdmin | Response {
  const expected = process.env.TEAMDESK_APP_KEY;
  const given = request.nextUrl.searchParams.get("key") ?? "";
  // 404, not 401: a stranger probing the public site learns nothing about what is here.
  if (!expected || !given || !sameKey(given, expected)) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  const role = request.headers.get("x-teamdesk-role");
  const teamdeskId = request.headers.get("x-teamdesk-user");
  if (!teamdeskId || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
    return Response.json({ error: "admins only" }, { status: 403 });
  }
  return {
    teamdeskId,
    name: request.headers.get("x-teamdesk-name") ?? "",
    // an admin who has never opened spill. has no row here, and so has starred nothing
    localUserId: getUserByTeamDeskId(teamdeskId)?.id ?? 0,
  };
}

/** SQLite's datetime('now') is UTC without saying so. */
export const isoUtc = (sqliteTime: string) => `${sqliteTime.replace(" ", "T")}Z`;
