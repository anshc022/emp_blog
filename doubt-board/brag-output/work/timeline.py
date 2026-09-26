"""Single source of truth for timing: the video composition and the audio
synth both read timeline.json, so every blip lands on its frame.
120 BPM, bars on odd seconds: every scene cut sits on a beat."""
import json, math

def typing(text, start, end):
    n = len(text)
    return [round(start + (end - start) * (i + 0.5) / n + 0.012 * math.sin(i * 2.3), 3) for i in range(n)]

def ticks(start, end, count, power=1.8):
    return [round(start + (end - start) * ((k / count) ** (1 / power)), 3) for k in range(1, count + 1)]

T = {"fps": 30, "duration": 31.0, "bpm": 120}
T["s1"] = {"label": 0.15, "cardIn": 0.2, "text": "wait… is this on the exam??", "send": 1.5, "doubtIn": 1.62,
           "typing": typing("wait… is this on the exam??", 0.45, 1.3), "votes": ticks(1.85, 2.92, 31)}
T["s2"] = {"wipe": 3.0, "logo": 3.3, "word": 3.45, "headline": 3.7, "squiggle": 4.2, "sub": 4.6, "sticker": 5.0, "exit": 6.7}
T["start"] = {"in": 7.0, "caption": 7.15, "card": 7.3, "codeDigits": [round(7.75 + i * 0.12, 3) for i in range(6)], "exit": 9.7}
T["join"] = {"phoneIn": 10.0, "caption": 10.2, "code": "482913", "digits": [round(10.45 + i * 0.17, 3) for i in range(6)], "press": 11.65, "slide": 12.0}
T["ask"] = {"caption1": 13.1, "text": "why is binary search log n", "typing": typing("why is binary search log n", 13.35, 14.25),
            "similar": 14.5, "caption2": 14.65, "tap": 15.4, "exit": 16.7}
seq = "CACCDCBCCACC"
T["board"] = {"in": 17.0, "caption": 17.2, "votes": [{"t": round(17.5 + i * 0.145 + 0.02 * math.sin(i), 3), "id": w} for i, w in enumerate(seq)],
              "cursor": 19.2, "click": 19.8, "confetti": 19.85, "exit": 20.7}
T["present"] = {"in": 21.0, "caption": 21.15, "votes": [{"t": round(21.8 + i * 0.16, 3), "id": w} for i, w in enumerate("EEAEBEE")], "exit": 23.7}
T["stats"] = {"in": 24.0, "caption": 24.15, "exit": 27.3}
T["outro"] = {"wipe": 27.5, "blobby": 27.85, "headline": 28.1, "brand": 28.7}

json.dump(T, open("timeline.json", "w"), ensure_ascii=False, indent=1)
print("ok", T["duration"], "s")
