import Link from "next/link";

import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden className={cn("size-9", className)}>
      <rect x="1" y="1" width="38" height="38" rx="12" fill="#6c47ff" />
      <path
        d="M11 13.5A4.5 4.5 0 0 1 15.5 9h11A4.5 4.5 0 0 1 31 13.5v8a4.5 4.5 0 0 1-4.5 4.5H19l-5.2 4.3c-.8.6-1.8-.1-1.6-1l.8-3.3h-.5A4.5 4.5 0 0 1 11 21.5z"
        fill="#fffdf9"
      />
      <path
        d="M18.2 14.8a2.9 2.9 0 1 1 3.9 2.7c-.7.3-1.1.9-1.1 1.6v.4"
        stroke="#16131c"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="21" cy="22.4" r="1.25" fill="#16131c" />
      <circle cx="32" cy="8" r="4.2" fill="#c6f432" stroke="#16131c" strokeWidth="1.6" />
    </svg>
  );
}

export function Brand({ href = "/", className, invert }: { href?: string; className?: string; invert?: boolean }) {
  return (
    <Link
      href={href}
      className={cn("group flex items-center gap-2.5 font-display text-[17px] font-bold tracking-tight", className)}
    >
      <LogoMark className="transition-transform group-hover:-rotate-6" />
      <span className={cn("leading-none", invert && "text-white")}>
        doubt<span className="text-primary">board</span>
        <span className="bg-lime text-lime-foreground ml-1.5 inline-block -translate-y-0.5 rounded-md px-1.5 py-0.5 align-middle text-[9px] font-extrabold tracking-widest">
          LIVE
        </span>
      </span>
    </Link>
  );
}
