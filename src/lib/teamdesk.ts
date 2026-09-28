import "server-only";

/**
 * TeamDesk is the only place accounts live.
 *
 * spill. used to keep its own users and passwords, which meant a second set of credentials for
 * every employee and a second place to remember to remove someone who left. Now it asks TeamDesk:
 * the person signs in with the email and password they already use there, TeamDesk says who they
 * are and whether they are an admin, and spill. keeps only a copy of the name it needs to address
 * feedback.
 *
 * The TeamDesk session that sign-in creates is revoked immediately. spill. never acts as the person
 * against TeamDesk — it asks once who they are, reads the colleague list, and lets go.
 */

export type TeamDeskRole = "SUPER_ADMIN" | "ADMIN" | "TEAM_LEADER" | "MEMBER" | string;

export type TeamDeskPerson = {
  id: string;
  name: string;
  global_role: TeamDeskRole;
  is_active: boolean;
};

export type TeamDeskMe = TeamDeskPerson & { email: string };

type LoginResponse = {
  access_token: string;
  refresh_token: string;
  user: TeamDeskMe;
};

export class TeamDeskUnavailable extends Error {}

const TIMEOUT_MS = 10_000;

function baseUrl() {
  const url = process.env.TEAMDESK_API_URL;
  if (!url) throw new TeamDeskUnavailable("TEAMDESK_API_URL is not set");
  return url.replace(/\/+$/, "");
}

async function call(path: string, init: RequestInit & { token?: string } = {}) {
  const { token, headers, ...rest } = init;
  try {
    return await fetch(`${baseUrl()}${path}`, {
      ...rest,
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (err) {
    throw new TeamDeskUnavailable(err instanceof Error ? err.message : String(err));
  }
}

/** Whether a TeamDesk role may see who wrote each note. */
export function isAdminRole(role: TeamDeskRole) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

/**
 * Check an email and password against TeamDesk.
 *
 * Returns the person and the colleague list, or null when TeamDesk says no. Throws
 * `TeamDeskUnavailable` when TeamDesk could not be asked at all, so the form can tell "wrong
 * password" apart from "try again in a minute".
 */
export async function signInWithTeamDesk(
  email: string,
  password: string,
): Promise<{ me: TeamDeskMe; directory: TeamDeskPerson[] | null } | null> {
  const res = await call("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
  if (res.status >= 500) throw new TeamDeskUnavailable(`TeamDesk answered ${res.status}`);
  if (!res.ok) return null;

  const body = (await res.json()) as LoginResponse;
  if (!body.user?.is_active) return null;

  // The colleague list is a nicety — sign-in must not fail because it could not be read.
  let directory: TeamDeskPerson[] | null = null;
  try {
    const dir = await call("/users/directory", { token: body.access_token });
    if (dir.ok) directory = (await dir.json()) as TeamDeskPerson[];
  } catch {
    directory = null;
  }

  // Let go of the session straight away. Best effort: an unrevoked refresh token still expires on
  // its own, and failing here would lock someone out over housekeeping.
  try {
    await call("/auth/logout", {
      method: "POST",
      token: body.access_token,
      body: JSON.stringify({ refresh_token: body.refresh_token }),
    });
  } catch {
    /* expires by itself */
  }

  return { me: body.user, directory };
}
