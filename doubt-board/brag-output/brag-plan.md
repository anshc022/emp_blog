# /brag plan — Live Doubt Board (by Ankita Rahi)

**What it is:** a real-time classroom doubt board. Students join with a 6-digit code, ask doubts anonymously, and upvote each other's; the teacher sees a live, ranked list and marks doubts answered.
**For:** students too shy to raise a hand, and the teachers who want to know what the room actually didn't get.
**Sets it apart:** anonymous by default (enforced on the server), "someone already asked this" hints while typing, a list that re-ranks live, Present mode.
**Funniest true claim:** the question everyone is secretly thinking — "is this on the exam??" — finally gets asked, and the whole class upvotes it.
**Visual hook:** a doubt typed on the ink/aurora background, then upvotes piling on.
**Real UI shown:** join code entry → composer with the similar-doubt nudge + upvote → teacher live board re-ranking → Mark answered (+ confetti).
**Tone:** `default` — punchy, playful, clean. The app's own voice ("no question is a silly question").
**Share caption:** see `share-copy.txt`.

## Angle
Classrooms are full of questions nobody asks. Live Doubt Board makes asking anonymous and lets the room vote, so the teacher answers what matters. Show it, don't explain it.

## Visual identity (from `app/globals.css`)
Paper `#f6f3ec` / ink `#0d0b12`, violet `#6c47ff`, lime `#c6f432`, tangerine `#ff7a3d`, bubblegum `#ff5ca8`.
Bricolage Grotesque (display) + Instrument Serif italic accents + Geist body. Aurora grain-gradient shader, Blobby mascot, real components (DoubtCard, UpvoteButton, OtpInput, LiveStatus, Segmented, JoinCode, LogoMark, Button).

## Storyboard — 31.0 s, 1920×1080, 30 fps, 120 BPM (cuts on the beat)
| # | Time | Scene | On screen |
|---|---|---|---|
| 1 | 0.0–3.0 | **Hook** | Ink + aurora. "everyone, silently:" → composer types *"wait… is this on the exam??"* → becomes a real doubt card whose upvotes race 0→31. |
| 2 | 3.0–7.0 | **Reveal** | Circle-wipe to paper. Logo, "doubtboard LIVE", **ask the question *everyone* is thinking.** + "a live Q&A board for your classroom." + "anonymous by default" sticker. |
| 3 | 7.0–10.0 | **Step 1 — teacher starts a session** | The "you're live" card: join code 482·913 appears digit by digit on the aurora card. |
| 4 | 10.0–13.0 | **Step 2 — students join with the code** | Phone: code boxes fill, "Let me in" tapped. |
| 5 | 13.0–17.0 | **Step 3 — ask anonymously, or just upvote** | Composer types → "someone already asked this" → tap ▲. |
| 6 | 17.0–21.0 | **Step 4 — the teacher sees what matters, live** | Teacher board re-ranks; cursor clicks Mark answered → confetti. |
| 7 | 21.0–24.0 | **Present mode** | The real Present mode, framed as a projector; votes keep re-ranking the top 5. |
| 8 | 24.0–27.5 | **Analytics** | The real analytics page ("the vibe check"): topics, answered vs open, doubts by hour. |
| 9 | 27.5–31.0 | **Punchline** | Ink wipe. Blobby + **no question is a *silly question.*** + doubtboard · made by **Ankita Rahi**. |

## Sound
Original track, F major, 120 BPM, synthesized for this video: soft intro under the typing, riser into the drop at 3.0 s, groove (kick, clap, hats, bass, I–vi–IV–V) with extra hats through the teacher and projector scenes, resolving F add9 chord at 29 s. SFX pitched to F-major pentatonic (typing, vote blips, code digits, taps, confetti sparkle, chart sweep), sharing one reverb, mixed under the music; −14 LUFS.
