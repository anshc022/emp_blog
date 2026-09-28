# spill. ☕

*spill the tea. anonymously.* NextQom's internal, **anonymous** feedback app. It wears NextQom's brand (the NQ mark, nextqom.com's blue and navy, Outfit / Inter / Space Mono), with hand-built 3D SVG objects (teacup, envelope, star, shades) that float and tilt toward the cursor, lucide line icons, and a funny voice.

- Any employee can send feedback to **one colleague** or to **everyone**.
- The form asks, rather than handing over a blank box: optional **1–5 star ratings** and a few **written questions**, which
  depend on who the note is for. At least one question must be answered; stars alone are not accepted.
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

### What the form asks

Written to one person (`{name}` is their first name):

| Stars (each optional) | Questions |
| --- | --- |
| Collaboration — {name} is easy to work with | What should {name} keep doing? |
| Communication — {name} keeps people in the loop | What would make working with {name} even better? |
| Reliability — {name} delivers what they commit to, on time | A moment that stuck with you *(optional)* |
| Quality of work — {name}'s work is solid and well thought through | |
| Helpfulness — {name} helps others when they're stuck | |

Written to everyone:

| Stars (each optional) | Questions |
| --- | --- |
| Clarity — I know what's expected of me, and why | What's working well at NextQom right now? |
| Workload — My workload is manageable | If you could change one thing, what would it be? |
| Communication — I hear about decisions that affect me in time | Anything else leadership should hear? *(optional)* |
| Tools & process — Our tools and process help more than they get in the way | |
| Growth — I'm learning and growing here | |
| Recognition — Good work gets noticed | |

The questions live in `src/lib/questions.ts`. Each note stores its ratings and answers with their labels, so rewording a
question later does not change what old notes say. Notes written before the form asked questions keep their plain text.
Admins see the average of each rating across whatever they have filtered to, with notes to everyone and notes to people
averaged apart.

Feedback vibes: props, idea, red flag, random, each marked with a small coloured dot (stored as Appreciation / Suggestion / Concern / Other).

UX details: confetti when you send, a draft that survives a validation error, ⌘/Ctrl+Enter to send, a star button that pops yellow, and dark mode.

Sound effects: every interaction has a tiny synthesized sound (no audio files, Web Audio API): taps, tabs, opening menus, picking a person or vibe, soft typing ticks, starring (sparkle) and un-starring, send (whoosh + chime), confetti party, errors, successes, a login chime, a goodbye jingle and a delete swoosh. There's a sound on/off toggle in the top bar, saved per browser. Sounds live in `src/lib/sound.ts`; any element can opt in with `data-sound="tap"`.

## Tech

Next.js 16 (App Router, Server Actions) · Tailwind CSS 4 · Outfit, Inter and Space Mono via `next/font` (fetched at build, served from this app) · SQLite (`better-sqlite3`) · signed-cookie sessions (`jose`).

Anonymity is enforced on the server: the employee-facing queries in `src/lib/db.ts` never select the author,
so the name cannot reach an employee's browser. Only the admin pages, which are guarded by `requireAdmin()`, join the author.

The UI follows the system light/dark setting and works on phones (bottom tab bar) as well as desktop (sidebar).
To rename the app, change `APP_NAME` in `src/components/brand.tsx`; the NQ mark is `public/nq-mark.png` and the icons are `src/app/icon.png` and `src/app/apple-icon.png`, all cut from nextqom.com's logo. Category labels live in `src/components/category.tsx`, aliases in `src/components/persona.ts`.

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

- `GET /api/teamdesk/feedback?sort=new|top&author=<id>&recipient=<id>|everyone` — totals, people, and every note with its author,
  its `ratings` (`[{id, label, value}]`) and `answers` (`[{id, label, text}]`; empty for notes from before the questions)
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
real forms over HTTP: sign-in and its failures, upgrading a database from before the questions, which stars and answers
are kept for each kind of note, anonymity in the inbox, admin visibility, the TeamDesk admin API and its
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
