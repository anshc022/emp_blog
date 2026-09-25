import Link from "next/link";

/** Link-based segmented control: state lives in the URL, so it works without JS and is shareable. */
export function Segmented({
  options,
  value,
  hrefFor,
  color = "var(--grad)",
}: {
  options: { value: string; label: string; count?: number | null }[];
  value: string;
  hrefFor: (value: string) => string;
  color?: string;
}) {
  return (
    <div className="inline-flex gap-1 rounded-full border border-white/70 bg-surface p-1 shadow-[0_10px_30px_-16px_var(--glow)] backdrop-blur-xl dark:border-white/10">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Link
            key={o.value}
            href={hrefFor(o.value)}
            scroll={false}
            data-sound="tab"
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold whitespace-nowrap transition-all duration-300 ${
              active ? "text-white shadow-[0_6px_16px_-6px_rgb(255_79_154/0.6)]" : "text-muted hover:bg-sunken hover:text-text"
            }`}
            style={active ? { backgroundImage: color } : undefined}
          >
            {o.label}
            {o.count != null && (
              <span
                className={`grid min-w-5 place-items-center rounded-full px-1 font-mono text-[11px] ${
                  active ? "bg-white/25 text-white" : "bg-sunken"
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
