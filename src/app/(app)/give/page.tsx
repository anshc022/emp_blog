import { Composer } from "@/components/forms";
import { PageHeader } from "@/components/feedback-note";
import { CATEGORIES, listActiveColleagues } from "@/lib/db";
import { requireUser } from "@/lib/session";

const TIPS: [string, string, string, string][] = [
  ["🎯", "be specific", "“in tuesday’s demo…” > “you always…”", "var(--blue)"],
  ["🫶", "honest ≠ mean", "say it like you’d want to hear it", "var(--pink)"],
  ["🔧", "bring a fix", "what would turn it into a W?", "var(--yellow)"],
];

export default async function GivePage() {
  const user = await requireUser();
  const colleagues = listActiveColleagues(user.id).map(({ id, name, department }) => ({ id, name, department }));

  return (
    <>
      <PageHeader tag="☕ spill" tagColor="var(--pink)" title="spill the tea ☕">
        to one person or the whole company. they&apos;ll never know it was you 🤫
      </PageHeader>

      <Composer colleagues={colleagues} categories={CATEGORIES} />

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {TIPS.map(([emoji, title, body, color], i) => (
          <div
            key={title}
            className="brut-sm p-4 text-on-bright"
            style={{ background: color, rotate: `${[-1.5, 1, -1][i]}deg` }}
          >
            <div className="text-2xl">{emoji}</div>
            <div className="mt-1 font-extrabold">{title}</div>
            <div className="mt-0.5 text-sm font-medium opacity-80">{body}</div>
          </div>
        ))}
      </div>
    </>
  );
}
