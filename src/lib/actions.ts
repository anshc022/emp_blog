"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CATEGORIES, type Category, db, getUserById, getUserWithHash, createFeedback } from "./db";
import { createSession, deleteSession, requireAdmin, requireUser } from "./session";

export type FormState = { error?: string; success?: string } | undefined;

const MAX_MESSAGE = 2000;

function text(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

/* ---------------------------- Auth ---------------------------- */

export async function login(_: FormState, form: FormData): Promise<FormState> {
  const email = text(form, "email");
  const password = String(form.get("password") ?? "");
  const user = email ? getUserWithHash(email) : undefined;

  if (!user || !user.active || !(await bcrypt.compare(password, user.password_hash))) {
    return { error: "Invalid email or password." };
  }

  await createSession(user.id);
  redirect(user.role === "admin" ? "/admin" : "/inbox");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

export async function changePassword(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const current = String(form.get("current") ?? "");
  const next = String(form.get("next") ?? "");

  const withHash = getUserWithHash(user.email);
  if (!withHash || !(await bcrypt.compare(current, withHash.password_hash))) {
    return { error: "Current password is incorrect." };
  }
  if (next.length < 8) return { error: "New password must be at least 8 characters." };

  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(await bcrypt.hash(next, 10), user.id);
  return { success: "Password updated." };
}

/* -------------------------- Feedback -------------------------- */

export async function sendFeedback(_: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const to = text(form, "recipient");
  const category = text(form, "category") as Category;
  const message = text(form, "message");

  if (!CATEGORIES.includes(category)) return { error: "Pick a category." };
  if (message.length < 5) return { error: "Write at least a few words." };
  if (message.length > MAX_MESSAGE) return { error: `Keep it under ${MAX_MESSAGE} characters.` };

  let recipientId: number | null = null;
  if (to !== "everyone") {
    recipientId = Number(to);
    const recipient = Number.isInteger(recipientId) ? getUserById(recipientId) : undefined;
    if (!recipient || !recipient.active) return { error: "Choose who the feedback is for." };
    if (recipient.id === user.id) return { error: "You can't send feedback to yourself." };
  }

  createFeedback({ authorId: user.id, recipientId, category, message });
  revalidatePath("/", "layout");
  return { success: "Feedback sent anonymously. Thank you!" };
}

/* --------------------------- Admin ---------------------------- */

export async function createEmployee(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const name = text(form, "name");
  const email = text(form, "email").toLowerCase();
  const department = text(form, "department") || null;
  const password = String(form.get("password") ?? "");
  const role = form.get("role") === "admin" ? "admin" : "employee";

  if (!name) return { error: "Name is required." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Enter a valid email." };
  if (password.length < 8) return { error: "Temporary password must be at least 8 characters." };
  if (getUserWithHash(email)) return { error: "An account with that email already exists." };

  db.prepare(
    "INSERT INTO users (name, email, password_hash, role, department) VALUES (?, ?, ?, ?, ?)",
  ).run(name, email, await bcrypt.hash(password, 10), role, department);

  revalidatePath("/admin", "layout");
  return { success: `Added ${name}. Share the temporary password with them privately.` };
}

export async function resetPassword(_: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const id = Number(form.get("id"));
  const password = String(form.get("password") ?? "");
  if (password.length < 8) return { error: "At least 8 characters." };
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(await bcrypt.hash(password, 10), id);
  return { success: "Password reset." };
}

export async function toggleActive(form: FormData) {
  const admin = await requireAdmin();
  const id = Number(form.get("id"));
  if (id === admin.id) return; // never lock yourself out
  db.prepare("UPDATE users SET active = 1 - active WHERE id = ?").run(id);
  revalidatePath("/", "layout");
}

export async function toggleRole(form: FormData) {
  const admin = await requireAdmin();
  const id = Number(form.get("id"));
  if (id === admin.id) return; // keep at least the current admin
  db.prepare(
    "UPDATE users SET role = CASE role WHEN 'admin' THEN 'employee' ELSE 'admin' END WHERE id = ?",
  ).run(id);
  revalidatePath("/", "layout");
}

export async function deleteFeedback(form: FormData) {
  await requireAdmin();
  db.prepare("DELETE FROM feedback WHERE id = ?").run(Number(form.get("id")));
  revalidatePath("/", "layout");
}
