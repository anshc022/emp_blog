// End-to-end test of TeamDesk sign-in and the TeamDesk admin API.
//
// Starts the stand-in TeamDesk and the built app, then drives the real forms over HTTP the way a
// browser without JavaScript would — so the same server actions employees hit are the ones tested.
// Run after `npm run build`:   node scripts/e2e/run.mjs
import { spawn } from "node:child_process";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";

const MOCK = 4599, APP = 4600, KEY = "e2e-app-key";
const base = `http://127.0.0.1:${APP}`, mock = `http://127.0.0.1:${MOCK}`;
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "spill-e2e-"));
const DB = path.join(dir, "feedback.db");
const kids = [];
const start = (cmd, args, env) => {
  const p = spawn(cmd, args, { env: { ...process.env, ...env }, stdio: "ignore" });
  kids.push(p);
  return p;
};
const stop = () => kids.forEach((k) => k.kill());
process.on("exit", stop);

start("node", ["scripts/e2e/mock-teamdesk.mjs"], { PORT: String(MOCK) });
start("npx", ["next", "start", "-p", String(APP), "-H", "127.0.0.1"], {
  TEAMDESK_API_URL: mock, TEAMDESK_APP_KEY: KEY, SESSION_SECRET: "e2e-secret-0123456789",
  DATABASE_PATH: DB, NODE_ENV: "production",
});
for (let i = 0; i < 60; i++) {
  try { if ((await fetch(`${base}/login`)).ok) break; } catch {}
  await new Promise((r) => setTimeout(r, 500));
}

let passed = 0;
const check = async (name, fn) => {
  await fn();
  passed++;
  console.log(`  ✓ ${name}`);
};
const unescape = (s) => s.replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#x27;/g, "'");

/** Submit the form on `page` that has a field named `marker`, as a browser without JS would. */
async function submit(page, marker, fields, cookie = "", ip = "10.0.0.1") {
  const html = await (await fetch(base + page, { headers: { cookie } })).text();
  const forms = html.match(/<form[\s\S]*?<\/form>/g) ?? [];
  const form = forms.find((f) => f.includes(`name="${marker}"`));
  assert.ok(form, `no form with "${marker}" on ${page}`);
  const body = new FormData();
  for (const [, name, value = ""] of form.matchAll(/<input type="hidden" name="([^"]+)"(?: value="([^"]*)")?/g)) {
    body.append(name, unescape(value));
  }
  for (const [k, v] of Object.entries(fields)) body.set(k, v);
  const res = await fetch(base + page, {
    method: "POST", body, redirect: "manual", headers: { cookie, "x-forwarded-for": ip },
  });
  return { res, text: await res.text(), cookie: res.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ") };
}
const login = (email, password, ip) => submit("/login", "email", { email, password }, "", ip);
const page = async (p, cookie) => {
  const res = await fetch(base + p, { headers: { cookie }, redirect: "manual" });
  return { res, text: await res.text() };
};
const api = (p, { method = "GET", key = KEY, role = "ADMIN", user = "td-boss" } = {}) =>
  fetch(`${base}${p}${key ? `${p.includes("?") ? "&" : "?"}key=${key}` : ""}`, {
    method,
    headers: { ...(role ? { "x-teamdesk-role": role } : {}), ...(user ? { "x-teamdesk-user": user } : {}) },
  });
const state = async () => (await fetch(`${mock}/__state`)).json();
const setMock = (b) => fetch(`${mock}/__set`, { method: "POST", body: JSON.stringify(b) });
const db = () => new Database(DB, { readonly: true });

