// Display layer for categories. The database keeps the plain names
// (Appreciation, Suggestion, Concern, Other); this maps them to the vibe.
export const CATEGORY_META: Record<string, { label: string; emoji: string; blurb: string; color: string }> = {
  Appreciation: { label: "props", emoji: "🙌", blurb: "hype someone up", color: "var(--lime)" },
  Suggestion: { label: "big idea", emoji: "💡", blurb: "galaxy-brain moment", color: "var(--yellow)" },
  Concern: { label: "red flag", emoji: "🚩", blurb: "something's off fr", color: "var(--coral)" },
  Other: { label: "random", emoji: "🫠", blurb: "just vibes, anything", color: "var(--lilac)" },
};

export function meta(category: string) {
  return CATEGORY_META[category] ?? CATEGORY_META.Other;
}

export function CategorySticker({ category, tilt = 0 }: { category: string; tilt?: number }) {
  const m = meta(category);
  return (
    <span className="sticker" style={{ background: m.color, rotate: `${tilt}deg` }}>
      <span aria-hidden>{m.emoji}</span> {m.label}
    </span>
  );
}
