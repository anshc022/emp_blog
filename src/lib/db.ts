import "server-only";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";

export type Role = "admin" | "employee";

export type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  department: string | null;
  active: number;
  created_at: string;
};

export const CATEGORIES = [
  "Appreciation",
  "Suggestion",
  "Concern",
  "Other",
] as const;
export type Category = (typeof CATEGORIES)[number];

const dbPath = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "feedback.db");

function open() {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT NOT NULL,
      email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      role          TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'employee')),
      department    TEXT,
      active        INTEGER NOT NULL DEFAULT 1,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- recipient_id NULL means the feedback is addressed to everyone.
    CREATE TABLE IF NOT EXISTS feedback (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      author_id    INTEGER NOT NULL REFERENCES users(id),
      recipient_id INTEGER REFERENCES users(id),
      category     TEXT NOT NULL,
      message      TEXT NOT NULL,
      created_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS stars (
      user_id     INTEGER NOT NULL REFERENCES users(id),
      feedback_id INTEGER NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, feedback_id)
    );

    CREATE INDEX IF NOT EXISTS feedback_recipient ON feedback(recipient_id);
    CREATE INDEX IF NOT EXISTS feedback_author ON feedback(author_id);
  `);

  // Bootstrap the first super admin so a fresh install can log in.
  // OR IGNORE: several build workers may open a fresh database at once.
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM users").get() as { count: number };
  if (count === 0) {
    const email = process.env.ADMIN_EMAIL ?? "admin@company.com";
    const password = process.env.ADMIN_PASSWORD ?? "admin1234";
    db.prepare(
      "INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')",
    ).run("Super Admin", email, bcrypt.hashSync(password, 10));
  }

  return db;
}

const globalForDb = globalThis as unknown as { db?: Database.Database };
export const db = globalForDb.db ?? open();
if (process.env.NODE_ENV !== "production") globalForDb.db = db;

const USER_COLUMNS = "id, name, email, role, department, active, created_at";

export function getUserById(id: number) {
  return db.prepare(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`).get(id) as User | undefined;
}

export function getUserWithHash(email: string) {
  return db.prepare(`SELECT ${USER_COLUMNS}, password_hash FROM users WHERE email = ?`).get(email) as
    | (User & { password_hash: string })
    | undefined;
}

export function listUsers() {
  return db.prepare(`SELECT ${USER_COLUMNS} FROM users ORDER BY active DESC, name`).all() as User[];
}

export function listActiveColleagues(excludeId: number) {
  return db
    .prepare(`SELECT ${USER_COLUMNS} FROM users WHERE active = 1 AND id != ? ORDER BY name`)
    .all(excludeId) as User[];
}

/* ------------------------------------------------------------------ */
/* Feedback                                                            */
/*                                                                     */
/* Employee-facing queries never select author_id or join the author,  */
/* so the writer's identity cannot leak to a recipient. Only the admin */
/* queries below expose who wrote what.                                */
/* ------------------------------------------------------------------ */

export type AnonymousFeedback = {
  id: number;
  category: Category;
  message: string;
  created_at: string;
  to_everyone: number;
  star_count: number;
  starred: number;
};

export type SentFeedback = {
  id: number;
  category: Category;
  message: string;
  created_at: string;
  recipient_name: string | null;
  star_count: number;
};

export type AdminFeedback = SentFeedback & {
  starred: number;
  author_id: number;
  author_name: string;
  author_email: string;
  recipient_id: number | null;
};

export function createFeedback(input: {
  authorId: number;
  recipientId: number | null;
  category: Category;
  message: string;
}) {
  db.prepare(
    "INSERT INTO feedback (author_id, recipient_id, category, message) VALUES (?, ?, ?, ?)",
  ).run(input.authorId, input.recipientId, input.category, input.message);
}

export type InboxView = "all" | "mine" | "company";
export type InboxSort = "new" | "top";

const STAR_COUNT = "(SELECT COUNT(*) FROM stars s WHERE s.feedback_id = f.id)";
const STARRED_BY = "EXISTS (SELECT 1 FROM stars s WHERE s.feedback_id = f.id AND s.user_id = ?)";

