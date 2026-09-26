import Link from "next/link";

import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8", className)}>
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <path
        d="M9 11.5a3.5 3.5 0 0 1 3.5-3.5h7a3.5 3.5 0 0 1 3.5 3.5v5a3.5 3.5 0 0 1-3.5 3.5H15l-4 3.5V20a3.5 3.5 0 0 1-2-3.2z"
        className="fill-primary-foreground"
      />
      <path
        d="M14.2 12.3a2 2 0 1 1 2.6 1.9c-.5.2-.8.6-.8 1.1v.3"
        className="stroke-primary"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="16" cy="17.6" r=".9" className="fill-primary" />
    </svg>
  );
}

export function Brand({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2 font-semibold tracking-tight", className)}>
      <LogoMark className="size-7" />
      <span>
        Live Doubt <span className="text-primary">Board</span>
      </span>
    </Link>
  );
}
