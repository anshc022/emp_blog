"use client";

import { Star } from "lucide-react";
import { useOptimistic, useState, useTransition } from "react";
import { toggleStar } from "@/lib/actions";

export function StarButton({ id, count, starred }: { id: number; count: number; starred: boolean }) {
  const [optimistic, setOptimistic] = useOptimistic({ count, starred });
  const [, startTransition] = useTransition();
  const [popKey, setPopKey] = useState(0);

  function onClick() {
    const next = !optimistic.starred;
    if (next) setPopKey((k) => k + 1);
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
      className={`group relative inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold tabular-nums transition ${
        optimistic.starred
          ? "border-star/40 bg-star-soft text-ink"
          : "border-line bg-surface text-muted hover:border-star/50 hover:text-ink"
      }`}
    >
      <span className="relative grid place-items-center">
        {optimistic.starred && popKey > 0 && (
          <span key={`b${popKey}`} className="star-burst absolute size-5 rounded-full border-2 border-star" />
        )}
        <Star
          key={popKey}
          size={16}
          strokeWidth={2.2}
          className={`${optimistic.starred ? "star-pop fill-star text-star" : "group-hover:text-star"} transition-colors`}
        />
      </span>
      <span>{optimistic.count}</span>
    </button>
  );
}

/** Read-only star count, for places where starring doesn't apply. */
export function StarCount({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-semibold tabular-nums text-muted">
      <Star size={16} strokeWidth={2.2} className={count ? "fill-star text-star" : ""} />
      {count} {count === 1 ? "star" : "stars"}
    </span>
  );
}
