// A stand-in for TeamDesk's auth API, for the end-to-end test. It answers the three calls spill.
// makes — /auth/login, /users/directory, /auth/logout — the way TeamDesk does, and records what
// it was asked so the test can check that every session spill. opened was also closed.
import http from "node:http";

const people = new Map([
  ["alice@nextqom.com", { id: "td-alice", name: "Alice Member", password: "pw-alice", role: "MEMBER", active: true }],
  ["boss@nextqom.com", { id: "td-boss", name: "Boss Admin", password: "pw-boss", role: "ADMIN", active: true }],
  ["sam@nextqom.com", { id: "td-sam", name: "Sam Super", password: "pw-sam", role: "SUPER_ADMIN", active: true }],
  ["gone@nextqom.com", { id: "td-gone", name: "Gone Person", password: "pw-gone", role: "MEMBER", active: false }],
  // in TeamDesk, never opens spill. — must still be someone you can write to
  ["carol@nextqom.com", { id: "td-carol", name: "Carol Neverloggedin", password: "pw-carol", role: "MEMBER", active: true }],
]);

const state = { logins: 0, failures: 0, issued: [], revoked: [], directoryCalls: 0, down: false };
let n = 0;

const json = (res, status, body) => {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
};
const readBody = (req) =>
  new Promise((ok) => {
    let d = "";
    req.on("data", (c) => (d += c));
    req.on("end", () => ok(d ? JSON.parse(d) : {}));
  });

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  if (url.pathname === "/__state") return json(res, 200, state);
  if (url.pathname === "/__set" && req.method === "POST") {
    const b = await readBody(req);
    if ("down" in b) state.down = b.down;
    if (b.deactivate) people.get(b.deactivate).active = false;
    return json(res, 200, { ok: true });
  }
  if (state.down) return json(res, 503, { detail: "down" });

  if (url.pathname === "/auth/login" && req.method === "POST") {
    const { email, password } = await readBody(req);
    const p = people.get(String(email).toLowerCase());
    // TeamDesk refuses a deactivated account the same way as a wrong password
    if (!p || p.password !== password || !p.active) {
      state.failures++;
      return json(res, 401, { detail: "Invalid email or password" });
    }
    state.logins++;
    const access = `access-${++n}`, refresh = `refresh-${n}`;
    state.issued.push({ access, refresh, who: p.id });
    return json(res, 200, {
      access_token: access, refresh_token: refresh, token_type: "bearer",
      user: { id: p.id, name: p.name, email, global_role: p.role, is_active: p.active },
    });
  }
  const token = (req.headers.authorization ?? "").replace("Bearer ", "");
  const valid = state.issued.some((t) => t.access === token);
  if (url.pathname === "/users/directory") {
    if (!valid) return json(res, 401, { detail: "Not authenticated" });
    state.directoryCalls++;
    return json(res, 200, [...people.values()].filter((p) => p.active)
      .map((p) => ({ id: p.id, name: p.name, avatar_url: null, global_role: p.role, is_active: true })));
  }
  if (url.pathname === "/auth/logout" && req.method === "POST") {
    if (!valid) return json(res, 401, { detail: "Not authenticated" });
    const { refresh_token } = await readBody(req);
    state.revoked.push(refresh_token);
    return json(res, 200, { detail: "Logged out (1 session(s) revoked)" });
  }
  json(res, 404, { detail: "Not Found" });
});

server.listen(Number(process.env.PORT ?? 4599), "127.0.0.1", () =>
  console.log(`mock TeamDesk on ${server.address().port}`),
);
