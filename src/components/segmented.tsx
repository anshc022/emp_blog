import Link from "next/link";

/** Link-based segmented control: state lives in the URL, so it works without JS and is shareable. */
export function Segmented({
  options,
  value,
  hrefFor,
}: {
  options: { value: string; label: string; count?: number | null }[];
  value: string;
  hrefFor: (value: string) => string;
}) {
  return (
    <div className="inline-flex rounded-full border border-line bg-sunken/70 p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Link
            key={o.value}
            href={hrefFor(o.value)}
            scroll={false}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition ${
              active ? "bg-surface font-semibold text-ink shadow-card" : "text-muted hover:text-ink"
            }`}
          >
            {o.label}
            {o.count != null && (
              <span className={`text-xs tabular-nums ${active ? "text-accent" : "text-faint"}`}>{o.count}</span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
