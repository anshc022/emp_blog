"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-[60dvh] place-items-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="text-muted-foreground mt-2">Please try again. If it keeps happening, reload the page.</p>
        <Button onClick={reset} className="mt-6">
          Try again
        </Button>
      </div>
    </main>
  );
}
