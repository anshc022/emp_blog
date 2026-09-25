import Link from "next/link";
import { PersonAvatar } from "@/components/avatar";
import { EmptyState, FeedbackNote, PageHeader, StarCount, ToSticker, starLine } from "@/components/feedback-note";
import { listSent } from "@/lib/db";
import { requireUser } from "@/lib/session";

export default async function SentPage() {
  const user = await requireUser();
  const items = listSent(user.id);
  const stars = items.reduce((n, f) => n + f.star_count, 0);

  return (
    <>
      <PageHeader tag="🧾 receipts" tagColor="var(--blue)" title={<>your <span className="grad-text">receipts</span> 🧾</>}>
        only you can see this. recipients saw these as anonymous.
      </PageHeader>

      {items.length > 0 && (
        <div className="mb-8 grid grid-cols-2 gap-4">
          <div className="brut-sm pop-in bg-pink p-5 text-on-bright">
            <div className="text-4xl font-extrabold">{items.length}</div>
            <div className="font-bold">notes spilled ☕</div>
          </div>
          <div className="brut-sm pop-in bg-yellow p-5 text-on-bright" style={{ animationDelay: "80ms" }}>
            <div className="text-4xl font-extrabold">{stars}</div>
            <div className="font-bold">stars farmed ⭐</div>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState emoji="🤐" title="you haven't spilled anything yet">
          <Link href="/give" data-sound="open" className="grad-text font-extrabold">
            write your first note →
          </Link>
        </EmptyState>
      ) : (
        <div className="space-y-6">
          {items.map((f, i) => (
            <FeedbackNote
              key={f.id}
              index={i}
              category={f.category}
              message={f.message}
              createdAt={f.created_at}
              avatar={
                f.recipient_name ? (
                  <PersonAvatar name={f.recipient_name} size={44} />
                ) : (
                  <span className="grid size-11 place-items-center rounded-full border-2 border-white/80 dark:border-white/15 bg-blue text-xl">📣</span>
                )
              }
              from="you (incognito 🕶️)"
              to={<ToSticker to={f.recipient_name ?? "everyone"} />}
              footer={
                <>
                  <span className="text-sm font-semibold text-muted">{starLine(f.star_count)}</span>
                  <StarCount count={f.star_count} />
                </>
              }
            />
          ))}
        </div>
      )}
    </>
  );
}
