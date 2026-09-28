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
import { MAX_ANSWER, PROMPTS, RATINGS, type GivenAnswer, type GivenRating } from "./questions";
import { clearFailures, lockedFor, recordFailure } from "./rate-limit";
import { createSession, deleteSession, requireAdmin, requireUser } from "./session";
import { signInWithTeamDesk, TeamDeskUnavailable } from "./teamdesk";

export type FormState = { error?: string; success?: string } | undefined;


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

  if (!CATEGORIES.includes(category)) return { error: "pick a vibe first" };

  let recipientId: number | null = null;
  if (to !== "everyone") {
    recipientId = Number(to);
    const recipient = Number.isInteger(recipientId) ? getUserById(recipientId) : undefined;
    if (!recipient || !recipient.active) return { error: "who's this for? pick someone" };
    if (recipient.id === user.id) return { error: "you can't spill tea on yourself" };
  }

  // Only the questions asked of this audience are read; anything else in the form is ignored.
  const audience = recipientId === null ? "company" : "person";
  const ratings: GivenRating[] = [];
  for (const r of RATINGS[audience]) {
    const value = Number(text(form, `rating_${r.id}`));
    if (Number.isInteger(value) && value >= 1 && value <= 5) ratings.push({ id: r.id, label: r.label, value });
  }
  const answers: GivenAnswer[] = [];
  for (const p of PROMPTS[audience]) {
    const answer = text(form, `answer_${p.id}`);
    if (answer.length > MAX_ANSWER) return { error: `keep “${p.label.toLowerCase()}” under ${MAX_ANSWER} characters` };
    if (answer) answers.push({ id: p.id, label: p.label, text: answer });
  }
  if (!answers.some((a) => a.text.length >= 5)) return { error: "answer at least one question in a few words" };

  createFeedback({
    authorId: user.id,
    recipientId,
    category,
    message: answers.map((a) => `${a.label}: ${a.text}`).join("\n\n"),
    ratings,
    answers,
  });
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
