import { Blobby } from "@/components/art/blobby";
import { Sparkle } from "@/components/art/doodles";
import { GrainBg } from "@/components/art/grain-bg";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";

const floaters = [
  { text: "wait, why is the derivative of eˣ… eˣ?", votes: 14, cls: "left-[8%] top-[15%]", r: "-4deg" },
  { text: "can someone explain recursion again 😭", votes: 9, cls: "right-[6%] top-[28%]", r: "3deg" },
  { text: "is this on the exam??", votes: 21, cls: "left-[30%] top-[44%]", r: "-2deg" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="grain relative hidden overflow-hidden p-10 text-white lg:flex lg:flex-col">
        <GrainBg preset="aurora" intensity={0.45} />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#0d0b12]/85 to-transparent" />
        <Brand invert className="relative" />
        {floaters.map((f) => (
          <div
            key={f.text}
            className={`animate-float absolute ${f.cls} flex max-w-64 items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 pr-4 text-sm font-medium backdrop-blur-md`}
            style={{ "--r": f.r } as React.CSSProperties}
          >
            <span className="bg-lime text-lime-foreground font-display grid h-10 w-9 shrink-0 place-items-center rounded-xl text-sm font-extrabold">
              {f.votes}
            </span>
            {f.text}
          </div>
        ))}
        <div className="relative mt-auto">
          <div className="relative mb-6 w-fit">
            <Blobby mood="happy" className="size-28 text-white" />
            <Sparkle className="text-lime absolute -top-2 -right-6 size-7" />
          </div>
          <h2 className="max-w-md text-5xl leading-[1.02] font-extrabold">
            every doubt counts. <span className="font-serif-i text-lime font-normal">especially the quiet ones.</span>
          </h2>
          <p className="mt-4 max-w-sm text-white/70">
            Ask anonymously, upvote what you&apos;re stuck on, and watch your teacher answer what matters most.
          </p>
        </div>
      </aside>
      <main className="bg-grid relative flex flex-col px-5 py-5 sm:px-10">
        <div className="flex items-center justify-between lg:justify-end">
          <Brand className="lg:hidden" />
          <ThemeToggle />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">{children}</div>
      </main>
    </div>
  );
}
