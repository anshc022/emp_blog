import Link from "next/link";
import { AnonAvatar } from "@/components/avatar";
import { EmptyState, FeedbackNote, PageHeader, starLine } from "@/components/feedback-note";
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
      <PageHeader title={<>what&apos;s the tea, {user.name.split(" ")[0].toLowerCase()}?</>}>
        everything here is anonymous. star what hits and it floats to the top.
      </PageHeader>

      <div className="mb-2 flex items-center justify-between gap-4 border-b border-line">
        <Segmented
          value={view}
          hrefFor={(v) => href({ view: v })}
          options={[
            { value: "all", label: "all", count: (counts.mine ?? 0) + (counts.company ?? 0) },
            { value: "mine", label: "for you", count: counts.mine ?? 0 },
            { value: "company", label: "everyone", count: counts.company ?? 0 },
          ]}
        />
        <Segmented
          value={sort}
          hrefFor={(v) => href({ sort: v })}
          options={[
            { value: "new", label: "new" },
            { value: "top", label: "top" },
          ]}
        />
      </div>

      {items.length === 0 ? (
        <EmptyState emoji="🦗" title="it's giving… empty">
          no tea yet. suspicious.{" "}
          <Link href="/give" data-sound="open" className="text-text underline underline-offset-4">
            be the first
          </Link>
        </EmptyState>
      ) : (
        <>
          {items.map((f, i) => (
            <FeedbackNote
              key={f.id}
              index={i}
              category={f.category}
              message={f.message}
              createdAt={f.created_at}
              avatar={<AnonAvatar seed={f.id} />}
              from={persona(f.id).name}
              to={f.to_everyone ? "everyone" : <span className="font-medium text-text">you</span>}
              footer={
                <>
                  <StarButton id={f.id} count={f.star_count} starred={!!f.starred} />
                  <span className="text-[13px] text-faint">{starLine(f.star_count)}</span>
                </>
              }
            />
          ))}
          <p className="pt-10 text-center text-[13px] text-faint">that&apos;s all. go touch grass 🌱</p>
        </>
      )}
    </>
  );
}
