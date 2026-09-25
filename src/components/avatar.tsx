import { persona } from "./persona";

/** Per-message anonymous critter avatar. */
export function AnonAvatar({ seed, size = 36 }: { seed: number; size?: number }) {
  const p = persona(seed);
  return (
    <span
      className="hover-wobble grid shrink-0 place-items-center rounded-full border border-line bg-subtle"
      style={{ width: size, height: size, fontSize: size * 0.5 }}
      aria-label={p.name}
      role="img"
    >
      {p.emoji}
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
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full bg-inverse font-medium text-on-inverse"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden
    >
      {initials}
    </span>
  );
}
