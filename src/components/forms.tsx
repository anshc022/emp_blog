"use client";

import Link from "next/link";
import { Check, ChevronDown, EyeOff, Eye, Lock, Megaphone, Search, Send } from "lucide-react";
import { startTransition, useActionState, useEffect, useMemo, useRef, useState } from "react";
import { login, sendFeedback, type FormState } from "@/lib/actions";
import { MAX_ANSWER, PROMPTS, RATINGS, STAR_WORDS, fill, firstName, type Audience } from "@/lib/questions";
import { play } from "@/lib/sound";
import { PersonAvatar } from "./avatar";
import { CATEGORY_META, Dot } from "./category";
import { StarShape } from "./ratings";
import { TeaCup3D, Tilt } from "./three-d";

function Status({ state }: { state: FormState }) {
  useEffect(() => {
    if (state?.error) play("error");
    else if (state?.success) play("success");
  }, [state]);
  if (state?.error)
    return (
      <p className="fade-up flex items-center gap-2 text-sm text-text">
        <Dot color="var(--c-flag)" /> {state.error}
      </p>
    );
  if (state?.success)
    return (
      <p className="fade-up flex items-center gap-2 text-sm text-text">
        <Dot color="var(--c-props)" /> {state.success}
      </p>
    );
  return null;
}

/* ------------------------------ Login ------------------------------ */

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const [peek, setPeek] = useState(false);
  return (
    <form
      action={action}
      onSubmit={() => {
        play("tap");
        try {
          sessionStorage.setItem("spill:hello", "1");
        } catch {}
      }}
      className="space-y-4"
    >
      <div>
        <label className="field-label" htmlFor="email">work email</label>
        <input className="field" id="email" name="email" type="email" autoComplete="email" placeholder="you@nextqom.com" required />
      </div>
      <div>
        <label className="field-label" htmlFor="password">password</label>
        <div className="relative">
          <input className="field pr-16" id="password" name="password" type={peek ? "text" : "password"} autoComplete="current-password" required />
          <button
            type="button"
            onClick={() => {
              play(peek ? "close" : "open");
              setPeek((p) => !p);
            }}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-lg"
            aria-label={peek ? "Hide password" : "Show password"}
            title={peek ? "hide" : "peek"}
          >
            {peek ? <EyeOff size={17} className="text-muted" /> : <Eye size={17} className="text-muted" />}
          </button>
        </div>
      </div>
      <Status state={state} />
      <button className="btn w-full !py-2.5" disabled={pending}>
        {pending ? "checking vibes…" : "let me in"}
      </button>
    </form>
  );
}

/* ----------------------------- Composer ----------------------------- */

type Colleague = { id: number; name: string };

type Recipient = "everyone" | number;

function RecipientPicker({
  colleagues,
  value,
  onChange,
}: {
  colleagues: Colleague[];
  value: Recipient;
  onChange: (value: Recipient) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? colleagues.filter((c) => c.name.toLowerCase().includes(q)) : colleagues;
  }, [colleagues, query]);

  const selected = value === "everyone" ? null : colleagues.find((c) => c.id === value);
  const pick = (v: Recipient) => {
    play("select");
    onChange(v);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={box} className="relative">
      <input type="hidden" name="recipient" value={value} />
      <button
        type="button"
        onClick={() => {
          play(open ? "close" : "open");
          setOpen((o) => !o);
        }}
        aria-expanded={open}
        className="flex w-full items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5 text-left transition hover:border-text/30"
      >
        {selected ? (
          <PersonAvatar name={selected.name} size={32} />
        ) : (
          <span className="grid size-8 place-items-center rounded-full border border-line bg-subtle"><Megaphone size={15} /></span>
        )}
        <span className="flex-1">
          <span className="block text-[15px] font-medium">{selected ? selected.name : "everyone"}</span>
          <span className="block text-[13px] text-muted">
            {selected ? "coworker" : "the whole company sees this"}
          </span>
        </span>
        <ChevronDown size={17} className={`text-faint transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="fade-up absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-xl border border-line bg-surface shadow-xl shadow-black/5">
          <div className="flex items-center gap-2 border-b border-line px-3.5">
          <Search size={16} className="text-faint" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              play("type");
              setQuery(e.target.value);
            }}
            placeholder="search people…"
            className="w-full bg-transparent py-3 text-[15px] outline-none placeholder:text-faint"
          />
          </div>
          <ul className="max-h-72 overflow-y-auto p-1.5" role="listbox">
            {!query && (
              <Option active={value === "everyone"} onClick={() => pick("everyone")}>
                <span className="grid size-7 place-items-center rounded-full border border-line bg-subtle"><Megaphone size={13} /></span>
                <span className="flex-1 text-[15px]">everyone</span>
              </Option>
            )}
            {filtered.map((c) => (
              <Option key={c.id} active={value === c.id} onClick={() => pick(c.id)}>
                <PersonAvatar name={c.name} size={28} />
                <span className="flex-1 text-[15px]">
                  {c.name}
                </span>
              </Option>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-muted">nobody named “{query}”. new phone who dis</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

function Option({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <li role="option" aria-selected={active}>
      <button
        type="button"
        onClick={onClick}
        data-sound-hover="hover"
        className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition hover:bg-subtle ${active ? "bg-subtle" : ""}`}
      >
        {children}
        {active && <Check size={16} />}
      </button>
    </li>
  );
}

