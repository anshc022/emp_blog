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
import { CATEGORY_META } from "./category";

function Status({ state }: { state: FormState }) {
  useEffect(() => {
    if (state?.error) play("error");
    else if (state?.success) play("success");
  }, [state]);
  if (state?.error)
    return <p className="pop-in rounded-2xl bg-coral px-4 py-2.5 text-sm font-bold text-on-bright">{state.error}</p>;
  if (state?.success)
    return <p className="pop-in rounded-2xl bg-lime px-4 py-2.5 text-sm font-bold text-on-bright">{state.success}</p>;
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
      className="space-y-5"
    >
      <div>
        <label className="field-label" htmlFor="email">work email 📧</label>
        <input className="field" id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" required />
      </div>
      <div>
        <label className="field-label" htmlFor="password">password 🤫</label>
        <div className="relative">
          <input className="field pr-14" id="password" name="password" type={peek ? "text" : "password"} autoComplete="current-password" placeholder="••••••••" required />
          <button
            type="button"
            onClick={() => {
              play(peek ? "close" : "open");
              setPeek((p) => !p);
            }}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-xl transition hover:scale-125"
            aria-label={peek ? "Hide password" : "Show password"}
          >
            {peek ? "🙉" : "🙈"}
          </button>
        </div>
      </div>
      <Status state={state} />
      <button className="btn-grad w-full py-3.5 text-lg" disabled={pending}>
        {pending ? "checking the vibes…" : "let me in 🚪"}
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
        className="press flex w-full items-center gap-3 rounded-2xl border border-line bg-surface-strong px-3 py-2.5 text-left"
      >
        {selected ? (
          <PersonAvatar name={selected.name} size={42} />
        ) : (
          <span className="grid size-[42px] place-items-center rounded-full bg-blue text-xl">📣</span>
        )}
        <span className="flex-1">
          <span className="block text-lg leading-tight font-extrabold">{selected ? selected.name : "everyone"}</span>
          <span className="block text-sm text-muted">
            {selected ? (selected.department ?? "coworker") : "the whole company sees this"}
          </span>
        </span>
        <span className={`text-lg transition ${open ? "rotate-180" : ""}`}>👇</span>
      </button>

      {open && (
        <div className="pop-in brut absolute inset-x-0 top-full z-40 mt-3 overflow-hidden !bg-surface-strong">
          <div className="flex items-center gap-2 border-b border-line px-4">
            <span>🔍</span>
            <input
              autoFocus
              value={query}
              onChange={(e) => {
                play("type");
                setQuery(e.target.value);
              }}
              placeholder="search the squad…"
              className="w-full bg-transparent py-3.5 text-base font-medium outline-none placeholder:text-faint"
            />
          </div>
          <ul className="max-h-72 overflow-y-auto p-2" role="listbox">
            {!query && (
              <Option active={value === "everyone"} onClick={() => pick("everyone")}>
                <span className="grid size-9 place-items-center rounded-full bg-blue">📣</span>
                <span className="flex-1">
                  <span className="block font-extrabold">everyone</span>
                  <span className="block text-xs text-muted">company-wide announcement energy</span>
                </span>
              </Option>
            )}
            {filtered.map((c) => (
              <Option key={c.id} active={value === c.id} onClick={() => pick(c.id)}>
                <PersonAvatar name={c.name} size={36} />
                <span className="flex-1">
                  <span className="block font-bold">{c.name}</span>
                  {c.department && <span className="block text-xs text-muted">{c.department}</span>}
                </span>
              </Option>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-8 text-center text-sm text-muted">no one named “{query}” here 🕵️</li>
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
        className={`flex w-full items-center gap-3 rounded-2xl px-2.5 py-2 text-left transition ${
          active ? "bg-pink text-on-bright" : "hover:bg-sunken"
        }`}
      >
        {children}
        {active && <span>✅</span>}
      </button>
    </li>
  );
}

/** How the message is shaping up, in emoji. */
function vibe(length: number, shouting: boolean): [string, string] {
  if (shouting) return ["😤", "caps lock is cruise control for cool… maybe chill?"];
  if (length === 0) return ["🤐", "cat got your tongue?"];
  if (length < 5) return ["👀", "keep going…"];
  if (length < 60) return ["✍️", "short & sweet"];
  if (length < 280) return ["🔥", "now we're talking"];
  if (length < 900) return ["📝", "detailed. love that"];
  if (length < 1800) return ["📜", "ok novelist"];
  return ["🫠", "almost at the limit"];
}

const SUCCESS_LINES = [
  "tea has been spilled ☕",
  "sent. you're lowkey a legend 🫡",
  "delivered. your secret's safe 🤐",
  "that was brave. proud of u 🥹",
  "message yeeted anonymously 🚀",
];

const CONFETTI_BITS = ["🎉", "✨", "⭐", "💖", "☕", "🫶", "", "", "", "", "", ""];
const CONFETTI_COLORS = ["#ff4f9a", "#ffae4f", "#8b5cf6", "#52cfc0", "#ffcc4d", "#78a9ff"];

function Confetti() {
  const [pieces] = useState(() =>
    Array.from({ length: 70 }, (_, i) => ({
      bit: CONFETTI_BITS[i % CONFETTI_BITS.length],
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      left: 50 + (Math.random() - 0.5) * 20,
      dx: `${(Math.random() - 0.5) * 900}px`,
      dy: `${200 + Math.random() * 500}px`,
      rot: `${(Math.random() - 0.5) * 900}deg`,
      dur: `${1100 + Math.random() * 1100}ms`,
      delay: `${Math.random() * 150}ms`,
      size: 8 + Math.random() * 10,
    })),
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti absolute top-[28%]"
          style={{
            left: `${p.left}%`,
            ["--dx" as string]: p.dx,
            ["--dy" as string]: p.dy,
            ["--rot" as string]: p.rot,
            ["--dur" as string]: p.dur,
            animationDelay: p.delay,
          }}
        >
          {p.bit ? (
            <span style={{ fontSize: p.size + 10 }}>{p.bit}</span>
          ) : (
            <span
              className="block rounded-[3px]"
              style={{ width: p.size, height: p.size * 0.6, background: p.color }}
            />
          )}
        </span>
      ))}
    </div>
  );
}

function SentScreen({ onAgain }: { onAgain: () => void }) {
  const [line] = useState(() => SUCCESS_LINES[Math.floor(Math.random() * SUCCESS_LINES.length)]);
  useEffect(() => play("party"), []);
  return (
    <div
      className="brut relative flex flex-col items-center overflow-hidden !border-white/30 px-6 py-16 text-center text-white"
      style={{ backgroundImage: "var(--grad)" }}
    >
      <Confetti />
      <div className="bounce-in mb-5 text-7xl">🫖</div>
      <h2 className="bounce-in w-full max-w-lg text-4xl leading-[0.95] font-extrabold tracking-tight text-balance sm:text-5xl" style={{ animationDelay: "120ms" }}>
        {line}
      </h2>
      <p className="mt-3 max-w-sm text-[17px] font-medium text-white/90">
        they&apos;ll never know it was you. only super admins can see names 🤫
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button className="btn bg-white" data-sound="open" onClick={onAgain}>spill more ☕</button>
        <Link href="/sent" data-sound="tap" className="btn bg-white/20 !text-white ring-1 ring-white/50">my receipts 🧾</Link>
      </div>
    </div>
  );
}

export function Composer({ colleagues, categories }: { colleagues: Colleague[]; categories: readonly string[] }) {
  const [state, action, pending] = useActionState(sendFeedback, undefined);
  const [text, setText] = useState("");
  // The success result the user has already dismissed with "spill more".
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
  const [emoji, mood] = vibe(text.trim().length, shouting);
  const pct = Math.min(1, text.length / max);

  return (
    <form
      ref={formRef}
      action={action}
      onSubmit={() => play("send")}
      onReset={() => setText("")}
      className="brut overflow-visible"
    >
      <div className="space-y-8 p-5 sm:p-7">
        <section>
          <StepLabel n={1} color="linear-gradient(135deg,#78a9ff,#8b5cf6)">who&apos;s it for? 🎯</StepLabel>
          <RecipientPicker colleagues={colleagues} />
        </section>

        <section>
          <StepLabel n={2} color="linear-gradient(135deg,#ffcc4d,#ff8a4f)">what&apos;s the vibe?</StepLabel>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categories.map((c, i) => {
              const m = CATEGORY_META[c] ?? CATEGORY_META.Other;
              return (
                <label key={c} className="cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    value={c}
                    defaultChecked={i === 0}
                    onChange={() => play("select")}
                    className="peer sr-only"
                  />
                  <span
                    className="press flex h-full flex-col items-start gap-1 rounded-2xl border border-line bg-surface-strong p-3.5 peer-checked:scale-[1.03] peer-checked:border-transparent peer-checked:bg-(--c) peer-checked:text-on-bright peer-checked:shadow-[0_14px_30px_-12px_var(--glow)] peer-checked:[&_.emo]:scale-125 peer-checked:[&_.emo]:-rotate-6 peer-focus-visible:ring-4 peer-focus-visible:ring-hot/30"
                    style={{ ["--c" as string]: m.color }}
                  >
                    <span className="emo text-3xl transition">{m.emoji}</span>
                    <span className="text-[17px] font-extrabold">{m.label}</span>
                    <span className="text-[13px] leading-snug opacity-75">{m.blurb}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        <section>
          <StepLabel n={3} color="var(--grad)">say it (nicely) ✍️</StepLabel>
          <textarea
            name="message"
            maxLength={max}
            required
            rows={6}
            value={text}
            onChange={(e) => {
              play("type");
              setText(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) formRef.current?.requestSubmit();
            }}
            placeholder="be specific, be real, be kind. what happened + what would make it a W?"
            className="w-full resize-none rounded-2xl border border-line bg-surface-strong p-4 text-[19px] leading-relaxed font-medium outline-none transition placeholder:text-base placeholder:font-normal placeholder:text-faint focus:border-hot/50 focus:ring-4 focus:ring-hot/15"
          />
          <div className="mt-2 flex items-center gap-2 text-sm font-bold">
            <span key={emoji} className="bounce-in text-2xl">{emoji}</span>
            <span className={shouting ? "text-hot" : "text-muted"}>{mood}</span>
            <span className="ml-auto flex items-center gap-2 font-mono text-xs text-faint">
              <span className="h-2 w-20 overflow-hidden rounded-full bg-sunken">
                <span
                  className="block h-full transition-all"
                  style={{ width: `${pct * 100}%`, backgroundImage: pct > 0.9 ? "linear-gradient(90deg,#ff4f4f,#ff4f9a)" : "var(--grad)" }}
                />
              </span>
              {text.length}/{max}
            </span>
          </div>
        </section>

        <Status state={state?.error ? state : undefined} />
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-b-[28px] border-t border-line bg-sunken px-5 py-4 sm:px-7">
        <span className="text-sm font-bold">🕶️ you&apos;re incognito</span>
        <span className="tag hidden text-faint sm:inline">⌘/ctrl + enter to send</span>
        <button className="btn-grad ml-auto" disabled={pending || text.trim().length < 5}>
          {pending ? "spilling…" : "spill it 🫖"}
        </button>
      </div>
    </form>
  );
}

function StepLabel({ n, color, children }: { n: number; color: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2.5 text-lg font-extrabold">
      <span
        className="grid size-7 place-items-center rounded-full font-mono text-sm text-white shadow-[0_6px_14px_-6px_var(--glow)]"
        style={{ backgroundImage: color }}
      >
        {n}
      </span>
      {children}
    </div>
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
        <label className="field-label" htmlFor="next">new password (make it spicy 🌶️)</label>
        <input className="field" id="next" name="next" type="password" autoComplete="new-password" minLength={8} required />
      </div>
      <Status state={state} />
      <button className="btn-grad" disabled={pending}>update password 🔐</button>
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
        <input className="field" id="department" name="department" placeholder="design (optional)" />
      </div>
      <div>
        <label className="field-label" htmlFor="temp-password">temp password</label>
        <input className="field" id="temp-password" name="password" minLength={8} placeholder="8+ characters" required />
      </div>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm font-bold">
          <input type="checkbox" name="role" value="admin" onChange={() => play("select")} className="size-5 accent-[#ff4f9a]" />
          👑 make super admin <span className="font-normal text-muted">(sees who wrote what)</span>
        </label>
        <button className="btn-grad ml-auto" disabled={pending}>add to squad ➕</button>
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
      <summary data-sound="open" className="btn-sm cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        🔑 {state?.success ? "reset ✅" : "password"}
      </summary>
      <form ref={ref} action={action} className="pop-in brut absolute right-0 z-20 mt-3 w-64 space-y-2 p-3">
        <input type="hidden" name="id" value={id} />
        <input className="field !py-2 !text-sm" name="password" placeholder="new temp password" minLength={8} required />
        <button className="btn-grad w-full !py-2 !text-sm" disabled={pending}>set it</button>
        {state?.error && <p className="text-xs font-bold text-hot">{state.error}</p>}
        {state?.success && <p className="text-xs font-bold">done ✅</p>}
      </form>
    </details>
  );
}
