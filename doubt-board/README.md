# Live Doubt Board

A real-time classroom doubt board. A teacher starts a session and shares a 6-digit code. Students join from their phones, post doubts (anonymous by default) and upvote each other's. The teacher sees a live, ranked list and marks doubts as answered. An analytics page shows which topics confuse the class most and when doubts come in.

**Stack:** Next.js 15 (App Router, TypeScript) · MongoDB + Mongoose · Socket.io on a custom Node server · JWT in an httpOnly cookie (`jsonwebtoken`, `bcryptjs`) · `zod` · Tailwind CSS 4 + shadcn/ui · `framer-motion` · `sonner` · `next-themes` · `recharts` · TanStack Query

## Features

**Students**
- Join with a 6-digit code (one box per digit; pasting the whole code works)
- Ask a doubt with a topic (preset chips or a custom one), anonymous by default
- While you type (debounced 400 ms), see "Similar doubts already asked" and upvote one of those instead
- Upvote with an animated count. Your own doubts are tagged **You**, and the list re-orders smoothly as votes change
- Open / Answered tabs. When the session ends, a banner appears and the board becomes read-only

**Teachers**
- Session list with stats, plus a "New session" page that shows the join code large enough for a projector
- Live ranked board with a live student count, **Mark answered** (with an optional written answer), delete, and **End session**
- **Present mode**: the top 5 open doubts full-screen in large text (Esc to exit)
- Analytics: top 5 confusing topics (last 7 days), answered vs open, doubts by hour of day, and a per-session table

**Everywhere**: light/dark mode, responsive from phone to projector, loading skeletons, empty states and error toasts.

## Prerequisites

- **Node.js 20+** (tested on Node 22)
- **MongoDB 6+**: a local `mongod`, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

## Setup

```bash
cd doubt-board
npm install
cp .env.example .env.local
```

Edit `.env.local`:

| Variable | Description |
| --- | --- |
| `MONGODB_URI` | e.g. `mongodb://127.0.0.1:27017/doubt-board`, or your Atlas connection string |
| `JWT_SECRET` | A long random string, e.g. `openssl rand -base64 48` |
| `PORT` | Port for the app and Socket.io (default `3000`) |

## Run

```bash
npm run seed     # optional: fill the DB with demo data (wipes users/sessions/doubts first!)
npm run dev      # Next.js + Socket.io on http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts `server.ts` with `tsx`: Next.js dev server and Socket.io on one port |
| `npm run build` | Production build (`next build`) |
| `npm start` | Runs `server.ts` in production mode (run `npm run build` first) |
| `npm run seed` | Resets the database and fills it with demo data |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |

### Demo logins (after `npm run seed`)

Every account uses the password **`password123`**.

| Role | Email |
| --- | --- |
| Teacher | `teacher@demo.edu` |
| Students | `student@demo.edu`, `student2@demo.edu` … `student8@demo.edu` |

The seed creates five past sessions spread over the last week, so analytics has data, plus one **live session with join code `123456`**.

**Try it live:** open two browser windows (one normal, one private). Log in as the teacher in one and as a student in the other. The student joins with `123456`. New doubts, upvotes, answers and "session ended" show up in both windows instantly.

## How it works

```
server.ts                 custom Node server: Next.js request handler + Socket.io on the same HTTP server
middleware.ts             role-based page protection (Node runtime; verifies the JWT cookie)
app/
  (auth)/login, register  auth pages with Student / Teacher picker
  join/                   student: 6-digit code entry
  session/[id]/           student: live feed
  teacher/                teacher: session list, new, live board (+ present mode), analytics
  api/**/route.ts         REST route handlers
