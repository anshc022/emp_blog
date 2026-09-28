import type { GivenAnswer, GivenRating } from "@/lib/questions";

const STAR_PATH = "M12 2.6l2.85 5.95 6.55.85-4.8 4.55 1.22 6.5L12 17.3l-5.82 3.15 1.22-6.5-4.8-4.55 6.55-.85z";

/** A star in the current text colour: solid when filled, an outline when not. */
export function StarShape({ filled, size = 14 }: { filled: boolean; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden className="block">
      <path
        d={STAR_PATH}
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** A 1–5 rating, read-only. An average shows as the nearest whole number of stars. */
export function Stars({ value, size = 13 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-[2px]" role="img" aria-label={`${value} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= Math.round(value) ? "text-star" : "text-faint/60"}>
          <StarShape filled={n <= Math.round(value)} size={size} />
        </span>
      ))}
    </span>
  );
}

/** The ratings on one note. */
export function RatingList({ ratings }: { ratings: GivenRating[] }) {
  if (!ratings.length) return null;
  return (
    <ul className="mt-3 grid gap-x-8 gap-y-1.5 rounded-xl bg-subtle px-3.5 py-3 sm:grid-cols-2">
      {ratings.map((r) => (
        <li key={r.id} className="flex items-center justify-between gap-3 text-[13px]">
          <span className="text-muted">{r.label}</span>
          <Stars value={r.value} />
        </li>
      ))}
    </ul>
  );
}

/** The written answers on one note, each under the question it answers. */
export function AnswerList({ answers }: { answers: GivenAnswer[] }) {
  return (
    <dl className="mt-3 space-y-3.5">
      {answers.map((a) => (
        <div key={a.id}>
          <dt className="meta tracking-wide uppercase">{a.label}</dt>
          <dd className="mt-0.5 text-[16px] leading-relaxed whitespace-pre-wrap">{a.text}</dd>
        </div>
      ))}
    </dl>
  );
}

type RatedNote = { ratings: GivenRating[]; recipient_id: number | null; recipient_name: string | null };

function averages(notes: RatedNote[]) {
  const byId = new Map<string, { label: string; sum: number; count: number }>();
  for (const r of notes.flatMap((n) => n.ratings)) {
    const entry = byId.get(r.id) ?? { label: r.label, sum: 0, count: 0 };
    entry.sum += r.value;
    entry.count += 1;
    byId.set(r.id, entry);
  }
  return [...byId.values()];
}

/**
 * Average of each rating across the notes an admin is looking at. Notes to everyone and notes to
 * people are averaged apart: they rate different things, even where a label is shared
 * ("Communication" is about decisions reaching you in one and about a colleague in the other).
 */
export function RatingAverages({ notes }: { notes: RatedNote[] }) {
  const toPeople = notes.filter((n) => n.recipient_id !== null);
  const names = [...new Set(toPeople.map((n) => n.recipient_name))];
  const groups = [
    { title: "working here", rows: averages(notes.filter((n) => n.recipient_id === null)) },
    {
      title: names.length === 1 ? `working with ${names[0]}` : "working with colleagues, everyone together",
      rows: averages(toPeople),
    },
  ].filter((g) => g.rows.length);
  if (!groups.length) return null;
  return (
    <section className="mb-8 space-y-4 rounded-2xl border border-line bg-surface px-4 py-3.5">
      {groups.map((g) => (
        <div key={g.title}>
          <h2 className="meta mb-2 tracking-wide uppercase">average ratings · {g.title}</h2>
          <ul className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {g.rows.map(({ label, sum, count }) => (
              <li key={label} className="flex items-center gap-3 text-[14px]">
                <span className="flex-1 text-muted">{label}</span>
                <Stars value={sum / count} />
                <span className="w-8 text-right font-semibold tabular-nums">{(sum / count).toFixed(1)}</span>
                <span className="meta w-14 text-right">
                  {count} {count === 1 ? "note" : "notes"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
