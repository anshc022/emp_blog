import type { ReactNode } from "react";
import { CategorySticker, meta } from "./category";
import { StarIcon } from "./star-button";

export function timeAgo(sqlDate: string) {
  // SQLite datetime('now') is UTC without a zone marker.
  const date = new Date(`${sqlDate.replace(" ", "T")}Z`);
  const s = Math.max(0, (Date.now() - date.getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toLowerCase();
}

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
    <article className="pop-in brut relative overflow-hidden p-5 transition-transform duration-300 hover:-translate-y-0.5 sm:p-6" style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}>
      <span
        className="pointer-events-none absolute -top-10 -right-10 size-40 rounded-full opacity-60 blur-3xl"
        style={{ background: meta(category).color }}
        aria-hidden
      />
      <header className="relative flex items-start gap-3">
        {avatar}
        <div className="min-w-0 flex-1">
          <div className="text-[17px] leading-tight font-extrabold">{from}</div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {to}
            <span className="font-mono text-xs font-bold text-faint">· {timeAgo(createdAt)}</span>
          </div>
        </div>
        <CategorySticker category={category} />
      </header>
      <p className="relative mt-4 text-[19px] leading-[1.5] font-medium whitespace-pre-wrap sm:text-xl">{message}</p>
      {footer && (
        <footer className="relative mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          {footer}
        </footer>
      )}
    </article>
  );
}

/** Small "→ you" / "→ everyone" sticker. */
export function ToSticker({ to }: { to: "you" | "everyone" | string }) {
  const bg = to === "you" ? "bg-pink" : to === "everyone" ? "bg-blue" : "bg-mint";
  const label = to === "you" ? "→ you 🫵" : to === "everyone" ? "→ everyone 📣" : `→ ${to}`;
  return <span className={`sticker !py-0 !text-xs ${bg}`}>{label}</span>;
}

export function EmptyState({ emoji, title, children }: { emoji: string; title: string; children?: ReactNode }) {
  return (
    <div className="brut flex flex-col items-center px-6 py-14 text-center">
      <div className="wiggle mb-4 text-6xl" style={{ ["--r" as string]: "-8deg" }}>{emoji}</div>
      <h3 className="text-2xl font-extrabold tracking-tight">{title}</h3>
      {children && <div className="mt-2 max-w-sm text-muted">{children}</div>}
    </div>
  );
}

export function PageHeader({
  tag,
  tagColor = "var(--lime)",
  title,
  children,
}: {
  tag?: string;
  tagColor?: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="mb-8">
      {tag && (
        <span className="sticker tag mb-4 !px-3 !py-1 !text-[11px]" style={{ background: tagColor }}>
          {tag}
        </span>
      )}
      <h1 className="text-[40px] leading-[0.98] font-extrabold tracking-[-0.035em] sm:text-[54px]">{title}</h1>
      {children && <p className="mt-3 max-w-xl text-[17px] text-muted">{children}</p>}
    </div>
  );
}

export function starLine(count: number) {
  if (count === 0) return "be the first to star this 👀";
  if (count === 1) return "1 person felt this";
  if (count >= 5) return `${count} people felt this 🔥`;
  return `${count} people felt this`;
}

/** Read-only star count. */
export function StarCount({ count }: { count: number }) {
  return (
    <span
      className={`sticker !gap-1.5 !px-3.5 !py-1.5 ${count ? "!text-white" : "border border-line bg-surface-strong !text-text"}`}
      style={count ? { backgroundImage: "var(--grad)" } : undefined}
    >
      <StarIcon filled={count > 0} size={16} /> {count}
    </span>
  );
}
