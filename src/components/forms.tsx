"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import {
  changePassword,
  createEmployee,
  login,
  resetPassword,
  sendFeedback,
  type FormState,
} from "@/lib/actions";
import { play } from "@/lib/sound";
import { PersonAvatar } from "./avatar";
import { CATEGORY_META, Dot } from "./category";

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

/** Clears the form after a successful submit. */
function useResetOnSuccess(state: FormState) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.success) ref.current?.reset();
  }, [state]);
  return ref;
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
        <input className="field" id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" required />
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
            {peek ? "🙉" : "🙈"}
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

type Colleague = { id: number; name: string; department: string | null };

function RecipientPicker({ colleagues }: { colleagues: Colleague[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [value, setValue] = useState<"everyone" | number>("everyone");
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? colleagues.filter((c) => `${c.name} ${c.department ?? ""}`.toLowerCase().includes(q)) : colleagues;
  }, [colleagues, query]);

  const selected = value === "everyone" ? null : colleagues.find((c) => c.id === value);
  const pick = (v: "everyone" | number) => {
    play("select");
    setValue(v);
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
        className="flex w-full items-center gap-3 rounded-xl border border-line px-3 py-2.5 text-left transition hover:border-text/30"
      >
        {selected ? (
          <PersonAvatar name={selected.name} size={32} />
        ) : (
          <span className="grid size-8 place-items-center rounded-full border border-line bg-subtle text-sm">📣</span>
        )}
        <span className="flex-1">
          <span className="block text-[15px] font-medium">{selected ? selected.name : "everyone"}</span>
          <span className="block text-[13px] text-muted">
            {selected ? (selected.department ?? "coworker") : "the whole company sees this"}
          </span>
        </span>
        <span className={`text-faint transition ${open ? "rotate-180" : ""}`}>↓</span>
      </button>

      {open && (
        <div className="fade-up absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-xl border border-line bg-bg shadow-xl shadow-black/5">
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              play("type");
              setQuery(e.target.value);
            }}
            placeholder="search people…"
            className="w-full border-b border-line bg-transparent px-4 py-3 text-[15px] outline-none placeholder:text-faint"
          />
          <ul className="max-h-72 overflow-y-auto p-1.5" role="listbox">
            {!query && (
              <Option active={value === "everyone"} onClick={() => pick("everyone")}>
                <span className="grid size-7 place-items-center rounded-full border border-line bg-subtle text-xs">📣</span>
                <span className="flex-1 text-[15px]">everyone</span>
              </Option>
            )}
            {filtered.map((c) => (
              <Option key={c.id} active={value === c.id} onClick={() => pick(c.id)}>
                <PersonAvatar name={c.name} size={28} />
                <span className="flex-1 text-[15px]">
                  {c.name} {c.department && <span className="text-muted">· {c.department}</span>}
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
        {active && <span className="text-sm">✓</span>}
      </button>
    </li>
  );
}

/** How the message is shaping up. */
function vibe(length: number, shouting: boolean): string {
  if (shouting) return "😤 caps lock is cruise control for cool. maybe chill?";
  if (length === 0) return "🤐 cat got your tongue?";
  if (length < 5) return "👀 keep going…";
  if (length < 60) return "✍️ short and sweet";
  if (length < 280) return "🔥 now we're talking";
  if (length < 900) return "📝 detailed. love that";
  if (length < 1800) return "📜 ok novelist";
  return "🫠 almost at the limit";
}

const SUCCESS_LINES = [
  "tea spilled.",
  "sent. you're lowkey a legend.",
  "delivered. your secret's safe.",
  "that was brave. proud of u.",
  "message yeeted anonymously.",
];

const CONFETTI_COLORS = ["var(--text)", "var(--text)", "var(--text)", "var(--star)", "var(--c-flag)", "var(--c-props)"];

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
      <div className="mb-6 text-5xl">🫖</div>
      <h2 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{line}</h2>
      <p className="mx-auto mt-2 max-w-sm text-[15px] text-muted">
        they&apos;ll never know it was you. only super admins can see names.
      </p>
      <div className="mt-8 flex justify-center gap-2">
        <button className="btn" data-sound="open" onClick={onAgain}>write another</button>
        <Link href="/sent" data-sound="tap" className="btn-ghost !px-4 !py-2 !text-sm">see sent</Link>
      </div>
    </div>
  );
}

export function Composer({ colleagues, categories }: { colleagues: Colleague[]; categories: readonly string[] }) {
  const [state, action, pending] = useActionState(sendFeedback, undefined);
  const [text, setText] = useState("");
  // The success result the user has already dismissed with "write another".
  const [dismissed, setDismissed] = useState<FormState>(undefined);
  const formRef = useRef<HTMLFormElement>(null);

  if (state?.success && state !== dismissed) {
    return (
      <SentScreen
        onAgain={() => {
          setDismissed(state);
          setText("");
        }}
      />
    );
  }

  const max = 2000;
  const letters = text.replace(/[^a-z]/gi, "");
  const shouting = letters.length > 12 && letters === letters.toUpperCase();

  return (
    <form
      ref={formRef}
      action={action}
      onSubmit={() => play("send")}
      onReset={() => setText("")}
      className="space-y-7"
    >
      <section>
        <div className="field-label">to</div>
        <RecipientPicker colleagues={colleagues} />
      </section>

      <section>
        <div className="field-label">vibe</div>
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
                <span className="flex items-center gap-2 rounded-full border border-line px-3.5 py-1.5 text-sm text-muted transition peer-checked:border-text peer-checked:text-text peer-focus-visible:ring-2 peer-focus-visible:ring-text/20 hover:border-text/30">
                  <Dot color={m.color} />
                  {m.label}
                </span>
              </label>
            );
          })}
        </div>
      </section>

      <section>
        <div className="field-label">message</div>
        <textarea
          name="message"
          maxLength={max}
          required
          rows={7}
          value={text}
          onChange={(e) => {
            play("type");
            setText(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) formRef.current?.requestSubmit();
          }}
          placeholder="be specific, be real, be kind. what happened, and what would make it better?"
          className="field resize-none !py-3 !text-[16px] leading-relaxed"
        />
        <div className="mt-2 flex items-center justify-between gap-3 text-[13px]">
          <span className={shouting ? "text-text" : "text-muted"}>{vibe(text.trim().length, shouting)}</span>
          <span className="meta">
            {text.length}/{max}
          </span>
        </div>
      </section>

      <Status state={state?.error ? state : undefined} />

      <div className="flex items-center gap-3 border-t border-line pt-5">
        <span className="text-[13px] text-muted">🕶️ your name stays hidden</span>
        <span className="meta hidden sm:inline">⌘↵ to send</span>
        <button className="btn ml-auto" disabled={pending || text.trim().length < 5}>
          {pending ? "sending…" : "send anonymously"}
        </button>
      </div>
    </form>
  );
}

