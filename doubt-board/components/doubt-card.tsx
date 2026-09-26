"use client";

import { forwardRef } from "react";
import { ChalkboardTeacherIcon, FireIcon, SealCheckIcon } from "@phosphor-icons/react";
import { motion } from "framer-motion";

import { Avatar } from "@/components/art/avatar";
import { TopicSticker } from "@/components/art/topic-sticker";
import { UpvoteButton } from "@/components/upvote-button";
import { timeAgo } from "@/hooks/useTime";
import type { DoubtDTO } from "@/lib/serialize";
import { cn } from "@/lib/utils";

type Props = {
  doubt: DoubtDTO;
  now: number;
  rank?: number;
  /** Students can vote; teachers just see the count. */
  canVote?: boolean;
  onUpvote?: () => void;
  actions?: React.ReactNode;
};

export const DoubtCard = forwardRef<HTMLLIElement, Props>(function DoubtCard(
  { doubt, now, rank, canVote, onUpvote, actions },
  ref,
) {
  const voteDisabled = !canVote || doubt.isMine || doubt.status !== "open";
  const voteTitle = doubt.isMine
    ? "You can't upvote your own doubt"
    : doubt.status !== "open"
      ? "Already answered"
      : undefined;
  const hot = rank === 1 && doubt.upvoteCount > 0;

  return (
    <motion.li
      ref={ref}
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 420, damping: 34 }}
      className={cn(
        "group bg-card shadow-soft relative flex gap-3 rounded-3xl border p-4 transition-shadow hover:shadow-pop sm:gap-4 sm:p-5",
        doubt.isMine && "border-primary/50 ring-primary/10 ring-4",
        hot && "border-tangerine/50",
      )}
    >
      {hot && (
        <span className="bg-tangerine absolute -top-2.5 left-5 inline-flex rotate-[-3deg] items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
          <FireIcon weight="fill" className="size-3.5" /> top doubt
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          <Avatar name={doubt.author?.name} seed={doubt.id} />
          <div className="min-w-0 leading-tight">
            <div className="flex items-center gap-1.5 text-sm font-semibold">
              <span className="truncate">{doubt.author ? doubt.author.name : "Anonymous"}</span>
              {doubt.isMine && (
                <span className="bg-lime text-lime-foreground rounded-md px-1.5 py-px text-[10px] font-extrabold tracking-wider uppercase">
                  You
                </span>
              )}
            </div>
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
              {rank !== undefined && <span className="font-semibold">#{rank}</span>}
              {rank !== undefined && <span aria-hidden>·</span>}
              <time dateTime={doubt.createdAt}>{timeAgo(doubt.createdAt, now)}</time>
            </div>
          </div>
          <TopicSticker topic={doubt.topic} className="ml-auto hidden sm:inline-flex" />
        </div>

        <p className="mt-3 text-[16px] leading-relaxed font-medium break-words whitespace-pre-wrap sm:text-[17px]">
          {doubt.text}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2 sm:hidden">
          <TopicSticker topic={doubt.topic} />
        </div>

        {doubt.status === "answered" && (
          <div className="mt-4 rounded-2xl border border-success/25 bg-success/8 p-3.5">
            <div className="text-success flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase">
              <SealCheckIcon weight="fill" className="size-4" /> Answered
              {doubt.answeredAt && (
                <span className="text-muted-foreground font-medium normal-case">· {timeAgo(doubt.answeredAt, now)}</span>
              )}
            </div>
            {doubt.answer && (
              <p className="mt-1.5 flex gap-2 text-sm leading-relaxed">
                <ChalkboardTeacherIcon weight="duotone" className="text-success mt-0.5 size-4 shrink-0" />
                <span className="whitespace-pre-wrap">{doubt.answer}</span>
              </p>
            )}
          </div>
        )}

        {actions && <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-dashed pt-3">{actions}</div>}
      </div>

      <UpvoteButton
        count={doubt.upvoteCount}
        active={doubt.hasUpvoted}
        disabled={voteDisabled}
        onClick={voteDisabled ? undefined : onUpvote}
        title={voteTitle}
      />
    </motion.li>
  );
});
