"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  CATEGORIES,
  type Category,
  canSeeFeedback,
  createFeedback,
  db,
  getUserById,
  syncDirectory,
  toggleStar as toggleStarRow,
  upsertSignedIn,
} from "./db";
import { clearFailures, lockedFor, recordFailure } from "./rate-limit";
import { createSession, deleteSession, requireAdmin, requireUser } from "./session";
import { signInWithTeamDesk, TeamDeskUnavailable } from "./teamdesk";

export type FormState = { error?: string; success?: string } | undefined;

const MAX_MESSAGE = 2000;

function text(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

/* ---------------------------- Auth ---------------------------- */

/** The address the request came from, as Caddy saw it. Caddy replaces any client-sent value. */
async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/**
 * Sign in with a TeamDesk email and password.
 *
 * There is no account to create here and no password to reset: TeamDesk decides who someone is
 * and whether they are an admin, and this app keeps the name.
 */
export async function login(_: FormState, form: FormData): Promise<FormState> {
  const email = text(form, "email").toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "email and password, both please" };

  const ip = await clientIp();
  const wait = lockedFor(ip, email);
  if (wait) return { error: `too many tries. breathe, then try again in ${wait} min` };

  let result;
  try {
    result = await signInWithTeamDesk(email, password);
  } catch (err) {
    if (err instanceof TeamDeskUnavailable) {
      return { error: "can't reach TeamDesk right now. try again in a minute" };
    }
    throw err;
  }
  if (!result) {
    recordFailure(ip, email);
    return { error: "that's not your TeamDesk email + password" };
  }

  clearFailures(ip, email);
  if (result.directory) syncDirectory(result.directory);
  const user = upsertSignedIn(result.me);
  await createSession(user.id);
  redirect(user.role === "admin" ? "/admin" : "/inbox");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

/* -------------------------- Feedback -------------------------- */

export async function sendFeedback(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const to = text(form, "recipient");
  const category = text(form, "category") as Category;
  const message = text(form, "message");

  if (!CATEGORIES.includes(category)) return { error: "pick a vibe first" };
  if (message.length < 5) return { error: "write at least a few words" };
  if (message.length > MAX_MESSAGE) return { error: `ok novelist, keep it under ${MAX_MESSAGE} characters` };

  let recipientId: number | null = null;
  if (to !== "everyone") {
    recipientId = Number(to);
    const recipient = Number.isInteger(recipientId) ? getUserById(recipientId) : undefined;
    if (!recipient || !recipient.active) return { error: "who's this for? pick someone" };
    if (recipient.id === user.id) return { error: "you can't spill tea on yourself" };
  }

  createFeedback({ authorId: user.id, recipientId, category, message });
  revalidatePath("/", "layout");
  return { success: "tea spilled" };
}

export async function toggleStar(feedbackId: number) {
  const user = await requireUser();
  if (!Number.isInteger(feedbackId) || !canSeeFeedback(user, feedbackId)) return;
  toggleStarRow(user.id, feedbackId);
  revalidatePath("/", "layout");
}

/* --------------------------- Admin ---------------------------- */

export async function deleteFeedback(form: FormData) {
  await requireAdmin();
  db.prepare("DELETE FROM feedback WHERE id = ?").run(Number(form.get("id")));
  revalidatePath("/", "layout");
}
