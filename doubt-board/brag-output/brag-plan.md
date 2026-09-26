# /brag plan — Live Doubt Board

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

## Storyboard — 21.0 s, 1920×1080, 30 fps, 120 BPM (cuts on the beat)
| # | Time | Scene | On screen |
|---|---|---|---|
| 1 | 0.0–3.0 | **Hook** | Ink + aurora. "everyone, silently:" → composer types *"wait… is this on the exam??"* → sends → becomes a real doubt card whose upvotes race 0→31. |
| 2 | 3.0–6.5 | **Reveal** | Circle-wipe to paper. Logo pops, "doubtboard LIVE". Headline from the landing page: **ask the question *everyone* is thinking.** Squiggle draws; lime sticker "anonymous by default". |
| 3 | 6.5–9.5 | **Join** | Phone slides in: "got a code?" + the real code boxes fill 4-8-2-9-1-3 → tap "Let me in". Left: **join with a 6-digit code.** |
| 4 | 9.5–13.5 | **Ask** | Same phone, session screen: typing *"why is binary search log n"* → "someone already asked this — upvote instead?" → tap ▲ (4→5). Left: **ask anonymously. / or just upvote it.** |
| 5 | 13.5–17.5 | **Teacher** | Browser window with the teacher live board: cards re-rank as votes tick, "top doubt" badge moves; cursor clicks **Mark answered** → card leaves, confetti. Top: **teachers see what the room needs — live.** |
| 6 | 17.5–21.0 | **Punchline** | Ink wipe from the confetti. Blobby (proud) + **no question is a *silly question.*** + logo + repo URL. |

## Sound
Original track, F major, 120 BPM, synthesized for this video: soft intro pad + pluck under the typing, a riser into the drop on the reveal (3.0 s), light groove (kick, clap, hats, bass, I–vi–IV–V), resolving chord on the outro. SFX are pitched to F-major pentatonic (typing ticks, vote blips, code-digit notes, pop on tap, sparkle on confetti), sit under the music, share the same reverb.
