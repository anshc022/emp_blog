"use client";

import Link from "next/link";
import { Check, ChevronDown, KeyRound, Lock, Megaphone, Search, Send } from "lucide-react";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import {
  changePassword,
  createEmployee,
  login,
  resetPassword,
  sendFeedback,
  type FormState,
} from "@/lib/actions";
import { PersonAvatar } from "./avatar";
import { CATEGORY_META } from "./category";

function Status({ state }: { state: FormState }) {
  if (state?.error)
    return <p className="rounded-xl bg-accent-soft px-3.5 py-2.5 text-sm font-medium text-accent">{state.error}</p>;
  if (state?.success)
    return (
      <p className="flex items-center gap-2 rounded-xl bg-(--cat-appreciation-soft) px-3.5 py-2.5 text-sm font-medium text-(--cat-appreciation)">
        <Check size={16} strokeWidth={2.6} /> {state.success}
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
  return (
    <form action={action} className="space-y-5">
      <div>
        <label className="field-label" htmlFor="email">Work email</label>
        <input className="field" id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" required />
      </div>
      <div>
        <label className="field-label" htmlFor="password">Password</label>
        <input className="field" id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <Status state={state} />
      <button className="btn-primary w-full py-3" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
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
    return q
      ? colleagues.filter((c) => `${c.name} ${c.department ?? ""}`.toLowerCase().includes(q))
      : colleagues;
  }, [colleagues, query]);

  const selected = value === "everyone" ? null : colleagues.find((c) => c.id === value);
  const pick = (v: "everyone" | number) => {
    setValue(v);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={box} className="relative">
      <input type="hidden" name="recipient" value={value} />
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="field flex items-center gap-3 !py-2 text-left"
      >
        {selected ? (
          <PersonAvatar name={selected.name} size={32} />
        ) : (
          <span className="grid size-8 place-items-center rounded-full bg-ink text-paper">
            <Megaphone size={15} />
          </span>
        )}
        <span className="flex-1">
          <span className="block font-semibold">{selected ? selected.name : "Everyone"}</span>
          <span className="block text-xs text-faint">
            {selected ? (selected.department ?? "Colleague") : "The whole company will see this"}
          </span>
        </span>
        <ChevronDown size={18} className={`text-faint transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="rise absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl shadow-black/10">
          <div className="flex items-center gap-2 border-b border-line px-3.5">
            <Search size={16} className="text-faint" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people or teams…"
              className="w-full bg-transparent py-3 text-[15px] outline-none placeholder:text-faint"
            />
          </div>
          <ul className="max-h-72 overflow-y-auto p-1.5" role="listbox">
            {!query && (
              <Option active={value === "everyone"} onClick={() => pick("everyone")}>
                <span className="grid size-8 place-items-center rounded-full bg-ink text-paper">
                  <Megaphone size={15} />
                </span>
                <span className="flex-1">
                  <span className="block font-semibold">Everyone</span>
                  <span className="block text-xs text-faint">Company-wide</span>
                </span>
              </Option>
            )}
            {filtered.map((c) => (
              <Option key={c.id} active={value === c.id} onClick={() => pick(c.id)}>
                <PersonAvatar name={c.name} size={32} />
                <span className="flex-1">
                  <span className="block font-medium">{c.name}</span>
                  {c.department && <span className="block text-xs text-faint">{c.department}</span>}
                </span>
              </Option>
            ))}
            {filtered.length === 0 && <li className="px-3 py-6 text-center text-sm text-faint">No one matches “{query}”</li>}
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
        className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-[15px] transition hover:bg-sunken ${active ? "bg-sunken" : ""}`}
      >
        {children}
        {active && <Check size={16} className="text-accent" strokeWidth={2.6} />}
      </button>
    </li>
  );
}

