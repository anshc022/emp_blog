"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRightIcon, CircleNotchIcon, CopyIcon, LinkSimpleIcon, SparkleIcon } from "@phosphor-icons/react";
import { motion } from "framer-motion";

import { Blobby } from "@/components/art/blobby";
import { GrainBg } from "@/components/art/grain-bg";
import { CopyButton } from "@/components/copy-button";
import { JoinCode } from "@/components/join-code";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api-client";
import { celebrate } from "@/lib/confetti";
import type { SessionDTO } from "@/lib/sessions";

const SUBJECT_IDEAS = ["Calculus", "Physics", "Chemistry", "Computer Science", "Economics", "Biology"];

export function NewSessionForm() {
  const qc = useQueryClient();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [session, setSession] = useState<SessionDTO | null>(null);
  const [host, setHost] = useState("");
  useEffect(() => setHost(window.location.host), []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setPending(true);
    setError(null);
    try {
      const res = await api<{ session: SessionDTO }>("/api/sessions", {
        method: "POST",
        body: { title: form.get("title"), subject },
      });
      qc.invalidateQueries({ queryKey: ["sessions"] });
      setSession(res.session);
      celebrate({ big: true, y: 0.4 });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPending(false);
    }
  }

  if (session?.joinCode) {
    const joinUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/join?code=${session.joinCode}`;
    return (
      <div className="mx-auto flex max-w-4xl flex-col items-center py-2 text-center sm:py-6">
        <span className="bg-lime text-lime-foreground inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold">
          <SparkleIcon weight="fill" className="size-4" /> you&apos;re live
        </span>
        <h1 className="mt-4 text-3xl font-extrabold text-balance sm:text-4xl">{session.title}</h1>
        <p className="text-muted-foreground font-semibold">{session.subject}</p>

        <motion.div
          initial={{ opacity: 0, y: 24, rotate: -1.5 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="grain shadow-pop relative mt-8 w-full overflow-hidden rounded-[2rem] px-4 py-12 text-white sm:py-16"
        >
          <GrainBg preset="aurora" intensity={0.45} scrim="center" />
          <p className="relative text-sm font-bold tracking-[0.2em] text-white/70 uppercase sm:text-base">
            go to <span className="text-white">{host || "this site"}/join</span> and enter
          </p>
          <JoinCode code={session.joinCode} className="relative mt-3 block text-7xl sm:text-9xl md:text-[10rem]" />
        </motion.div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <CopyButton value={session.joinCode} label="Copy code" variant="outline" size="lg" icon={<CopyIcon weight="bold" />} />
          <CopyButton value={joinUrl} label="Copy link" variant="outline" size="lg" icon={<LinkSimpleIcon weight="bold" />} />
          <Button size="lg" asChild>
            <Link href={`/teacher/session/${session.id}`}>
              Open live board <ArrowRightIcon weight="bold" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-4xl items-center gap-10 py-2 sm:py-8 md:grid-cols-[1fr_1.1fr]">
      <div className="hidden md:block">
        <Blobby mood="happy" className="text-foreground size-40 animate-float" />
        <h1 className="mt-6 text-5xl leading-[1.02] font-extrabold">
          start a <span className="font-serif-i text-primary font-normal">session</span>
        </h1>
        <p className="text-muted-foreground mt-3 text-lg">
          Students join with a 6-digit code and can start asking right away — no accounts to share, no fuss.
        </p>
      </div>

      <form onSubmit={onSubmit} className="bg-card shadow-pop flex flex-col gap-5 rounded-[2rem] border p-6 sm:p-8">
        <h1 className="text-3xl font-extrabold md:hidden">Start a session</h1>
        <div className="grid gap-2">
          <Label htmlFor="title">What&apos;s today&apos;s class about?</Label>
          <Input
            id="title"
            name="title"
            required
            minLength={3}
            maxLength={100}
            placeholder="e.g. Integration by parts"
            autoFocus
            className="h-12 text-base"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            name="subject"
            required
            minLength={2}
            maxLength={60}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Calculus"
            className="h-12 text-base"
          />
          <div className="flex flex-wrap gap-1.5">
            {SUBJECT_IDEAS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSubject(s)}
                className="text-muted-foreground hover:text-foreground hover:border-foreground/40 h-7 cursor-pointer rounded-full border px-2.5 text-xs font-semibold"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        {error && (
          <p role="alert" className="bg-destructive/10 text-destructive rounded-xl px-3 py-2 text-sm font-medium">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" disabled={pending} className="mt-1">
          {pending && <CircleNotchIcon weight="bold" className="animate-spin" />}
          Create session & get code
        </Button>
      </form>
    </div>
  );
}
