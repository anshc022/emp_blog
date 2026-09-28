import "server-only";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import type { GivenAnswer, GivenRating } from "./questions";

export type Role = "admin" | "employee";

export type User = {
  id: number;
  /** The person's id in TeamDesk, which owns the account. */
  teamdesk_id: string;
  name: string;
  /** Known once they have signed in here; the colleague list TeamDesk shares carries no emails. */
  email: string | null;
  role: Role;
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
    -- Accounts live in TeamDesk. This is a copy of who exists, so feedback can be addressed and
    -- read back; there is no password here to leak or to forget to change.
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      teamdesk_id   TEXT NOT NULL UNIQUE,
      name          TEXT NOT NULL,
      email         TEXT UNIQUE COLLATE NOCASE,
      role          TEXT NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'employee')),
      active        INTEGER NOT NULL DEFAULT 1,
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      last_login_at TEXT
    );

    -- recipient_id NULL means the feedback is addressed to everyone.
    CREATE TABLE IF NOT EXISTS feedback (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      author_id    INTEGER NOT NULL REFERENCES users(id),
      recipient_id INTEGER REFERENCES users(id),
      category     TEXT NOT NULL,
      -- Every answer as plain text, so anything that reads only this column still has the note.
      message      TEXT NOT NULL,
      created_at   TEXT NOT NULL DEFAULT (datetime('now')),
      -- JSON arrays of GivenRating and GivenAnswer (src/lib/questions.ts). NULL on notes written
      -- before the composer asked questions: those are just the message.
      ratings      TEXT,
      answers      TEXT
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

  // A database made before sign-in moved to TeamDesk has local passwords and no TeamDesk ids.
  // Refuse it loudly rather than half-work: nobody could sign in, and the old accounts would sit
  // there with password hashes nobody meant to keep.
  const columns = db.prepare("PRAGMA table_info(users)").all() as { name: string }[];
  if (!columns.some((c) => c.name === "teamdesk_id")) {
    throw new Error(
      `${dbPath} predates TeamDesk sign-in. Point DATABASE_PATH at a fresh file, or migrate it.`,
    );
  }

  // Notes from before the composer asked questions have no ratings or answers columns.
  const feedbackColumns = new Set(
    (db.prepare("PRAGMA table_info(feedback)").all() as { name: string }[]).map((c) => c.name),
  );
  for (const column of ["ratings", "answers"]) {
    if (!feedbackColumns.has(column)) db.exec(`ALTER TABLE feedback ADD COLUMN ${column} TEXT`);
  }

  return db;
}

const globalForDb = globalThis as unknown as { db?: Database.Database };

/**
 * The database, opened on first use rather than on import.
 *
 * `next build` imports every route in several workers at once to collect page data. When importing
 * opened the database, those workers raced to create the same fresh file and switch it to WAL, and
 * one of them lost with SQLITE_BUSY — failing the build, but only sometimes, and only when the file
 * did not exist yet. A build has no business creating a database anyway. Now nothing opens it until
 * a request actually reads or writes, which happens in one server process.
 *
 * Cached on globalThis so dev-mode reloads reuse one connection instead of leaking them.
 */
function instance() {
  globalForDb.db ??= open();
  return globalForDb.db;
}

