import { Composer } from "@/components/forms";
import { PageHeader } from "@/components/feedback-note";
import { CATEGORIES, listActiveColleagues } from "@/lib/db";
import { requireUser } from "@/lib/session";

export default async function GivePage() {
  const user = await requireUser();
  const colleagues = listActiveColleagues(user.id).map(({ id, name, department }) => ({ id, name, department }));

  return (
    <>
      <PageHeader title="spill the tea">
        to one person or the whole company. they&apos;ll never know it was you.
      </PageHeader>

      <Composer colleagues={colleagues} categories={CATEGORIES} />

      <ul className="mt-14 space-y-2 border-t border-line pt-6 text-[13px] text-muted">
        <li><span className="text-text">be specific.</span> “in tuesday’s demo…” beats “you always…”</li>
        <li><span className="text-text">honest ≠ mean.</span> say it like you’d want to hear it.</li>
        <li><span className="text-text">bring a fix.</span> what would make it better?</li>
      </ul>
    </>
  );
}
