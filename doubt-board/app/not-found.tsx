import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center p-6 text-center">
      <div>
        <p className="text-primary font-mono text-6xl font-bold">404</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">That&apos;s a doubt we can&apos;t answer</h1>
        <p className="text-muted-foreground mt-2">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Button asChild className="mt-6">
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </main>
  );
}
