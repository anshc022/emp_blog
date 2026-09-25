import Link from "next/link";
import { PersonAvatar } from "@/components/avatar";
import { Dot } from "@/components/category";
import { EmptyState, FeedbackNote, PageHeader } from "@/components/feedback-note";
import { persona } from "@/components/persona";
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

  const numbers: [number, string][] = [
    [stats.employees, "people"],
    [stats.total, "notes"],
    [stats.this_week, "this week"],
    [stats.stars, "stars"],
  ];

  return (
    <>
      <PageHeader title="all the tea, with names">
        you can see who wrote everything. with great power comes great responsibility.
      </PageHeader>

      <div className="mb-8 grid grid-cols-4 border-y border-line">
        {numbers.map(([value, label], i) => (
          <div key={label} className={`py-4 ${i ? "border-l border-line pl-4" : ""}`}>
            <div className="text-2xl font-semibold tabular-nums">{value}</div>
            <div className="meta">{label}</div>
          </div>
        ))}
      </div>

      <form className="mb-6 flex flex-wrap items-end gap-3">
        <div className="min-w-36 flex-1">
          <label className="field-label" htmlFor="author">from</label>
          <select className="field" id="author" name="author" defaultValue={author ?? ""}>
            <option value="">anyone</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        <div className="min-w-36 flex-1">
          <label className="field-label" htmlFor="recipient">to</label>
          <select className="field" id="recipient" name="recipient" defaultValue={recipient ?? ""}>
            <option value="">anyone</option>
            <option value="everyone">everyone</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        {sort === "top" && <input type="hidden" name="sort" value="top" />}
        <button data-sound="tap" className="btn !py-2.5">filter</button>
        {filtered && <Link href="/admin" data-sound="close" className="btn-ghost !py-2.5">clear</Link>}
      </form>

      <div className="mb-2 flex items-center justify-between border-b border-line">
        <span className="meta">{items.length} {items.length === 1 ? "note" : "notes"}</span>
        <Segmented value={sort} hrefFor={href} options={[{ value: "new", label: "new" }, { value: "top", label: "top" }]} />
      </div>

      {items.length === 0 ? (
        <EmptyState emoji="🕵️" title="nothing matches">try a different filter.</EmptyState>
      ) : (
        items.map((f, i) => (
          <FeedbackNote
            key={f.id}
            index={i}
            category={f.category}
            message={f.message}
            createdAt={f.created_at}
            avatar={<PersonAvatar name={f.author_name} />}
            from={
              <span className="inline-flex items-center gap-1.5">
                {f.author_name}
                <span className="meta">(aka {persona(f.id).name})</span>
              </span>
            }
            to={f.recipient_name ?? "everyone"}
            footer={
              <>
                <StarButton id={f.id} count={f.star_count} starred={!!f.starred} />
                <form action={deleteFeedback} className="ml-auto">
                  <input type="hidden" name="id" value={f.id} />
                  <button data-sound="delete" className="inline-flex items-center gap-1.5 text-[13px] text-faint transition hover:text-text">
                    <Dot color="var(--c-flag)" size={6} /> yeet
                  </button>
                </form>
              </>
            }
          />
        ))
      )}
    </>
  );
}
