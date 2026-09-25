import Link from "next/link";

/** Text tabs; state lives in the URL so it works without JS and is shareable. */
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
    <div className="flex gap-5">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Link
            key={o.value}
            href={hrefFor(o.value)}
            scroll={false}
            data-sound="tab"
            className={`-mb-px flex items-center gap-1.5 border-b py-2.5 text-sm transition ${
              active ? "border-text font-medium text-text" : "border-transparent text-muted hover:text-text"
            }`}
          >
            {o.label}
            {o.count != null && <span className="meta">{o.count}</span>}
          </Link>
        );
      })}
    </div>
  );
}
