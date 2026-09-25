"use client";

import { useOptimistic, useState, useTransition } from "react";
import { toggleStar } from "@/lib/actions";
import { play } from "@/lib/sound";

const BITS = ["⭐", "✨", "💖", "⭐", "🔥", "✨", "⭐", "💫"];

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
      className={`group press relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-[15px] font-extrabold tabular-nums ${
        optimistic.starred
          ? "text-white shadow-[0_10px_24px_-8px_rgb(255_79_154/0.7)]"
          : "border border-line bg-surface-strong text-text hover:border-hot/40"
      }`}
      style={optimistic.starred ? { backgroundImage: "var(--grad)" } : undefined}
    >
      <span className="relative inline-block leading-none">
        {optimistic.starred && burst > 0 && (
          <span key={burst} aria-hidden>
            {BITS.map((b, i) => (
              <span
                key={i}
                className="particle pointer-events-none absolute top-1/2 left-1/2 text-[13px]"
                style={{ ["--a" as string]: `${i * 45}deg` }}
              >
                {b}
              </span>
            ))}
          </span>
        )}
        <span key={burst} className={`inline-block ${optimistic.starred ? "star-smash" : ""}`}>
          <StarIcon filled={optimistic.starred} />
        </span>
      </span>
      {optimistic.count}
    </button>
  );
}

export function StarIcon({ filled, size = 18 }: { filled: boolean; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden className="block">
      <path
        d="M12 2.6l2.85 5.95 6.55.85-4.8 4.55 1.22 6.5L12 17.3l-5.82 3.15 1.22-6.5-4.8-4.55 6.55-.85z"
        className={filled ? "fill-current" : "fill-transparent transition group-hover:fill-[#ffcc4d]"}
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
