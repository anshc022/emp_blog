"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowBigUpIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** Vertical upvote pill with a count that rolls up/down when it changes. */
export function UpvoteButton({
  count,
  active,
  disabled,
  onClick,
  title,
  size = "md",
}: {
  count: number;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  title?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <motion.button
      type="button"
      whileTap={disabled ? undefined : { scale: 0.88 }}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-pressed={active}
      aria-label={`${active ? "Remove upvote" : "Upvote"} (${count})`}
      className={cn(
        "flex shrink-0 flex-col items-center justify-center rounded-lg border font-semibold tabular-nums transition-colors outline-none",
        "focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        size === "sm" && "h-11 w-10 text-xs",
        size === "md" && "h-14 w-12 text-sm",
        size === "lg" && "h-24 w-20 text-3xl",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-primary/25 shadow-md"
          : "bg-background hover:border-primary/50 hover:text-primary",
        disabled && !active && "hover:text-foreground cursor-default hover:border-border",
        disabled && "cursor-default",
      )}
    >
      <ArrowBigUpIcon
        className={cn(size === "lg" ? "size-9" : size === "sm" ? "size-4" : "size-5", active && "fill-current")}
      />
      <span className="relative h-[1.2em] overflow-hidden leading-[1.2em]">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={count}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
            className="block"
          >
            {count}
          </motion.span>
        </AnimatePresence>
      </span>
    </motion.button>
  );
}
