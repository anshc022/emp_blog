# spill. ☕

*spill the tea. anonymously.* An internal, **anonymous** feedback app for the whole company, Minimal black & white design with small pops of colour, and a funny voice.

- Any employee can send feedback to **one colleague** or to **everyone**.
- Recipients **never** see who wrote it. Their inbox only shows "Anonymous".
- Anyone can **★ star** the notes they can see; sort by **Top** to see what resonates most.
- **Super admins** see everything, including who wrote each message and who it was for.

## Features

| Who | Can do |
| --- | --- |
| Employee | Read their inbox (filter: All / For you / Company, sort: Newest / Top), star notes, write feedback, see what they sent and how many stars it got, change password |
| Super admin | Everything above, plus see **all** feedback with author names, filter by sender/recipient, sort by stars, delete messages, add employees, reset passwords, promote/demote admins, deactivate accounts |

Feedback vibes: props, idea, red flag, random, each marked with a small coloured dot (stored as Appreciation / Suggestion / Concern / Other).

UX details: confetti when you send, a live "vibe meter" while you type (it even notices ALL CAPS), ⌘/Ctrl+Enter to send, a star button that pops yellow, and dark mode.

Sound effects: every interaction has a tiny synthesized sound (no audio files, Web Audio API): taps, tabs, opening menus, picking a person or vibe, soft typing ticks, starring (sparkle) and un-starring, send (whoosh + chime), confetti party, errors, successes, a login chime, a goodbye jingle and a delete swoosh. There's a sound on/off toggle in the top bar, saved per browser. Sounds live in `src/lib/sound.ts`; any element can opt in with `data-sound="tap"`.

## Tech

Next.js 16 (App Router, Server Actions) · Tailwind CSS 4 · Geist + Geist Mono (self-hosted) · SQLite (`better-sqlite3`) · signed-cookie sessions (`jose`) · `bcryptjs` password hashing.

Anonymity is enforced on the server: the employee-facing queries in `src/lib/db.ts` never select the author,
so the name cannot reach an employee's browser. Only the admin pages, which are guarded by `requireAdmin()`, join the author.

The UI follows the system light/dark setting and works on phones (bottom tab bar) as well as desktop (sidebar).
To rename the app, change `APP_NAME` in `src/components/brand.tsx`. Category labels live in `src/components/category.tsx`, aliases in `src/components/persona.ts`.

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