export function Composer({ colleagues, categories }: { colleagues: Colleague[]; categories: readonly string[] }) {
  const [state, action, pending] = useActionState(sendFeedback, undefined);
  const [length, setLength] = useState(0);
  // The success result the user has already dismissed with "Write another".
  const [dismissed, setDismissed] = useState<FormState>(undefined);

  if (state?.success && state !== dismissed) {
    return (
      <div className="rise panel flex flex-col items-center px-6 py-16 text-center">
        <div className="mb-5 grid size-16 place-items-center rounded-full bg-(--cat-appreciation-soft) text-(--cat-appreciation)">
          <Check size={30} strokeWidth={2.6} />
        </div>
        <h2 className="font-display text-3xl font-semibold">Sent. Anonymously.</h2>
        <p className="mt-2 max-w-sm text-muted">
          Thank you for speaking up. Your name stays hidden from everyone except super admins.
        </p>
        <div className="mt-8 flex gap-3">
          <button
            className="btn-primary"
            onClick={() => {
              setDismissed(state);
              setLength(0);
            }}
          >
            Write another
          </button>
          <Link href="/sent" className="btn-quiet !px-5 !py-2.5 !text-sm">See what you sent</Link>
        </div>
      </div>
    );
  }

  const max = 2000;
  const pct = Math.min(1, length / max);

  return (
    <form action={action} onReset={() => setLength(0)} className="panel overflow-hidden">
      <div className="space-y-7 p-5 sm:p-7">
        <section>
          <div className="eyebrow mb-2.5">1 · To</div>
          <RecipientPicker colleagues={colleagues} />
        </section>

        <section>
          <div className="eyebrow mb-2.5">2 · What kind</div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {categories.map((c, i) => {
              const { icon: Icon, blurb } = CATEGORY_META[c] ?? CATEGORY_META.Other;
              return (
                <label key={c} data-cat={c} className="cursor-pointer">
                  <input type="radio" name="category" value={c} defaultChecked={i === 0} className="peer sr-only" />
                  <span className="flex h-full flex-col gap-2 rounded-xl border border-line bg-surface p-3 transition peer-checked:border-(--c) peer-checked:bg-(--c-soft) peer-checked:[&_.ico]:bg-(--c) peer-checked:[&_.ico]:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-ink/10 hover:border-ink/25">
                    <span className="ico grid size-8 place-items-center rounded-lg bg-(--c-soft) text-(--c) transition">
                      <Icon size={16} strokeWidth={2.4} />
                    </span>
                    <span className="text-sm font-semibold">{c}</span>
                    <span className="text-xs leading-snug text-muted">{blurb}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        <section>
          <div className="eyebrow mb-2.5">3 · Say it</div>
          <textarea
            name="message"
            maxLength={max}
            required
            rows={6}
            placeholder="Be specific and kind. What happened, how did it land, and what would help?"
            onChange={(e) => setLength(e.target.value.length)}
            className="w-full resize-none rounded-xl border border-line bg-paper/60 p-4 font-display text-[19px] leading-relaxed outline-none transition placeholder:font-sans placeholder:text-[15px] placeholder:text-faint focus:border-ink/30 focus:bg-surface focus:ring-4 focus:ring-ink/5"
          />
        </section>

        <Status state={state?.error ? state : undefined} />
      </div>

      <div className="flex items-center gap-4 border-t border-line bg-sunken/50 px-5 py-4 sm:px-7">
        <span className="flex items-center gap-2 text-xs text-muted">
          <Lock size={14} /> Your name is hidden from the recipient
        </span>
        <span className="ml-auto flex items-center gap-2 text-xs tabular-nums text-faint">
          <svg viewBox="0 0 20 20" className="size-5 -rotate-90">
            <circle cx="10" cy="10" r="8" fill="none" stroke="var(--line)" strokeWidth="2.5" />
            <circle
              cx="10" cy="10" r="8" fill="none" strokeWidth="2.5" strokeLinecap="round"
              stroke={pct > 0.9 ? "var(--accent)" : "var(--ink)"}
              strokeOpacity={length ? 1 : 0}
              strokeDasharray={`${pct * 50.3} 50.3`}
            />
          </svg>
          <span className="hidden sm:inline">{length}/{max}</span>
        </span>
        <button className="btn-accent" disabled={pending || length < 5}>
          {pending ? "Sending…" : <>Send <Send size={15} strokeWidth={2.4} /></>}
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
        <label className="field-label" htmlFor="current">Current password</label>
        <input className="field" id="current" name="current" type="password" autoComplete="current-password" required />
      </div>
      <div>
        <label className="field-label" htmlFor="next">New password</label>
        <input className="field" id="next" name="next" type="password" autoComplete="new-password" minLength={8} required />
      </div>
      <Status state={state} />
      <button className="btn-primary" disabled={pending}>Update password</button>
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
        <label className="field-label" htmlFor="name">Full name</label>
        <input className="field" id="name" name="name" placeholder="Ankita Sharma" required />
      </div>
      <div>
        <label className="field-label" htmlFor="new-email">Work email</label>
        <input className="field" id="new-email" name="email" type="email" placeholder="ankita@company.com" required />
      </div>
      <div>
        <label className="field-label" htmlFor="department">Team</label>
        <input className="field" id="department" name="department" placeholder="Design (optional)" />
      </div>
      <div>
        <label className="field-label" htmlFor="temp-password">Temporary password</label>
        <input className="field" id="temp-password" name="password" minLength={8} placeholder="At least 8 characters" required />
      </div>
      <div className="sm:col-span-2 flex flex-wrap items-center gap-4">
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input type="checkbox" name="role" value="admin" className="size-4 accent-(--accent)" />
          Make super admin <span className="text-faint">(can see who wrote what)</span>
        </label>
        <button className="btn-primary ml-auto" disabled={pending}>Add person</button>
      </div>
      <div className="sm:col-span-2"><Status state={state} /></div>
    </form>
  );
}

export function ResetPasswordForm({ id }: { id: number }) {
  const [state, action, pending] = useActionState(resetPassword, undefined);
  const ref = useResetOnSuccess(state);
  return (
    <details className="group relative">
      <summary className="btn-quiet cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <KeyRound size={13} /> {state?.success ? "Reset ✓" : "Password"}
      </summary>
      <form
        ref={ref}
        action={action}
        className="absolute right-0 z-20 mt-2 w-64 space-y-2 rounded-xl border border-line bg-surface p-3 shadow-2xl shadow-black/10"
      >
        <input type="hidden" name="id" value={id} />
        <input className="field !py-2 !text-sm" name="password" placeholder="New temporary password" minLength={8} required />
        <button className="btn-primary w-full !py-2" disabled={pending}>Set password</button>
        {state?.error && <p className="text-xs text-accent">{state.error}</p>}
        {state?.success && <p className="text-xs text-(--cat-appreciation)">Password updated.</p>}
      </form>
    </details>
  );
}