/** Feedback addressed to this user or to everyone, excluding what they wrote themselves. */
export function listInbox(userId: number, view: InboxView = "all", sort: InboxSort = "new") {
  const scope = {
    all: "(f.recipient_id = @user OR f.recipient_id IS NULL)",
    mine: "f.recipient_id = @user",
    company: "f.recipient_id IS NULL",
  }[view];
  const order = sort === "top" ? "star_count DESC, f.created_at DESC" : "f.created_at DESC, f.id DESC";
  return db
    .prepare(
      `SELECT f.id, f.category, f.message, f.created_at, (f.recipient_id IS NULL) AS to_everyone,
              ${STAR_COUNT} AS star_count,
              EXISTS (SELECT 1 FROM stars s WHERE s.feedback_id = f.id AND s.user_id = @user) AS starred
         FROM feedback f
        WHERE ${scope} AND f.author_id != @user
        ORDER BY ${order}`,
    )
    .all({ user: userId }) as AnonymousFeedback[];
}

export function countInbox(userId: number) {
  return db
    .prepare(
      `SELECT
         SUM(recipient_id = ?)          AS mine,
         SUM(recipient_id IS NULL)      AS company,
         SUM(created_at >= datetime('now', '-7 days')) AS recent
         FROM feedback
        WHERE (recipient_id = ? OR recipient_id IS NULL) AND author_id != ?`,
    )
    .get(userId, userId, userId) as { mine: number | null; company: number | null; recent: number | null };
}

/** Whether a user may see (and therefore star) a piece of feedback. */
export function canSeeFeedback(user: User, feedbackId: number) {
  if (user.role === "admin") return true;
  const row = db
    .prepare("SELECT 1 FROM feedback WHERE id = ? AND (recipient_id = ? OR recipient_id IS NULL OR author_id = ?)")
    .get(feedbackId, user.id, user.id);
  return Boolean(row);
}

export function toggleStar(userId: number, feedbackId: number) {
  const removed = db.prepare("DELETE FROM stars WHERE user_id = ? AND feedback_id = ?").run(userId, feedbackId);
  if (removed.changes === 0) {
    db.prepare("INSERT INTO stars (user_id, feedback_id) VALUES (?, ?)").run(userId, feedbackId);
  }
}

export function listSent(userId: number) {
  return db
    .prepare(
      `SELECT f.id, f.category, f.message, f.created_at, r.name AS recipient_name,
              ${STAR_COUNT} AS star_count
         FROM feedback f
         LEFT JOIN users r ON r.id = f.recipient_id
        WHERE f.author_id = ?
        ORDER BY f.created_at DESC, f.id DESC`,
    )
    .all(userId) as SentFeedback[];
}

export function listAllFeedback(
  adminId: number,
  filter: { authorId?: number; recipientId?: number | "everyone"; sort?: InboxSort } = {},
) {
  const where: string[] = [];
  const params: (number | string)[] = [adminId];
  if (filter.authorId) {
    where.push("f.author_id = ?");
    params.push(filter.authorId);
  }
  if (filter.recipientId === "everyone") {
    where.push("f.recipient_id IS NULL");
  } else if (filter.recipientId) {
    where.push("f.recipient_id = ?");
    params.push(filter.recipientId);
  }
  return db
    .prepare(
      `SELECT f.id, f.category, f.message, f.created_at, f.author_id, f.recipient_id,
              a.name AS author_name, a.email AS author_email, r.name AS recipient_name,
              ${STAR_COUNT} AS star_count, ${STARRED_BY} AS starred
         FROM feedback f
         JOIN users a ON a.id = f.author_id
         LEFT JOIN users r ON r.id = f.recipient_id
        ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
        ORDER BY ${filter.sort === "top" ? "star_count DESC, f.created_at DESC" : "f.created_at DESC, f.id DESC"}`,
    )
    .all(...params) as AdminFeedback[];
}

export function getStats() {
  return db
    .prepare(
      `SELECT
         (SELECT COUNT(*) FROM users WHERE active = 1)                 AS employees,
         (SELECT COUNT(*) FROM feedback)                               AS total,
         (SELECT COUNT(*) FROM feedback WHERE recipient_id IS NULL)    AS to_everyone,
         (SELECT COUNT(*) FROM feedback WHERE created_at >= datetime('now', '-7 days')) AS this_week,
         (SELECT COUNT(*) FROM stars)                                  AS stars`,
    )
    .get() as { employees: number; total: number; to_everyone: number; this_week: number; stars: number };
}
