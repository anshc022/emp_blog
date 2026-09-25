import { EmptyState, FeedbackCard } from "@/components/feedback-card";
import { listSent } from "@/lib/db";
import { requireUser } from "@/lib/session";

export default async function SentPage() {
  const user = await requireUser();
  const items = listSent(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Sent</h1>
        <p className="text-sm text-zinc-500">Only you (and super admins) can see this list.</p>
      </div>
      {items.length === 0 ? (
        <EmptyState>You haven&apos;t sent any feedback yet.</EmptyState>
      ) : (
        <div className="space-y-3">
          {items.map((f) => (
            <FeedbackCard
              key={f.id}
              category={f.category}
              message={f.message}
              createdAt={f.created_at}
              meta={`To ${f.recipient_name ?? "Everyone"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
