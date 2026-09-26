"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import NumberFlow from "@number-flow/react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArchiveIcon,
  ArrowLeftIcon,
  CircleNotchIcon,
  PowerIcon,
  PresentationChartIcon,
  SealCheckIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";

import { GrainBg } from "@/components/art/grain-bg";
import { AnswerDialog } from "@/components/answer-dialog";
import { Confirm } from "@/components/confirm-button";
import { CopyButton } from "@/components/copy-button";
import { DoubtCard } from "@/components/doubt-card";
import { DoubtList, DoubtListSkeleton } from "@/components/doubt-list";
import { EmptyState } from "@/components/empty-state";
import { JoinCode } from "@/components/join-code";
import { LiveStatus } from "@/components/live-status";
import { PresentMode } from "@/components/present-mode";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { sessionKey, useSessionDoubts } from "@/hooks/useSessionDoubts";
import { useNow } from "@/hooks/useTime";
import { api } from "@/lib/api-client";
import { celebrate } from "@/lib/confetti";
import type { DoubtDTO } from "@/lib/serialize";
import type { SessionDTO } from "@/lib/sessions";

export function TeacherSession({ sessionId }: { sessionId: string }) {
  const s = useSessionDoubts(sessionId);
  const qc = useQueryClient();
  const now = useNow();
  const [tab, setTab] = useState<"open" | "answered">("open");
  const [presenting, setPresenting] = useState(false);
  const [ending, setEnding] = useState(false);
  const closePresent = useCallback(() => setPresenting(false), []);

  async function endSession() {
    setEnding(true);
    try {
      const { session } = await api<{ session: SessionDTO }>(`/api/sessions/${sessionId}/end`, { method: "PATCH" });
      qc.setQueryData(sessionKey(sessionId), session);
      qc.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Session ended — students can still read the board.");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setEnding(false);
    }
  }

  if (s.sessionError) {
    return (
      <EmptyState
        mood="shocked"
        title="Can't open this session"
        description={s.sessionError.message}
        action={
          <Button asChild>
            <Link href="/teacher">Back to sessions</Link>
          </Button>
        }
      />
    );
  }

  const session = s.session;
  const active = session?.isActive ?? true;
  const totalUpvotes = [...s.open, ...s.answered].reduce((n, d) => n + d.upvoteCount, 0);
  const list = tab === "open" ? s.open : s.answered;

  const renderCard = (d: DoubtDTO, i: number) => (
    <DoubtCard
      key={d.id}
      doubt={d}
      now={now}
      rank={d.status === "open" ? i + 1 : undefined}
      actions={
        <>
          {d.status === "open" && (
            <AnswerDialog
              doubt={d}
              onAnswer={(answer) =>
                s.answerDoubt.mutate({ doubtId: d.id, answer }, { onSuccess: () => celebrate({ y: 0.5 }) })
              }
            >
              <Button size="sm">
                <SealCheckIcon weight="fill" /> Mark answered
              </Button>
            </AnswerDialog>
          )}
          <Confirm
            title="Delete this doubt?"
            description="It's removed for everyone. This can't be undone."
            confirmLabel="Delete"
            destructive
            onConfirm={() => s.deleteDoubt.mutate(d.id)}
          >
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
              <TrashIcon weight="bold" /> Delete
            </Button>
          </Confirm>
        </>
      }
    />
  );

  return (
    <div>
      <Link
        href="/teacher"
        className="text-muted-foreground hover:text-foreground mb-5 inline-flex items-center gap-1.5 text-sm font-semibold"
      >
        <ArrowLeftIcon weight="bold" className="size-4" /> all sessions
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <header className="mb-6 flex flex-col gap-4">
            {session ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-xs font-bold">
                  {session.subject}
                </span>
                <LiveStatus active={active} connected={s.connected} presence={s.presence} />
              </div>
            ) : (
              <Skeleton className="h-9 w-56 rounded-full" />
            )}
            {session ? (
              <h1 className="text-3xl leading-tight font-extrabold text-balance sm:text-5xl">{session.title}</h1>
            ) : (
              <Skeleton className="h-12 w-3/4 rounded-2xl" />
            )}
          </header>

          <Segmented
            value={tab}
            onChange={setTab}
            options={[
              { value: "open", label: "Open", count: s.open.length },
              { value: "answered", label: "Answered", count: s.answered.length },
            ]}
            className="mb-2 w-full sm:w-auto"
          />

          {s.isLoading ? (
            <DoubtListSkeleton />
          ) : list.length === 0 ? (
            tab === "open" ? (
              <EmptyState
                className="mt-2"
                mood={active ? "curious" : "sleepy"}
                title="No doubts yet — everyone's a genius today"
                description={active ? "New doubts pop up here the moment students ask." : undefined}
              />
            ) : (
              <EmptyState className="mt-2" mood="sleepy" title="Nothing answered yet" description="Mark doubts as answered as you go." />
            )
          ) : (
            <DoubtList>{list.map(renderCard)}</DoubtList>
          )}
        </div>

        <aside className="order-first lg:order-none">
          <div className="flex flex-col gap-3 lg:sticky lg:top-24">
            {session?.joinCode && active && (
              <div className="grain shadow-pop relative overflow-hidden rounded-3xl p-6 text-center text-white">
                <GrainBg preset="aurora" speed={0.4} intensity={0.45} scrim="center" />
                <p className="relative text-xs font-bold tracking-[0.2em] text-white/70 uppercase">Join code</p>
                <JoinCode code={session.joinCode} className="relative mt-1 block text-5xl" />
                <CopyButton
                  value={session.joinCode}
                  label="Copy"
                  size="sm"
                  className="relative mt-3 bg-white/15 text-white backdrop-blur hover:bg-white/25"
                  variant="ghost"
                />
              </div>
            )}
            {!active && session && (
              <div className="bg-card flex items-center gap-3 rounded-3xl border-2 border-dashed p-5">
                <ArchiveIcon weight="duotone" className="size-7 shrink-0" />
                <p className="text-sm">
                  <span className="font-display font-bold">Session ended.</span>{" "}
                  <span className="text-muted-foreground">Students can still read everything.</span>
                </p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Here", value: s.presence, cls: "bg-lime text-lime-foreground border-transparent" },
                { label: "Open", value: s.open.length, cls: "bg-card" },
                { label: "Upvotes", value: totalUpvotes, cls: "bg-card" },
              ].map((x) => (
                <div key={x.label} className={`shadow-soft rounded-2xl border p-3 text-center ${x.cls}`}>
                  <NumberFlow value={x.value} className="font-display text-3xl font-extrabold" />
                  <div className="text-xs font-semibold opacity-70">{x.label}</div>
                </div>
              ))}
            </div>

            <Button size="lg" variant="ink" onClick={() => setPresenting(true)} disabled={!session} className="h-14 text-base">
              <PresentationChartIcon weight="duotone" className="size-5" /> Present mode
            </Button>
            {active && (
              <Confirm
                title="End this session?"
                description="Students won't be able to post or upvote anymore. Everything stays readable."
                confirmLabel="End session"
                destructive
                onConfirm={endSession}
              >
                <Button size="lg" variant="outline" disabled={!session || ending} className="text-destructive hover:text-destructive">
                  {ending ? <CircleNotchIcon weight="bold" className="animate-spin" /> : <PowerIcon weight="bold" />} End
                  session
                </Button>
              </Confirm>
            )}
          </div>
        </aside>
      </div>

      {presenting && session && (
        <PresentMode session={session} doubts={s.open} presence={s.presence} onClose={closePresent} />
      )}
    </div>
  );
}
