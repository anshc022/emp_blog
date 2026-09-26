"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArchiveIcon, ArrowLeftIcon, ChatCircleDotsIcon, TrashIcon } from "@phosphor-icons/react";

import { AskBox } from "@/components/ask-box";
import { Confirm } from "@/components/confirm-button";
import { DoubtCard } from "@/components/doubt-card";
import { DoubtList, DoubtListSkeleton } from "@/components/doubt-list";
import { EmptyState } from "@/components/empty-state";
import { LiveStatus } from "@/components/live-status";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessionDoubts } from "@/hooks/useSessionDoubts";
import { useNow } from "@/hooks/useTime";
import type { DoubtDTO } from "@/lib/serialize";

export function StudentSession({ sessionId }: { sessionId: string }) {
  const s = useSessionDoubts(sessionId);
  const now = useNow();
  const [tab, setTab] = useState<"open" | "answered">("open");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const all = useMemo(() => [...s.open, ...s.answered], [s.open, s.answered]);
  const topics = useMemo(() => [...new Set(all.map((d) => d.topic))], [all]);

  if (s.sessionError) {
    return (
      <EmptyState
        mood="shocked"
        title="Hmm, can't find that session"
        description={s.sessionError.message}
        action={
          <Button asChild>
            <Link href="/join">Try another code</Link>
          </Button>
        }
      />
    );
  }

  const ended = s.session ? !s.session.isActive : false;
  const list = tab === "open" ? s.open : s.answered;

  const askProps = {
    sessionId,
    existingTopics: topics,
    liveDoubts: all,
    onSubmit: (input: { text: string; topic: string; isAnonymous: boolean }) => s.createDoubt.mutateAsync(input),
    onUpvote: (id: string) => s.toggleUpvote.mutate(id),
  };

  const renderCard = (d: DoubtDTO, i: number) => (
    <DoubtCard
      key={d.id}
      doubt={d}
      now={now}
      rank={d.status === "open" ? i + 1 : undefined}
      canVote={!ended}
      onUpvote={() => s.toggleUpvote.mutate(d.id)}
      actions={
        d.isMine ? (
          <Confirm
            title="Delete your doubt?"
            description="It disappears for everyone in the session."
            confirmLabel="Delete"
            destructive
            onConfirm={() => s.deleteDoubt.mutate(d.id)}
          >
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive -ml-2">
              <TrashIcon weight="bold" /> Delete
            </Button>
          </Confirm>
        ) : undefined
      }
    />
  );

  return (
    <div className="mx-auto max-w-2xl pb-24 sm:pb-0">
      <Link
        href="/join"
        className="text-muted-foreground hover:text-foreground mb-5 inline-flex items-center gap-1.5 text-sm font-semibold"
      >
        <ArrowLeftIcon weight="bold" className="size-4" /> another session
      </Link>

      <header className="mb-6 flex flex-col gap-4">
        {s.session ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-xs font-bold">
              {s.session.subject}
            </span>
            <LiveStatus active={!ended} connected={s.connected} presence={s.presence} />
          </div>
        ) : (
          <Skeleton className="h-9 w-56 rounded-full" />
        )}
        {s.session ? (
          <h1 className="text-3xl leading-tight font-extrabold text-balance sm:text-5xl">{s.session.title}</h1>
        ) : (
          <Skeleton className="h-12 w-3/4 rounded-2xl" />
        )}
      </header>

      {ended ? (
        <div
          role="status"
          className="bg-card shadow-soft mb-8 flex items-center gap-4 rounded-3xl border-2 border-dashed p-5"
        >
          <div className="bg-muted grid size-12 shrink-0 place-items-center rounded-2xl">
            <ArchiveIcon weight="duotone" className="size-6" />
          </div>
          <div>
            <p className="font-display text-lg font-bold">That&apos;s a wrap — session ended</p>
            <p className="text-muted-foreground text-sm">Read-only now. Scroll through every doubt and answer below.</p>
          </div>
        </div>
      ) : (
        s.session && <AskBox {...askProps} className="mb-8 hidden sm:block" />
      )}

      <div className="mb-2 flex items-center justify-between gap-3">
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: "open", label: "Open", count: s.open.length },
            { value: "answered", label: "Answered", count: s.answered.length },
          ]}
          className="w-full sm:w-auto"
        />
      </div>

      {s.isLoading ? (
        <DoubtListSkeleton />
      ) : list.length === 0 ? (
        tab === "open" ? (
          <EmptyState
            className="mt-2"
            mood={ended ? "sleepy" : "curious"}
            title="No doubts yet — everyone's a genius today"
            description={ended ? "Nobody left an open doubt here." : "Be the first to ask. It's anonymous, nobody will know."}
          />
        ) : (
          <EmptyState
            className="mt-2"
            mood="sleepy"
            title="Nothing answered yet"
            description="When your teacher answers a doubt it lands here."
          />
        )
      ) : (
        <DoubtList>{list.map(renderCard)}</DoubtList>
      )}

      {/* Phones: composer lives in a bottom sheet behind a sticky bar. */}
      {!ended && s.session && (
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <div className="fixed inset-x-0 bottom-0 z-30 p-3 sm:hidden">
            <DrawerTrigger asChild>
              <button
                type="button"
                className="bg-foreground text-background shadow-pop flex h-14 w-full cursor-pointer items-center gap-3 rounded-full pr-2 pl-5 text-left"
              >
                <ChatCircleDotsIcon weight="duotone" className="size-6 shrink-0" />
                <span className="flex-1 truncate text-[15px] font-medium opacity-80">Ask a doubt, anonymously…</span>
                <span className="bg-lime text-lime-foreground rounded-full px-4 py-2 text-sm font-bold">Ask</span>
              </button>
            </DrawerTrigger>
          </div>
          <DrawerContent>
            <div className="overflow-y-auto px-3 pt-1 pb-6">
              <DrawerTitle className="px-2 pb-1">Ask a doubt</DrawerTitle>
              <DrawerDescription className="px-2 pb-3">It&apos;s anonymous unless you flip the switch.</DrawerDescription>
              <AskBox {...askProps} autoFocus onPosted={() => setDrawerOpen(false)} className="shadow-none" />
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}
