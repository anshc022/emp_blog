import "server-only";

/**
 * Slow down password guessing.
 *
 * This form checks TeamDesk passwords, and TeamDesk's own login has no lockout — so without this,
 * a public link to spill. would be an unlimited way to try passwords against every account. Two
 * windows: one per address and email, so a single account cannot be hammered; one per address, so
 * one machine cannot walk through the whole company.
 *
 * In memory, because this runs as one process. A restart forgets the counts, which is fine: it
 * resets the window, it does not open the door.
 */

const WINDOW_MS = 15 * 60 * 1000;
const PER_ACCOUNT = 8;
const PER_ADDRESS = 30;

const failures = new Map<string, number[]>();

function recent(key: string, now: number) {
  const kept = (failures.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (kept.length) failures.set(key, kept);
  else failures.delete(key);
  return kept;
}

/** Minutes until another attempt is allowed, or 0 if one is allowed now. */
export function lockedFor(ip: string, email: string, now = Date.now()) {
  const account = recent(`${ip}|${email}`, now);
  const address = recent(ip, now);
  const blocking = [
    account.length >= PER_ACCOUNT ? account : null,
    address.length >= PER_ADDRESS ? address : null,
  ].filter(Boolean) as number[][];
  if (!blocking.length) return 0;
  const until = Math.max(...blocking.map((times) => times[0] + WINDOW_MS));
  return Math.max(1, Math.ceil((until - now) / 60_000));
}

export function recordFailure(ip: string, email: string, now = Date.now()) {
  for (const key of [`${ip}|${email}`, ip]) failures.set(key, [...recent(key, now), now]);
}

export function clearFailures(ip: string, email: string) {
  failures.delete(`${ip}|${email}`);
}
