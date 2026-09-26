import Link from "next/link";
import {
  ArrowBigUpIcon,
  ArrowRightIcon,
  BarChart3Icon,
  EyeOffIcon,
  KeyRoundIcon,
  MonitorPlayIcon,
  SparklesIcon,
  ZapIcon,
} from "lucide-react";

import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/auth";

const steps = [
  { icon: KeyRoundIcon, title: "Teacher starts a session", text: "Get a 6-digit code and put it on the projector." },
  { icon: EyeOffIcon, title: "Students ask, anonymously", text: "Join from any phone. Post a doubt without the fear of looking silly." },
  { icon: ArrowBigUpIcon, title: "The class upvotes", text: "Same doubt? Upvote it. The most-needed questions rise to the top, live." },
];

const features = [
  { icon: ZapIcon, title: "Real-time", text: "New doubts, votes and answers appear instantly on every screen — no refresh." },
  { icon: SparklesIcon, title: "Duplicate hints", text: "While typing, students see similar doubts already asked and can upvote instead." },
  { icon: MonitorPlayIcon, title: "Present mode", text: "Top 5 doubts full-screen in huge text, made for the projector." },
  { icon: BarChart3Icon, title: "Analytics", text: "See the most confusing topics, peak doubt hours and how much you covered." },
];

const preview = [
  { votes: 14, text: "Why is the derivative of e^x equal to itself?", topic: "Derivatives", you: false },
  { votes: 9, text: "When do I use the chain rule vs the product rule?", topic: "Derivatives", you: true },
  { votes: 5, text: "What does it mean for a limit to not exist?", topic: "Limits", you: false },
];

export default async function Home() {
  const user = await getUser();
  const home = user?.role === "teacher" ? "/teacher" : "/join";

  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden">
      <header className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 py-4">
        <Brand />
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          {user ? (
            <Button asChild>
              <Link href={home}>Open app</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild className="hidden sm:inline-flex">
                <Link href="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      <main className="flex-1">
        <section className="relative">
          <div className="bg-primary/20 absolute top-0 left-1/2 -z-10 h-80 w-[48rem] -translate-x-1/2 rounded-full blur-3xl" />
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-10 pb-20 sm:pt-16 lg:grid-cols-2">
            <div>
              <span className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium">
                <span className="bg-primary size-1.5 animate-pulse rounded-full" /> Live classroom Q&amp;A
              </span>
              <h1 className="mt-5 text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-6xl">
                The doubts your class is <span className="text-primary">too shy</span> to ask.
              </h1>
              <p className="text-muted-foreground mt-5 max-w-lg text-lg text-pretty">
                Students post doubts anonymously and upvote each other&apos;s. You see a live, ranked list of what the
                room actually needs explained — and answer it before moving on.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <Link href={user ? home : "/register"}>
                    {user ? "Open app" : "Get started — it's free"} <ArrowRightIcon />
                  </Link>
                </Button>
                {!user && (
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/login">I have an account</Link>
                  </Button>
                )}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md" aria-hidden>
              <div className="bg-card rotate-1 rounded-2xl border p-4 pb-14 shadow-2xl shadow-indigo-500/10">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-primary text-xs font-medium">Calculus</p>
                    <p className="font-semibold">Derivatives in Practice</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs">
                    <span className="bg-success size-1.5 rounded-full" /> Live · 32
                  </span>
                </div>
                <ul className="space-y-2.5">
                  {preview.map((p, i) => (
                    <li
                      key={p.text}
                      className={`flex gap-3 rounded-xl border p-3 ${p.you ? "border-primary/40 ring-primary/10 ring-2" : ""}`}
                    >
                      <div
                        className={`flex h-12 w-10 shrink-0 flex-col items-center justify-center rounded-lg border text-sm font-semibold ${i === 0 ? "bg-primary text-primary-foreground border-primary" : ""}`}
                      >
                        <ArrowBigUpIcon className={`size-4 ${i === 0 ? "fill-current" : ""}`} />
                        {p.votes}
                      </div>
                      <div className="min-w-0">
                        <div className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                          <span className="bg-secondary rounded px-1.5 py-0.5 font-medium">{p.topic}</span>
                          <EyeOffIcon className="size-3" /> Anonymous
                          {p.you && (
                            <span className="bg-primary text-primary-foreground rounded px-1 font-medium">You</span>
                          )}
                        </div>
                        <p className="mt-1 text-sm">{p.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-card absolute -bottom-4 -left-2 -rotate-3 rounded-xl border px-4 py-3 shadow-xl sm:-left-10">
                <p className="text-muted-foreground text-[10px] font-medium tracking-widest uppercase">Join code</p>
                <p className="font-mono text-2xl font-bold tracking-widest">482 913</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-muted/40 border-y">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">How it works</h2>
            <ol className="mt-10 grid gap-6 sm:grid-cols-3">
              {steps.map((s, i) => (
                <li key={s.title} className="bg-card rounded-2xl border p-6">
                  <div className="flex items-center gap-3">
                    <span className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-full text-sm font-semibold">
                      {i + 1}
                    </span>
                    <s.icon className="text-primary size-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{s.title}</h3>
                  <p className="text-muted-foreground mt-1 text-sm">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title}>
                <div className="bg-primary/10 text-primary grid size-10 place-items-center rounded-xl">
                  <f.icon className="size-5" />
                </div>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="text-muted-foreground mt-1 text-sm">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-20">
          <div className="from-primary rounded-3xl bg-gradient-to-br to-indigo-800 px-6 py-12 text-center text-white sm:px-12">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Ready for your next class?</h2>
            <p className="mx-auto mt-2 max-w-md text-white/80">Set up a session in 10 seconds. Students join with a code — no app to install.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button size="lg" variant="secondary" asChild>
                <Link href={user ? home : "/register?role=teacher"}>I&apos;m a teacher</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white" asChild>
                <Link href={user ? home : "/register"}>I&apos;m a student</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="text-muted-foreground border-t py-6 text-center text-sm">
        Live Doubt Board · built with Next.js, MongoDB &amp; Socket.io
      </footer>
    </div>
  );
}
