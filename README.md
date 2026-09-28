# spill. ☕

*spill the tea. anonymously.* An internal, **anonymous** feedback app for the whole company, Minimal black & white design with small pops of colour, hand-built 3D SVG objects (teacup, envelope, star, shades) that float and tilt toward the cursor, lucide line icons, and a funny voice.

- Any employee can send feedback to **one colleague** or to **everyone**.
- Recipients **never** see who wrote it. Their inbox only shows "Anonymous".
- Anyone can **★ star** the notes they can see; sort by **Top** to see what resonates most.
- **Admins** — anyone who is an ADMIN or SUPER_ADMIN in TeamDesk — see everything, including who wrote each message
  and who it was for. Employees are told this in the composer, before they send.
- **Sign in with TeamDesk.** There are no accounts or passwords here: people use the email and password they already
  use for TeamDesk, and TeamDesk decides who is an admin.

## Features

| Who | Can do |
| --- | --- |
| Employee | Read their inbox (filter: All / For you / Company, sort: Newest / Top), star notes, write feedback, see what they sent and how many stars it got |
| Admin | Everything above, plus see **all** feedback with author names, filter by sender/recipient, sort by stars, delete messages. Also available inside the TeamDesk desktop app. |

Feedback vibes: props, idea, red flag, random, each marked with a small coloured dot (stored as Appreciation / Suggestion / Concern / Other).

UX details: confetti when you send, a live "vibe meter" while you type (it even notices ALL CAPS), ⌘/Ctrl+Enter to send, a star button that pops yellow, and dark mode.

Sound effects: every interaction has a tiny synthesized sound (no audio files, Web Audio API): taps, tabs, opening menus, picking a person or vibe, soft typing ticks, starring (sparkle) and un-starring, send (whoosh + chime), confetti party, errors, successes, a login chime, a goodbye jingle and a delete swoosh. There's a sound on/off toggle in the top bar, saved per browser. Sounds live in `src/lib/sound.ts`; any element can opt in with `data-sound="tap"`.

## Tech

Next.js 16 (App Router, Server Actions) · Tailwind CSS 4 · Geist + Geist Mono (self-hosted) · SQLite (`better-sqlite3`) · signed-cookie sessions (`jose`).

Anonymity is enforced on the server: the employee-facing queries in `src/lib/db.ts` never select the author,
so the name cannot reach an employee's browser. Only the admin pages, which are guarded by `requireAdmin()`, join the author.

The UI follows the system light/dark setting and works on phones (bottom tab bar) as well as desktop (sidebar).
To rename the app, change `APP_NAME` in `src/components/brand.tsx`. Category labels live in `src/components/category.tsx`, aliases in `src/components/persona.ts`.

## Accounts live in TeamDesk

spill. keeps no passwords. Signing in (`src/lib/teamdesk.ts`) asks TeamDesk:

1. `POST /auth/login` with the email and password. TeamDesk says who the person is and whether they are an admin.
2. `GET /users/directory` with that session, to refresh the colleague list — so anyone active in TeamDesk can
   receive feedback, even if they have never opened spill., and anyone deactivated there is deactivated here
   (which also ends their session here).
3. `POST /auth/logout` straight away. spill. never keeps or reuses a TeamDesk session.

TeamDesk's login has no lockout, so this form rate-limits failed attempts (`src/lib/rate-limit.ts`): 8 per account and
30 per address in 15 minutes. A locked attempt never reaches TeamDesk.

Forgotten passwords, new starters and leavers are all handled in TeamDesk. Nothing here needs touching.

## Inside TeamDesk

TeamDesk admins also get a **Feedback** page in the TeamDesk desktop app. It calls this app through TeamDesk's app proxy
(`/apps/feedback/call/…`), which adds the signed-in person as `x-teamdesk-*` headers and this app's key as `?key=`.
The routes it uses (`src/app/api/teamdesk/`) answer only when the key matches `TEAMDESK_APP_KEY` **and** the role is
ADMIN or SUPER_ADMIN — otherwise they return 404, so the public site cannot be used to read names by forging headers.

- `GET /api/teamdesk/feedback?sort=new|top&author=<id>&recipient=<id>|everyone` — totals, people, and every note with its author
- `DELETE /api/teamdesk/feedback/<id>` — remove a note and its stars

## Getting started

```bash
npm install
cp .env.example .env.local   # then set SESSION_SECRET and TEAMDESK_API_URL
npm run dev
```

Open http://localhost:3000 and sign in with a TeamDesk account.

Want sample data? `npm run seed` adds four demo colleagues and a few messages. They exist only to be written to —
they cannot sign in, because sign-in goes through TeamDesk.

## Testing

```bash
npm run build && npm run test:e2e
```

`scripts/e2e/run.mjs` starts a stand-in TeamDesk (`scripts/e2e/mock-teamdesk.mjs`) and the built app, then drives the
real forms over HTTP: sign-in and its failures, anonymity in the inbox, admin visibility, the TeamDesk admin API and its
key check, deactivation, session revocation, and rate limiting.

## Deploying

The database is a single SQLite file (`./data/feedback.db`, or set `DATABASE_PATH`). Deploy somewhere with a persistent
disk (a VPS, Railway, Render or Fly.io with a volume). Serverless hosts like Vercel don't keep files between requests.
Always set `SESSION_SECRET` in production; the app refuses to run without it.

It runs on the TeamDesk VM as `spill.service` (`/opt/spill`, data in `/var/lib/spill`, secrets in
`/etc/spill/spill.env`), bound to the Docker bridge on port 3100 so only Caddy can reach it, at
**https://feedback.35-200-237-138.nip.io**.

Deploy **from your own machine**:

```bash
bash deploy/deploy.sh        # builds the commit you have checked out, ships it, restarts the service
```

**Never build on the VM.** It has 2 GB of RAM and runs TeamDesk; on 28 Sep 2026 a `next build` there used all of it,
TeamDesk stopped answering for about half an hour and the machine had to be reset. `deploy.sh` builds locally and ships
only `.next`; `deploy/remote.sh` does the VM side — installs dependencies only when the lockfile changed, swaps the build
in, restarts, and keeps the previous build until the new one answers.
