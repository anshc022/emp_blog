import { redirect } from "next/navigation";
import { AnonAvatar } from "@/components/avatar";
import { Logo } from "@/components/brand";
import { CategoryTag } from "@/components/category";
import { LoginForm } from "@/components/forms";
import { persona } from "@/components/persona";
import { getCurrentUser } from "@/lib/session";

const SAMPLES = [
  { seed: 3, cat: "Appreciation", text: "the way you ran the launch retro? everyone felt heard. W." },
  { seed: 8, cat: "Suggestion", text: "async stand-ups on fridays. hear me out." },
  { seed: 11, cat: "Concern", text: "deadlines keep moving and nobody says why." },
];

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/");

  return (
    <main className="mx-auto grid min-h-dvh max-w-5xl items-center gap-16 px-6 py-12 lg:grid-cols-2">
      <section>
        <Logo size={26} />
        <h1 className="mt-10 text-[44px] leading-[1.02] font-semibold tracking-[-0.045em] sm:text-[56px]">
          say the thing.
          <br />
          <span className="text-muted">nobody knows it was you.</span>
        </h1>
        <p className="mt-5 max-w-md text-[17px] text-muted">
          anonymous feedback for your whole team. honest, kind, slightly unhinged.
        </p>

        <div className="mt-10 hidden border-t border-line lg:block">
          {SAMPLES.map((s) => (
            <div key={s.seed} className="flex gap-3 border-b border-line py-4">
              <AnonAvatar seed={s.seed} size={30} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold">{persona(s.seed).name}</span>
                  <span className="ml-auto"><CategoryTag category={s.cat} /></span>
                </div>
                <p className="mt-0.5 text-[15px]">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full max-w-sm lg:justify-self-end">
        <h2 className="text-2xl font-semibold tracking-tight">who&apos;s there? 👀</h2>
        <p className="mt-1 mb-7 text-[15px] text-muted">log in with the account your admin made for you.</p>
        <LoginForm />
        <p className="mt-8 text-[13px] text-faint">
          no account? slide into your super admin&apos;s DMs.
        </p>
      </section>
    </main>
  );
}
