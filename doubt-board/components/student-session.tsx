"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArchiveIcon, ArrowLeftIcon, BrainIcon, CheckCheckIcon, Trash2Icon } from "lucide-react";

import { AskBox } from "@/components/ask-box";
import { Confirm } from "@/components/confirm-button";
import { DoubtCard } from "@/components/doubt-card";
import { DoubtList, DoubtListSkeleton } from "@/components/doubt-list";
import { EmptyState } from "@/components/empty-state";
import { LiveStatus } from "@/components/live-status";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSessionDoubts } from "@/hooks/useSessionDoubts";
import { useNow } from "@/hooks/useTime";
import type { DoubtDTO } from "@/lib/serialize";

export function StudentSession({ sessionId }: { sessionId: string }) {
  const s = useSessionDoubts(sessionId);
  const now = useNow();
  const [tab, setTab] = useState("open");

  const topics = useMemo(() => [...new Set([...s.open, ...s.answered].map((d) => d.topic))], [s.open, s.answered]);
  const all = useMemo(() => [...s.open, ...s.answered], [s.open, s.answered]);

  if (s.sessionError) {
    return (
      <EmptyState
        icon={ArchiveIcon}
        title="Session not found"
        description={s.sessionError.message}
        action={
          <Button asChild>
            <Link href="/join">Join another session</Link>
          </Button>
        }
      />
    );
  }

  const ended = s.session ? !s.session.isActive : false;

  const renderList = (list: DoubtDTO[], empty: React.ReactNode) =>
    s.isLoading ? (
      <DoubtListSkeleton />
    ) : list.length === 0 ? (
      empty
    ) : (
      <DoubtList>
        {list.map((d, i) => (
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
                  description="It will disappear for everyone in the session."
                  confirmLabel="Delete"
                  destructive
                  onConfirm={() => s.deleteDoubt.mutate(d.id)}
                >
                  <Button variant="ghost" size="icon" className="text-muted-foreground size-8" aria-label="Delete doubt">
                    <Trash2Icon />
                  </Button>
                </Confirm>
              ) : undefined
            }
          />
        ))}
      </DoubtList>
    );

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/join"
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeftIcon className="size-4" /> Join another
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          {s.session ? (
            <>
              <p className="text-primary text-sm font-medium">{s.session.subject}</p>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{s.session.title}</h1>
            </>
          ) : (
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-64" />
            </div>
          )}
        </div>
        {s.session && <LiveStatus active={!ended} connected={s.connected} presence={s.presence} />}
      </div>

      {ended ? (
        <div
          role="status"
          className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm"
        >
          <ArchiveIcon className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="font-semibold">This session has ended</p>
            <p className="text-muted-foreground">It&apos;s read-only now — you can still go through every doubt and answer.</p>
          </div>
        </div>
      ) : (
        s.session && (
          <div className="mb-8">
            <AskBox
              sessionId={sessionId}
              existingTopics={topics}
              liveDoubts={all}
              onSubmit={(input) => s.createDoubt.mutateAsync(input)}
              onUpvote={(id) => s.toggleUpvote.mutate(id)}
            />
          </div>
        )
      )}

      <Tabs value={tab} onValueChange={setTab} className="gap-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="open" className="sm:px-5">
            Open <span className="text-muted-foreground tabular-nums">{s.open.length}</span>
          </TabsTrigger>
          <TabsTrigger value="answered" className="sm:px-5">
            Answered <span className="text-muted-foreground tabular-nums">{s.answered.length}</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="open">
          {renderList(
            s.open,
            <EmptyState
              icon={BrainIcon}
              title="No doubts yet — everyone's a genius today"
              description={ended ? "Nobody left an open doubt in this session." : "Be the first to ask. It's anonymous by default."}
            />,
          )}
        </TabsContent>
        <TabsContent value="answered">
          {renderList(
            s.answered,
            <EmptyState
              icon={CheckCheckIcon}
              title="Nothing answered yet"
              description="When your teacher answers a doubt it'll show up here."
            />,
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
