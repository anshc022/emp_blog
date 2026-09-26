import { cn } from "@/lib/utils";

/** Big, projector-friendly join code: "482 913". */
export function JoinCode({ code, className }: { code: string; className?: string }) {
  return (
    <span
      className={cn("font-display font-extrabold tracking-[0.08em] whitespace-nowrap tabular-nums", className)}
      aria-label={`Join code ${code.split("").join(" ")}`}
    >
      {code.slice(0, 3)}
      <span className="mx-[0.18em] opacity-40">·</span>
      {code.slice(3)}
    </span>
  );
}
