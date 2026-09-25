import { HeartHandshake, Target, Wrench } from "lucide-react";
import { Composer } from "@/components/forms";
import { PageHeader } from "@/components/feedback-note";
import { Envelope3D, Tilt } from "@/components/three-d";
import { CATEGORIES, listActiveColleagues } from "@/lib/db";
import { requireUser } from "@/lib/session";

export default async function GivePage() {
  const user = await requireUser();
  const colleagues = listActiveColleagues(user.id).map(({ id, name, department }) => ({ id, name, department }));

  return (
    <>
      <PageHeader title="spill the tea" art={<Tilt><Envelope3D size={120} /></Tilt>}>
        to one person or the whole company. they&apos;ll never know it was you.
      </PageHeader>

      <Composer colleagues={colleagues} categories={CATEGORIES} />

      <ul className="mt-14 grid gap-5 border-t border-line pt-6 text-[13px] text-muted sm:grid-cols-3">
        <li>
          <Target size={18} className="mb-2 text-text" />
          <span className="text-text">be specific.</span> “in tuesday’s demo…” beats “you always…”
        </li>
        <li>
          <HeartHandshake size={18} className="mb-2 text-text" />
          <span className="text-text">honest ≠ mean.</span> say it like you’d want to hear it.
        </li>
        <li>
          <Wrench size={18} className="mb-2 text-text" />
          <span className="text-text">bring a fix.</span> what would make it better?
        </li>
      </ul>
    </>
  );
}
