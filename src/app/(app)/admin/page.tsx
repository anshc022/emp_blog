import Link from "next/link";
import { Eye, Megaphone, SearchX, Trash2 } from "lucide-react";
import { PersonAvatar } from "@/components/avatar";
import { EmptyState, FeedbackNote, PageHeader } from "@/components/feedback-note";
import { Segmented } from "@/components/segmented";
import { StarButton } from "@/components/star-button";
import { deleteFeedback } from "@/lib/actions";
import { getStats, listAllFeedback, listUsers } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

export default async function AdminFeedbackPage(props: PageProps<"/admin">) {
  const admin = await requireAdmin();
  const params = await props.searchParams;
  const author = Number(params.author) || undefined;
  const recipient =
    params.recipient === "everyone" ? ("everyone" as const) : Number(params.recipient) || undefined;
  const sort = params.sort === "top" ? "top" : "new";

  const users = listUsers();
  const stats = getStats();
  const items = listAllFeedback(admin.id, { authorId: author, recipientId: recipient, sort });
  const filtered = Boolean(author || recipient);

  const href = (s: string) => {
    const q = new URLSearchParams();
    if (author) q.set("author", String(author));
    if (recipient) q.set("recipient", String(recipient));
    if (s === "top") q.set("sort", "top");
    const str = q.toString();
    return str ? `/admin?${str}` : "/admin";
  };

  return (
    <>
      <PageHeader eyebrow="Super admin" title="Every note, unmasked.">
        You can see who wrote each message. Employees never see this page, and senders stay anonymous to everyone else.
      </PageHeader>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["People", stats.employees],
          ["Notes", stats.total],
          ["This week", stats.this_week],
          ["Stars given", stats.stars],
        ].map(([label, value]) => (
          <div key={label} className="panel p-4">
            <div className="font-display text-3xl font-semibold tabular-nums">{value}</div>
            <div className="mt-0.5 text-xs font-medium text-muted">{label}</div>
          </div>
        ))}
      </div>

      <form className="panel mb-6 flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-40 flex-1">
          <label className="field-label" htmlFor="author">Written by</label>
          <select className="field" id="author" name="author" defaultValue={author ?? ""}>
            <option value="">Anyone</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        <div className="min-w-40 flex-1">
          <label className="field-label" htmlFor="recipient">Sent to</label>
          <select className="field" id="recipient" name="recipient" defaultValue={recipient ?? ""}>
            <option value="">Anyone</option>
            <option value="everyone">Everyone (company-wide)</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        {sort === "top" && <input type="hidden" name="sort" value="top" />}
        <button className="btn-primary">Apply</button>
        {filtered && <Link href="/admin" className="btn-quiet !py-2.5">Clear</Link>}
      </form>

      <div className="mb-5 flex items-center justify-between gap-3">
        <span className="text-sm text-muted">{items.length} {items.length === 1 ? "note" : "notes"}</span>
        <Segmented value={sort} hrefFor={href} options={[{ value: "new", label: "Newest" }, { value: "top", label: "★ Top" }]} />
      </div>

      {items.length === 0 ? (
        <EmptyState icon={<SearchX size={24} />} title="No notes match">
          Try a different filter.
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
              avatar={<PersonAvatar name={f.author_name} size={40} />}
              from={
                <span className="inline-flex items-center gap-1.5">
                  {f.author_name}
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
                    <Eye size={11} strokeWidth={2.6} /> Revealed
                  </span>
                </span>
              }
              to={
                f.recipient_name ?? (
                  <span className="inline-flex items-center gap-1"><Megaphone size={13} /> Everyone</span>
                )
              }
              footer={
                <>
                  <form action={deleteFeedback}>
                    <input type="hidden" name="id" value={f.id} />
                    <button className="btn-quiet hover:!border-accent/40 hover:!text-accent">
                      <Trash2 size={13} /> Delete
                    </button>
                  </form>
                  <StarButton id={f.id} count={f.star_count} starred={!!f.starred} />
                </>
              }
            />
          ))}
        </div>
      )}
    </>
  );
}
