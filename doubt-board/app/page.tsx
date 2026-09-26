import Link from "next/link";
import {
  ArrowFatUpIcon,
  ArrowRightIcon,
  ChartBarIcon,
  DetectiveIcon,
  EyesIcon,
  KeyIcon,
  LightningIcon,
  PresentationChartIcon,
} from "@phosphor-icons/react/dist/ssr";

import { Blobby } from "@/components/art/blobby";
import { CurlyArrow, Sparkle, Squiggle } from "@/components/art/doodles";
import { GrainBg } from "@/components/art/grain-bg";
import { Brand } from "@/components/brand";
import { LiveDemo } from "@/components/landing/live-demo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/auth";

const MARQUEE = [
  "why do we add +C 🤔",
  "can you redo step 3?",
  "what's the intuition behind eigenvectors",
  "is recursion always slower?",
  "why is friction not in the formula",
  "wait what's a pointer",
  "how is this different from last week's",
  "is this on the exam??",
  "why does the graph flip there",
  "can we get one more example pls",
];

const steps = [
  { icon: KeyIcon, title: "Teacher starts a session", text: "One click, one 6-digit code on the projector.", tint: "bg-primary text-primary-foreground" },
  { icon: DetectiveIcon, title: "Students ask anonymously", text: "From any phone. No name, no judgement, no fear.", tint: "bg-lime text-lime-foreground" },
  { icon: ArrowFatUpIcon, title: "The room upvotes", text: "Same doubt? Tap ▲. What matters most floats up, live.", tint: "bg-tangerine text-white" },
];

