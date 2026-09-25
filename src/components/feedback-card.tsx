import type { ReactNode } from "react";

const CATEGORY_STYLES: Record<string, string> = {
  Appreciation: "bg-emerald-50 text-emerald-700",
  Suggestion: "bg-sky-50 text-sky-700",
  Concern: "bg-amber-50 text-amber-800",
  Other: "bg-zinc-100 text-zinc-700",
};

export function formatDate(sqlDate: string) {
  // SQLite datetime('now') is UTC without a zone marker.
  return new Date(`${sqlDate.replace(" ", "T")}Z`).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function FeedbackCard({
  category,
  message,
  createdAt,
  meta,
  actions,
}: {
  category: string;
  message: string;
  createdAt: string;
  meta: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <article className="card">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
        <span className={`rounded-full px-2 py-0.5 font-medium ${CATEGORY_STYLES[category] ?? CATEGORY_STYLES.Other}`}>
          {category}
        </span>
        <span>{meta}</span>
        <span className="ml-auto">{formatDate(createdAt)}</span>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-6 text-zinc-800">{message}</p>
      {actions && <div className="mt-3 flex justify-end">{actions}</div>}
    </article>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="card text-center text-sm text-zinc-500">{children}</div>;
}
