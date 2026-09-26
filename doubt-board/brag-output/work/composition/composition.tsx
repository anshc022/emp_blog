"use client";

/**
 * /brag launch-video composition. Every frame is a pure function of `t`
 * (seconds), set from the render script via window.__bragSeek(t). The page's
 * clock is faked and stepped 1/30 s per frame, so framer-motion's layout
 * animations (list re-ranking) are deterministic too.
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { flushSync } from "react-dom";
import confetti from "canvas-confetti";
import { GrainGradient } from "@paper-design/shaders-react";
import { ArrowRightIcon, CopyIcon, EyesIcon, LinkSimpleIcon, LockKeyIcon, PaperPlaneTiltIcon, PlusIcon, PowerIcon, PresentationChartIcon, SealCheckIcon, SparkleIcon, TrashIcon } from "@phosphor-icons/react";

import { AnalyticsView } from "@/components/analytics-view";
import { Avatar } from "@/components/art/avatar";
import { Blobby } from "@/components/art/blobby";
import { Sparkle } from "@/components/art/doodles";
import { GRAIN_PRESETS } from "@/components/art/grain-bg";
import { LogoMark } from "@/components/brand";
import { DoubtCard } from "@/components/doubt-card";
import { DoubtList } from "@/components/doubt-list";
import { JoinCode } from "@/components/join-code";
import { LiveStatus } from "@/components/live-status";
import { OtpInput } from "@/components/otp-input";
import { PresentMode } from "@/components/present-mode";
import { UpvoteButton } from "@/components/upvote-button";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { Switch } from "@/components/ui/switch";
import type { Analytics } from "@/lib/analytics";
import type { DoubtDTO } from "@/lib/serialize";
import type { SessionDTO } from "@/lib/sessions";
import { cn } from "@/lib/utils";

import T from "./timeline.json";

// ── easing helpers ────────────────────────────────────────────────────────
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const p = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const eo = (x: number) => 1 - Math.pow(1 - x, 3);
const eio = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const back = (x: number) => {
  const c1 = 1.5;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
const countUpTo = (arr: number[], t: number) => arr.filter((x) => x <= t).length;
/** Fade + rise in at `a`, optional exit at `b`. */
const enter = (t: number, a: number, dur = 0.4, dist = 40, exitAt?: number, exitDur = 0.3) => {
  const i = eo(p(t, a, a + dur));
  const o = exitAt === undefined ? 0 : eio(p(t, exitAt, exitAt + exitDur));
  return { opacity: i * (1 - o), transform: `translateY(${(1 - i) * dist - o * dist}px)` };
};

const W = 1920;
const H = 1080;
const NOW_ISO = new Date(0).toISOString();

function doubt(partial: Partial<DoubtDTO> & { id: string; text: string }): DoubtDTO {
  return {
    sessionId: "s",
    topic: "General",
    isAnonymous: true,
    author: null,
    isMine: false,
    hasUpvoted: false,
    upvoteCount: 0,
    status: "open",
    answer: null,
    createdAt: NOW_ISO,
    answeredAt: null,
    ...partial,
  };
}

// ── shared pieces ─────────────────────────────────────────────────────────
function Ink({ t, children }: { t: number; children?: React.ReactNode }) {
  const g = GRAIN_PRESETS.aurora;
  return (
    <div className="grain absolute inset-0 overflow-hidden bg-[#0d0b12] text-white">
      <GrainGradient
        className="absolute inset-0 size-full"
        colorBack={g.colorBack}
        colors={[...g.colors]}
        shape={g.shape}
        softness={0.6}
        intensity={0.45}
        noise={0.3}
        speed={0}
        maxPixelCount={1280 * 720}
        minPixelRatio={1}
        frame={t * 650}
      />
      <div className="absolute inset-0 bg-[radial-gradient(62%_62%_at_50%_52%,rgb(13_11_18/0.86),rgb(13_11_18/0.25))]" />
      {children}
    </div>
  );
}

function Paper({ children }: { children?: React.ReactNode }) {
  return (
    <div className="bg-background bg-grid absolute inset-0 overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(60%_100%_at_20%_0%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent),radial-gradient(40%_80%_at_90%_0%,color-mix(in_oklab,var(--bubblegum)_12%,transparent),transparent)]" />
      {children}
    </div>
  );
}

/** "step 2" sticker that sits above each explainer caption. */
function Step({ n, style, className }: { n: number; style?: React.CSSProperties; className?: string }) {
  return (
    <span
      className={cn(
        "bg-lime text-lime-foreground font-display inline-flex items-center gap-2 rounded-full border-2 border-[#16131c] px-5 py-2 text-3xl font-extrabold shadow-[3px_3px_0_0_#16131c]",
        className,
      )}
      style={style}
    >
      step {n}
    </span>
  );
}

const SESSION: SessionDTO = {
  id: "demo",
  title: "Data Structures: Live Q&A",
  subject: "Computer Science",
  isActive: true,
  createdAt: new Date(0).toISOString(),
  endedAt: null,
  joinCode: "482913",
  isOwner: true,
};