export default async function Home() {
  const user = await getUser();
  const home = user?.role === "teacher" ? "/teacher" : "/join";

  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip">
      {/* ───────────── HERO ───────────── */}
      <section className="grain relative overflow-hidden rounded-b-[2.5rem] bg-[#0d0b12] text-white sm:rounded-b-[3.5rem]">
        <GrainBg preset="aurora" intensity={0.45} scrim="left" />
        <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center gap-2 px-5 py-5">
          <Brand invert />
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <ThemeToggle className="text-white hover:bg-white/10" />
            {user ? (
              <Button variant="lime" asChild>
                <Link href={home}>Open app</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button variant="lime" asChild className="hidden sm:inline-flex">
                  <Link href="/register">Get started</Link>
                </Button>
              </>
            )}
          </div>
        </header>

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pt-8 pb-20 sm:pt-14 lg:grid-cols-[1.15fr_1fr] lg:pb-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-semibold backdrop-blur">
              <span className="relative flex size-2">
                <span className="bg-lime absolute inline-flex size-full animate-ping rounded-full opacity-70" />
                <span className="bg-lime relative inline-flex size-2 rounded-full" />
              </span>
              live classroom Q&amp;A
            </span>
            <h1 className="mt-6 text-[3.2rem] leading-[0.95] font-extrabold tracking-[-0.035em] text-balance sm:text-7xl lg:text-[5.5rem]">
              ask the question{" "}
              <span className="relative inline-block whitespace-nowrap">
                <span className="font-serif-i text-lime font-normal">everyone</span>
                <Squiggle className="text-bubblegum absolute -bottom-2 left-0" />
              </span>{" "}
              is thinking.
            </h1>
            <p className="mt-7 max-w-lg text-lg text-white/75 sm:text-xl">
              Students post doubts anonymously and upvote each other&apos;s. Teachers get a live, ranked list of what the
              room actually needs explained.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button size="lg" variant="lime" asChild className="h-14 px-8 text-base">
                <Link href={user ? home : "/register"}>
                  {user ? "Open app" : "Get started — it's free"} <ArrowRightIcon weight="bold" />
                </Link>
              </Button>
              {!user && (
                <Button
                  size="lg"
                  variant="ghost"
                  asChild
                  className="h-14 border border-white/20 bg-white/10 px-8 text-base text-white backdrop-blur hover:bg-white/20 hover:text-white"
                >
                  <Link href="/join">I have a code</Link>
                </Button>
              )}
            </div>
          </div>

          {/* phone mock */}
          <div className="relative mx-auto w-full max-w-[340px]" aria-hidden>
            <div className="absolute -top-10 -left-16 z-10 hidden sm:block">
              <Blobby mood="curious" className="size-28 rotate-[-10deg] text-white" />
            </div>
            <span className="bg-lime text-lime-foreground shadow-sticker absolute -right-4 -bottom-5 z-10 rotate-[6deg] rounded-2xl border-2 border-[#16131c] px-4 py-2 font-display text-lg font-extrabold sm:-right-10">
              100% anonymous 🕵️
            </span>
            <Sparkle className="text-lime absolute -top-6 right-6 size-8" />
            <div className="rounded-[2.8rem] border border-white/20 bg-white/10 p-2.5 shadow-2xl backdrop-blur-xl">
              <div className="rounded-[2.3rem] bg-[#f6f3ec] p-4 pt-3">
                <div className="mx-auto mb-3 h-5 w-24 rounded-full bg-[#16131c]" />
                <div className="mb-3 flex items-center justify-between px-1">
                  <div>
                    <p className="text-[10px] font-bold tracking-wider text-[#6c47ff] uppercase">Calculus</p>
                    <p className="font-display text-base leading-tight font-extrabold text-[#16131c]">Derivatives 101</p>
                  </div>
                  <span className="flex items-center gap-1 rounded-full border border-[#e5e0d6] bg-white px-2 py-1 text-[10px] font-bold text-[#16131c]">
                    <span className="size-1.5 rounded-full bg-[#12a150]" /> LIVE · 32
                  </span>
                </div>
                <LiveDemo />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── MARQUEE ───────────── */}
      <section className="relative -mt-2 overflow-hidden py-10" aria-label="Examples of doubts">
        {[0, 1].map((row) => (
          <div key={row} className="flex overflow-hidden py-1.5 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
            <div
              className="animate-marquee flex shrink-0 gap-3 pr-3"
              style={row ? { animationDirection: "reverse", animationDuration: "55s" } : undefined}
            >
              {[...MARQUEE, ...MARQUEE].map((q, i) => (
                <span
                  key={i}
                  className={`bg-card flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${
                    (i + row) % 4 === 0 ? "rotate-[-1.5deg]" : (i + row) % 4 === 2 ? "rotate-[1.5deg]" : ""
                  }`}
                >
                  <span className="bg-lime text-lime-foreground rounded-full px-1.5 text-[11px] font-extrabold">
                    ▲{(((i * 7 + row * 3) % 23) + 3).toString()}
                  </span>
                  {q}
                </span>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ───────────── HOW IT WORKS ───────────── */}
      <section className="mx-auto w-full max-w-6xl px-5 py-12 sm:py-16">
        <p className="text-primary text-sm font-bold tracking-widest uppercase">How it works</p>
        <h2 className="mt-2 max-w-2xl text-4xl leading-[1.02] font-extrabold sm:text-6xl">
          three steps. <span className="font-serif-i text-muted-foreground font-normal">zero awkward silences.</span>
        </h2>
        <ol className="relative mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="bg-card shadow-soft relative rounded-3xl border p-6 pt-7">
              <span className="font-display text-muted-foreground/25 absolute top-3 right-5 text-7xl leading-none font-extrabold">
                {i + 1}
              </span>
              <span className={`grid size-14 place-items-center rounded-2xl ${s.tint}`}>
                <s.icon weight="duotone" className="size-7" />
              </span>
              <h3 className="mt-6 text-2xl font-bold">{s.title}</h3>
              <p className="text-muted-foreground mt-2">{s.text}</p>
              {i < 2 && <CurlyArrow className="text-muted-foreground/50 absolute -right-12 -bottom-10 z-10 hidden rotate-12 md:block" />}
            </li>
          ))}
        </ol>
      </section>

      {/* ───────────── BENTO ───────────── */}
      <section className="mx-auto w-full max-w-6xl px-5 py-12 sm:py-16">
        <div className="grid auto-rows-[minmax(200px,auto)] gap-4 md:grid-cols-6">
          <div className="bg-lime text-lime-foreground relative overflow-hidden rounded-3xl p-7 md:col-span-4">
            <LightningIcon weight="duotone" className="size-10" />
            <h3 className="mt-4 text-3xl font-extrabold sm:text-4xl">stupidly real-time.</h3>
            <p className="mt-2 max-w-md text-[#16131c]/75">
              New doubts, upvotes and answers hit every screen instantly over WebSockets. No refresh button in sight.
            </p>
            <div className="absolute -right-6 -bottom-8 hidden gap-2 sm:flex">
              {[14, 22, 9].map((n, i) => (
                <span
                  key={i}
                  className="font-display grid h-24 w-20 place-items-center rounded-3xl border-2 border-[#16131c] bg-white text-3xl font-extrabold"
                  style={{ transform: `rotate(${(i - 1) * 8}deg) translateY(${i === 1 ? -12 : 0}px)` }}
                >
                  ▲{n}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-card shadow-soft rounded-3xl border p-7 md:col-span-2">
            <DetectiveIcon weight="duotone" className="text-primary size-10" />
            <h3 className="mt-4 text-2xl font-extrabold">actually anonymous</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Anonymous means anonymous — not even your teacher sees your name. Enforced on the server, not just hidden in
              the UI.
            </p>
          </div>

          <div className="bg-card shadow-soft rounded-3xl border p-7 md:col-span-2">
            <EyesIcon weight="duotone" className="text-bubblegum size-10" />
            <h3 className="mt-4 text-2xl font-extrabold">no duplicate spam</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              While you type, similar doubts pop up — upvote instead of asking the same thing twice.
            </p>
          </div>

          <div className="grain relative overflow-hidden rounded-3xl p-7 text-white md:col-span-2">
            <GrainBg preset="sunset" speed={0.3} />
            <PresentationChartIcon weight="duotone" className="relative size-10" />
            <h3 className="relative mt-4 text-2xl font-extrabold">present mode</h3>
            <p className="relative mt-2 text-sm text-white/80">Top 5 doubts full-screen, huge text, made for the projector.</p>
          </div>

          <div className="bg-card shadow-soft rounded-3xl border p-7 md:col-span-2">
            <ChartBarIcon weight="duotone" className="text-tangerine size-10" />
            <h3 className="mt-4 text-2xl font-extrabold">the vibe check</h3>
            <p className="text-muted-foreground mt-2 text-sm">Which topics confuse your class, and when doubts peak.</p>
            <svg viewBox="0 0 160 48" className="mt-4 h-12 w-full" aria-hidden>
              {[18, 30, 22, 44, 34, 26, 38, 14].map((h, i) => (
                <rect key={i} x={i * 20 + 2} y={48 - h} width="14" height={h} rx="4" fill={i === 3 ? "var(--tangerine)" : "var(--primary)"} opacity={i === 3 ? 1 : 0.8} />
              ))}
            </svg>
          </div>
        </div>
      </section>

      {/* ───────────── CTA ───────────── */}
      <section className="mx-auto w-full max-w-6xl px-5 pt-6 pb-20">
        <div className="grain relative overflow-hidden rounded-[2.5rem] px-6 py-16 text-center text-white sm:px-12 sm:py-20">
          <GrainBg preset="aurora" speed={0.4} intensity={0.45} scrim="center" />
          <Blobby mood="proud" className="relative mx-auto size-28 text-white" />
          <h2 className="relative mx-auto mt-6 max-w-2xl text-4xl leading-[1.02] font-extrabold sm:text-6xl">
            your next class, <span className="font-serif-i text-lime font-normal">but everyone speaks up.</span>
          </h2>
          <p className="relative mx-auto mt-4 max-w-md text-white/75">
            Set up a session in 10 seconds. Students join with a code — nothing to install.
          </p>
          <div className="relative mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="lime" asChild className="h-14 px-8 text-base">
              <Link href={user ? home : "/register?role=teacher"}>I&apos;m a teacher</Link>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              asChild
              className="h-14 border border-white/20 bg-white/10 px-8 text-base text-white backdrop-blur hover:bg-white/20 hover:text-white"
            >
              <Link href={user ? home : "/register"}>I&apos;m a student</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="text-muted-foreground border-t px-5 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-sm">
          <Brand />
          <p>
            built with Next.js, MongoDB &amp; Socket.io ·{" "}
            <span className="font-serif-i text-base">no question is a silly question</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
