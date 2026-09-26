"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowRightIcon, BackpackIcon, ChalkboardTeacherIcon, CheckCircleIcon, CircleNotchIcon } from "@phosphor-icons/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";
import type { AuthUser } from "@/lib/jwt";
import { cn } from "@/lib/utils";

type Role = AuthUser["role"];

const ROLE_OPTIONS: { value: Role; label: string; hint: string; icon: typeof BackpackIcon }[] = [
  { value: "student", label: "Student", hint: "Join sessions & ask", icon: BackpackIcon },
  { value: "teacher", label: "Teacher", hint: "Run sessions & answer", icon: ChalkboardTeacherIcon },
];

function destination(role: Role, next: string | null) {
  const home = role === "teacher" ? "/teacher" : "/join";
  if (!next || !next.startsWith("/") || next.startsWith("//")) return home;
  const teacherOnly = next.startsWith("/teacher");
  const studentOnly = next.startsWith("/join") || next.startsWith("/session");
  if ((teacherOnly && role !== "teacher") || (studentOnly && role !== "student")) return home;
  return next;
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const params = useSearchParams();
  const [role, setRole] = useState<Role>(params.get("role") === "teacher" ? "teacher" : "student");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const body =
      mode === "register"
        ? { name: form.get("name"), email: form.get("email"), password: form.get("password"), role }
        : { email: form.get("email"), password: form.get("password") };

    setPending(true);
    setError(null);
    try {
      const { user } = await api<{ user: AuthUser }>(`/api/auth/${mode}`, { method: "POST", body });
      const first = user.name.replace(/^(prof|dr|mr|ms|mrs)\.?\s+/i, "").split(" ")[0];
      toast.success(mode === "register" ? `Welcome, ${first}!` : `Welcome back, ${first}!`);
      router.replace(destination(user.role, params.get("next")));
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setPending(false);
    }
  }

  const other = mode === "login" ? "/register" : "/login";
  const nextParam = params.get("next") ? `?next=${encodeURIComponent(params.get("next")!)}` : "";

  return (
    <div>
      <h1 className="text-4xl leading-tight font-extrabold sm:text-5xl">
        {mode === "login" ? (
          <>
            welcome <span className="font-serif-i text-primary font-normal">back</span>
          </>
        ) : (
          <>
            let&apos;s get you <span className="font-serif-i text-primary font-normal">in</span>
          </>
        )}
      </h1>
      <p className="text-muted-foreground mt-2">
        {mode === "login" ? "Log in to join a session or run your class." : "Takes less than a minute. Promise."}
      </p>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        {mode === "register" && (
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">I am a…</legend>
            <div className="grid grid-cols-2 gap-3" role="radiogroup">
              {ROLE_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  role="radio"
                  aria-checked={role === o.value}
                  onClick={() => setRole(o.value)}
                  className={cn(
                    "bg-card relative flex cursor-pointer flex-col items-start gap-1 rounded-2xl border-2 p-4 text-left transition-all",
                    role === o.value ? "border-foreground shadow-sticker -translate-y-0.5" : "hover:border-foreground/30",
                  )}
                >
                  {role === o.value && (
                    <CheckCircleIcon weight="fill" className="text-primary absolute top-3 right-3 size-5" />
                  )}
                  <span
                    className={cn(
                      "mb-2 grid size-11 place-items-center rounded-xl",
                      o.value === "student" ? "bg-lime text-lime-foreground" : "bg-primary text-primary-foreground",
                    )}
                  >
                    <o.icon weight="duotone" className="size-6" />
                  </span>
                  <span className="font-display text-lg font-bold">{o.label}</span>
                  <span className="text-muted-foreground text-xs">{o.hint}</span>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {mode === "register" && (
          <div className="grid gap-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" autoComplete="name" required minLength={2} maxLength={60} className="h-12" placeholder="Your name" />
          </div>
        )}
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@school.edu" className="h-12" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            minLength={mode === "register" ? 6 : 1}
            className="h-12"
            placeholder={mode === "register" ? "6+ characters" : "••••••••"}
          />
        </div>

        {error && (
          <p role="alert" className="bg-destructive/10 text-destructive rounded-xl px-3.5 py-2.5 text-sm font-medium">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" disabled={pending} className="mt-2">
          {pending && <CircleNotchIcon weight="bold" className="animate-spin" />}
          {mode === "login" ? "Log in" : `Sign up as ${role}`}
          {!pending && <ArrowRightIcon weight="bold" />}
        </Button>
      </form>

      <p className="text-muted-foreground mt-6 text-center text-sm">
        {mode === "login" ? "New here? " : "Already have an account? "}
        <Link href={other + nextParam} className="text-foreground font-semibold underline decoration-primary decoration-2 underline-offset-4">
          {mode === "login" ? "Create an account" : "Log in"}
        </Link>
      </p>

      {mode === "login" && (
        <div className="bg-card text-muted-foreground mt-8 rounded-2xl border border-dashed p-4 text-xs">
          <p className="text-foreground font-semibold">🔑 Demo accounts (after `npm run seed`)</p>
          <p className="mt-1">
            teacher@demo.edu · student@demo.edu · password <code>password123</code>
          </p>
        </div>
      )}
    </div>
  );
}
