"use client";

import { useOptimistic, useState, useTransition } from "react";
import { toggleStar } from "@/lib/actions";

const BITS = ["⭐", "✨", "💖", "⭐", "🔥", "✨", "⭐", "💫"];

export function StarButton({ id, count, starred }: { id: number; count: number; starred: boolean }) {
  const [optimistic, setOptimistic] = useOptimistic({ count, starred });
  const [, startTransition] = useTransition();
  const [burst, setBurst] = useState(0);

  function onClick() {
    const next = !optimistic.starred;
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
      className={`group press relative inline-flex items-center gap-2 rounded-full border-2 border-line px-3.5 py-1.5 text-[15px] font-extrabold tabular-nums shadow-[3px_3px_0_0_var(--line)] ${
        optimistic.starred ? "bg-yellow text-on-bright" : "bg-surface"
      }`}
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
        className={filled ? "fill-on-bright" : "fill-transparent transition group-hover:fill-yellow"}
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
