import Link from "next/link";
import { EmptyState, FeedbackCard } from "@/components/feedback-card";
import { listInbox } from "@/lib/db";
import { requireUser } from "@/lib/session";

export default async function InboxPage() {
  const user = await requireUser();
  const items = listInbox(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Your inbox</h1>
        <p className="text-sm text-zinc-500">
          Feedback sent to you and to the whole company. Senders are always anonymous.
        </p>
      </div>
      {items.length === 0 ? (
        <EmptyState>
          No feedback yet. <Link href="/give" className="text-indigo-600 hover:underline">Be the first to give some.</Link>
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {items.map((f) => (
            <FeedbackCard
              key={f.id}
              category={f.category}
              message={f.message}
              createdAt={f.created_at}
              meta={f.to_everyone ? "Anonymous → Everyone" : "Anonymous → You"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
