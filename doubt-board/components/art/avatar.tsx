import { DetectiveIcon } from "@phosphor-icons/react/dist/ssr";

import { cn } from "@/lib/utils";

const SWATCHES = [
  "bg-[#e4dcff] text-[#3b2a8c] dark:bg-[#2d2450] dark:text-[#cbbcff]",
  "bg-[#e9ffb0] text-[#3a4a05] dark:bg-[#2b3510] dark:text-[#d2ff4d]",
  "bg-[#ffd9c7] text-[#7a2a05] dark:bg-[#3d2216] dark:text-[#ffb08a]",
  "bg-[#ffd1e6] text-[#7a0f45] dark:bg-[#3d1a2b] dark:text-[#ff9ccb]",
  "bg-[#cdeeff] text-[#0b4a6e] dark:bg-[#132c3b] dark:text-[#8fdcff]",
  "bg-[#cff5dd] text-[#0b5a2c] dark:bg-[#12301f] dark:text-[#7ee7ab]",
];

export function hashString(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export const swatchFor = (seed: string) => SWATCHES[hashString(seed) % SWATCHES.length];

export function initials(name: string) {
  return name
    .replace(/^(prof|dr|mr|ms|mrs)\.?\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

/**
 * Anonymous doubts get a detective avatar whose colour is seeded by the
 * *doubt* id (never the author), so nothing links two anonymous doubts.
 */
export function Avatar({
  name,
  seed,
  className,
}: {
  name?: string | null;
  seed: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full text-[11px] font-bold ring-2 ring-[var(--card)]",
        swatchFor(name ?? seed),
        className,
      )}
      aria-hidden
    >
      {name ? initials(name) : <DetectiveIcon weight="duotone" className="size-[60%]" />}
    </span>
  );
}
