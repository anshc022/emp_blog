import { cn } from "@/lib/utils";

/** Hand-drawn underline. */
export function Squiggle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 18" preserveAspectRatio="none" className={cn("h-3 w-full", className)} aria-hidden>
      <path
        d="M3 12C25 4 40 4 56 10s32 6 50-1 34-7 52 0 34 6 58-3"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/** Four-point sparkle. */
export function Sparkle({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-6", className)} style={style} aria-hidden>
      <path d="M12 0c1 7 5 11 12 12-7 1-11 5-12 12-1-7-5-11-12-12 7-1 11-5 12-12Z" fill="currentColor" />
    </svg>
  );
}

/** Loopy arrow pointing down-right. */
export function CurlyArrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 80" className={cn("h-16 w-24", className)} aria-hidden fill="none">
      <path
        d="M6 10c20-6 44 0 44 18 0 14-20 16-20 4s24-20 44-4c12 10 20 24 26 38"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path d="M92 58l8 12 10-11" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Scribbled circle for highlighting a word. */
export function ScribbleCircle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 80" preserveAspectRatio="none" className={cn("absolute", className)} aria-hidden fill="none">
      <path
        d="M150 8C96-2 18 6 8 34c-9 26 50 40 108 38 52-2 84-16 78-36C188 14 130 4 60 12"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