export const db: Database.Database = new Proxy({} as Database.Database, {
  get(_, prop) {
    const real = instance();
    const value = Reflect.get(real, prop, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
});

const USER_COLUMNS = "id, teamdesk_id, name, email, role, active, created_at";

export function getUserById(id: number) {
  return db.prepare(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`).get(id) as User | undefined;
}

const toRole = (teamdeskRole: string): Role =>
  teamdeskRole === "ADMIN" || teamdeskRole === "SUPER_ADMIN" ? "admin" : "employee";

/**
 * Record the person who just signed in, as TeamDesk describes them.
 *
 * Name, email and role come from TeamDesk every time, so a promotion, a rename or a new email
 * there is true here at the next sign-in without anyone touching this app.
 */
export function upsertSignedIn(person: { id: string; name: string; email: string; global_role: string }) {
  db.prepare(
    `INSERT INTO users (teamdesk_id, name, email, role, active, last_login_at)
     VALUES (@id, @name, @email, @role, 1, datetime('now'))
     ON CONFLICT (teamdesk_id) DO UPDATE SET
       name = excluded.name, email = excluded.email, role = excluded.role,
       active = 1, last_login_at = excluded.last_login_at`,
  ).run({ id: person.id, name: person.name, email: person.email.toLowerCase(), role: toRole(person.global_role) });
  return db.prepare(`SELECT ${USER_COLUMNS} FROM users WHERE teamdesk_id = ?`).get(person.id) as User;
}

/**
 * Bring the colleague list in line with TeamDesk's.
 *
 * Everyone TeamDesk lists as active can be written to — including people who have never opened
 * this app, which is the point: feedback should not wait for its recipient to sign up. Anyone
 * missing from the list has left or been deactivated there, so they are deactivated here too,
 * which also ends any session they still hold. Their past feedback stays, and so do their stars.
 */
export function syncDirectory(people: { id: string; name: string; global_role: string; is_active: boolean }[]) {
  const active = people.filter((p) => p.is_active);
  if (active.length === 0) return; // an empty answer is a fault, not a company with nobody in it
  const upsert = db.prepare(
    `INSERT INTO users (teamdesk_id, name, role, active) VALUES (@id, @name, @role, 1)
     ON CONFLICT (teamdesk_id) DO UPDATE SET name = excluded.name, role = excluded.role, active = 1`,
  );
  const ids = active.map((p) => p.id);
  db.transaction(() => {
    for (const p of active) upsert.run({ id: p.id, name: p.name, role: toRole(p.global_role) });
    db.prepare(
      `UPDATE users SET active = 0 WHERE teamdesk_id NOT IN (${ids.map(() => "?").join(",")})`,
    ).run(...ids);
  })();
}

export function getUserByTeamDeskId(teamdeskId: string) {
  return db.prepare(`SELECT ${USER_COLUMNS} FROM users WHERE teamdesk_id = ?`).get(teamdeskId) as
    | User
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

/** What every reader gets of a note's content. */
type NoteBody = {
  id: number;
  category: Category;
  message: string;
  created_at: string;
  ratings: GivenRating[];
  answers: GivenAnswer[];
};

export type AnonymousFeedback = NoteBody & {
  to_everyone: number;
  star_count: number;
  starred: number;
};

export type SentFeedback = NoteBody & {
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
  ratings: GivenRating[];
  answers: GivenAnswer[];
}) {
  db.prepare(
    `INSERT INTO feedback (author_id, recipient_id, category, message, ratings, answers)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(
    input.authorId,
    input.recipientId,
    input.category,
    input.message,
    input.ratings.length ? JSON.stringify(input.ratings) : null,
    input.answers.length ? JSON.stringify(input.answers) : null,
  );
}

const NOTE_COLUMNS = "f.id, f.category, f.message, f.created_at, f.ratings, f.answers";

type Stored<T> = Omit<T, "ratings" | "answers"> & { ratings: string | null; answers: string | null };

function list<T>(raw: string | null): T[] {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

/** Unpack the JSON columns of a note row. */
function parsed<T extends NoteBody>(row: Stored<T>): T {
  return { ...row, ratings: list<GivenRating>(row.ratings), answers: list<GivenAnswer>(row.answers) } as T;
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
      `SELECT ${NOTE_COLUMNS}, (f.recipient_id IS NULL) AS to_everyone,
              ${STAR_COUNT} AS star_count,
              EXISTS (SELECT 1 FROM stars s WHERE s.feedback_id = f.id AND s.user_id = @user) AS starred
         FROM feedback f
        WHERE ${scope} AND f.author_id != @user
        ORDER BY ${order}`,
    )
    .all({ user: userId })
    .map((row) => parsed(row as Stored<AnonymousFeedback>));
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
      `SELECT ${NOTE_COLUMNS}, r.name AS recipient_name,
              ${STAR_COUNT} AS star_count
         FROM feedback f
         LEFT JOIN users r ON r.id = f.recipient_id
        WHERE f.author_id = ?
        ORDER BY f.created_at DESC, f.id DESC`,
    )
    .all(userId)
    .map((row) => parsed(row as Stored<SentFeedback>));
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
      `SELECT ${NOTE_COLUMNS}, f.author_id, f.recipient_id,
              a.name AS author_name, a.email AS author_email, r.name AS recipient_name,
              ${STAR_COUNT} AS star_count, ${STARRED_BY} AS starred
         FROM feedback f
         JOIN users a ON a.id = f.author_id
         LEFT JOIN users r ON r.id = f.recipient_id
        ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
        ORDER BY ${filter.sort === "top" ? "star_count DESC, f.created_at DESC" : "f.created_at DESC, f.id DESC"}`,
    )
    .all(...params)
    .map((row) => parsed(row as Stored<AdminFeedback>));
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
