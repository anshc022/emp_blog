import Link from "next/link";
import { Megaphone, Send } from "lucide-react";
import { PersonAvatar } from "@/components/avatar";
import { LogoMark } from "@/components/brand";
import { EmptyState, FeedbackNote, PageHeader } from "@/components/feedback-note";
import { StarCount } from "@/components/star-button";
import { listSent } from "@/lib/db";
import { requireUser } from "@/lib/session";

export default async function SentPage() {
  const user = await requireUser();
  const items = listSent(user.id);
  const stars = items.reduce((n, f) => n + f.star_count, 0);

  return (
    <>
      <PageHeader eyebrow="Sent" title="Your notes">
        Only you can see this list. Recipients saw these as anonymous.
        {items.length > 0 && ` You've sent ${items.length} and collected ${stars} ★ so far.`}
      </PageHeader>

      {items.length === 0 ? (
        <EmptyState icon={<Send size={22} />} title="You haven’t sent anything yet">
          <Link href="/give" className="font-semibold text-accent hover:underline">Write your first note →</Link>
        </EmptyState>
      ) : (
        <div className="space-y-4">
          {items.map((f, i) => (
            <FeedbackNote
              key={f.id}
              index={i}
              category={f.category}
              message={f.message}
              createdAt={f.created_at}
              avatar={
                f.recipient_name ? (
                  <PersonAvatar name={f.recipient_name} size={40} />
                ) : (
                  <span className="grid size-10 place-items-center rounded-full bg-sunken"><LogoMark className="size-6" /></span>
                )
              }
              from="You (anonymous)"
              to={
                f.recipient_name ?? (
                  <span className="inline-flex items-center gap-1"><Megaphone size={13} /> Everyone</span>
                )
              }
              footer={<StarCount count={f.star_count} />}
            />
          ))}
        </div>
      )}
    </>
  );
}
