import type { ReactNode } from "react";
import { CategoryTag } from "./category";

export function timeAgo(sqlDate: string) {
  // SQLite datetime('now') is UTC without a zone marker.
  const date = new Date(`${sqlDate.replace(" ", "T")}Z`);
  const s = Math.max(0, (Date.now() - date.getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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
    <article
      data-cat={category}
      className="rise panel relative overflow-hidden p-5 sm:p-6"
      style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
    >
      <span className="absolute inset-y-0 left-0 w-1 bg-(--c)" aria-hidden />
      <header className="flex items-start gap-3">
        {avatar}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-1.5 text-sm">
            <span className="font-semibold">{from}</span>
            <span className="text-faint">→</span>
            <span className="font-medium text-muted">{to}</span>
          </div>
          <div className="text-xs text-faint">{timeAgo(createdAt)}</div>
        </div>
        <CategoryTag category={category} />
      </header>
      <p className="mt-4 whitespace-pre-wrap font-display text-[19px] leading-[1.55] tracking-[-0.005em] text-ink">
        {message}
      </p>
      {footer && <footer className="mt-5 flex flex-wrap items-center justify-between gap-3">{footer}</footer>}
    </article>
  );
}

export function EmptyState({ icon, title, children }: { icon: ReactNode; title: string; children?: ReactNode }) {
  return (
    <div className="panel flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-sunken text-muted">{icon}</div>
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      {children && <div className="mt-2 max-w-sm text-sm text-muted">{children}</div>}
    </div>
  );
}

export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-8">
      {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
      <h1 className="font-display text-[34px] font-semibold leading-tight tracking-tight sm:text-[40px]">{title}</h1>
      {children && <p className="mt-2 max-w-xl text-[15px] text-muted">{children}</p>}
    </div>
  );
}
