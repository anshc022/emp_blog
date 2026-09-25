import { redirect } from "next/navigation";
import { AnonAvatar } from "@/components/avatar";
import { Logo } from "@/components/brand";
import { CategorySticker } from "@/components/category";
import { LoginForm } from "@/components/forms";
import { persona } from "@/components/persona";
import { getCurrentUser } from "@/lib/session";

const SAMPLES = [
  { seed: 3, cat: "Appreciation", text: "the way you ran the launch retro?? everyone felt heard. W.", stars: 12, r: "-4deg", pos: "top-0 left-0" },
  { seed: 8, cat: "Suggestion", text: "async stand-ups on fridays. hear me out 🙏", stars: 8, r: "3deg", pos: "top-[30%] right-0" },
  { seed: 11, cat: "Concern", text: "deadlines keep moving and nobody says why 🫠", stars: 21, r: "-2deg", pos: "bottom-0 left-0" },
];

const STICKERS = [
  { text: "🤫 100% anon", bg: "var(--pink)", pos: "top-[4%] right-[6%]", r: "8deg" },
  { text: "no cap 🧢", bg: "var(--yellow)", pos: "top-[44%] left-[6%]", r: "-10deg" },
  { text: "⭐ star what hits", bg: "var(--blue)", pos: "bottom-[4%] right-[4%]", r: "6deg" },
];

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/");

  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.15fr_1fr]">
      {/* Hype side */}
      <section className="relative hidden flex-col overflow-hidden p-12 lg:flex">
        <Logo size={40} />
        <div className="relative my-8 min-h-[440px] flex-1">
          {SAMPLES.map((s) => (
            <div
              key={s.seed}
              className={`floaty brut absolute ${s.pos} w-[46%] max-w-[300px] !rounded-3xl p-4`}
              style={{ ["--r" as string]: s.r, animationDelay: `${s.seed * -0.6}s` }}
            >
              <div className="flex items-center gap-2.5">
                <AnonAvatar seed={s.seed} size={36} />
                <span className="text-sm leading-tight font-extrabold">{persona(s.seed).name}</span>
                <span className="ml-auto"><CategorySticker category={s.cat} /></span>
              </div>
              <p className="mt-3 text-[17px] leading-snug font-semibold">{s.text}</p>
              <span className="sticker mt-3 !text-xs text-white" style={{ backgroundImage: "var(--grad)" }}>⭐ {s.stars}</span>
            </div>
          ))}
          {STICKERS.map((s) => (
            <span
              key={s.text}
              className={`wiggle sticker absolute ${s.pos} !px-4 !py-2 !text-base shadow-[0_10px_24px_-10px_var(--glow)]`}
              style={{ background: s.bg, ["--r" as string]: s.r }}
            >
              {s.text}
            </span>
          ))}
        </div>
        <h1 className="text-[68px] leading-[0.88] font-extrabold tracking-[-0.045em]">
          spill the tea.
          <br />
          <span className="grad-text">anonymously.</span>
        </h1>
        <p className="mt-6 max-w-md text-lg font-semibold text-muted">
          honest feedback for your whole team. zero awkwardness. maximum growth 📈
        </p>
      </section>

      {/* Form side */}
      <section className="flex flex-col px-6 py-8 sm:px-12">
        <div className="lg:hidden"><Logo /></div>
        <div className="m-auto w-full max-w-sm py-12">
          <div className="wiggle mb-4 inline-block text-6xl" style={{ ["--r" as string]: "-10deg" }}>👀</div>
          <h2 className="text-5xl leading-none font-extrabold tracking-tight">who&apos;s <span className="grad-text">there?</span></h2>
          <p className="mt-3 mb-8 text-lg text-muted">log in with the account your admin made for you.</p>
          <div className="brut p-6">
            <LoginForm />
          </div>
          <p className="mt-6 flex items-start gap-2 text-sm font-semibold text-muted">
            <span className="text-lg">🕶️</span>
            your name is never shown to the people you send feedback to. pinky promise 🤙
          </p>
        </div>
        <p className="text-center text-sm text-faint">no account? slide into your super admin&apos;s DMs 📩</p>
      </section>
    </main>
  );
}