function Caret({ t, on = true }: { t: number; on?: boolean }) {
  return (
    <span
      className="bg-primary ml-0.5 inline-block w-[3px] translate-y-[3px] rounded-full"
      style={{ height: "1.05em", opacity: on && Math.floor(t * 2.2) % 2 === 0 ? 1 : 0 }}
    />
  );
}

/** Visual twin of <AskBox> (the real one is stateful), driven by t. */
function Composer({
  t,
  text,
  typing,
  typeStart,
  pressAt,
  fontSize = 18,
  chips = ["general", "concept", "example", "homework", "exam"],
  activeChip = "general",
  children,
}: {
  t: number;
  text: string;
  typing: number[];
  typeStart: number;
  pressAt?: number;
  fontSize?: number;
  chips?: string[];
  activeChip?: string;
  children?: React.ReactNode;
}) {
  const n = countUpTo(typing, t);
  const shown = text.slice(0, n);
  const press = pressAt === undefined ? 0 : p(t, pressAt, pressAt + 0.08) * (1 - p(t, pressAt + 0.08, pressAt + 0.22));
  const len = shown.length;
  const r = 9;
  const c = 2 * Math.PI * r;
  return (
    <div className="bg-card text-foreground shadow-pop border-primary/60 ring-primary/10 rounded-3xl border ring-4">
      <div className="flex items-center gap-2.5 px-5 pt-5">
        <Avatar seed="you-anon" className="ring-0" />
        <div className="text-sm leading-tight">
          <div className="font-semibold">Anonymous</div>
          <div className="text-muted-foreground text-xs">Not even your teacher will see your name</div>
        </div>
      </div>
      <div className="min-h-24 px-5 pt-3 pb-3 font-medium" style={{ fontSize, lineHeight: 1.35 }}>
        {shown.length === 0 && t < typeStart ? (
          <span className="text-muted-foreground/70">Ask the thing everyone&apos;s secretly thinking…</span>
        ) : (
          shown
        )}
        <Caret t={t} />
      </div>
      {children}
      <div className="flex gap-1.5 px-5 pb-3">
        {chips.map((ch) => (
          <span
            key={ch}
            className={cn(
              "flex h-8 items-center rounded-full border px-3 text-xs font-semibold",
              ch === activeChip ? "border-foreground bg-foreground text-background" : "text-muted-foreground",
            )}
          >
            #{ch}
          </span>
        ))}
        <span className="text-muted-foreground inline-flex h-8 items-center gap-1 rounded-full border border-dashed px-3 text-xs font-semibold">
          <PlusIcon weight="bold" className="size-3" /> custom
        </span>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-dashed px-5 py-3">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Switch checked aria-label="Stay anonymous" /> Stay anonymous
        </span>
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 24 24" className="size-6 -rotate-90">
            <circle cx="12" cy="12" r={r} fill="none" stroke="var(--border)" strokeWidth="3" />
            <circle
              cx="12"
              cy="12"
              r={r}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={c * (1 - Math.min(len / 500, 1))}
            />
          </svg>
          <Button disabled={len < 3} style={{ transform: `scale(${1 - press * 0.08})` }} className="min-w-24">
            <PaperPlaneTiltIcon weight="fill" /> Ask
          </Button>
        </div>
      </div>
    </div>
  );
}

function Tap({ t, at, x, y }: { t: number; at: number; x: number; y: number }) {
  const k = p(t, at, at + 0.45);
  if (k <= 0 || k >= 1) return null;
  return (
    <span
      className="border-primary pointer-events-none absolute rounded-full border-4"
      style={{
        left: x,
        top: y,
        width: 20 + k * 90,
        height: 20 + k * 90,
        transform: "translate(-50%,-50%)",
        opacity: 1 - k,
      }}
    />
  );
}

