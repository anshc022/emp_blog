# Feedback Channel

An internal, **anonymous** feedback app for the whole company.

- Any employee can send feedback to **one colleague** or to **everyone**.
- Recipients **never** see who wrote it. Their inbox only shows "Anonymous".
- **Super admins** see everything, including who wrote each message and who it was for.

## Features

| Who | Can do |
| --- | --- |
| Employee | Read their inbox (feedback to them + to everyone), give feedback, see what they sent, change password |
| Super admin | Everything above, plus see **all** feedback with author names, filter by sender/recipient, delete messages, add employees, reset passwords, promote/demote admins, deactivate accounts |

Feedback categories: Appreciation, Suggestion, Concern, Other.

## Tech

Next.js 16 (App Router, Server Actions) · Tailwind CSS 4 · SQLite (`better-sqlite3`) · signed-cookie sessions (`jose`) · `bcryptjs` password hashing.

Anonymity is enforced on the server: the employee-facing queries in `src/lib/db.ts` never select the author,
so the name cannot reach an employee's browser. Only the admin pages, which are guarded by `requireAdmin()`, join the author.

## Getting started

```bash
npm install
cp .env.example .env.local   # then set SESSION_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run dev
```

Open http://localhost:3000. The first super admin is created automatically from `ADMIN_EMAIL` / `ADMIN_PASSWORD`
(default `admin@company.com` / `admin1234` if unset, so change it).

Want sample data? `npm run seed` adds four demo employees (password `password123`) and a few messages.

## Deploying

The database is a single SQLite file (`./data/feedback.db`, or set `DATABASE_PATH`). Deploy somewhere with a persistent
disk (a VPS, Railway, Render or Fly.io with a volume). Serverless hosts like Vercel don't keep files between requests.
Always set `SESSION_SECRET` in production; the app refuses to run without it.
