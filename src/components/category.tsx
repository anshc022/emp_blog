import { HandHeart, Lightbulb, MessageCircle, TriangleAlert, type LucideIcon } from "lucide-react";

export const CATEGORY_META: Record<string, { icon: LucideIcon; blurb: string }> = {
  Appreciation: { icon: HandHeart, blurb: "Recognise something done well" },
  Suggestion: { icon: Lightbulb, blurb: "An idea to make things better" },
  Concern: { icon: TriangleAlert, blurb: "Something that isn't working" },
  Other: { icon: MessageCircle, blurb: "Anything else on your mind" },
};

export function CategoryTag({ category }: { category: string }) {
  const Icon = (CATEGORY_META[category] ?? CATEGORY_META.Other).icon;
  return (
    <span
      data-cat={category}
      className="inline-flex items-center gap-1.5 rounded-full bg-(--c-soft) px-2.5 py-1 text-xs font-semibold text-(--c)"
    >
      <Icon size={13} strokeWidth={2.4} />
      {category}
    </span>
  );
}
