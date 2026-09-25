// Display layer for categories. The database keeps the plain names
// (Appreciation, Suggestion, Concern, Other); this maps them to the vibe.
export const CATEGORY_META: Record<string, { label: string; blurb: string; color: string }> = {
  Appreciation: { label: "props", blurb: "hype someone up", color: "var(--c-props)" },
  Suggestion: { label: "idea", blurb: "galaxy-brain moment", color: "var(--c-idea)" },
  Concern: { label: "red flag", blurb: "something's off", color: "var(--c-flag)" },
  Other: { label: "random", blurb: "just vibes", color: "var(--c-random)" },
};

export function meta(category: string) {
  return CATEGORY_META[category] ?? CATEGORY_META.Other;
}

export function Dot({ color, size = 8 }: { color: string; size?: number }) {
  return <span className="inline-block shrink-0 rounded-full" style={{ width: size, height: size, background: color }} aria-hidden />;
}

export function CategoryTag({ category }: { category: string }) {
  const m = meta(category);
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] text-muted">
      <Dot color={m.color} />
      {m.label}
    </span>
  );
}
