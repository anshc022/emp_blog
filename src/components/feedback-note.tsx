import type { ReactNode } from "react";
import { CategoryTag } from "./category";
import { StarIcon } from "./star-button";

export function timeAgo(sqlDate: string) {
  // SQLite datetime('now') is UTC without a zone marker.
  const date = new Date(`${sqlDate.replace(" ", "T")}Z`);
  const s = Math.max(0, (Date.now() - date.getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toLowerCase();
}

/** One row in a feed. */
export function FeedbackNote({
  category,
  message,
  createdAt,
  avatar,
  from,
  to,
  footer,
  index = 0,
}: {
  category: string;
  message: string;
  createdAt: string;
  avatar: ReactNode;
  from: ReactNode;
  to: ReactNode;
  footer?: ReactNode;
  index?: number;
}) {
  return (
    <article
      className="fade-up flex gap-3.5 border-b border-line py-6 first:pt-2"
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      {avatar}
      <div className="min-w-0 flex-1">
        <header className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-[15px] font-semibold">{from}</span>
          <span className="text-[13px] text-muted">→ {to}</span>
          <span className="meta">· {timeAgo(createdAt)}</span>
          <span className="ml-auto">
            <CategoryTag category={category} />
          </span>
        </header>
        <p className="mt-1.5 text-[16px] leading-relaxed whitespace-pre-wrap">{message}</p>
        {footer && <footer className="mt-3 flex flex-wrap items-center gap-3">{footer}</footer>}
      </div>
    </article>
  );
}

export function EmptyState({ emoji, title, children }: { emoji: string; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <div className="mb-4 text-4xl grayscale">{emoji}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {children && <div className="mt-1 max-w-sm text-[15px] text-muted">{children}</div>}
    </div>
  );
}

export function PageHeader({ title, children, right }: { title: ReactNode; children?: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.03em] sm:text-[32px]">{title}</h1>
        {children && <p className="mt-1.5 max-w-lg text-[15px] text-muted">{children}</p>}
      </div>
      {right}
    </div>
  );
}

export function starLine(count: number) {
  if (count === 0) return "no stars yet";
  if (count === 1) return "1 person felt this";
  if (count >= 5) return `${count} people felt this. it's giving consensus`;
  return `${count} people felt this`;
}

/** Read-only star count. */
export function StarCount({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] font-medium tabular-nums text-muted">
      <StarIcon filled={count > 0} /> {count}
    </span>
  );
}
