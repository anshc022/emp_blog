export const APP_NAME = "Candor";

export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path
        d="M16 3c7.7 0 13 4.9 13 11.3 0 6.4-5.3 11.3-13 11.3-1.3 0-2.6-.1-3.8-.4L6 29l1.3-6.1C4.6 20.9 3 17.9 3 14.3 3 7.9 8.3 3 16 3Z"
        fill="var(--accent)"
      />
      <path
        d="M9.5 13.2c1.6-1.6 3.6-1.6 5 .1M17.5 13.3c1.4-1.7 3.4-1.7 5-.1"
        stroke="var(--accent-ink)"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <LogoMark />
      <span className="font-display text-[22px] font-semibold tracking-tight">{APP_NAME}</span>
    </span>
  );
}
