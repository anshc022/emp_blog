"use client";

import NumberFlow from "@number-flow/react";
import { ArrowFatUpIcon } from "@phosphor-icons/react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

/** Capsule upvote button: lime when you've voted, count rolls with NumberFlow. */
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
  size?: "sm" | "md";
}) {
  return (
    <motion.button
      type="button"
      whileTap={disabled ? undefined : { scale: 0.85, rotate: -4 }}
      whileHover={disabled ? undefined : { y: -2 }}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-pressed={active}
      aria-label={`${active ? "Remove upvote" : "Upvote"} (${count})`}
      className={cn(
        "group flex shrink-0 flex-col items-center justify-center rounded-2xl border-2 font-display font-bold tabular-nums transition-colors outline-none",
        "focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        size === "sm" ? "h-12 w-11 text-sm" : "h-16 w-14 text-lg",
        active
          ? "border-foreground bg-lime text-lime-foreground shadow-sticker"
          : "bg-background border-border",
        !disabled && !active && "hover:border-primary hover:text-primary cursor-pointer",
        !disabled && active && "cursor-pointer",
        disabled && !active && "text-muted-foreground cursor-default",
        disabled && "cursor-default",
      )}
    >
      <motion.span
        key={active ? "on" : "off"}
        initial={active ? { y: 6, scale: 0.6 } : false}
        animate={{ y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 600, damping: 15 }}
      >
        <ArrowFatUpIcon weight={active ? "fill" : "bold"} className={size === "sm" ? "size-4" : "size-5"} />
      </motion.span>
      <NumberFlow value={count} className="-mt-0.5 leading-none" />
    </motion.button>
  );
}
