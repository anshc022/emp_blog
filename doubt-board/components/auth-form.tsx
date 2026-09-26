"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { GraduationCapIcon, Loader2Icon, PresentationIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";
import type { AuthUser } from "@/lib/jwt";
import { cn } from "@/lib/utils";

type Role = AuthUser["role"];

const ROLE_OPTIONS: { value: Role; label: string; hint: string; icon: typeof GraduationCapIcon }[] = [
  { value: "student", label: "Student", hint: "Join sessions & ask", icon: GraduationCapIcon },
  { value: "teacher", label: "Teacher", hint: "Run sessions & answer", icon: PresentationIcon },
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
      toast.success(mode === "register" ? `Welcome, ${user.name.split(" ")[0]}!` : `Welcome back, ${user.name.split(" ")[0]}!`);
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
      <h1 className="text-2xl font-semibold tracking-tight">
        {mode === "login" ? "Welcome back" : "Create your account"}
      </h1>
      <p className="text-muted-foreground mt-1 text-sm">
        {mode === "login" ? "Log in to join a session or run your class." : "It takes less than a minute."}
      </p>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
        {mode === "register" && (
          <fieldset>
            <legend className="mb-2 text-sm font-medium">I am a…</legend>
            <div className="grid grid-cols-2 gap-3" role="radiogroup">
              {ROLE_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  role="radio"
                  aria-checked={role === o.value}
                  onClick={() => setRole(o.value)}
                  className={cn(
                    "flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition-all",
                    role === o.value
                      ? "border-primary bg-primary/5 ring-primary/15 ring-4"
                      : "hover:border-primary/40",
                  )}
                >
                  <o.icon className={cn("size-5", role === o.value ? "text-primary" : "text-muted-foreground")} />
                  <span className="font-medium">{o.label}</span>
                  <span className="text-muted-foreground text-xs">{o.hint}</span>
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {mode === "register" && (
          <div className="grid gap-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" autoComplete="name" required minLength={2} maxLength={60} />
          </div>
        )}
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@school.edu" />
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
          />
        </div>

        {error && (
          <p role="alert" className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" disabled={pending} className="mt-2">
          {pending && <Loader2Icon className="animate-spin" />}
          {mode === "login" ? "Log in" : `Sign up as ${role}`}
        </Button>
      </form>

      <p className="text-muted-foreground mt-6 text-center text-sm">
        {mode === "login" ? "New here? " : "Already have an account? "}
        <Link href={other + nextParam} className="text-primary font-medium hover:underline">
          {mode === "login" ? "Create an account" : "Log in"}
        </Link>
      </p>

      {mode === "login" && (
        <div className="bg-muted/60 text-muted-foreground mt-8 rounded-lg p-3 text-xs">
          <p className="text-foreground font-medium">Demo accounts (after `npm run seed`)</p>
          <p className="mt-1">
            teacher@demo.edu · student@demo.edu · password <code>password123</code>
          </p>
        </div>
      )}
    </div>
  );
}
