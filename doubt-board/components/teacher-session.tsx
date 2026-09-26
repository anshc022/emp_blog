"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArchiveIcon,
  ArrowLeftIcon,
  BrainIcon,
  CheckCheckIcon,
  CheckIcon,
  Loader2Icon,
  MonitorPlayIcon,
  PowerIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

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
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sessionKey, useSessionDoubts } from "@/hooks/useSessionDoubts";
import { useNow } from "@/hooks/useTime";
import { api } from "@/lib/api-client";
import type { DoubtDTO } from "@/lib/serialize";
import type { SessionDTO } from "@/lib/sessions";

export function TeacherSession({ sessionId }: { sessionId: string }) {
  const s = useSessionDoubts(sessionId);
  const qc = useQueryClient();
  const now = useNow();
  const [tab, setTab] = useState("open");
  const [presenting, setPresenting] = useState(false);
  const [ending, setEnding] = useState(false);
  const closePresent = useCallback(() => setPresenting(false), []);

  async function endSession() {
    setEnding(true);
    try {
      const { session } = await api<{ session: SessionDTO }>(`/api/sessions/${sessionId}/end`, { method: "PATCH" });
      qc.setQueryData(sessionKey(sessionId), session);
      qc.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Session ended. Students can still read the board.");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setEnding(false);
    }
  }

  if (s.sessionError) {
    return (
      <EmptyState
        icon={ArchiveIcon}
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
            actions={
              <>
                {d.status === "open" && (
                  <AnswerDialog doubt={d} onAnswer={(answer) => s.answerDoubt.mutate({ doubtId: d.id, answer })}>
                    <Button size="sm" variant="outline" className="gap-1">
                      <CheckIcon /> <span className="hidden sm:inline">Mark answered</span>
                    </Button>
                  </AnswerDialog>
                )}
                <Confirm
                  title="Delete this doubt?"
                  description="It will be removed for everyone. This can't be undone."
                  confirmLabel="Delete"
                  destructive
                  onConfirm={() => s.deleteDoubt.mutate(d.id)}
                >
                  <Button variant="ghost" size="icon" className="text-muted-foreground size-8" aria-label="Delete doubt">
                    <Trash2Icon />
                  </Button>
                </Confirm>
              </>
            }
          />
        ))}
      </DoubtList>
    );

  return (
    <div>
      <Link
        href="/teacher"
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeftIcon className="size-4" /> All sessions
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              {session ? (
                <>
                  <p className="text-primary text-sm font-medium">{session.subject}</p>
                  <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{session.title}</h1>
                </>
              ) : (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-64" />
                </div>
              )}
            </div>
            {session && <LiveStatus active={active} connected={s.connected} presence={s.presence} />}
          </div>

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
                  description={active ? "New doubts will pop up here the moment students ask." : undefined}
                />,
              )}
            </TabsContent>
            <TabsContent value="answered">
              {renderList(
                s.answered,
                <EmptyState icon={CheckCheckIcon} title="Nothing answered yet" description="Mark doubts as answered as you go." />,
              )}
            </TabsContent>
          </Tabs>
        </div>

        <aside className="order-first flex flex-col gap-4 lg:order-none">
          <div className="lg:sticky lg:top-20 lg:flex lg:flex-col lg:gap-4">
            {session?.joinCode && active && (
              <Card className="items-center gap-2 p-5 text-center">
                <span className="text-muted-foreground text-xs font-medium tracking-widest uppercase">Join code</span>
                <JoinCode code={session.joinCode} className="text-4xl" />
                <CopyButton value={session.joinCode} label="Copy" variant="ghost" size="sm" />
              </Card>
            )}

            <Card className="mt-4 grid grid-cols-3 gap-2 p-4 text-center lg:mt-0">
              {[
                { label: "Students", value: s.presence },
                { label: "Open", value: s.open.length },
                { label: "Upvotes", value: totalUpvotes },
              ].map((x) => (
                <div key={x.label}>
                  <div className="text-2xl font-semibold tabular-nums">{x.value}</div>
                  <div className="text-muted-foreground text-xs">{x.label}</div>
                </div>
              ))}
            </Card>

            <div className="mt-4 flex flex-col gap-2 lg:mt-0">
              <Button size="lg" onClick={() => setPresenting(true)} disabled={!session}>
                <MonitorPlayIcon /> Present mode
              </Button>
              {active && (
                <Confirm
                  title="End this session?"
                  description="Students won't be able to post or upvote anymore. Everything stays readable."
                  confirmLabel="End session"
                  destructive
                  onConfirm={endSession}
                >
                  <Button size="lg" variant="outline" disabled={!session || ending} className="text-destructive">
                    {ending ? <Loader2Icon className="animate-spin" /> : <PowerIcon />} End session
                  </Button>
                </Confirm>
              )}
            </div>
          </div>
        </aside>
      </div>

      {presenting && session && (
        <PresentMode session={session} doubts={s.open} presence={s.presence} onClose={closePresent} />
      )}
    </div>
  );
}