components/               UI (shadcn/ui primitives live in components/ui)
hooks/                    useSocket, useSessionDoubts, useTime
lib/                      db (cached connection), auth/jwt, socket (shared io), serialize, validators, analytics…
models/                   User, Session, Doubt (Mongoose)
scripts/seed.ts           demo data
```

- **Why a custom server?** Next.js route handlers can't hold WebSocket connections. `server.ts` creates one HTTP server that serves Next.js and Socket.io together. It stores the `io` instance on `globalThis`, and route handlers get it back with `getIO()` (`lib/socket.ts`) to emit events after each DB write.
- **Socket auth:** the auth cookie is httpOnly, so the client first calls `GET /api/auth/socket-token` for a 5-minute token and sends it as `socket.handshake.auth.token`. The server rejects invalid tokens. The client fetches a fresh token on every reconnect, re-joins its room, and refetches the doubt list in case it missed events.
- **Rooms:** `session:<id>`. Client → server: `session:join`, `session:leave`. Server → room: `doubt:created`, `doubt:upvoted {doubtId, upvoteCount}`, `doubt:answered`, `doubt:deleted`, `session:ended`, `presence:count`.
- **Anonymity:** every doubt leaves the server through one function, `serializeDoubt` in `lib/serialize.ts`, for both API responses and socket payloads. For anonymous doubts it sends no author name and no author id, only an `isMine` boolean computed for the viewer. Socket events that carry a doubt are serialized separately for each connected socket, so `isMine` / `hasUpvoted` are right for everyone. This applies to teachers too.
- **Upvotes** are atomic: a single `findOneAndUpdate` with `$addToSet` + `$inc` (filtered on "not already voted"), or `$pull` + `$inc` to undo. Each student gets one vote per doubt, even with concurrent clicks.
- **Similar doubts** use a MongoDB text index on `text`, ranked by `textScore`.
- **Rate limit:** at most 5 doubts per minute per user (in memory, which is fine for one server instance).

### API

All errors return `{ "error": string }` with a matching status code, and every request body is validated with `zod`.

| Method | Path | Who |
| --- | --- | --- |
| POST | `/api/auth/register` · `/api/auth/login` · `/api/auth/logout` | anyone |
| GET | `/api/auth/me` · `/api/auth/socket-token` | signed in |
| POST / GET | `/api/sessions` | teacher |
| POST | `/api/sessions/join` | student |
| GET | `/api/sessions/[id]` | student, or the owning teacher |
| PATCH | `/api/sessions/[id]/end` | owning teacher |
| GET / POST | `/api/sessions/[id]/doubts?status=open\|answered` | GET: both roles; POST: student |
| GET | `/api/sessions/[id]/doubts/similar?q=…` | signed in |
| POST | `/api/doubts/[id]/upvote` | student (toggle) |
| PATCH | `/api/doubts/[id]/answer` | owning teacher |
| DELETE | `/api/doubts/[id]` | author or owning teacher |
| GET | `/api/analytics?tz=Area/City` | teacher |

## Deploy (Render or Railway, not Vercel)

The app needs a **long-running Node process** to keep Socket.io connections open, so serverless hosts like Vercel won't work. Use Render or Railway, with MongoDB Atlas for the database.

**1. MongoDB Atlas (free tier)**
1. Create a free M0 cluster.
2. Under *Database Access*, add a database user.
3. Under *Network Access*, allow `0.0.0.0/0` (or your host's outbound IPs).
4. Copy the connection string and add a database name, e.g. `…mongodb.net/doubt-board?retryWrites=true&w=majority`.

**2a. Render**
1. New → **Web Service** → connect this repo.
2. **Root directory:** `doubt-board`
3. **Build command:** `npm ci --include=dev && npm run build`. Dev dependencies are needed because `tsx` runs the server and TypeScript is used during the build.
4. **Start command:** `npm start`
5. **Environment:** `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`. Render sets `PORT` itself.
6. Optionally seed once from the Render shell: `npm run seed`.

**2b. Railway**
1. New project → Deploy from GitHub repo, and set the service **root directory** to `doubt-board`.
2. Railway detects Node and runs `npm run build` and `npm start`.
3. Add the variables `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`. Railway provides `PORT`. Then generate a public domain.

Notes
- Both platforms give you HTTPS, and in production the auth cookie is `Secure`. If you run a production build over plain HTTP (for example, testing on your LAN), set `INSECURE_COOKIES=true`.
- The rate limiter and Socket.io rooms are in memory, so run **one instance**. To scale out, add the Socket.io Redis adapter and a Redis-backed rate limiter.
- Free Render instances sleep when idle. The first request wakes them, and clients reconnect automatically.
