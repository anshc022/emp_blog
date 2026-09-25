import Link from "next/link";
import { Inbox, Megaphone } from "lucide-react";
import { AnonAvatar } from "@/components/avatar";
import { EmptyState, FeedbackNote, PageHeader } from "@/components/feedback-note";
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
      <PageHeader eyebrow="Inbox" title={<>Hi {user.name.split(" ")[0]}, here’s what people are saying.</>}>
        Everything here is anonymous. Star the notes that resonate so the good ones rise to the top.
      </PageHeader>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Segmented
          value={view}
          hrefFor={(v) => href({ view: v })}
          options={[
            { value: "all", label: "All", count: (counts.mine ?? 0) + (counts.company ?? 0) },
            { value: "mine", label: "For you", count: counts.mine ?? 0 },
            { value: "company", label: "Company", count: counts.company ?? 0 },
          ]}
        />
        <Segmented
          value={sort}
          hrefFor={(v) => href({ sort: v })}
          options={[
            { value: "new", label: "Newest" },
            { value: "top", label: "★ Top" },
          ]}
        />
      </div>

      {items.length === 0 ? (
        <EmptyState icon={<Inbox size={24} />} title="Nothing here yet">
          When someone shares feedback with you or the whole company, it lands here.{" "}
          <Link href="/give" className="font-semibold text-accent hover:underline">Start the conversation →</Link>
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
              avatar={<AnonAvatar seed={f.id} />}
              from="Anonymous"
              to={
                f.to_everyone ? (
                  <span className="inline-flex items-center gap-1"><Megaphone size={13} /> Everyone</span>
                ) : (
                  <span className="text-accent">You</span>
                )
              }
              footer={
                <>
                  <span className="text-xs text-faint">
                    {f.star_count > 0
                      ? `${f.star_count} ${f.star_count === 1 ? "person" : "people"} starred this`
                      : "Be the first to star this"}
                  </span>
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