console.log("sign-in");
await check("a wrong TeamDesk password is refused and opens no session", async () => {
  const r = await login("alice@nextqom.com", "nope");
  assert.match(r.text, /not your TeamDesk email/);
  assert.ok(!r.cookie.includes("session="));
});
await check("a deactivated TeamDesk account cannot sign in", async () => {
  const r = await login("gone@nextqom.com", "pw-gone");
  assert.match(r.text, /not your TeamDesk email/);
});
await check("TeamDesk being down says so, instead of blaming the password", async () => {
  await setMock({ down: true });
  const r = await login("alice@nextqom.com", "pw-alice");
  await setMock({ down: false });
  assert.match(r.text, /can&#x27;t reach TeamDesk|can't reach TeamDesk/);
});

let alice, boss, carol;
await check("a member signs in with TeamDesk credentials and lands on the inbox", async () => {
  const r = await login("alice@nextqom.com", "pw-alice");
  assert.equal(r.res.status, 303);
  assert.equal(r.res.headers.get("location"), "/inbox");
  assert.ok(r.cookie.includes("session="));
  alice = r.cookie;
});
await check("the TeamDesk session opened to check the password is revoked straight away", async () => {
  const s = await state();
  assert.equal(s.issued.length, 1);
  assert.deepEqual(s.revoked, [s.issued[0].refresh]);
});
await check("colleagues come from TeamDesk — including people who never opened spill.", async () => {
  const { text } = await page("/give", alice);
  assert.match(text, /Carol Neverloggedin/);
  assert.match(text, /Boss Admin/);
  const row = db().prepare("SELECT role, email FROM users WHERE teamdesk_id = 'td-alice'").get();
  assert.deepEqual(row, { role: "employee", email: "alice@nextqom.com" });
});

console.log("feedback and anonymity");
const carolId = db().prepare("SELECT id FROM users WHERE teamdesk_id = 'td-carol'").get().id;
await check("a member can send feedback to someone who has never signed in", async () => {
  const r = await submit("/give", "message", { recipient: String(carolId), category: "Appreciation", message: "loved the release notes, carol" }, alice);
  assert.doesNotMatch(r.text, /pick someone|pick a vibe/);
  const r2 = await submit("/give", "message", { recipient: "everyone", category: "Suggestion", message: "friday demos should be shorter" }, alice);
  assert.doesNotMatch(r2.text, /pick someone|pick a vibe/);
  assert.equal(db().prepare("SELECT COUNT(*) c FROM feedback").get().c, 2);
});
await check("the recipient reads it without ever being told who wrote it", async () => {
  carol = (await login("carol@nextqom.com", "pw-carol")).cookie;
  const { text } = await page("/inbox", carol);
  assert.match(text, /loved the release notes, carol/);
  assert.doesNotMatch(text, /Alice/); // not in the markup, not in the RSC payload, nowhere
  assert.doesNotMatch(text, /td-alice|alice@nextqom/);
});
await check("a TeamDesk admin signs in and sees who wrote each note", async () => {
  const r = await login("boss@nextqom.com", "pw-boss");
  assert.equal(r.res.headers.get("location"), "/admin");
  boss = r.cookie;
  const { text } = await page("/admin", boss);
  assert.match(text, /Alice Member/);
});
await check("TeamDesk SUPER_ADMIN counts as an admin here too", async () => {
  const r = await login("sam@nextqom.com", "pw-sam");
  assert.equal(r.res.headers.get("location"), "/admin");
});
await check("a member cannot open the admin page", async () => {
  const { res } = await page("/admin", alice);
  assert.equal(res.status, 307);
  assert.match(res.headers.get("location"), /\/inbox/);
});

console.log("the admin API TeamDesk calls");
await check("without TeamDesk's key the API does not exist — even with forged admin headers", async () => {
  assert.equal((await api("/api/teamdesk/feedback", { key: null })).status, 404);
  assert.equal((await api("/api/teamdesk/feedback", { key: "wrong-key" })).status, 404);
});
await check("with the key, a non-admin TeamDesk role is refused", async () => {
  assert.equal((await api("/api/teamdesk/feedback", { role: "MEMBER" })).status, 403);
  assert.equal((await api("/api/teamdesk/feedback", { user: null })).status, 403);
});
let listed;
await check("with the key and an admin role, it returns every note with its author", async () => {
  const res = await api("/api/teamdesk/feedback?sort=new");
  assert.equal(res.status, 200);
  listed = await res.json();
  assert.equal(listed.stats.total, 2);
  assert.equal(listed.feedback.length, 2);
  const toCarol = listed.feedback.find((f) => f.recipient_name === "Carol Neverloggedin");
  assert.equal(toCarol.author_name, "Alice Member");
  assert.ok(listed.feedback.some((f) => f.recipient_name === null), "a note to everyone");
  assert.match(toCarol.created_at, /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/);
  assert.ok(listed.people.some((p) => p.name === "Carol Neverloggedin"));
});
await check("filters narrow the list", async () => {
  const onlyEveryone = await (await api("/api/teamdesk/feedback?recipient=everyone")).json();
  assert.equal(onlyEveryone.feedback.length, 1);
  assert.equal(onlyEveryone.feedback[0].recipient_name, null);
});
await check("an admin can delete a note, and deleting it twice says it is gone", async () => {
  const id = listed.feedback[0].id;
  assert.equal((await api(`/api/teamdesk/feedback/${id}`, { method: "DELETE" })).status, 200);
  assert.equal((await api(`/api/teamdesk/feedback/${id}`, { method: "DELETE" })).status, 404);
  assert.equal((await api(`/api/teamdesk/feedback/${id}`, { method: "DELETE", key: null })).status, 404);
  assert.equal(db().prepare("SELECT COUNT(*) c FROM feedback").get().c, 1);
});

console.log("TeamDesk stays in charge");
await check("someone deactivated in TeamDesk loses their session at the next sync", async () => {
  await setMock({ deactivate: "alice@nextqom.com" });
  await login("boss@nextqom.com", "pw-boss"); // any sign-in refreshes the colleague list
  const { res } = await page("/inbox", alice);
  assert.equal(res.status, 307);
  assert.match(res.headers.get("location"), /\/login/);
});
await check("every TeamDesk session spill. opened was closed again", async () => {
  const s = await state();
  assert.equal(s.revoked.length, s.issued.length);
  assert.ok(s.issued.length >= 5);
});
await check("password guessing is slowed: the ninth wrong try on one account is refused", async () => {
  for (let i = 0; i < 8; i++) await login("boss@nextqom.com", `guess-${i}`, "10.9.9.9");
  const before = (await state()).failures;
  const r = await login("boss@nextqom.com", "pw-boss", "10.9.9.9");
  assert.match(r.text, /too many tries/);
  assert.equal((await state()).failures, before, "the locked attempt never reached TeamDesk");
  const other = await login("boss@nextqom.com", "pw-boss", "10.1.1.1");
  assert.equal(other.res.status, 303, "a different address is not locked out");
});

console.log(`\n${passed} checks passed`);
stop();
fs.rmSync(dir, { recursive: true, force: true });
process.exit(0);
