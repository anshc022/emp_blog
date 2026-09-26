"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowRightIcon, CircleNotchIcon, LockKeyIcon } from "@phosphor-icons/react";

import { Blobby } from "@/components/art/blobby";
import { Sparkle } from "@/components/art/doodles";
import { OtpInput } from "@/components/otp-input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import type { SessionDTO } from "@/lib/sessions";

export function JoinForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [code, setCode] = useState((params.get("code") ?? "").replace(/\D/g, "").slice(0, 6));
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function join(joinCode = code) {
    if (joinCode.length !== 6 || pending) return;
    setPending(true);
    setError(null);
    try {
      const { session } = await api<{ session: SessionDTO }>("/api/sessions/join", {
        method: "POST",
        body: { joinCode },
      });
      router.push(`/session/${session.id}`);
    } catch (err) {
      setError((err as Error).message);
      setPending(false);
    }
  }

  return (
    <div className="relative mx-auto flex max-w-xl flex-col items-center py-6 text-center sm:py-12">
      <div className="relative">
        <Blobby mood={error ? "shocked" : pending ? "happy" : "curious"} className="text-foreground size-32 animate-float" />
        <Sparkle className="text-lime absolute -top-1 -left-6 size-7" />
        <Sparkle className="text-bubblegum absolute top-10 -right-8 size-5" />
      </div>
      <h1 className="mt-6 text-4xl leading-[1.05] font-extrabold sm:text-6xl">
        got a <span className="font-serif-i text-primary text-5xl font-normal sm:text-7xl">code?</span>
      </h1>
      <p className="text-muted-foreground mt-3 text-base sm:text-lg">
        Punch in the 6 digits on your teacher&apos;s screen.
      </p>

      <form
        className="mt-10 flex w-full flex-col items-center gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          join();
        }}
      >
        <OtpInput
          value={code}
          onChange={(v) => {
            setCode(v);
            setError(null);
          }}
          onComplete={join}
          disabled={pending}
          invalid={!!error}
        />
        <p role="alert" className="text-destructive min-h-5 text-sm font-semibold">
          {error}
        </p>
        <Button type="submit" size="lg" className="w-full max-w-xs" disabled={code.length !== 6 || pending}>
          {pending ? <CircleNotchIcon weight="bold" className="animate-spin" /> : null}
          Let me in
          {!pending && <ArrowRightIcon weight="bold" />}
        </Button>
        <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <LockKeyIcon weight="duotone" className="size-4" /> Doubts are anonymous by default
        </p>
      </form>
    </div>
  );
}