function Cursor({ x, y, down }: { x: number; y: number; down: boolean }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className="pointer-events-none absolute z-50 size-12 drop-shadow-[0_6px_10px_rgba(0,0,0,0.25)]"
      style={{ left: x - 6, top: y - 4, transform: `scale(${down ? 0.86 : 1})`, transformOrigin: "6px 4px" }}
    >
      <path d="M6 4l20 11-9 2.4L12.6 26z" fill="#16131c" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

// ── scene 1: hook ─────────────────────────────────────────────────────────
function SceneHook({ t }: { t: number }) {
  const s = T.s1;
  const votes = countUpTo(s.votes, t);
  const composerOut = eio(p(t, s.send + 0.02, s.doubtIn));
  const floaters = s.votes.map((v, i) => ({ v, i })).filter(({ v, i }) => i % 3 === 1 && t >= v && t < v + 0.55);
  return (
    <Ink t={t}>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="font-serif-i mb-10 text-6xl text-white/80" style={enter(t, s.label, 0.45, 24)}>
          everyone, silently:
        </p>
        <div className="text-foreground relative w-[1180px]" style={{ height: 340 }}>
          {t < s.doubtIn + 0.05 && (
            <div
              className="absolute top-0 left-1/2 w-[860px] origin-top"
              style={{
                opacity: (1 - composerOut) * eo(p(t, s.cardIn, s.cardIn + 0.4)),
                transform: `translateX(-50%) translateY(${(1 - eo(p(t, s.cardIn, s.cardIn + 0.4))) * 50}px) scale(${1.25 - composerOut * 0.1})`,
              }}
            >
              <Composer t={t} text={s.text} typing={s.typing} typeStart={s.typing[0]} pressAt={s.send - 0.05} fontSize={30} activeChip="exam" />
            </div>
          )}
          {t >= s.doubtIn && (
            <div className="absolute top-2 left-1/2 w-[620px] origin-top" style={{ transform: "translateX(-50%) scale(1.9)" }}>
              <DoubtList>
                <DoubtCard
                  doubt={doubt({ id: "hook", text: s.text, topic: "Exam", upvoteCount: votes, hasUpvoted: votes > 0 })}
                  now={0}
                  rank={1}
                  canVote
                />
              </DoubtList>
              {floaters.map(({ v, i }) => {
                const k = p(t, v, v + 0.55);
                return (
                  <span
                    key={v}
                    className="bg-lime text-lime-foreground font-display absolute rounded-full border border-[#16131c] px-1.5 text-[11px] font-extrabold"
                    style={{ right: 14 + ((i * 7) % 5) * 9 - 18, top: 14 - eo(k) * 60, opacity: 1 - k * k, transform: `rotate(${((i * 13) % 7) - 3}deg)` }}
                  >
                    +1
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Ink>
  );
}

// ── scene 2: reveal ───────────────────────────────────────────────────────
const HEADLINE = [["ask", "the", "question"], ["everyone", "is", "thinking."]];

function SceneReveal({ t }: { t: number }) {
  const s = T.s2;
  const logo = back(p(t, s.logo, s.logo + 0.45));
  const wordIn = eo(p(t, s.word, s.word + 0.45));
  const squig = eio(p(t, s.squiggle, s.squiggle + 0.45));
  const sticker = back(p(t, s.sticker, s.sticker + 0.4));
  const out = eio(p(t, s.exit, s.exit + 0.3));
  let wi = 0;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ opacity: 1 - out, transform: `translateY(${-out * 40}px)` }}>
      <div className="mb-12 flex items-center gap-7">
        <div style={{ transform: `scale(${logo}) rotate(${(1 - logo) * -25}deg)` }}>
          <LogoMark className="size-32" />
        </div>
        <div className="overflow-hidden">
          <div
            className="font-display text-[96px] leading-none font-bold tracking-tight"
            style={{ transform: `translateX(${(1 - wordIn) * -60}px)`, opacity: wordIn }}
          >
            doubt<span className="text-primary">board</span>
            <span className="bg-lime text-lime-foreground ml-4 inline-block -translate-y-4 rounded-xl px-3.5 py-1.5 align-middle text-[26px] font-extrabold tracking-widest">
              LIVE
            </span>
          </div>
        </div>
      </div>
      <h1 className="text-center text-[132px] leading-[0.98] font-extrabold tracking-[-0.035em]">
        {HEADLINE.map((line, li) => (
          <span key={li} className="block">
            {line.map((w) => {
              const i = wi++;
              const k = eo(p(t, s.headline + i * 0.07, s.headline + i * 0.07 + 0.4));
              const serif = w === "everyone";
              return (
                <span
                  key={w}
                  className={cn("relative mx-[0.12em] inline-block", serif && "font-serif-i text-primary font-normal")}
                  style={{ opacity: k, transform: `translateY(${(1 - k) * 50}px)` }}
                >
                  {w}
                  {serif && (
                    <svg viewBox="0 0 220 18" preserveAspectRatio="none" className="text-bubblegum absolute -bottom-3 left-0 h-5 w-full">
                      <path
                        d="M3 12C25 4 40 4 56 10s32 6 50-1 34-7 52 0 34 6 58-3"
                        stroke="currentColor"
                        strokeWidth="5"
                        strokeLinecap="round"
                        fill="none"
                        strokeDasharray={260}
                        strokeDashoffset={260 * (1 - squig)}
                      />
                    </svg>
                  )}
                </span>
              );
            })}
          </span>
        ))}
      </h1>
      <p className="text-muted-foreground mt-10 text-[44px] font-medium" style={enter(t, s.sub, 0.4, 24)}>
        a live Q&amp;A board for your classroom.
      </p>
      <span
        className="bg-lime text-lime-foreground shadow-sticker font-display absolute right-[190px] bottom-[110px] rounded-2xl border-2 border-[#16131c] px-6 py-3 text-4xl font-extrabold"
        style={{ transform: `rotate(6deg) scale(${sticker})`, opacity: p(t, s.sticker, s.sticker + 0.1) }}
      >
        anonymous by default 🕵️
      </span>
      <Sparkle className="text-lime absolute top-[190px] right-[560px] size-12" style={{ transform: `scale(${logo})` }} />
      <Sparkle className="text-bubblegum absolute bottom-[260px] left-[230px] size-9" style={{ transform: `scale(${sticker})` }} />
    </div>
  );
}

// ── scenes 3 + 4: the phone ───────────────────────────────────────────────
function PhoneJoin({ t }: { t: number }) {
  const s = T.join;
  // The real OtpInput autofocuses its first box; hide the caret for the video.
  useEffect(() => {
    const el = document.activeElement as HTMLElement | null;
    if (el && el.tagName === "INPUT") el.blur();
  });
  const n = countUpTo(s.digits, t);
  const press = p(t, s.press, s.press + 0.08) * (1 - p(t, s.press + 0.08, s.press + 0.22));
  return (
    <div className="relative flex h-full w-[416px] shrink-0 flex-col items-center px-6 pt-28 text-center">
      <Blobby mood={t >= s.press ? "happy" : "curious"} className="text-foreground size-44" />
      <h2 className="mt-6 text-[50px] leading-none font-extrabold">
        got a <span className="font-serif-i text-primary text-[60px] font-normal">code?</span>
      </h2>
      <p className="text-muted-foreground mt-4 text-base">Punch in the 6 digits on your teacher&apos;s screen.</p>
      <div className="mt-10 flex h-[68px] w-full justify-center">
        <div className="origin-top scale-[0.8]">
          <OtpInput value={s.code.slice(0, n)} onChange={() => {}} />
        </div>
      </div>
      <div className="mt-8 w-full">
        <Button size="lg" className="w-full" disabled={n < 6} style={{ transform: `scale(${1 - press * 0.06})` }}>
          Let me in <ArrowRightIcon weight="bold" />
        </Button>
        <p className="text-muted-foreground mt-5 flex items-center justify-center gap-1.5 text-sm">
          <LockKeyIcon weight="duotone" className="size-4" /> Doubts are anonymous by default
        </p>
      </div>
      <Tap t={t} at={s.press} x={208} y={642} />
    </div>
  );
}

function PhoneSession({ t }: { t: number }) {
  const s = T.ask;
  const sim = eo(p(t, s.similar, s.similar + 0.3));
  const tapped = t >= s.tap;
  return (
    <div className="relative flex h-full w-[416px] shrink-0 flex-col gap-4 px-4 pt-14 text-left">
      <div className="flex items-center gap-2">
        <span className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-xs font-bold">Computer Science</span>
        <LiveStatus active connected presence={28} />
      </div>
      <h2 className="text-[30px] leading-tight font-extrabold">Data Structures: Live Q&amp;A</h2>
      <Composer t={t} text={s.text} typing={s.typing} typeStart={s.typing[0]} chips={["general", "concept", "big-o"]}>
        <div style={{ height: sim * 132, opacity: sim }} className="overflow-hidden">
          <div className="border-primary/40 bg-accent/60 mx-3 mb-3 rounded-2xl border border-dashed p-3">
            <p className="text-accent-foreground mb-2 flex items-center gap-1.5 text-xs font-bold">
              <EyesIcon weight="duotone" className="size-4" /> someone already asked this — upvote instead?
            </p>
            <div className="bg-card flex items-center gap-3 rounded-xl border p-2 pr-3">
              <div style={{ transform: `scale(${1 + 0.18 * Math.sin(Math.PI * p(t, s.tap, s.tap + 0.3))})` }}>
                <UpvoteButton size="sm" count={tapped ? 5 : 4} active={tapped} />
              </div>
              <p className="line-clamp-2 flex-1 text-sm font-medium">Why is binary search O(log n) and not O(n/2)?</p>
            </div>
          </div>
        </div>
      </Composer>
      <Segmented
        value="open"
        onChange={() => {}}
        options={[
          { value: "open", label: "Open", count: 5 },
          { value: "answered", label: "Answered", count: 2 },
        ]}
        className="w-full"
      />
      <DoubtList>
        <DoubtCard
          doubt={doubt({ id: "ph1", text: "Why is binary search O(log n) and not O(n/2)?", topic: "Big-O", upvoteCount: tapped ? 5 : 4, hasUpvoted: tapped })}
          now={0}
          rank={1}
          canVote
        />
        <DoubtCard
          doubt={doubt({ id: "ph2", text: "Does recursion always use more memory than a loop?", topic: "Recursion", upvoteCount: 3, isAnonymous: false, author: { name: "Vihaan Rao" } })}
          now={0}
          rank={2}
          canVote
        />
      </DoubtList>
      <Tap t={t} at={s.tap} x={46} y={378} />
    </div>
  );
}

function ScenePhone({ t }: { t: number }) {
  const s3 = T.join;
  const s4 = T.ask;
  const inK = eo(p(t, s3.phoneIn, s3.phoneIn + 0.5));
  const outK = eio(p(t, s4.exit, s4.exit + 0.35));
  const slide = eio(p(t, s3.slide, s3.slide + 0.45));
  const cap3 = enter(t, s3.caption, 0.4, 40, 12.75, 0.25);
  const cap4a = enter(t, s4.caption1, 0.4, 40, s4.exit, 0.3);
  const cap4b = enter(t, s4.caption2, 0.4, 40, s4.exit, 0.3);
  return (
    <>
      <div className="absolute top-0 left-[170px] flex h-full w-[900px] flex-col justify-center">
        {t < 13.05 ? (
          <div style={cap3}>
            <Step n={2} className="mb-8" />
            <h2 className="text-[104px] leading-[0.98] font-extrabold tracking-[-0.03em]">
              students join
              <br />
              <span className="font-serif-i text-primary text-[120px] font-normal">with the code.</span>
            </h2>
          </div>
        ) : (
          <h2 className="text-[112px] leading-[0.98] font-extrabold tracking-[-0.03em]">
            <span className="mb-8 block" style={cap4a}>
              <Step n={3} />
            </span>
            <span className="block" style={cap4a}>
              ask anonymously.
            </span>
            <span className="font-serif-i text-primary block text-[128px] font-normal" style={cap4b}>
              or just upvote it.
            </span>
          </h2>
        )}
      </div>
      <div
        className="absolute top-[70px] left-[1240px] h-[940px] w-[440px] rounded-[64px] border-[12px] border-[#16131c] bg-[#16131c] shadow-[0_40px_80px_-30px_rgba(40,20,90,0.55)]"
        style={{ transform: `translate(${outK * 700}px, ${(1 - inK) * 1100}px) rotate(${(1 - inK) * 8 + outK * 10}deg)` }}
      >
        <div className="bg-background bg-grid relative h-full w-full overflow-hidden rounded-[52px]">
          <div className="absolute top-3 left-1/2 z-10 h-7 w-28 -translate-x-1/2 rounded-full bg-[#16131c]" />
          <div className="flex h-full w-[832px]" style={{ transform: `translateX(${-slide * 416}px)` }}>
            <PhoneJoin t={t} />
            <PhoneSession t={t} />
          </div>
        </div>
      </div>
    </>
  );
}

// ── scene 5: teacher board ────────────────────────────────────────────────
const BOARD = [
  { id: "A", base: 6, created: 1, d: { text: "Why is binary search O(log n) and not O(n/2)?", topic: "Big-O" } },
  { id: "B", base: 5, created: 2, d: { text: "Does recursion always use more memory than a loop?", topic: "Recursion", isAnonymous: false, author: { name: "Vihaan Rao" } } },
  { id: "D", base: 3, created: 3, d: { text: "What's the difference between an array and a linked list in terms of memory?", topic: "Arrays" } },
  { id: "C", base: 2, created: 4, d: { text: "Can you redo the linked list reversal one more time?", topic: "Linked lists" } },
];

function SceneTeacher({ t, onConfetti }: { t: number; onConfetti: (x: number, y: number) => void }) {
  const s = T.board;
  const inK = eo(p(t, s.in, s.in + 0.5));
  const answered = t >= s.click + 0.05;
  const targetRef = useRef<HTMLSpanElement>(null);
  const [target, setTarget] = useState({ x: 1400, y: 700 });
  const fired = useRef(false);

  const list = useMemo(() => {
    const rows = BOARD.map((b) => ({
      ...b,
      votes: b.base + s.votes.filter((v) => v.id === b.id && v.t <= t).length,
    }))
      .filter((b) => !(answered && b.id === "C"))
      .sort((a, b) => b.votes - a.votes || a.created - b.created);
    return rows;
  }, [t, answered, s.votes]);

  useLayoutEffect(() => {
    const el = targetRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = r.left + r.width / 2;
    const ny = r.top + r.height / 2;
    if (Math.abs(nx - target.x) > 0.5 || Math.abs(ny - target.y) > 0.5) setTarget({ x: nx, y: ny });
  });

  useEffect(() => {
    if (t >= s.confetti && !fired.current) {
      fired.current = true;
      onConfetti(target.x, target.y);
    }
  }, [t, s.confetti, target, onConfetti]);

  const upvotes = list.reduce((n, d) => n + d.votes, 0);
  // cursor path
  const ck = eio(p(t, s.cursor, s.click - 0.1));
  const cx = 1560 + (target.x - 1560) * ck;
  const cy = 1040 + (target.y - 1040) * ck - Math.sin(ck * Math.PI) * 60;
  const down = t >= s.click && t < s.click + 0.14;

  return (
    <>
      <h2
        className="absolute top-[70px] left-[170px] flex items-center gap-6 text-[76px] leading-none font-extrabold tracking-[-0.03em]"
        style={enter(t, s.caption, 0.4, 30, s.exit, 0.3)}
      >
        <Step n={4} />
        <span>
          the teacher sees what matters <span className="font-serif-i text-primary font-normal">— live.</span>
        </span>
      </h2>
      <div
        className="bg-card shadow-pop absolute top-[215px] left-[170px] h-[900px] w-[1580px] overflow-hidden rounded-[28px] border"
        style={{
          opacity: inK * (1 - eio(p(t, s.exit, s.exit + 0.3))),
          transform: `translateY(${(1 - inK) * 260 - eio(p(t, s.exit, s.exit + 0.3)) * 80}px)`,
        }}
      >
        <div className="flex h-12 items-center gap-2 border-b px-5">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
          <span className="bg-muted text-muted-foreground mx-auto rounded-full px-4 py-1 text-xs font-medium">
            doubtboard · teacher / live board
          </span>
        </div>
        <div className="bg-background bg-grid grid h-full grid-cols-[1fr_330px] gap-8 px-12 pt-8">
          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-2">
              <span className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-xs font-bold">Computer Science</span>
              <LiveStatus active connected presence={28} />
            </div>
            <h3 className="mb-5 text-5xl font-extrabold">Data Structures: Live Q&amp;A</h3>
            <Segmented
              value="open"
              onChange={() => {}}
              options={[
                { value: "open", label: "Open", count: list.length },
                { value: "answered", label: "Answered", count: answered ? 3 : 2 },
              ]}
              className="mb-2"
            />
            <DoubtList>
              {list.map((b, i) => (
                <DoubtCard
                  key={b.id}
                  doubt={doubt({ id: b.id, upvoteCount: b.votes, ...b.d })}
                  now={0}
                  rank={i + 1}
                  actions={
                    <>
                      <span ref={b.id === "C" ? targetRef : undefined} className="inline-flex">
                        <Button size="sm">
                          <SealCheckIcon weight="fill" /> Mark answered
                        </Button>
                      </span>
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        <TrashIcon weight="bold" /> Delete
                      </Button>
                    </>
                  }
                />
              ))}
            </DoubtList>
          </div>
          <aside className="flex flex-col gap-3 pt-2">
            <div className="grain shadow-pop relative overflow-hidden rounded-3xl p-6 text-center text-white">
              <GrainGradient
                className="absolute inset-0 size-full"
                colorBack="#0d0b12"
                colors={[...GRAIN_PRESETS.aurora.colors]}
                shape="corners"
                intensity={0.45}
                softness={0.6}
                noise={0.3}
                speed={0}
        maxPixelCount={1280 * 720}
        minPixelRatio={1}
                frame={t * 650}
              />
              <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_55%,rgb(13_11_18/0.8),transparent)]" />
              <p className="relative text-xs font-bold tracking-[0.2em] text-white/70 uppercase">Join code</p>
              <JoinCode code={T.join.code} className="relative mt-1 block text-5xl" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Here", value: 28, cls: "bg-lime text-lime-foreground border-transparent" },
                { label: "Open", value: list.length, cls: "bg-card" },
                { label: "Upvotes", value: upvotes, cls: "bg-card" },
              ].map((x) => (
                <div key={x.label} className={`shadow-soft rounded-2xl border p-3 text-center ${x.cls}`}>
                  <div className="font-display text-3xl font-extrabold">{x.value}</div>
                  <div className="text-xs font-semibold opacity-70">{x.label}</div>
                </div>
              ))}
            </div>
            <Button size="lg" variant="ink" className="h-14 text-base">
              <PresentationChartIcon weight="duotone" className="size-5" /> Present mode
            </Button>
            <Button size="lg" variant="outline" className="text-destructive">
              <PowerIcon weight="bold" /> End session
            </Button>
          </aside>
        </div>
      </div>
      {t >= s.cursor && t < s.exit && <Cursor x={cx} y={cy} down={down} />}
      <Tap t={t} at={s.click} x={target.x} y={target.y} />
    </>
  );
}

