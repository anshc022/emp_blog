"use client";

import { useEffect, useRef } from "react";
import NumberFlow from "@number-flow/react";
import { ArrowFatUpIcon, UsersThreeIcon, XIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";

import { Blobby } from "@/components/art/blobby";
import { GrainBg } from "@/components/art/grain-bg";
import { LogoMark } from "@/components/brand";
import { JoinCode } from "@/components/join-code";
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
      className="grain fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-[#0d0b12] p-6 text-white sm:p-10 lg:p-14"
      role="dialog"
      aria-label="Present mode"
    >
      <GrainBg preset="aurora" speed={0.35} intensity={0.4} />
      <div aria-hidden className="pointer-events-none fixed inset-0 bg-[#0d0b12]/55" />

      <header className="relative flex flex-wrap items-center gap-x-8 gap-y-4">
        <div className="flex min-w-0 items-center gap-4">
          <LogoMark className="size-14 shrink-0" />
          <div className="min-w-0">
            <p className="text-lime text-lg font-bold">{session.subject}</p>
            <h1 className="truncate text-3xl font-extrabold lg:text-5xl">{session.title}</h1>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {session.isActive && session.joinCode && (
            <div className="rounded-3xl border border-white/10 bg-[#0d0b12]/50 px-6 py-3 text-right backdrop-blur-xl">
              <p className="text-xs font-bold tracking-[0.2em] text-white/60 uppercase">Join code</p>
              <JoinCode code={session.joinCode} className="text-4xl lg:text-6xl" />
            </div>
          )}
          <div className="rounded-3xl border border-white/10 bg-[#0d0b12]/50 px-6 py-3 text-right backdrop-blur-xl">
            <p className="flex items-center justify-end gap-1.5 text-xs font-bold tracking-[0.2em] text-white/60 uppercase">
              <UsersThreeIcon weight="fill" className="size-4" /> Here
            </p>
            <NumberFlow value={presence} className="font-display text-4xl font-extrabold lg:text-6xl" />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Exit present mode"
            className="grid size-14 cursor-pointer place-items-center rounded-full border border-white/15 bg-white/10 backdrop-blur-md hover:bg-white/20"
          >
            <XIcon weight="bold" className="size-6" />
          </button>
        </div>
      </header>

      <div className="relative mt-10 flex-1">
        {top.length === 0 ? (
          <div className="grid h-full place-items-center text-center">
            <div>
              <Blobby mood="sleepy" className="mx-auto size-48 text-white" />
              <p className="mt-6 text-4xl font-extrabold lg:text-6xl">No doubts yet</p>
              <p className="font-serif-i mt-2 text-3xl text-white/70 lg:text-4xl">everyone&apos;s a genius today</p>
            </div>
          </div>
        ) : (
          <ol className="flex flex-col gap-4 lg:gap-5">
            <AnimatePresence initial={false} mode="popLayout">
              {top.map((d, i) => (
                <motion.li
                  key={d.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 32 }}
                  className={
                    i === 0
                      ? "flex items-center gap-6 rounded-[2rem] bg-white p-6 text-[#16131c] shadow-2xl lg:gap-10 lg:p-8"
                      : "flex items-center gap-6 rounded-[2rem] border border-white/10 bg-[#0d0b12]/55 p-5 backdrop-blur-xl lg:gap-10 lg:p-7"
                  }
                >
                  <span className="font-display w-14 text-center text-4xl font-extrabold opacity-40 lg:text-6xl">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold tracking-wider uppercase opacity-60">#{d.topic.toLowerCase()}</p>
                    <p className="text-2xl leading-snug font-semibold md:text-3xl lg:text-[2.6rem] lg:leading-tight">{d.text}</p>
                  </div>
                  <div className="bg-lime text-lime-foreground flex min-w-24 flex-col items-center rounded-3xl px-4 py-3 lg:min-w-32">
                    <ArrowFatUpIcon weight="fill" className="size-8 lg:size-10" />
                    <NumberFlow value={d.upvoteCount} className="font-display text-4xl font-extrabold lg:text-6xl" />
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
        )}
      </div>
      <p className="relative mt-8 text-center text-sm text-white/50">Press Esc to exit</p>
    </motion.div>
  );
}
