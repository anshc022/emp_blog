"use client";

const COLORS = ["#6c47ff", "#c6f432", "#ff5ca8", "#ff7a3d", "#38bdf8"];

/** Brand-coloured confetti burst. No-ops for reduced-motion users. */
export async function celebrate(opts: { x?: number; y?: number; big?: boolean } = {}) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const confetti = (await import("canvas-confetti")).default;
  const origin = { x: opts.x ?? 0.5, y: opts.y ?? 0.6 };
  if (opts.big) {
    confetti({ particleCount: 90, spread: 100, startVelocity: 45, origin, colors: COLORS, scalar: 1.1 });
    setTimeout(() => confetti({ particleCount: 60, spread: 120, origin: { x: 0.2, y: 0.5 }, colors: COLORS }), 180);
    setTimeout(() => confetti({ particleCount: 60, spread: 120, origin: { x: 0.8, y: 0.5 }, colors: COLORS }), 320);
  } else {
    confetti({ particleCount: 45, spread: 70, startVelocity: 32, origin, colors: COLORS, ticks: 140, scalar: 0.9 });
  }
}

/** Origin (0..1) of an element, for aiming confetti at a button. */
export function originOf(el: Element | null | undefined) {
  if (!el) return {};
  const r = el.getBoundingClientRect();
  return { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight };
}
