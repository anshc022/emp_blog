import { HttpError } from "@/lib/api";

// Simple in-memory sliding-window limiter. Good enough for a single server
// instance; swap for Redis if you ever run more than one.
const globalForRL = globalThis as unknown as { __rateLimits?: Map<string, number[]> };
const hits: Map<string, number[]> = globalForRL.__rateLimits ?? new Map();
globalForRL.__rateLimits = hits;

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    const retryIn = Math.ceil((windowMs - (now - recent[0])) / 1000);
    hits.set(key, recent);
    throw new HttpError(429, `Slow down! You can post ${limit} doubts a minute. Try again in ${retryIn}s.`);
  }
  recent.push(now);
  hits.set(key, recent);
}