// ── step 1: teacher starts a session ─────────────────────────────────────
function SceneStart({ t }: { t: number }) {
  const s = T.start;
  const card = eo(p(t, s.card, s.card + 0.5));
  const out = eio(p(t, s.exit, s.exit + 0.3));
  const shown = s.codeDigits.filter((d) => d <= t).length;
  const code = T.join.code;
  return (
    <div className="absolute inset-0" style={{ opacity: 1 - out, transform: `translateY(${-out * 40}px)` }}>
      <div className="absolute top-0 left-[170px] flex h-full w-[640px] flex-col justify-center" style={enter(t, s.caption, 0.4, 40)}>
        <Step n={1} className="mb-8 w-fit" />
        <h2 className="text-[104px] leading-[0.98] font-extrabold tracking-[-0.03em]">
          teacher starts
          <br />
          <span className="font-serif-i text-primary text-[120px] font-normal">a session.</span>
        </h2>
      </div>
      <div
        className="absolute top-1/2 left-[860px] flex w-[900px] flex-col items-center text-center"
        style={{ opacity: card, transform: `translateY(calc(-50% + ${(1 - card) * 60}px))` }}
      >
        <span className="bg-lime text-lime-foreground inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xl font-bold">
          <SparkleIcon weight="fill" className="size-5" /> you&apos;re live
        </span>
        <h3 className="mt-4 text-5xl font-extrabold">{SESSION.title}</h3>
        <p className="text-muted-foreground mt-1 text-2xl font-semibold">{SESSION.subject}</p>
        <div className="grain shadow-pop relative mt-8 w-full overflow-hidden rounded-[2.2rem] px-6 py-12 text-white">
          <GrainGradient
            className="absolute inset-0 size-full"
            colorBack="#0d0b12"
            colors={[...GRAIN_PRESETS.aurora.colors]}
            shape="corners"
            intensity={0.45}
            softness={0.6}
            noise={0.3}
            speed={0}
            maxPixelCount={1280 * 720}
            minPixelRatio={1}
            frame={t * 650}
          />
          <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_55%,rgb(13_11_18/0.8),transparent)]" />
          <p className="relative text-lg font-bold tracking-[0.2em] text-white/70 uppercase">
            students go to <span className="text-white">/join</span> and enter
          </p>
          <div className="font-display relative mt-2 text-[150px] leading-none font-extrabold tracking-[0.06em] tabular-nums">
            {code.split("").map((d, i) => {
              const k = back(p(t, s.codeDigits[i], s.codeDigits[i] + 0.3));
              return (
                <span key={i}>
                  {i === 3 && <span className="mx-[0.12em] opacity-40">·</span>}
                  <span className="inline-block" style={{ opacity: i < shown ? 1 : 0.12, transform: `translateY(${(1 - k) * 30}px)` }}>
                    {i < shown ? d : "0"}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
        <div className="mt-8 flex gap-3">
          <Button variant="outline" size="lg">
            <CopyIcon weight="bold" /> Copy code
          </Button>
          <Button variant="outline" size="lg">
            <LinkSimpleIcon weight="bold" /> Copy link
          </Button>
          <Button size="lg">
            Open live board <ArrowRightIcon weight="bold" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── present mode (the real component, framed as a projector screen) ──────
const PRESENT_BASE = [
  { id: "A", votes: 8, created: 1, text: "Why is binary search O(log n) and not O(n/2)?", topic: "Big-O" },
  { id: "B", votes: 6, created: 2, text: "Does recursion always use more memory than a loop?", topic: "Recursion" },
  { id: "D", votes: 4, created: 3, text: "What's the difference between an array and a linked list in terms of memory?", topic: "Arrays" },
  { id: "E", votes: 2, created: 5, text: "Can we get one more example of a hash collision?", topic: "Hashing" },
  { id: "F", votes: 1, created: 6, text: "When would I use a queue instead of a stack?", topic: "Queues" },
];

function ScenePresent({ t }: { t: number }) {
  const s = T.present;
  const inK = eo(p(t, s.in, s.in + 0.5));
  const out = eio(p(t, s.exit, s.exit + 0.3));
  const doubts = useMemo(
    () =>
      PRESENT_BASE.map((d) => ({ ...d, votes: d.votes + s.votes.filter((v) => v.id === d.id && v.t <= t).length }))
        .sort((a, b) => b.votes - a.votes || a.created - b.created)
        .map((d) => doubt({ id: d.id, text: d.text, topic: d.topic, upvoteCount: d.votes })),
    [t, s.votes],
  );
  const scale = 1440 / 1920;
  return (
    <div className="absolute inset-0" style={{ opacity: 1 - out }}>
      <h2
        className="absolute top-[56px] left-0 w-full text-center text-[76px] leading-none font-extrabold tracking-[-0.03em]"
        style={enter(t, s.caption, 0.4, 30)}
      >
        put the top 5 <span className="font-serif-i text-primary font-normal">on the projector.</span>
      </h2>
      <div
        className="shadow-pop absolute top-[190px] left-[240px] overflow-hidden rounded-[32px] border-[10px] border-[#16131c] bg-[#16131c]"
        style={{ width: 1440 + 20, height: 810 + 20, opacity: inK, transform: `translateY(${(1 - inK) * 200}px) scale(${0.96 + 0.04 * inK})` }}
      >
        {/* transformed wrapper: PresentMode's position:fixed resolves against this box */}
        <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
          <PresentMode session={SESSION} doubts={doubts} presence={28} onClose={() => {}} />
        </div>
      </div>
    </div>
  );
}

// ── analytics (the real page, fed demo data through the query cache) ─────
const ANALYTICS: Analytics = {
  timezone: "UTC",
  topTopics: [
    { topic: "Recursion", count: 9, upvotes: 31 },
    { topic: "Big-O", count: 7, upvotes: 26 },
    { topic: "Linked lists", count: 6, upvotes: 19 },
    { topic: "Arrays", count: 4, upvotes: 11 },
    { topic: "Hashing", count: 3, upvotes: 8 },
  ],
  status: { answered: 23, open: 11, total: 34 },
  byHour: Array.from({ length: 24 }, (_, hour) => ({ hour, count: [0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 7, 11, 5, 2, 6, 8, 3, 1, 0, 0, 0, 0, 0, 0][hour] })),
  sessions: [],
};

function SceneStats({ t }: { t: number }) {
  const s = T.stats;
  const qc = useQueryClient();
  const [ready] = useState(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    qc.setQueryData(["analytics", tz], { ...ANALYTICS, timezone: tz });
    return true;
  });
  const inK = eo(p(t, s.in, s.in + 0.5));
  return (
    <>
      <h2
        className="absolute top-[70px] left-[170px] text-[84px] leading-none font-extrabold tracking-[-0.03em]"
        style={enter(t, s.caption, 0.4, 30)}
      >
        then see what <span className="font-serif-i text-primary font-normal">confused the class.</span>
      </h2>
      <div
        className="bg-card shadow-pop absolute top-[215px] left-[170px] h-[900px] w-[1580px] overflow-hidden rounded-[28px] border"
        style={{ opacity: inK, transform: `translateY(${(1 - inK) * 260}px)` }}
      >
        <div className="flex h-12 items-center gap-2 border-b px-5">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
          <span className="bg-muted text-muted-foreground mx-auto rounded-full px-4 py-1 text-xs font-medium">
            doubtboard · teacher / analytics
          </span>
        </div>
        <div className="bg-background bg-grid h-full overflow-hidden px-12 pt-8">
          {ready && t >= s.in + 0.1 && (
            <div style={{ width: 1484 / 0.86, transform: "scale(0.86)", transformOrigin: "0 0" }}>
              <AnalyticsView />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── scene 6: punchline ────────────────────────────────────────────────────
function SceneOutro({ t }: { t: number }) {
  const s = T.outro;
  const b = back(p(t, s.blobby, s.blobby + 0.5));
  const words = ["no", "question", "is", "a", "silly", "question."];
  return (
    <Ink t={t}>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div style={{ transform: `translateY(${(1 - b) * 160}px) scale(${0.6 + 0.4 * b})`, opacity: p(t, s.blobby, s.blobby + 0.15) }}>
          <Blobby mood="proud" className="size-56 text-white" />
        </div>
        <h2 className="mt-6 text-[124px] leading-[0.98] font-extrabold tracking-[-0.035em]">
          {words.map((w, i) => {
            const k = eo(p(t, s.headline + i * 0.07, s.headline + i * 0.07 + 0.4));
            const serif = i >= 4;
            return (
              <span key={i}>
                {i === 4 && <br />}
                <span
                  className={cn("mx-[0.12em] inline-block", serif && "font-serif-i text-lime text-[140px] font-normal")}
                  style={{ opacity: k, transform: `translateY(${(1 - k) * 50}px)` }}
                >
                  {w}
                </span>
              </span>
            );
          })}
        </h2>
        <div className="mt-12 flex items-center gap-5" style={enter(t, s.brand, 0.45, 30)}>
          <LogoMark className="size-16" />
          <span className="font-display text-5xl font-bold">
            doubt<span className="text-[#a58bff]">board</span>
          </span>
          <span className="h-10 w-px bg-white/25" />
          <span className="text-4xl text-white/75">
            made by <span className="font-display font-bold text-white">Ankita Rahi</span>
          </span>
        </div>
      </div>
    </Ink>
  );
}

// ── stage ─────────────────────────────────────────────────────────────────
export function BragComposition() {
  const [t, setT] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const w = window as unknown as { __bragSeek: (s: number) => void; __bragReady: boolean };
    w.__bragSeek = (s: number) => flushSync(() => setT(s));
    // PresentMode asks for browser fullscreen on mount; in the video it must stay in its frame.
    Element.prototype.requestFullscreen = () => Promise.reject(new Error("fullscreen disabled for the video"));
    document.fonts.ready.then(() => (w.__bragReady = true));
  }, []);

  const fireConfetti = useMemo(
    () => (x: number, y: number) => {
      const c = canvasRef.current;
      if (!c) return;
      const shoot = confetti.create(c, { resize: false });
      const colors = ["#6c47ff", "#c6f432", "#ff5ca8", "#ff7a3d", "#38bdf8"];
      const origin = { x: x / W, y: y / H };
      shoot({ particleCount: 110, spread: 100, startVelocity: 55, origin, colors, scalar: 1.4, ticks: 220 });
      shoot({ particleCount: 60, spread: 160, startVelocity: 35, origin, colors, scalar: 1.1, ticks: 200 });
    },
    [],
  );

  const s2 = T.s2;
  const s6 = T.outro;
  const wipe2 = eio(p(t, s2.wipe, s2.wipe + 0.45));
  const wipe6 = eio(p(t, s6.wipe, s6.wipe + 0.45));

  return (
    <div className="relative overflow-hidden" style={{ width: W, height: H }}>
      <style>{"nextjs-portal{display:none!important}"}</style>
      {t < s2.wipe + 0.5 && <SceneHook t={t} />}
      {t >= s2.wipe && t < s6.wipe + 0.5 && (
        <div
          className="absolute inset-0"
          style={{ clipPath: wipe2 < 1 ? `circle(${wipe2 * 2300}px at 1240px 520px)` : undefined }}
        >
          <Paper>
            {t < T.start.in && <SceneReveal t={t} />}
            {t >= T.start.in && t < T.join.phoneIn && <SceneStart t={t} />}
            {t >= T.join.phoneIn && t < T.board.in + 0.2 && <ScenePhone t={t} />}
            {t >= T.board.in && t < T.present.in && <SceneTeacher t={t} onConfetti={fireConfetti} />}
            {t >= T.present.in && t < T.stats.in && <ScenePresent t={t} />}
            {t >= T.stats.in && <SceneStats t={t} />}
          </Paper>
        </div>
      )}
      {t >= s6.wipe && (
        <div
          className="absolute inset-0"
          style={{ clipPath: wipe6 < 1 ? `circle(${wipe6 * 2400}px at 960px 560px)` : undefined }}
        >
          <SceneOutro t={t} />
        </div>
      )}
      <canvas ref={canvasRef} width={W} height={H} className="pointer-events-none absolute inset-0 z-40" style={{ width: W, height: H }} />
    </div>
  );
}
