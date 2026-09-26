"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowBigUpIcon, XIcon } from "lucide-react";

import { LogoMark } from "@/components/brand";
import { JoinCode } from "@/components/join-code";
import { Button } from "@/components/ui/button";
import type { DoubtDTO } from "@/lib/serialize";
import type { SessionDTO } from "@/lib/sessions";

/** Full-screen, projector-friendly view of the top 5 open doubts. Esc to exit. */
export function PresentMode({
  session,
  doubts,
  presence,
  onClose,
}: {
  session: SessionDTO;
  doubts: DoubtDTO[];
  presence: number;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    el?.requestFullscreen?.().catch(() => {});
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    // Leaving browser fullscreen (Esc in most browsers) also exits present mode.
    const onFs = () => !document.fullscreenElement && onClose();
    window.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFs);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFs);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, [onClose]);

  const top = doubts.slice(0, 5);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-background fixed inset-0 z-[60] flex flex-col overflow-y-auto p-6 sm:p-10 lg:p-14"
      role="dialog"
      aria-label="Present mode"
    >
      <header className="flex flex-wrap items-center gap-x-8 gap-y-3">
        <div className="flex min-w-0 items-center gap-4">
          <LogoMark className="size-12 shrink-0" />
          <div className="min-w-0">
            <p className="text-primary text-lg font-medium">{session.subject}</p>
            <h1 className="truncate text-2xl font-semibold tracking-tight lg:text-4xl">{session.title}</h1>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-6">
          {session.isActive && session.joinCode && (
            <div className="text-right">
              <p className="text-muted-foreground text-sm font-medium tracking-wider uppercase">Join code</p>
              <JoinCode code={session.joinCode} className="text-4xl lg:text-6xl" />
            </div>
          )}
          <div className="text-right">
            <p className="text-muted-foreground text-sm font-medium tracking-wider uppercase">Students</p>
            <p className="text-4xl font-bold tabular-nums lg:text-6xl">{presence}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Exit present mode" className="size-12">
            <XIcon className="size-6" />
          </Button>
        </div>
      </header>

      <div className="mt-10 flex-1">
        {top.length === 0 ? (
          <div className="text-muted-foreground grid h-full place-items-center text-center text-3xl lg:text-5xl">
            No doubts yet — everyone&apos;s a genius today 🎉
          </div>
        ) : (
          <ol className="flex flex-col gap-4 lg:gap-6">
            <AnimatePresence initial={false} mode="popLayout">
              {top.map((d, i) => (
                <motion.li
                  key={d.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 32 }}
                  className="bg-card flex items-center gap-6 rounded-2xl border p-5 shadow-sm lg:gap-10 lg:p-8"
                >
                  <span className="text-muted-foreground/60 w-12 text-4xl font-bold tabular-nums lg:text-6xl">
                    {i + 1}
                  </span>
                  <p className="flex-1 text-2xl leading-snug font-medium md:text-3xl lg:text-5xl">{d.text}</p>
                  <div className="text-primary flex flex-col items-center">
                    <ArrowBigUpIcon className="size-10 fill-current lg:size-14" />
                    <motion.span
                      key={d.upvoteCount}
                      initial={{ scale: 1.5 }}
                      animate={{ scale: 1 }}
                      className="text-3xl font-bold tabular-nums lg:text-5xl"
                    >
                      {d.upvoteCount}
                    </motion.span>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
        )}
      </div>
      <p className="text-muted-foreground mt-8 text-center text-sm">Press Esc to exit</p>
    </motion.div>
  );
}
