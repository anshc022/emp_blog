import { VenetianMask } from "lucide-react";

function hash(input: string | number) {
  const s = String(input);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return Math.abs(h);
}

/** A per-message anonymous avatar: a unique gradient, never tied to the author. */
export function AnonAvatar({ seed, size = 40 }: { seed: number; size?: number }) {
  const a = (seed * 137.508) % 360; // golden angle keeps neighbouring notes visually distinct
  const b = (a + 40 + (hash(seed) % 60)) % 360;
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full text-white shadow-inner"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 30% 25%, hsl(${a} 85% 70%), hsl(${b} 70% 45%))`,
      }}
      aria-label="Anonymous"
    >
      <VenetianMask size={size * 0.48} strokeWidth={1.8} />
    </span>
  );
}

export function PersonAvatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const hue = hash(name) % 360;
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-semibold"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `hsl(${hue} 70% 88%)`,
        color: `hsl(${hue} 55% 28%)`,
      }}
      aria-hidden
    >
      {initials}
    </span>
  );
}
