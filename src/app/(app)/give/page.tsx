import { Composer } from "@/components/forms";
import { PageHeader } from "@/components/feedback-note";
import { CATEGORIES, listActiveColleagues } from "@/lib/db";
import { requireUser } from "@/lib/session";

const TIPS = [
  ["Be specific", "“In Tuesday’s demo…” beats “You always…”."],
  ["Focus on impact", "Describe how it affected you or the team."],
  ["Offer a way forward", "What would you love to see instead?"],
];

export default async function GivePage() {
  const user = await requireUser();
  const colleagues = listActiveColleagues(user.id).map(({ id, name, department }) => ({ id, name, department }));

  return (
    <>
      <PageHeader eyebrow="Write feedback" title="Say the thing. Kindly.">
        Send a note to one colleague or to the whole company. They’ll never see your name.
      </PageHeader>

      <Composer colleagues={colleagues} categories={CATEGORIES} />

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {TIPS.map(([title, body]) => (
          <div key={title} className="rounded-2xl border border-dashed border-line p-4">
            <div className="text-sm font-semibold">{title}</div>
            <div className="mt-1 text-[13px] leading-snug text-muted">{body}</div>
          </div>
        ))}
      </div>
    </>
  );
}
