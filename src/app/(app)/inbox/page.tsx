import Link from "next/link";
import { AnonAvatar } from "@/components/avatar";
import { EmptyState, FeedbackNote, PageHeader, ToSticker, starLine } from "@/components/feedback-note";
import { persona } from "@/components/persona";
import { Segmented } from "@/components/segmented";
import { StarButton } from "@/components/star-button";
import { countInbox, listInbox, type InboxSort, type InboxView } from "@/lib/db";
import { requireUser } from "@/lib/session";

export default async function InboxPage(props: PageProps<"/inbox">) {
  const user = await requireUser();
  const params = await props.searchParams;
  const view: InboxView = params.view === "mine" || params.view === "company" ? params.view : "all";
  const sort: InboxSort = params.sort === "top" ? "top" : "new";

  const counts = countInbox(user.id);
  const items = listInbox(user.id, view, sort);
  const href = (next: { view?: string; sort?: string }) => {
    const q = new URLSearchParams({ view, sort, ...next });
    if (q.get("view") === "all") q.delete("view");
    if (q.get("sort") === "new") q.delete("sort");
    const s = q.toString();
    return s ? `/inbox?${s}` : "/inbox";
  };

  return (
    <>
      <PageHeader tag="📥 inbox" title={<>what&apos;s the tea, {user.name.split(" ")[0].toLowerCase()}? ☕</>}>
        everything here is anonymous. star the ones that hit ⭐ and the best takes float to the top.
      </PageHeader>

      <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
        <Segmented
          value={view}
          hrefFor={(v) => href({ view: v })}
          options={[
            { value: "all", label: "all", count: (counts.mine ?? 0) + (counts.company ?? 0) },
            { value: "mine", label: "for you 🫵", count: counts.mine ?? 0 },
            { value: "company", label: "company 📣", count: counts.company ?? 0 },
          ]}
        />
        <Segmented
          value={sort}
          color="var(--yellow)"
          hrefFor={(v) => href({ sort: v })}
          options={[
            { value: "new", label: "fresh 🆕" },
            { value: "top", label: "top ⭐" },
          ]}
        />
      </div>

      {items.length === 0 ? (
        <EmptyState emoji="🦗" title="it's giving… empty">
          no tea here yet. suspicious. be the main character and{" "}
          <Link href="/give" className="font-extrabold text-text underline decoration-pink decoration-4 underline-offset-2">
            spill first →
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
              avatar={<AnonAvatar seed={f.id} />}
              from={persona(f.id).name}
              to={<ToSticker to={f.to_everyone ? "everyone" : "you"} />}
              footer={
                <>
                  <span className="text-sm font-semibold text-muted">{starLine(f.star_count)}</span>
                  <StarButton id={f.id} count={f.star_count} starred={!!f.starred} />
                </>
              }
            />
          ))}
          <p className="pt-4 text-center text-sm font-bold text-faint">you&apos;re all caught up ✨ touch grass maybe? 🌱</p>
        </div>
      )}
    </>
  );
}
