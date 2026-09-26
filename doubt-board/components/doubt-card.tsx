"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { CheckCircle2Icon, EyeOffIcon, UserIcon } from "lucide-react";

import { UpvoteButton } from "@/components/upvote-button";
import { Badge } from "@/components/ui/badge";
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

  return (
    <motion.li
      ref={ref}
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 420, damping: 36 }}
      className={cn(
        "bg-card flex gap-3 rounded-xl border p-3 shadow-xs sm:gap-4 sm:p-4",
        doubt.isMine && "border-primary/40 ring-primary/10 ring-2",
      )}
    >
      <div className="flex flex-col items-center gap-2">
        <UpvoteButton
          count={doubt.upvoteCount}
          active={doubt.hasUpvoted}
          disabled={voteDisabled}
          onClick={voteDisabled ? undefined : onUpvote}
          title={voteTitle}
        />
        {rank !== undefined && <span className="text-muted-foreground text-xs font-medium">#{rank}</span>}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <Badge variant="secondary" className="rounded-md">
            {doubt.topic}
          </Badge>
          <span className="inline-flex items-center gap-1">
            {doubt.author ? <UserIcon className="size-3" /> : <EyeOffIcon className="size-3" />}
            {doubt.author ? doubt.author.name : "Anonymous"}
          </span>
          {doubt.isMine && (
            <Badge className="h-5 rounded-md px-1.5" aria-label="Your doubt">
              You
            </Badge>
          )}
          <span aria-hidden>·</span>
          <time dateTime={doubt.createdAt}>{timeAgo(doubt.createdAt, now)}</time>
        </div>

        <p className="mt-1.5 text-[15px] leading-relaxed break-words whitespace-pre-wrap">{doubt.text}</p>

        {doubt.status === "answered" && (
          <div className="bg-success/10 text-foreground mt-3 rounded-lg px-3 py-2 text-sm">
            <div className="text-success flex items-center gap-1.5 text-xs font-semibold">
              <CheckCircle2Icon className="size-3.5" /> Answered
              {doubt.answeredAt && (
                <span className="text-muted-foreground font-normal">· {timeAgo(doubt.answeredAt, now)}</span>
              )}
            </div>
            {doubt.answer && <p className="mt-1 whitespace-pre-wrap">{doubt.answer}</p>}
          </div>
        )}
      </div>

      {actions && <div className="flex shrink-0 flex-col items-end gap-1">{actions}</div>}
    </motion.li>
  );
});
