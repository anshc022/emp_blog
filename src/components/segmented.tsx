import Link from "next/link";

/** Link-based segmented control: state lives in the URL, so it works without JS and is shareable. */
export function Segmented({
  options,
  value,
  hrefFor,
  color = "var(--lime)",
}: {
  options: { value: string; label: string; count?: number | null }[];
  value: string;
  hrefFor: (value: string) => string;
  color?: string;
}) {
  return (
    <div className="inline-flex gap-1 rounded-full border-2 border-line bg-surface p-1 shadow-[3px_3px_0_0_var(--line)]">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Link
            key={o.value}
            href={hrefFor(o.value)}
            scroll={false}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold whitespace-nowrap transition ${
              active ? "border-2 border-line text-on-bright" : "border-2 border-transparent text-muted hover:text-text"
            }`}
            style={active ? { background: color } : undefined}
          >
            {o.label}
            {o.count != null && (
              <span
                className={`grid min-w-5 place-items-center rounded-full px-1 font-mono text-[11px] ${
                  active ? "bg-on-bright text-white" : "bg-sunken"
                }`}
              >
                {o.count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