/* ------------------------------ Account ----------------------------- */

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePassword, undefined);
  const ref = useResetOnSuccess(state);
  return (
    <form ref={ref} action={action} className="space-y-4">
      <div>
        <label className="field-label" htmlFor="current">current password</label>
        <input className="field" id="current" name="current" type="password" autoComplete="current-password" required />
      </div>
      <div>
        <label className="field-label" htmlFor="next">new password</label>
        <input className="field" id="next" name="next" type="password" autoComplete="new-password" minLength={8} required />
      </div>
      <Status state={state} />
      <button className="btn" disabled={pending}>update password</button>
    </form>
  );
}

/* ------------------------------- Admin ------------------------------ */

export function AddEmployeeForm() {
  const [state, action, pending] = useActionState(createEmployee, undefined);
  const ref = useResetOnSuccess(state);
  return (
    <form ref={ref} action={action} className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="field-label" htmlFor="name">full name</label>
        <input className="field" id="name" name="name" placeholder="Ankita Sharma" required />
      </div>
      <div>
        <label className="field-label" htmlFor="new-email">work email</label>
        <input className="field" id="new-email" name="email" type="email" placeholder="ankita@company.com" required />
      </div>
      <div>
        <label className="field-label" htmlFor="department">team</label>
        <input className="field" id="department" name="department" placeholder="optional" />
      </div>
      <div>
        <label className="field-label" htmlFor="temp-password">temporary password</label>
        <input className="field" id="temp-password" name="password" minLength={8} placeholder="8+ characters" required />
      </div>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" name="role" value="admin" onChange={() => play("select")} className="size-4 accent-[var(--text)]" />
          super admin <span className="text-muted">(can see who wrote what)</span>
        </label>
        <button className="btn ml-auto" disabled={pending}>add person</button>
      </div>
      <div className="sm:col-span-2"><Status state={state} /></div>
    </form>
  );
}

export function ResetPasswordForm({ id }: { id: number }) {
  const [state, action, pending] = useActionState(resetPassword, undefined);
  const ref = useResetOnSuccess(state);
  return (
    <details className="relative">
      <summary data-sound="open" className="btn-ghost cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        {state?.success ? "reset ✓" : "password"}
      </summary>
      <form ref={ref} action={action} className="fade-up absolute right-0 z-20 mt-2 w-60 space-y-2 rounded-xl border border-line bg-bg p-3 shadow-xl shadow-black/5">
        <input type="hidden" name="id" value={id} />
        <input className="field !py-2 !text-sm" name="password" placeholder="new temp password" minLength={8} required />
        <button className="btn w-full" disabled={pending}>set password</button>
        {state?.error && <p className="text-xs text-muted">{state.error}</p>}
      </form>
    </details>
  );
}
