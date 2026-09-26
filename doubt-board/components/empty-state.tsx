import { Blobby, type BlobbyMood } from "@/components/art/blobby";
import { cn } from "@/lib/utils";

export function EmptyState({
  mood = "curious",
  title,
  description,
  action,
  className,
}: {
  mood?: BlobbyMood;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-card/60 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-12 text-center",
        className,
      )}
    >
      <Blobby mood={mood} className="text-foreground size-28 animate-float" />
      <h3 className="mt-4 text-xl font-bold text-balance">{title}</h3>
      {description && <p className="text-muted-foreground mt-1.5 max-w-sm text-sm text-balance">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
