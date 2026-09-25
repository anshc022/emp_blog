import { colorFor, persona } from "./persona";

/** Per-message anonymous critter avatar. */
export function AnonAvatar({ seed, size = 44 }: { seed: number; size?: number }) {
  const p = persona(seed);
  return (
    <span
      className="hover-wiggle grid shrink-0 place-items-center rounded-full border-[2.5px] border-line"
      style={{ width: size, height: size, background: p.color, fontSize: size * 0.52, ["--r" as string]: "10deg" }}
      aria-label={p.name}
      role="img"
    >
      {p.emoji}
    </span>
  );
}

export function PersonAvatar({ name, size = 40 }: { name: string; size?: number }) {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full border-[2.5px] border-line font-extrabold text-on-bright"
      style={{ width: size, height: size, fontSize: size * 0.36, background: colorFor(name) }}
      aria-hidden
    >
      {initials}
    </span>
  );
}
