import { EmptyState, FeedbackCard } from "@/components/feedback-card";
import { deleteFeedback } from "@/lib/actions";
import { getStats, listAllFeedback, listUsers } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export default async function AdminFeedbackPage(props: PageProps<"/admin">) {
  await requireAdmin();
  const params = await props.searchParams;
  const author = Number(params.author) || undefined;
  const recipient =
    params.recipient === "everyone" ? ("everyone" as const) : Number(params.recipient) || undefined;

  const users = listUsers();
  const stats = getStats();
  const items = listAllFeedback({ authorId: author, recipientId: recipient });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">All feedback</h1>
        <p className="text-sm text-zinc-500">
          Super admin view: you can see who wrote every message. Employees never see this.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Active employees", stats.employees],
          ["Total feedback", stats.total],
          ["To everyone", stats.to_everyone],
          ["Last 7 days", stats.this_week],
        ].map(([label, value]) => (
          <div key={label} className="card !p-4">
            <div className="text-2xl font-semibold">{value}</div>
            <div className="text-xs text-zinc-500">{label}</div>
          </div>
        ))}
      </div>

      <form className="card flex flex-wrap items-end gap-3 !p-4">
        <div className="min-w-40 flex-1">
          <label className="label" htmlFor="author">From</label>
          <select className="input" id="author" name="author" defaultValue={author ?? ""}>
            <option value="">Anyone</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
        <div className="min-w-40 flex-1">
          <label className="label" htmlFor="recipient">To</label>
          <select className="input" id="recipient" name="recipient" defaultValue={recipient ?? ""}>
            <option value="">Anyone</option>
            <option value="everyone">Everyone (company-wide)</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
        <button className="btn">Filter</button>
        <a href="/admin" className="btn-ghost !py-2">Clear</a>
      </form>

      {items.length === 0 ? (
        <EmptyState>No feedback matches.</EmptyState>
      ) : (
        <div className="space-y-3">
          {items.map((f) => (
            <FeedbackCard
              key={f.id}
              category={f.category}
              message={f.message}
              createdAt={f.created_at}
              meta={
                <>
                  <strong className="text-zinc-800">{f.author_name}</strong>
                  <span className="text-zinc-400"> ({f.author_email})</span> → {" "}
                  <strong className="text-zinc-800">{f.recipient_name ?? "Everyone"}</strong>
                </>
              }
              actions={
                <form action={deleteFeedback}>
                  <input type="hidden" name="id" value={f.id} />
                  <button className="btn-ghost text-red-600">Delete</button>
                </form>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
