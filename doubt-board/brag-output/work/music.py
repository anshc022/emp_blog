"""Original soundtrack + SFX for the /brag video, synthesized from scratch.

120 BPM, F major. Bars start on odd seconds so every scene cut lands on a beat.
Music and effects share one key (F-major pentatonic for the blips) and one
reverb, and are mixed as a single piece. Timing comes from timeline.json.
"""
import json
import wave

import numpy as np

SR = 44100
T = json.load(open("timeline.json"))
DUR = T["duration"] + 0.6  # tail, trimmed by the mux
N = int(DUR * SR)
rng = np.random.default_rng(7)


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def buf():
    return np.zeros((2, N))


def place(bus, sig, t, gain=1.0, pan=0.0):
    """Add mono `sig` at time t (s) with equal-power pan (-1..1)."""
    i = int(t * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    l = np.cos((pan + 1) * np.pi / 4)
    r = np.sin((pan + 1) * np.pi / 4)
    bus[0, i : i + len(sig)] += sig * gain * l
    bus[1, i : i + len(sig)] += sig * gain * r


def env_adsr(n, a=0.005, d=0.1, s=0.6, r=0.2, sus_len=None):
    a_n, d_n, r_n = int(a * SR), int(d * SR), int(r * SR)
    sus_n = max(0, n - a_n - d_n - r_n) if sus_len is None else int(sus_len * SR)
    e = np.concatenate(
        [np.linspace(0, 1, a_n, endpoint=False), np.linspace(1, s, d_n, endpoint=False), np.full(sus_n, s), np.linspace(s, 0, r_n)]
    )
    return e[:n] if len(e) >= n else np.pad(e, (0, n - len(e)))


def decay(n, tau):
    return np.exp(-np.arange(n) / (tau * SR))


def lowpass_fft(x, cutoff, slope=2.0):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 / np.sqrt(1 + (f / cutoff) ** (2 * slope))
    return np.fft.irfft(X, len(x))


def highpass_fft(x, cutoff, slope=2.0):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= 1 - 1 / np.sqrt(1 + (f / cutoff) ** (2 * slope))
    return np.fft.irfft(X, len(x))


def bandpass_fft(x, lo, hi):
    return lowpass_fft(highpass_fft(x, lo), hi)


def saw(freq, n, harmonics=24, detune_cents=0.0, phase=0.0):
    t = np.arange(n) / SR
    f = freq * 2 ** (detune_cents / 1200)
    out = np.zeros(n)
    for k in range(1, harmonics + 1):
        if f * k > SR / 2 - 1000:
            break
        out += np.sin(2 * np.pi * f * k * t + phase * k) / k
    return out * 0.6


def tri(freq, n):
    t = np.arange(n) / SR
    return 2 / np.pi * np.arcsin(np.sin(2 * np.pi * freq * t))


def sine(freq, n, phase=0.0):
    return np.sin(2 * np.pi * freq * np.arange(n) / SR + phase)


# ── harmony ─────────────────────────────────────────────────────────────────
# chord tones as MIDI (voiced around F3–C5)
F = [53, 57, 60, 64]  # Fmaj7
Dm = [50, 57, 60, 65]  # Dm7 (D A C F)
Bb = [46, 58, 62, 65]  # Bbmaj7-ish (Bb D F A→ voiced)
C = [48, 55, 60, 64, 62]  # C add9
Fadd9 = [41, 53, 60, 64, 67, 69]

# bars (start, end, chord, bass root)
bars = [(0.0, 1.0, Bb, 46), (1.0, 3.0, C, 48)]
prog = [(F, 41), (Dm, 38), (Bb, 46), (C, 48)]
t0, k = 3.0, 0
while t0 < 19.0:
    ch, root = prog[k % 4]
    bars.append((t0, t0 + 2.0, ch, root))
    t0 += 2.0
    k += 1
bars.append((19.0, DUR, Fadd9, 41))

music = buf()
sfx = buf()
verb_send = buf()

# ── pad ─────────────────────────────────────────────────────────────────────
for s, e, ch, _ in bars:
    n = int((e - s + 0.35) * SR)
    intro = s < 3.0
    for j, m in enumerate(ch[:4] if len(ch) > 4 and not e >= DUR else ch):
        v = saw(midi(m), n, 18, -7) + saw(midi(m), n, 18, +7, 0.7)
        v = lowpass_fft(v, 900 if intro else (2600 if s < 19 else 3200), 1.5)
        v *= env_adsr(n, a=0.25 if intro else 0.04, d=0.3, s=0.8, r=0.35)
        place(music, v, s, 0.085 if intro else 0.06, pan=(-0.5 + j / max(1, len(ch) - 1)) * 0.8)

# ── drums (from the drop at 3.0 until the outro chord at 19.0) ──────────────
def kick():
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = 45 + 95 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * decay(n, 0.16) + 0.25 * highpass_fft(rng.standard_normal(n) * decay(n, 0.004), 1500)


def clap():
    n = int(0.3 * SR)
    x = rng.standard_normal(n)
    e = np.zeros(n)
    for off in (0.0, 0.009, 0.018):
        i = int(off * SR)
        e[i:] += decay(n - i, 0.012 if off < 0.018 else 0.09)
    return bandpass_fft(x * e, 900, 5000) * 0.8


def hat(open_=False):
    n = int((0.18 if open_ else 0.05) * SR)
    return highpass_fft(rng.standard_normal(n), 7000) * decay(n, 0.05 if open_ else 0.012)


K, CL = kick(), clap()
kick_times = []
beat = 3.0
while beat < 19.0 - 1e-6:
    kick_times.append(beat)
    place(music, highpass_fft(K, 38), beat, 0.4)
    bar_pos = round(((beat - 1.0) % 2.0) / 0.5)  # 0..3 within bar
    if bar_pos in (1, 3):
        place(music, CL, beat, 0.22, 0.05)
        place(verb_send, CL, beat, 0.12)
    place(music, hat(), beat + 0.25, 0.07, 0.35)
    if beat >= 13.5:  # extra 16th hats for lift in the teacher scene
        place(music, hat(), beat + 0.125, 0.035, -0.3)
        place(music, hat(), beat + 0.375, 0.035, -0.3)
    beat += 0.5
place(music, hat(True), 18.75, 0.06, 0.2)

# ── bass ────────────────────────────────────────────────────────────────────
for s, e, ch, root in bars:
    if s < 3.0 or s >= 19.0:
        continue
    for step in range(8):  # 8th notes
        t = s + step * 0.25
        m = root + (12 if step in (3, 7) else 0)
        n = int(0.24 * SR)
        v = sine(midi(m), n) + 0.35 * sine(midi(m) * 2, n) + 0.15 * saw(midi(m), n, 6)
        v *= env_adsr(n, a=0.004, d=0.08, s=0.55, r=0.06)
        place(music, highpass_fft(lowpass_fft(v, 700), 35), t, 0.13)
# outro sub
n = int((DUR - 19.0) * SR)
place(music, sine(midi(41), n) * env_adsr(n, a=0.02, d=0.4, s=0.7, r=1.2), 19.0, 0.12)

# ── pluck arpeggio (intro + phone scenes, light) ────────────────────────────
def pluck(m, dur=0.22):
    n = int(dur * SR)
    return (tri(midi(m), n) * 0.6 + sine(midi(m) * 2, n) * 0.25) * decay(n, 0.09)


for s, e, ch, _ in bars:
    if not (s < 3.0 or 6.5 <= s < 13.5 or s >= 19.0):
        continue
    tones = sorted(set(ch))[1:4] + [sorted(set(ch))[1] + 12]
    for step in range(int((min(e, DUR - 0.5) - s) / 0.25)):
        t = s + step * 0.25
        m = tones[step % len(tones)] + 12
        g = 0.075 if s < 3.0 else 0.045
        place(music, pluck(m), t, g, 0.4 if step % 2 else -0.4)
        place(verb_send, pluck(m), t, g * 0.8)

# ── riser into the drop + transitions ───────────────────────────────────────
def whoosh(dur, rev=True, lo=400, hi=6000):
    n = int(dur * SR)
    x = bandpass_fft(rng.standard_normal(n), lo, hi)
    e = np.linspace(0, 1, n) ** 2.2
    return x * (e if rev else e[::-1])


rn = int(1.0 * SR)
riser = highpass_fft(rng.standard_normal(rn), 1200) * np.linspace(0, 1, rn) ** 3
riser += 0.3 * sine(1, rn) * 0  # placeholder for clarity
place(music, riser, 2.0, 0.09)
place(verb_send, riser, 2.0, 0.05)
crash_n = int(1.6 * SR)
crash = highpass_fft(rng.standard_normal(crash_n), 5000) * decay(crash_n, 0.45)
place(music, crash, 3.0, 0.06, 0.1)
place(verb_send, crash, 3.0, 0.05)
for tw, d in ((T["s3"]["phoneIn"] - 0.25, 0.3), (T["s3"]["slide"] - 0.05, 0.4), (T["s4"]["exit"] - 0.05, 0.35), (T["s6"]["wipe"] - 0.3, 0.35)):
    place(sfx, whoosh(d), tw, 0.07)
place(music, crash, T["s6"]["wipe"] + 0.05, 0.045, -0.1)

# ── SFX, all pitched to F-major pentatonic ──────────────────────────────────
PENT = [65, 67, 69, 72, 74, 77, 79, 81, 84, 86, 89]  # F4 G4 A4 C5 D5 F5 …


def blip(m, dur=0.09, bright=0.25):
    n = int(dur * SR)
    return (sine(midi(m), n) + bright * sine(midi(m) * 2, n)) * env_adsr(n, a=0.002, d=0.04, s=0.3, r=0.04)


def tick():
    n = int(0.018 * SR)
    return bandpass_fft(rng.standard_normal(n), 1800, 5500) * decay(n, 0.003)


def pop(m=84):
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    f = midi(m) * (1 + 0.6 * np.exp(-t * 60))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * decay(n, 0.035)


def bell(m, dur=1.4):
    n = int(dur * SR)
    f = midi(m)
    v = sine(f, n) + 0.5 * sine(f * 2.76, n) * decay(n, 0.25) + 0.25 * sine(f * 5.4, n) * decay(n, 0.1)
    return v * decay(n, 0.5) * env_adsr(n, a=0.002, d=0.0, s=1.0, r=0.05)


def sparkle(t, base=5, gain=0.05):
    for i, m in enumerate([PENT[base], PENT[base + 2], PENT[base + 3], PENT[base + 5]]):
        place(sfx, bell(m + 12, 0.6), t + i * 0.05, gain, -0.5 + i * 0.33)
        place(verb_send, bell(m + 12, 0.6), t + i * 0.05, gain * 1.2)


# typing
for i, tt in enumerate(T["s1"]["typing"] + T["s4"]["typing"]):
    place(sfx, tick(), tt, 0.1 + 0.03 * ((i * 7) % 3), ((i * 5) % 7 - 3) * 0.08)
# send + votes racing up
place(sfx, pop(84), T["s1"]["send"], 0.12)
place(verb_send, pop(84), T["s1"]["send"], 0.06)
for i, tv in enumerate(T["s1"]["votes"]):
    if i % 2 == 0:
        m = PENT[min(len(PENT) - 1, 2 + i // 4)]
        place(sfx, blip(m + 12, 0.07), tv, 0.035 + 0.02 * i / 31, 0.3 if i % 4 else -0.3)
        place(verb_send, blip(m + 12, 0.07), tv, 0.02)
# reveal
place(sfx, bell(77), T["s2"]["logo"], 0.09)
place(sfx, bell(84), T["s2"]["logo"] + 0.02, 0.05, 0.3)
place(verb_send, bell(77), T["s2"]["logo"], 0.08)
gn = int(0.35 * SR)
gl = np.sin(2 * np.pi * np.cumsum(np.linspace(midi(77), midi(89), gn)) / SR) * env_adsr(gn, a=0.03, d=0.1, s=0.5, r=0.15)
place(sfx, gl, T["s2"]["squiggle"], 0.03, -0.2)
place(verb_send, gl, T["s2"]["squiggle"], 0.03)
place(sfx, pop(81), T["s2"]["sticker"], 0.1, 0.4)
# code digits climb the scale
for i, td in enumerate(T["s3"]["digits"]):
    m = [77, 79, 81, 84, 86, 89][i]
    place(sfx, blip(m, 0.11, 0.35), td, 0.06, -0.2 + i * 0.08)
    place(verb_send, blip(m, 0.11), td, 0.04)
place(sfx, tick(), T["s3"]["press"], 0.25)
place(sfx, pop(84), T["s3"]["press"] + 0.01, 0.1)
# similar-doubt chime + upvote tap
place(sfx, bell(81, 0.8), T["s4"]["similar"], 0.05, -0.2)
place(sfx, bell(84, 0.8), T["s4"]["similar"] + 0.1, 0.05, 0.2)
place(verb_send, bell(81, 0.8), T["s4"]["similar"], 0.05)
place(sfx, pop(86), T["s4"]["tap"], 0.12)
sparkle(T["s4"]["tap"] + 0.04, base=5, gain=0.035)
# teacher board votes
for i, v in enumerate(T["s5"]["votes"]):
    m = PENT[4 + (i % 5)] + 12
    place(sfx, blip(m, 0.06), v["t"], 0.025, 0.4 if i % 2 else -0.4)
# mark answered + confetti
place(sfx, tick(), T["s5"]["click"], 0.3)
place(sfx, pop(84), T["s5"]["click"] + 0.01, 0.1)
sparkle(T["s5"]["confetti"], base=5, gain=0.06)
cn = int(1.2 * SR)
shimmer = highpass_fft(rng.standard_normal(cn), 6000) * decay(cn, 0.3) * np.linspace(1, 0, cn)
place(sfx, shimmer, T["s5"]["confetti"], 0.035)
place(verb_send, shimmer, T["s5"]["confetti"], 0.04)
# blobby boing + final chord bell
bn = int(0.35 * SR)
tb = np.arange(bn) / SR
fb = midi(72) * (1 + 0.06 * np.sin(2 * np.pi * 14 * tb)) * (1 + 0.3 * np.exp(-tb * 20))
boing = np.sin(2 * np.pi * np.cumsum(fb) / SR) * decay(bn, 0.09)
place(sfx, boing, T["s6"]["blobby"], 0.09)
place(verb_send, boing, T["s6"]["blobby"], 0.05)
for i, m in enumerate([65, 72, 77, 81]):
    place(sfx, bell(m + 12, 2.0), 19.0 + i * 0.03, 0.045, -0.4 + i * 0.25)
    place(verb_send, bell(m + 12, 2.0), 19.0 + i * 0.03, 0.05)

# ── mix ─────────────────────────────────────────────────────────────────────
# sidechain: duck music (except drums already in) slightly on each kick
duck = np.ones(N)
dn = int(0.22 * SR)
shape = 1 - 0.35 * np.exp(-np.arange(dn) / (0.06 * SR))
for kt in kick_times:
    i = int(kt * SR)
    duck[i : i + dn] = np.minimum(duck[i : i + dn], shape[: len(duck[i : i + dn])])

# shared room reverb
irn = int(1.8 * SR)
ir = rng.standard_normal((2, irn)) * decay(irn, 0.45)
ir = np.stack([lowpass_fft(ir[0], 5000), lowpass_fft(ir[1], 5000)])
ir /= np.sqrt((ir**2).sum(axis=1, keepdims=True))
L = N + irn
verb = np.stack([np.fft.irfft(np.fft.rfft(verb_send[c], L) * np.fft.rfft(ir[c], L), L)[:N] for c in range(2)])

# effects tucked under the music: gentle lowpass + level
sfx = np.stack([lowpass_fft(sfx[0], 9000), lowpass_fft(sfx[1], 9000)])
mix = music * duck + sfx * 0.9 + verb * 0.35

# fade in/out
fi = int(0.05 * SR)
mix[:, :fi] *= np.linspace(0, 1, fi)
end = int(T["duration"] * SR)
fo = int(1.4 * SR)
mix[:, end - fo : end] *= np.linspace(1, 0, fo) ** 1.5
mix[:, end:] = 0

# glue: soft saturation, then normalise to -1 dBFS peak
drive = 1.6
mix = np.tanh(mix * drive) / np.tanh(drive)
mix *= 10 ** (-1 / 20) / np.max(np.abs(mix))
rms = 20 * np.log10(np.sqrt(np.mean(mix[:, : end] ** 2)))
print(f"peak -1.0 dBFS, rms {rms:.1f} dBFS")

pcm = (mix.T[:end] * 32767).astype(np.int16)
with wave.open("audio.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("wrote audio.wav", pcm.shape[0] / SR, "s")
