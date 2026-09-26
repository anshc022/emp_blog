"use client";

import { AnimatePresence } from "framer-motion";

import { Skeleton } from "@/components/ui/skeleton";

/** Animated list container: children re-order smoothly thanks to `layout` on each card. */
export function DoubtList({ children }: { children: React.ReactNode }) {
  return (
    <ul className="flex flex-col gap-4 pt-2">
      <AnimatePresence initial={false} mode="popLayout">
        {children}
      </AnimatePresence>
    </ul>
  );
}

export function DoubtListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4 pt-2" aria-busy="true" aria-label="Loading doubts">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="bg-card flex gap-4 rounded-3xl border p-5">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-4 w-32 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full rounded-full" />
            <Skeleton className="h-4 w-2/3 rounded-full" />
          </div>
          <Skeleton className="h-16 w-14 rounded-2xl" />
        </div>
      ))}
    </div>
  );
}