const SUCCESS_LINES = [
  "tea spilled.",
  "sent. you're lowkey a legend.",
  "delivered. your secret's safe.",
  "that was brave. proud of u.",
  "message yeeted anonymously.",
];

const CONFETTI_COLORS = ["var(--accent)", "var(--accent)", "var(--text)", "var(--star)", "var(--c-flag)", "var(--c-props)"];

function Confetti() {
  const [pieces] = useState(() =>
    Array.from({ length: 48 }, (_, i) => ({
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      left: 50 + (Math.random() - 0.5) * 16,
      dx: `${(Math.random() - 0.5) * 700}px`,
      dy: `${160 + Math.random() * 420}px`,
      rot: `${(Math.random() - 0.5) * 720}deg`,
      dur: `${1000 + Math.random() * 900}ms`,
      delay: `${Math.random() * 120}ms`,
      w: 4 + Math.random() * 6,
    })),
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti absolute top-[30%] block"
          style={{
            left: `${p.left}%`,
            width: p.w,
            height: p.w * 1.6,
            background: p.color,
            ["--dx" as string]: p.dx,
            ["--dy" as string]: p.dy,
            ["--rot" as string]: p.rot,
            ["--dur" as string]: p.dur,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

function SentScreen({ onAgain }: { onAgain: () => void }) {
  const [line] = useState(() => SUCCESS_LINES[Math.floor(Math.random() * SUCCESS_LINES.length)]);
  useEffect(() => play("party"), []);
  return (
    <div className="fade-up py-16 text-center">
      <Confetti />
      <Tilt className="mx-auto mb-2 w-fit">
        <TeaCup3D size={170} />
      </Tilt>
      <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{line}</h2>
      <p className="mx-auto mt-2 max-w-sm text-[15px] text-muted">
        they&apos;ll never know it was you. only admins can see names.
      </p>
      <div className="mt-8 flex justify-center gap-2">
        <button className="btn" data-sound="open" onClick={onAgain}>write another</button>
        <Link href="/sent" data-sound="tap" className="btn-ghost !px-4 !py-2 !text-sm">see sent</Link>
      </div>
    </div>
  );
}

/** One statement, rated 1–5. Picking the chosen star again clears it: every rating is optional. */
function StarRow({
  name,
  label,
  statement,
  value,
  onChange,
}: {
  name: string;
  label: string;
  statement: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line py-3.5 last:border-0">
      <div className="min-w-48 flex-1">
        <div className="text-[15px] font-medium">{label}</div>
        <div className="text-[13px] text-muted">{statement}</div>
      </div>
      <div className="flex items-center gap-3">
        <div role="radiogroup" aria-label={statement} className="flex" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer p-[3px]" onMouseEnter={() => setHover(n)}>
              <input
                type="radio"
                name={name}
                value={n}
                checked={value === n}
                onChange={() => {
                  play("star");
                  onChange(n);
                }}
                onClick={() => {
                  if (value !== n) return;
                  play("unstar");
                  onChange(0);
                }}
                aria-label={`${n} of 5, ${STAR_WORDS[n]}`}
                className="peer sr-only"
              />
              <span
                className={`block rounded-md transition peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40 ${
                  n <= shown ? "text-star" : "text-faint"
                } ${hover === n ? "scale-110" : ""}`}
              >
                <StarShape filled={n <= shown} size={22} />
              </span>
            </label>
          ))}
        </div>
        <span className={`w-[8.5rem] text-[13px] ${shown ? "text-text" : "text-faint"}`}>{STAR_WORDS[shown]}</span>
      </div>
    </div>
  );
}

type Answers = Record<string, string>;
type Stars = Record<string, number>;
const EMPTY: Record<Audience, { answers: Answers; stars: Stars }> = {
  person: { answers: {}, stars: {} },
  company: { answers: {}, stars: {} },
};

export function Composer({ colleagues, categories }: { colleagues: Colleague[]; categories: readonly string[] }) {
  const [state, action, pending] = useActionState(sendFeedback, undefined);
  const [to, setTo] = useState<Recipient>("everyone");
  // What has been written so far, per audience: switching from a person to everyone and back keeps
  // both drafts, since the two ask different things.
  const [draft, setDraft] = useState(EMPTY);
  // The success result the user has already dismissed with "write another".
  const [dismissed, setDismissed] = useState<FormState>(undefined);
  const formRef = useRef<HTMLFormElement>(null);

  if (state?.success && state !== dismissed) {
    return (
      <SentScreen
        onAgain={() => {
          setDismissed(state);
          setDraft(EMPTY);
          setTo("everyone");
        }}
      />
    );
  }

  const audience: Audience = to === "everyone" ? "company" : "person";
  const person = to === "everyone" ? undefined : colleagues.find((c) => c.id === to);
  const name = person ? firstName(person.name) : "";
  const { answers, stars } = draft[audience];
  const ratings = RATINGS[audience];
  const prompts = PROMPTS[audience];
  const rated = ratings.filter((r) => stars[r.id]).length;
  const answered = prompts.filter((p) => (answers[p.id] ?? "").trim().length >= 5).length;

  const set = (patch: { answers?: Answers; stars?: Stars }) =>
    setDraft((d) => ({
      ...d,
      [audience]: { answers: { ...d[audience].answers, ...patch.answers }, stars: { ...d[audience].stars, ...patch.stars } },
    }));

  return (
    <form
      ref={formRef}
      action={action}
      onSubmit={(e) => {
        // Dispatch by hand: a form action resets the form when it finishes, and a draft someone
        // spent five minutes on must survive "answer at least one question". `action` stays on
        // the form for browsers without JavaScript.
        e.preventDefault();
        play("send");
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
      className="space-y-9"
    >
      <section>
        <div className="field-label">to</div>
        <RecipientPicker colleagues={colleagues} value={to} onChange={setTo} />
      </section>

      <section>
        <div className="field-label">what kind of note?</div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c, i) => {
            const m = CATEGORY_META[c] ?? CATEGORY_META.Other;
            return (
              <label key={c} className="cursor-pointer" title={m.blurb}>
                <input
                  type="radio"
                  name="category"
                  value={c}
                  defaultChecked={i === 0}
                  onChange={() => play("select")}
                  className="peer sr-only"
                />
                <span className="flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm text-muted transition peer-checked:border-text peer-checked:text-text peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40 hover:border-text/30">
                  <Dot color={m.color} />
                  {m.label}
                </span>
              </label>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-[19px] font-semibold tracking-tight">
            {person ? `How is it working with ${name}?` : "How does working here feel?"}
          </h2>
          <span className="meta shrink-0">{rated}/{ratings.length} rated</span>
        </div>
        <p className="mt-1 text-[13px] text-muted">
          {person
            ? "Rate only what you've seen yourself. Skip the rest."
            : "Rate how it is for you, right now. Skip anything you're unsure about."}
        </p>
        <div className="mt-3 rounded-2xl border border-line bg-surface px-4">
          {ratings.map((r) => (
            <StarRow
              key={r.id}
              name={`rating_${r.id}`}
              label={r.label}
              statement={fill(r.statement, name)}
              value={stars[r.id] ?? 0}
              onChange={(v) => set({ stars: { [r.id]: v } })}
            />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-[19px] font-semibold tracking-tight">In your words</h2>
          <span className="meta shrink-0">{answered}/{prompts.length} answered</span>
        </div>
        <p className="mt-1 text-[13px] text-muted">
          Answer at least one. Be specific, be kind, and leave out details that would give you away.
        </p>
        <div className="mt-4 space-y-6">
          {prompts.map((p) => {
            const value = answers[p.id] ?? "";
            return (
              <label key={p.id} className="block">
                <span className="flex items-baseline gap-2 text-[15px] font-medium">
                  {fill(p.question, name)}
                  {p.optional && <span className="meta">optional</span>}
                </span>
                <textarea
                  name={`answer_${p.id}`}
                  maxLength={MAX_ANSWER}
                  rows={3}
                  value={value}
                  onChange={(e) => {
                    play("type");
                    set({ answers: { [p.id]: e.target.value } });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) formRef.current?.requestSubmit();
                  }}
                  placeholder={p.hint}
                  className="field mt-2 resize-y !py-3 !text-[16px] leading-relaxed"
                />
                {value.length > MAX_ANSWER * 0.8 && (
                  <span className="meta mt-1 block text-right">{value.length}/{MAX_ANSWER}</span>
                )}
              </label>
            );
          })}
        </div>
      </section>

      <Status state={state?.error ? state : undefined} />

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <span className="inline-flex items-center gap-1.5 text-[13px] text-muted" title="hidden from whoever you write to. admins can see who wrote each note."><Lock size={13} /> hidden from them · admins can see</span>
        <span className="meta hidden sm:inline">⌘↵ to send</span>
        <button className="btn ml-auto whitespace-nowrap" disabled={pending || answered === 0}>
          {pending ? "sending…" : <>send anonymously <Send size={14} /></>}
        </button>
      </div>
    </form>
  );
}
