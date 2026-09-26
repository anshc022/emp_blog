"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowBigUpIcon, BarChart3Icon, CheckCircle2Icon, MessageCircleQuestionIcon, PlusIcon, PresentationIcon } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { JoinCode } from "@/components/join-code";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo, useNow } from "@/hooks/useTime";
import { api } from "@/lib/api-client";
import type { SessionDTO } from "@/lib/sessions";

type SessionWithStats = SessionDTO & { stats: { total: number; open: number; answered: number; upvotes: number } };

export function TeacherDashboard() {
  const now = useNow();
  const { data, isLoading, error } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => api<{ sessions: SessionWithStats[] }>("/api/sessions").then((r) => r.sessions),
  });

  const sessions = data ?? [];
  const totals = sessions.reduce(
    (acc, s) => ({
      doubts: acc.doubts + s.stats.total,
      answered: acc.answered + s.stats.answered,
      live: acc.live + (s.isActive ? 1 : 0),
    }),
    { doubts: 0, answered: 0, live: 0 },
  );

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Your sessions</h1>
          <p className="text-muted-foreground mt-1">Start a session, share the code, and watch the doubts roll in.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/teacher/analytics">
              <BarChart3Icon /> Analytics
            </Link>
          </Button>
          <Button asChild>
            <Link href="/teacher/new">
              <PlusIcon /> New session
            </Link>
          </Button>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-3">
        {[
          { label: "Live now", value: totals.live },
          { label: "Doubts asked", value: totals.doubts },
          {
            label: "Answered",
            value: totals.doubts ? `${Math.round((totals.answered / totals.doubts) * 100)}%` : "—",
          },
        ].map((stat) => (
          <Card key={stat.label} className="gap-1 p-4">
            <span className="text-muted-foreground text-xs font-medium sm:text-sm">{stat.label}</span>
            {isLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <span className="text-2xl font-semibold tabular-nums sm:text-3xl">{stat.value}</span>
            )}
          </Card>
        ))}
      </div>

      {error ? (
        <EmptyState icon={MessageCircleQuestionIcon} title="Couldn't load sessions" description={error.message} />
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={PresentationIcon}
          title="No sessions yet"
          description="Create your first session and share the join code with your class."
          action={
            <Button asChild>
              <Link href="/teacher/new">
                <PlusIcon /> New session
              </Link>
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((s) => (
            <li key={s.id}>
              <Link
                href={`/teacher/session/${s.id}`}
                className="group bg-card hover:border-primary/50 flex h-full flex-col rounded-xl border p-5 shadow-xs transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-primary text-xs font-medium">{s.subject}</span>
                  {s.isActive ? (
                    <Badge variant="success" className="gap-1.5">
                      <span className="bg-success size-1.5 animate-pulse rounded-full" /> Live
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      Ended
                    </Badge>
                  )}
                </div>
                <h2 className="group-hover:text-primary mt-1 line-clamp-2 font-semibold transition-colors">
                  {s.title}
                </h2>
                <p className="text-muted-foreground mt-1 text-xs">
                  {timeAgo(s.createdAt, now)}
                  {s.isActive && s.joinCode && (
                    <>
                      {" · code "}
                      <JoinCode code={s.joinCode} className="text-foreground tracking-normal" />
                    </>
                  )}
                </p>
                <div className="text-muted-foreground mt-auto flex items-center gap-4 pt-5 text-sm">
                  <span className="flex items-center gap-1" title="Doubts">
                    <MessageCircleQuestionIcon className="size-4" /> {s.stats.total}
                  </span>
                  <span className="flex items-center gap-1" title="Answered">
                    <CheckCircle2Icon className="size-4" /> {s.stats.answered}
                  </span>
                  <span className="flex items-center gap-1" title="Upvotes">
                    <ArrowBigUpIcon className="size-4" /> {s.stats.upvotes}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
