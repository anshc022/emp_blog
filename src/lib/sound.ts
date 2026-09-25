"use client";

// Tiny synthesized sound kit. Everything is generated with the Web Audio API,
// so there are no audio files to load. Sounds only play after a user gesture
// (browser rule) and respect the mute toggle saved in localStorage.

export type SoundName =
  | "tap"
  | "tab"
  | "open"
  | "close"
  | "select"
  | "star"
  | "unstar"
  | "type"
  | "send"
  | "party"
  | "error"
  | "success"
  | "login"
  | "bye"
  | "delete"
  | "hover";

const KEY = "spill:muted";
let ctx: AudioContext | null = null;
let lastType = 0;

export function isMuted() {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setMuted(muted: boolean) {
  try {
    localStorage.setItem(KEY, muted ? "1" : "0");
  } catch {
    /* storage blocked: stay in-memory */
  }
  window.dispatchEvent(new CustomEvent("spill:mute", { detail: muted }));
}

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

type Tone = {
  freq: number;
  to?: number;
  at?: number;
  dur?: number;
  type?: OscillatorType;
  vol?: number;
};

function tone(ac: AudioContext, { freq, to, at = 0, dur = 0.12, type = "sine", vol = 0.18 }: Tone) {
  const t = ac.currentTime + at;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function noise(ac: AudioContext, { at = 0, dur = 0.35, from = 400, to = 4000, vol = 0.12 } = {}) {
  const t = ac.currentTime + at;
  const buffer = ac.createBuffer(1, Math.ceil(ac.sampleRate * dur), ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 1.2;
  filter.frequency.setValueAtTime(from, t);
  filter.frequency.exponentialRampToValueAtTime(to, t + dur);
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + dur * 0.3);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(gain).connect(ac.destination);
  src.start(t);
}

const RECIPES: Record<SoundName, (ac: AudioContext) => void> = {
  // soft bubble pop
  tap: (ac) => tone(ac, { freq: 520, to: 880, dur: 0.07, vol: 0.12 }),
  tab: (ac) => tone(ac, { freq: 700, to: 1000, dur: 0.06, type: "triangle", vol: 0.1 }),
  hover: (ac) => tone(ac, { freq: 1400, dur: 0.03, vol: 0.025 }),
  open: (ac) => {
    tone(ac, { freq: 400, to: 800, dur: 0.1, type: "triangle", vol: 0.12 });
    tone(ac, { freq: 800, to: 1200, at: 0.05, dur: 0.08, vol: 0.06 });
  },
  close: (ac) => tone(ac, { freq: 800, to: 380, dur: 0.1, type: "triangle", vol: 0.1 }),
  select: (ac) => {
    tone(ac, { freq: 660, dur: 0.07, type: "triangle", vol: 0.12 });
    tone(ac, { freq: 990, at: 0.06, dur: 0.09, type: "triangle", vol: 0.1 });
  },
  // sparkly arpeggio
  star: (ac) =>
    [880, 1109, 1319, 1760].forEach((f, i) => tone(ac, { freq: f, at: i * 0.045, dur: 0.16, vol: 0.12 })),
  unstar: (ac) => tone(ac, { freq: 700, to: 300, dur: 0.14, type: "triangle", vol: 0.1 }),
  // barely-there keyboard tick
  type: (ac) => tone(ac, { freq: 1800 + Math.random() * 400, dur: 0.018, type: "square", vol: 0.012 }),
  // whoosh + bright chime
  send: (ac) => {
    noise(ac, { dur: 0.4, from: 300, to: 5000, vol: 0.14 });
    [784, 1175, 1568].forEach((f, i) => tone(ac, { freq: f, at: 0.25 + i * 0.07, dur: 0.25, vol: 0.12 }));
  },
  // party horn-ish celebration
  party: (ac) => {
    tone(ac, { freq: 300, to: 900, dur: 0.35, type: "sawtooth", vol: 0.05 });
    [1047, 1319, 1568, 2093].forEach((f, i) => tone(ac, { freq: f, at: 0.3 + i * 0.06, dur: 0.2, vol: 0.09 }));
  },
  error: (ac) => {
    tone(ac, { freq: 220, dur: 0.12, type: "square", vol: 0.06 });
    tone(ac, { freq: 180, at: 0.13, dur: 0.18, type: "square", vol: 0.06 });
  },
  success: (ac) =>
    [659, 880].forEach((f, i) => tone(ac, { freq: f, at: i * 0.08, dur: 0.18, type: "triangle", vol: 0.13 })),
  login: (ac) =>
    [523, 659, 784, 1047].forEach((f, i) => tone(ac, { freq: f, at: i * 0.07, dur: 0.22, vol: 0.12 })),
  bye: (ac) =>
    [784, 659, 523].forEach((f, i) => tone(ac, { freq: f, at: i * 0.08, dur: 0.2, type: "triangle", vol: 0.11 })),
  delete: (ac) => {
    noise(ac, { dur: 0.25, from: 3000, to: 200, vol: 0.12 });
    tone(ac, { freq: 300, to: 90, dur: 0.25, type: "triangle", vol: 0.1 });
  },
};

export function play(name: SoundName) {
  if (isMuted()) return;
  if (name === "type") {
    const now = performance.now();
    if (now - lastType < 45) return;
    lastType = now;
  }
  const ac = audio();
  if (!ac) return;
  try {
    RECIPES[name](ac);
  } catch {
    /* never let a sound break the UI */
  }
}
