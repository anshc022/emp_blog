import { redirect } from "next/navigation";
import { Lock, Star } from "lucide-react";
import { AnonAvatar } from "@/components/avatar";
import { Logo } from "@/components/brand";
import { CategoryTag } from "@/components/category";
import { LoginForm } from "@/components/forms";
import { getCurrentUser } from "@/lib/session";

const SAMPLES = [
  { seed: 3, cat: "Appreciation", text: "The way you ran the launch retro made everyone feel heard.", stars: 12, r: "-3deg", pos: "top-[6%] left-[4%]" },
  { seed: 7, cat: "Suggestion", text: "Could stand-ups be async on Fridays?", stars: 8, r: "2.5deg", pos: "top-[34%] right-[4%]" },
  { seed: 11, cat: "Concern", text: "Deadlines keep moving without anyone saying why.", stars: 21, r: "-1.5deg", pos: "bottom-[2%] left-[12%]" },
];

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/");

  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      {/* Brand side */}
      <section className="relative hidden overflow-hidden bg-ink text-paper lg:block">
        <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(var(--paper)_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="relative z-10 flex h-full flex-col p-12">
          <div className="[&_span]:text-paper"><Logo /></div>
          <div className="relative my-8 min-h-[400px] flex-1">
            {SAMPLES.map((s) => (
              <div
                key={s.seed}
                data-cat={s.cat}
                className={`float absolute ${s.pos} w-72 rounded-2xl bg-surface p-4 text-ink shadow-2xl shadow-black/40`}
                style={{ ["--r" as string]: s.r, animationDelay: `${s.seed * -0.7}s` }}
              >
                <div className="flex items-center gap-2.5">
                  <AnonAvatar seed={s.seed} size={30} />
                  <span className="text-sm font-semibold">Anonymous</span>
                  <span className="ml-auto"><CategoryTag category={s.cat} /></span>
                </div>
                <p className="mt-3 font-display text-[16px] leading-snug">{s.text}</p>
                <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-star-soft px-2 py-0.5 text-xs font-semibold">
                  <Star size={12} className="fill-star text-star" /> {s.stars}
                </div>
              </div>
            ))}
          </div>
          <h1 className="max-w-md font-display text-6xl leading-[1.02] font-semibold tracking-tight">
            Say the thing.
            <br />
            <em className="font-normal text-accent">Kindly.</em>
          </h1>
          <p className="mt-5 max-w-sm text-[17px] text-paper/65">
            Honest, anonymous feedback for your whole team, and a star for the notes that matter.
          </p>
        </div>
      </section>

      {/* Form side */}
      <section className="flex flex-col px-6 py-10 sm:px-12">
        <div className="lg:hidden"><Logo /></div>
        <div className="m-auto w-full max-w-sm py-12">
          <h2 className="font-display text-4xl font-semibold tracking-tight">Welcome back</h2>
          <p className="mt-2 mb-8 text-muted">Sign in with the account your admin set up for you.</p>
          <LoginForm />
          <p className="mt-8 flex items-start gap-2 rounded-xl bg-sunken/70 p-3.5 text-[13px] leading-snug text-muted">
            <Lock size={15} className="mt-0.5 shrink-0" />
            Your name is never shown to the people you send feedback to.
          </p>
        </div>
        <p className="text-center text-xs text-faint">No account? Ask your super admin to add you.</p>
      </section>
    </main>
  );
}
