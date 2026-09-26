import Link from "next/link";

import { Blobby } from "@/components/art/blobby";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="bg-grid grid min-h-dvh place-items-center p-6 text-center">
      <div>
        <Blobby mood="shocked" className="text-foreground mx-auto size-36 animate-float" />
        <p className="font-display text-primary mt-6 text-7xl font-extrabold">404</p>
        <h1 className="mt-2 text-3xl font-extrabold">
          that&apos;s a doubt we <span className="font-serif-i font-normal">can&apos;t</span> answer
        </h1>
        <p className="text-muted-foreground mt-2">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Button asChild className="mt-8" size="lg">
          <Link href="/">Take me home</Link>
        </Button>
      </div>
    </main>
  );
}
