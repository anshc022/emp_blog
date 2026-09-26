import { cn } from "@/lib/utils";

/** Big, projector-friendly join code: "482 913". */
export function JoinCode({ code, className }: { code: string; className?: string }) {
  return (
    <span
      className={cn("font-mono font-bold tracking-[0.12em] tabular-nums", className)}
      aria-label={`Join code ${code.split("").join(" ")}`}
    >
      {code.slice(0, 3)}
      <span className="text-muted-foreground/50 mx-[0.15em]">·</span>
      {code.slice(3)}
    </span>
  );
}
