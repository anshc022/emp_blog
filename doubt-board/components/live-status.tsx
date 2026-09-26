"use client";

import NumberFlow from "@number-flow/react";
import { UsersThreeIcon } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

/** "● LIVE · 12 here" pill. */
export function LiveStatus({
  active,
  connected,
  presence,
  className,
}: {
  active: boolean;
  connected: boolean;
  presence?: number;
  className?: string;
}) {
  const label = !active ? "Ended" : connected ? "Live" : "Reconnecting";
  return (
    <span
      className={cn(
        "bg-card inline-flex h-9 items-center gap-2 rounded-full border pr-3.5 pl-3 text-xs font-bold tracking-wider uppercase",
        !active && "text-muted-foreground",
        className,
      )}
      aria-live="polite"
    >
      <span className="relative flex size-2.5">
        {active && connected && (
          <span className="bg-success absolute inline-flex size-full animate-ping rounded-full opacity-70" />
        )}
        <span
          className={cn(
            "relative inline-flex size-2.5 rounded-full",
            !active ? "bg-muted-foreground" : connected ? "bg-success" : "bg-tangerine animate-pulse",
          )}
        />
      </span>
      {label}
      {presence !== undefined && active && (
        <>
          <span className="bg-border h-4 w-px" />
          <UsersThreeIcon weight="duotone" className="size-4" />
          <span className="flex items-center gap-1 normal-case tracking-normal">
            <NumberFlow value={presence} className="font-display text-sm" />
            <span className="text-muted-foreground font-semibold">here</span>
          </span>
        </>
      )}
    </span>
  );
}
