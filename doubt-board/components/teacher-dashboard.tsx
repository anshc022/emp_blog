"use client";

import Link from "next/link";
import NumberFlow from "@number-flow/react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowFatUpIcon,
  ArrowUpRightIcon,
  ChartBarIcon,
  ChatsCircleIcon,
  PlusIcon,
  RadioIcon,
  SealCheckIcon,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";

import { hashString } from "@/components/art/avatar";
import { GrainBg } from "@/components/art/grain-bg";
import { EmptyState } from "@/components/empty-state";
import { JoinCode } from "@/components/join-code";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/hooks/useMe";
import { timeAgo, useNow } from "@/hooks/useTime";
import { api } from "@/lib/api-client";
import type { SessionDTO } from "@/lib/sessions";
import { cn } from "@/lib/utils";

type SessionWithStats = SessionDTO & { stats: { total: number; open: number; answered: number; upvotes: number } };

const BANDS = [
  "from-[#6c47ff] to-[#a58bff]",
  "from-[#c6f432] to-[#8fd400]",
  "from-[#ff7a3d] to-[#ffb36b]",
  "from-[#ff5ca8] to-[#ff9ccb]",
  "from-[#38bdf8] to-[#8fdcff]",
];

function greeting(now: number) {
  const h = new Date(now).getHours();
  return h < 12 ? "good morning" : h < 17 ? "good afternoon" : "good evening";
}

