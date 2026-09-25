import Link from "next/link";
import { PersonAvatar } from "@/components/avatar";
import { EmptyState, FeedbackNote, PageHeader, ToSticker } from "@/components/feedback-note";
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

  const tiles: [string, number, string, string][] = [
    ["👯", stats.employees, "humans", "var(--lilac)"],
    ["☕", stats.total, "notes", "var(--pink)"],
    ["🗓️", stats.this_week, "this week", "var(--blue)"],
    ["⭐", stats.stars, "stars", "var(--yellow)"],
  ];

  return (
    <>
      <PageHeader tag="👁️ god mode" tagColor="var(--yellow)" title="all the tea, with names 👁️">
        you can see who wrote everything. with great power comes great responsibility 🕷️
      </PageHeader>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {tiles.map(([emoji, value, label, color], i) => (
          <div
            key={label}
            className="brut-sm p-4 text-on-bright"
            style={{ background: color, rotate: `${[-1.5, 1, -1, 1.5][i]}deg` }}
          >
            <div className="text-2xl">{emoji}</div>
            <div className="text-4xl leading-none font-extrabold tabular-nums">{value}</div>
            <div className="mt-1 text-sm font-bold">{label}</div>
          </div>
        ))}
      </div>

      <form className="brut mb-7 flex flex-wrap items-end gap-3 p-4">
        <div className="min-w-40 flex-1">
          <label className="field-label" htmlFor="author">written by ✍️</label>
          <select className="field !py-2.5" id="author" name="author" defaultValue={author ?? ""}>
            <option value="">anyone</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        <div className="min-w-40 flex-1">
          <label className="field-label" htmlFor="recipient">sent to 🎯</label>
          <select className="field !py-2.5" id="recipient" name="recipient" defaultValue={recipient ?? ""}>
            <option value="">anyone</option>
            <option value="everyone">everyone 📣</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        {sort === "top" && <input type="hidden" name="sort" value="top" />}
        <button className="btn bg-lime">filter 🔍</button>
        {filtered && <Link href="/admin" className="btn bg-surface !text-text">clear</Link>}
      </form>

      <div className="mb-6 flex items-center justify-between gap-3">
        <span className="tag text-muted">{items.length} {items.length === 1 ? "note" : "notes"}</span>
        <Segmented
          value={sort}
          color="var(--yellow)"
          hrefFor={href}
          options={[{ value: "new", label: "fresh 🆕" }, { value: "top", label: "top ⭐" }]}
        />
      </div>

      {items.length === 0 ? (
        <EmptyState emoji="🕵️" title="nothing matches">try a different filter</EmptyState>
      ) : (
        <div className="space-y-6">
          {items.map((f, i) => (
            <FeedbackNote
              key={f.id}
              index={i}
              category={f.category}
              message={f.message}
              createdAt={f.created_at}
              avatar={<PersonAvatar name={f.author_name} size={44} />}
              from={
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  {f.author_name}
                  <span className="sticker -rotate-2 bg-coral !py-0 !text-[11px]">🎭 unmasked</span>
                </span>
              }
              to={
                <>
                  <ToSticker to={f.recipient_name ?? "everyone"} />
                  <span className="font-mono text-xs font-bold text-faint">aka {persona(f.id).name.toLowerCase()}</span>
                </>
              }
              footer={
                <>
                  <form action={deleteFeedback}>
                    <input type="hidden" name="id" value={f.id} />
                    <button className="btn-sm hover:bg-coral hover:text-on-bright">🗑️ yeet</button>
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
