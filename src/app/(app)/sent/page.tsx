import Link from "next/link";
import { Megaphone } from "lucide-react";
import { PersonAvatar } from "@/components/avatar";
import { EmptyState, FeedbackNote, PageHeader, StarCount, starLine } from "@/components/feedback-note";
import { Envelope3D, Star3D, Tilt } from "@/components/three-d";
import { listSent } from "@/lib/db";
import { requireUser } from "@/lib/session";

export default async function SentPage() {
  const user = await requireUser();
  const items = listSent(user.id);
  const stars = items.reduce((n, f) => n + f.star_count, 0);

  return (
    <>
      <PageHeader
        title="sent"
        art={<Tilt><Star3D size={110} /></Tilt>}
        right={
          items.length > 0 && (
            <div className="flex gap-6 text-right">
              <div>
                <div className="text-2xl font-semibold tabular-nums">{items.length}</div>
                <div className="meta">notes</div>
              </div>
              <div>
                <div className="text-2xl font-semibold tabular-nums">{stars}</div>
                <div className="meta">stars farmed</div>
              </div>
            </div>
          )
        }
      >
        only you can see this. they saw it as anonymous.
      </PageHeader>

      {items.length === 0 ? (
        <EmptyState art={<Tilt><Envelope3D size={150} /></Tilt>} title="nothing sent yet">
          <Link href="/give" data-sound="open" className="text-text underline underline-offset-4">
            write your first note
          </Link>
        </EmptyState>
      ) : (
        <div className="border-t border-line pt-4">
          {items.map((f, i) => (
            <FeedbackNote
              key={f.id}
              index={i}
              category={f.category}
              message={f.message}
              createdAt={f.created_at}
              avatar={
                f.recipient_name ? (
                  <PersonAvatar name={f.recipient_name} />
                ) : (
                  <span className="grid size-9 shrink-0 place-items-center rounded-full border border-line bg-subtle"><Megaphone size={15} /></span>
                )
              }
              from="you, incognito"
              to={f.recipient_name ?? "everyone"}
              footer={
                <>
                  <StarCount count={f.star_count} />
                  <span className="text-[13px] text-faint">{starLine(f.star_count)}</span>
                </>
              }
            />
          ))}
        </div>
      )}
    </>
  );
}
