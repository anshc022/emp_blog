"use client";

import { Blobby } from "@/components/art/blobby";
import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-[60dvh] place-items-center p-6 text-center">
      <div>
        <Blobby mood="shocked" className="text-foreground mx-auto size-28" />
        <h1 className="mt-4 text-3xl font-extrabold">oops, something broke</h1>
        <p className="text-muted-foreground mt-2">Please try again. If it keeps happening, reload the page.</p>
        <Button onClick={reset} className="mt-6">
          Try again
        </Button>
      </div>
    </main>
  );
}
