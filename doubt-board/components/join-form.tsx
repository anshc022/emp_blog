"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowRightIcon, Loader2Icon, RadioIcon } from "lucide-react";

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
    <div className="mx-auto flex max-w-lg flex-col items-center py-8 text-center sm:py-16">
      <div className="bg-primary/10 text-primary mb-6 grid size-14 place-items-center rounded-2xl">
        <RadioIcon className="size-7" />
      </div>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Join a live session</h1>
      <p className="text-muted-foreground mt-2">Enter the 6-digit code your teacher is showing.</p>

      <form
        className="mt-10 flex w-full flex-col items-center gap-6"
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
        <p role="alert" className="text-destructive min-h-5 text-sm font-medium">
          {error}
        </p>
        <Button type="submit" size="lg" className="w-full max-w-xs" disabled={code.length !== 6 || pending}>
          {pending ? <Loader2Icon className="animate-spin" /> : <ArrowRightIcon />}
          Join session
        </Button>
      </form>
    </div>
  );
}
