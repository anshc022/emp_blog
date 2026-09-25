"use client";

import { useOptimistic, useState, useTransition } from "react";
import { toggleStar } from "@/lib/actions";
import { play } from "@/lib/sound";

export function StarButton({ id, count, starred }: { id: number; count: number; starred: boolean }) {
  const [optimistic, setOptimistic] = useOptimistic({ count, starred });
  const [, startTransition] = useTransition();
  const [burst, setBurst] = useState(0);

  function onClick() {
    const next = !optimistic.starred;
    play(next ? "star" : "unstar");
    if (next) setBurst((b) => b + 1);
    startTransition(async () => {
      setOptimistic({ starred: next, count: optimistic.count + (next ? 1 : -1) });
      await toggleStar(id);
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={optimistic.starred}
      aria-label={optimistic.starred ? "Unstar" : "Star"}
      title={optimistic.starred ? "un-star" : "star it if you felt this"}
      className={`group inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium tabular-nums transition active:scale-95 ${
        optimistic.starred ? "border-text text-text" : "border-line text-muted hover:border-text/30 hover:text-text"
      }`}
    >
      <span className="relative inline-block">
        {optimistic.starred && burst > 0 && (
          <span key={burst} aria-hidden>
            {Array.from({ length: 6 }, (_, i) => (
              <span
                key={i}
                className="particle pointer-events-none absolute top-1/2 left-1/2 size-1 rounded-full bg-star"
                style={{ ["--a" as string]: `${i * 60}deg` }}
              />
            ))}
          </span>
        )}
        <span key={burst} className={`block ${optimistic.starred ? "star-pop" : ""}`}>
          <StarIcon filled={optimistic.starred} />
        </span>
      </span>
      {optimistic.count}
    </button>
  );
}

export function StarIcon({ filled, size = 15 }: { filled: boolean; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden className="block">
      <path
        d="M12 2.6l2.85 5.95 6.55.85-4.8 4.55 1.22 6.5L12 17.3l-5.82 3.15 1.22-6.5-4.8-4.55 6.55-.85z"
        fill={filled ? "var(--star)" : "none"}
        stroke={filled ? "var(--star)" : "currentColor"}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
