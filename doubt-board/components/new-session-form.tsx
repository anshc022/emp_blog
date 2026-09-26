"use client";

import Link from "next/link";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRightIcon, Loader2Icon, SparklesIcon } from "lucide-react";

import { CopyButton } from "@/components/copy-button";
import { JoinCode } from "@/components/join-code";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";
import type { SessionDTO } from "@/lib/sessions";

export function NewSessionForm() {
  const qc = useQueryClient();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<SessionDTO | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setPending(true);
    setError(null);
    try {
      const res = await api<{ session: SessionDTO }>("/api/sessions", {
        method: "POST",
        body: { title: form.get("title"), subject: form.get("subject") },
      });
      qc.invalidateQueries({ queryKey: ["sessions"] });
      setSession(res.session);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPending(false);
    }
  }

  if (session?.joinCode) {
    const joinUrl = typeof window !== "undefined" ? `${window.location.origin}/join?code=${session.joinCode}` : "";
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto flex max-w-3xl flex-col items-center py-6 text-center sm:py-12"
      >
        <span className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium">
          <SparklesIcon className="size-4" /> Session is live
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">{session.title}</h1>
        <p className="text-muted-foreground">{session.subject}</p>

        <div className="bg-card mt-10 w-full rounded-3xl border-2 border-dashed px-4 py-10 shadow-sm sm:py-14">
          <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase sm:text-base">
            Go to <span className="text-foreground">{typeof window !== "undefined" ? window.location.host : ""}/join</span>{" "}
            and enter
          </p>
          <JoinCode code={session.joinCode} className="mt-4 block text-6xl sm:text-8xl md:text-9xl" />
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <CopyButton value={session.joinCode} label="Copy code" variant="outline" size="lg" />
          <CopyButton value={joinUrl} label="Copy link" variant="outline" size="lg" />
          <Button size="lg" asChild>
            <Link href={`/teacher/session/${session.id}`}>
              Open live board <ArrowRightIcon />
            </Link>
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-lg py-4 sm:py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Start a new session</CardTitle>
          <CardDescription>Students join with a 6-digit code and can start asking right away.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required minLength={3} maxLength={100} placeholder="e.g. Integration by parts" autoFocus />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" name="subject" required minLength={2} maxLength={60} placeholder="e.g. Calculus" />
            </div>
            {error && (
              <p role="alert" className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
                {error}
              </p>
            )}
            <Button type="submit" size="lg" disabled={pending} className="mt-2">
              {pending && <Loader2Icon className="animate-spin" />}
              Create session
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
