import { UsersIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** "● Live · 12 students" pill. */
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
  const label = !active ? "Ended" : connected ? "Live" : "Reconnecting…";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium",
        !active && "text-muted-foreground",
        className,
      )}
      aria-live="polite"
    >
      <span className="relative flex size-2">
        {active && connected && (
          <span className="bg-success absolute inline-flex size-full animate-ping rounded-full opacity-60" />
        )}
        <span
          className={cn(
            "relative inline-flex size-2 rounded-full",
            !active ? "bg-muted-foreground" : connected ? "bg-success" : "bg-amber-500",
          )}
        />
      </span>
      {label}
      {presence !== undefined && active && (
        <>
          <span className="bg-border h-3 w-px" />
          <UsersIcon className="size-3.5" />
          <span className="tabular-nums">{presence}</span>
          <span className="hidden sm:inline">{presence === 1 ? "student" : "students"}</span>
        </>
      )}
    </span>
  );
}
