import type { NextRequest } from "next/server";
import { getStats, listAllFeedback, listUsers } from "@/lib/db";
import { isoUtc, teamdeskAdmin } from "@/lib/teamdesk-proxy";

/**
 * Everything TeamDesk's admin page shows, in one request: the totals, the people to filter by,
 * and the notes themselves with who wrote them.
 *
 * Query: `sort=new|top`, `author=<id>`, `recipient=<id>|everyone`.
 */
export async function GET(request: NextRequest) {
  const admin = teamdeskAdmin(request);
  if (admin instanceof Response) return admin;

  const q = request.nextUrl.searchParams;
  const author = Number(q.get("author")) || undefined;
  const recipient = q.get("recipient") === "everyone" ? ("everyone" as const) : Number(q.get("recipient")) || undefined;
  const sort = q.get("sort") === "top" ? "top" : "new";

  const feedback = listAllFeedback(admin.localUserId, { authorId: author, recipientId: recipient, sort }).map(
    (f) => ({
      id: f.id,
      category: f.category,
      message: f.message,
      created_at: isoUtc(f.created_at),
      author_id: f.author_id,
      author_name: f.author_name,
      recipient_id: f.recipient_id,
      recipient_name: f.recipient_name, // null: written to everyone
      star_count: f.star_count,
    }),
  );
  const people = listUsers().map((u) => ({ id: u.id, name: u.name, active: Boolean(u.active) }));

  return Response.json({ stats: getStats(), people, feedback });
}
