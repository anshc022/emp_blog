"""Single source of truth for timing: the video composition and the audio
synth both read timeline.json, so every blip lands on its frame."""
import json, math

def typing(text, start, end):
    n = len(text)
    # slightly humanised rhythm, deterministic
    base = [(i + 0.5) / n for i in range(n)]
    jit = [0.012 * math.sin(i * 2.3) for i in range(n)]
    return [round(start + (end - start) * b + j, 3) for b, j in zip(base, jit)]

def ticks(start, end, count, power=1.8):
    # accelerating vote ticks: tick k happens at start + (k/count)^(1/power) * span
    return [round(start + (end - start) * ((k / count) ** (1 / power)), 3) for k in range(1, count + 1)]

T = {
    "fps": 30, "duration": 21.0, "bpm": 120,
    "s1": {"label": 0.15, "cardIn": 0.2, "text": "wait… is this on the exam??", "send": 1.5, "doubtIn": 1.62},
    "s2": {"wipe": 3.0, "logo": 3.3, "word": 3.45, "headline": 3.7, "squiggle": 4.2, "sticker": 4.55, "exit": 6.2},
    "s3": {"phoneIn": 6.5, "caption": 6.7, "code": "482913", "press": 8.15, "slide": 8.5},
    "s4": {"caption1": 9.6, "text": "why is binary search log n", "similar": 11.0, "caption2": 11.15, "tap": 11.9, "exit": 13.2},
    "s5": {"in": 13.5, "caption": 13.75, "cursor": 15.75, "click": 16.35, "confetti": 16.4},
    "s6": {"wipe": 17.5, "blobby": 17.85, "headline": 18.1, "brand": 18.7},
}
T["s1"]["typing"] = typing(T["s1"]["text"], 0.45, 1.3)
T["s1"]["votes"] = ticks(1.85, 2.92, 31)
T["s3"]["digits"] = [round(6.95 + i * 0.17, 3) for i in range(6)]
T["s4"]["typing"] = typing(T["s4"]["text"], 9.85, 10.75)

# Teacher board: which doubt gets a vote when. "C" climbs from 4th to 1st.
votes = []
seq = "CACCDCBCCACC"  # 12 votes
for i, who in enumerate(seq):
    votes.append({"t": round(14.0 + i * 0.145 + 0.02 * math.sin(i), 3), "id": who})
T["s5"]["votes"] = votes

json.dump(T, open("timeline.json", "w"), ensure_ascii=False, indent=1)
print("events:", len(T["s1"]["typing"]), len(T["s1"]["votes"]), len(T["s4"]["typing"]), len(votes))