function Stat({
  label,
  value,
  suffix,
  icon: Icon,
  className,
  loading,
}: {
  label: string;
  value: number;
  suffix?: string;
  icon: React.ComponentType<{ weight?: "duotone"; className?: string }>;
  className?: string;
  loading?: boolean;
}) {
  return (
    <div className={cn("bg-card shadow-soft flex flex-col justify-between gap-6 rounded-3xl border p-5", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold opacity-70">{label}</span>
        <Icon weight="duotone" className="size-6 opacity-70" />
      </div>
      {loading ? (
        <Skeleton className="h-10 w-16 rounded-xl" />
      ) : (
        <NumberFlow value={value} suffix={suffix} className="font-display text-4xl leading-none font-extrabold sm:text-5xl" />
      )}
    </div>
  );
}

export function TeacherDashboard() {
  const now = useNow();
  const me = useMe();
  const { data, isLoading, error } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => api<{ sessions: SessionWithStats[] }>("/api/sessions").then((r) => r.sessions),
  });

  const sessions = data ?? [];
  const totals = sessions.reduce(
    (acc, s) => ({
      doubts: acc.doubts + s.stats.total,
      answered: acc.answered + s.stats.answered,
      upvotes: acc.upvotes + s.stats.upvotes,
      live: acc.live + (s.isActive ? 1 : 0),
    }),
    { doubts: 0, answered: 0, upvotes: 0, live: 0 },
  );
  const firstName = me.data?.name.replace(/^(prof|dr|mr|ms|mrs)\.?\s+/i, "").split(" ")[0];

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm font-semibold">{greeting(now)} ☀︎</p>
          <h1 className="mt-1 text-4xl font-extrabold sm:text-5xl">
            hey{firstName ? <>, <span className="font-serif-i text-primary font-normal">{firstName}</span></> : ""}
          </h1>
          <p className="text-muted-foreground mt-2">
            {totals.live > 0
              ? `${totals.live} session${totals.live > 1 ? "s" : ""} live right now.`
              : "Start a session, share the code, watch the doubts roll in."}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/teacher/analytics">
            <ChartBarIcon weight="duotone" /> Analytics
          </Link>
        </Button>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Link
          href="/teacher/new"
          className="group relative col-span-2 flex min-h-40 flex-col justify-between overflow-hidden rounded-3xl p-5 text-white lg:col-span-1 lg:row-span-2 lg:min-h-0"
        >
          <GrainBg preset="sunset" speed={0.4} />
          <div className="relative grid size-12 place-items-center rounded-2xl bg-white/20 backdrop-blur transition-transform group-hover:rotate-90">
            <PlusIcon weight="bold" className="size-6" />
          </div>
          <div className="relative">
            <p className="font-display text-3xl leading-tight font-extrabold">New session</p>
            <p className="text-sm text-white/80">Get a join code in one click →</p>
          </div>
        </Link>
        <Stat label="Live now" value={totals.live} icon={RadioIcon} loading={isLoading} className="bg-lime text-lime-foreground border-transparent" />
        <Stat label="Doubts asked" value={totals.doubts} icon={ChatsCircleIcon} loading={isLoading} />
        <Stat
          label="Answered"
          value={totals.doubts ? Math.round((totals.answered / totals.doubts) * 100) : 0}
          suffix="%"
          icon={SealCheckIcon}
          loading={isLoading}
        />
        <Stat label="Upvotes" value={totals.upvotes} icon={ArrowFatUpIcon} loading={isLoading} className="max-lg:hidden" />
        <div className="bg-card shadow-soft col-span-2 hidden items-center gap-4 rounded-3xl border p-5 lg:flex">
          <p className="text-muted-foreground text-sm">
            <span className="text-foreground font-display font-bold">Pro tip:</span> open{" "}
            <span className="text-foreground font-semibold">Present mode</span> on the projector — the top 5 doubts update
            live as students vote.
          </p>
        </div>
      </div>

      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-2xl font-extrabold">Your sessions</h2>
        {!isLoading && <span className="text-muted-foreground text-sm">{sessions.length} total</span>}
      </div>

      {error ? (
        <EmptyState mood="shocked" title="Couldn't load sessions" description={error.message} />
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-48 rounded-3xl" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <EmptyState
          mood="happy"
          title="No sessions yet"
          description="Create your first session and share the code with your class."
          action={
            <Button asChild>
              <Link href="/teacher/new">
                <PlusIcon weight="bold" /> New session
              </Link>
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sessions.map((s, i) => (
            <motion.li
              key={s.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.3) }}
            >
              <Link
                href={`/teacher/session/${s.id}`}
                className="group bg-card shadow-soft hover:shadow-pop relative flex h-full flex-col overflow-hidden rounded-3xl border p-5 pt-6 transition-all hover:-translate-y-1"
              >
                <span
                  className={cn(
                    "absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r",
                    BANDS[hashString(s.subject.toLowerCase()) % BANDS.length],
                  )}
                />
                <div className="flex items-start justify-between gap-2">
                  <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">{s.subject}</span>
                  {s.isActive ? (
                    <span className="bg-success/12 text-success inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase">
                      <span className="bg-success size-1.5 animate-pulse rounded-full" /> Live
                    </span>
                  ) : (
                    <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase">
                      Ended
                    </span>
                  )}
                </div>
                <h3 className="mt-2 line-clamp-2 pr-6 text-xl leading-snug font-bold">{s.title}</h3>
                <p className="text-muted-foreground mt-1 text-xs">
                  {timeAgo(s.createdAt, now)}
                  {s.isActive && s.joinCode && (
                    <>
                      {" · "}
                      <JoinCode code={s.joinCode} className="text-foreground text-xs tracking-wider" />
                    </>
                  )}
                </p>
                <div className="mt-auto flex items-center gap-4 pt-6 text-sm font-semibold">
                  <span className="flex items-center gap-1.5" title="Doubts">
                    <ChatsCircleIcon weight="duotone" className="text-primary size-5" /> {s.stats.total}
                  </span>
                  <span className="flex items-center gap-1.5" title="Answered">
                    <SealCheckIcon weight="duotone" className="text-success size-5" /> {s.stats.answered}
                  </span>
                  <span className="flex items-center gap-1.5" title="Upvotes">
                    <ArrowFatUpIcon weight="duotone" className="text-tangerine size-5" /> {s.stats.upvotes}
                  </span>
                  <ArrowUpRightIcon
                    weight="bold"
                    className="text-muted-foreground group-hover:text-foreground ml-auto size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </div>
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
