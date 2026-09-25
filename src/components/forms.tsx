"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  changePassword,
  createEmployee,
  login,
  resetPassword,
  sendFeedback,
  type FormState,
} from "@/lib/actions";

function Status({ state }: { state: FormState }) {
  if (state?.error) return <p className="text-sm text-red-600">{state.error}</p>;
  if (state?.success) return <p className="text-sm text-emerald-600">{state.success}</p>;
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

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="email">Work email</label>
        <input className="input" id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input className="input" id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <Status state={state} />
      <button className="btn w-full" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}

export function GiveFeedbackForm({
  colleagues,
  categories,
}: {
  colleagues: { id: number; name: string; department: string | null }[];
  categories: readonly string[];
}) {
  const [state, action, pending] = useActionState(sendFeedback, undefined);
  const ref = useResetOnSuccess(state);
  const [length, setLength] = useState(0);

  return (
    <form ref={ref} action={action} className="space-y-4" onReset={() => setLength(0)}>
      <div>
        <label className="label" htmlFor="recipient">Who is this for?</label>
        <select className="input" id="recipient" name="recipient" defaultValue="everyone">
          <option value="everyone">Everyone (whole company)</option>
          {colleagues.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}{c.department ? ` · ${c.department}` : ""}
            </option>
          ))}
        </select>
      </div>
      <div>
        <span className="label">Type</span>
        <div className="flex flex-wrap gap-2">
          {categories.map((c, i) => (
            <label key={c} className="cursor-pointer">
              <input type="radio" name="category" value={c} defaultChecked={i === 0} className="peer sr-only" />
              <span className="inline-block rounded-full border border-zinc-300 px-3 py-1 text-sm peer-checked:border-indigo-600 peer-checked:bg-indigo-50 peer-checked:text-indigo-700">
                {c}
              </span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="label" htmlFor="message">Your feedback</label>
        <textarea
          className="input min-h-36"
          id="message"
          name="message"
          maxLength={2000}
          required
          placeholder="Be specific, honest and kind. What happened, and what would help?"
          onChange={(e) => setLength(e.target.value.length)}
        />
        <p className="mt-1 text-right text-xs text-zinc-400">{length}/2000</p>
      </div>
      <Status state={state} />
      <button className="btn" disabled={pending}>{pending ? "Sending…" : "Send anonymously"}</button>
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePassword, undefined);
  const ref = useResetOnSuccess(state);
  return (
    <form ref={ref} action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="current">Current password</label>
        <input className="input" id="current" name="current" type="password" autoComplete="current-password" required />
      </div>
      <div>
        <label className="label" htmlFor="next">New password</label>
        <input className="input" id="next" name="next" type="password" autoComplete="new-password" minLength={8} required />
      </div>
      <Status state={state} />
      <button className="btn" disabled={pending}>Update password</button>
    </form>
  );
}

export function AddEmployeeForm() {
  const [state, action, pending] = useActionState(createEmployee, undefined);
  const ref = useResetOnSuccess(state);
  return (
    <form ref={ref} action={action} className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="label" htmlFor="name">Full name</label>
        <input className="input" id="name" name="name" required />
      </div>
      <div>
        <label className="label" htmlFor="new-email">Email</label>
        <input className="input" id="new-email" name="email" type="email" required />
      </div>
      <div>
        <label className="label" htmlFor="department">Department</label>
        <input className="input" id="department" name="department" placeholder="Optional" />
      </div>
      <div>
        <label className="label" htmlFor="temp-password">Temporary password</label>
        <input className="input" id="temp-password" name="password" minLength={8} required />
      </div>
      <div>
        <label className="label" htmlFor="role">Role</label>
        <select className="input" id="role" name="role" defaultValue="employee">
          <option value="employee">Employee</option>
          <option value="admin">Super admin</option>
        </select>
      </div>
      <div className="flex items-end">
        <button className="btn w-full" disabled={pending}>Add employee</button>
      </div>
      <div className="sm:col-span-2"><Status state={state} /></div>
    </form>
  );
}

export function ResetPasswordForm({ id }: { id: number }) {
  const [state, action, pending] = useActionState(resetPassword, undefined);
  const ref = useResetOnSuccess(state);
  return (
    <form ref={ref} action={action} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <input className="input !py-1 !text-xs w-32" name="password" placeholder="New password" minLength={8} required />
      <button className="btn-ghost" disabled={pending}>Reset</button>
      {state?.error && <span className="text-xs text-red-600">{state.error}</span>}
      {state?.success && <span className="text-xs text-emerald-600">Done</span>}
    </form>
  );
}
