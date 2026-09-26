"use client";

import { AnimatePresence } from "framer-motion";

import { Skeleton } from "@/components/ui/skeleton";

/** Animated list container: children re-order smoothly thanks to `layout` on each card. */
export function DoubtList({ children }: { children: React.ReactNode }) {
  return (
    <ul className="flex flex-col gap-3">
      <AnimatePresence initial={false} mode="popLayout">
        {children}
      </AnimatePresence>
    </ul>
  );
}

export function DoubtListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading doubts">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="bg-card flex gap-4 rounded-xl border p-4">
          <Skeleton className="h-14 w-12" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
