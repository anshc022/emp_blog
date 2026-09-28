import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { teamdeskAdmin } from "@/lib/teamdesk-proxy";

/** Remove a note, from TeamDesk's admin page. Its stars go with it. */
export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = teamdeskAdmin(request);
  if (admin instanceof Response) return admin;

  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id) || id <= 0) return Response.json({ error: "bad id" }, { status: 400 });
  const { changes } = db.prepare("DELETE FROM feedback WHERE id = ?").run(id);
  if (!changes) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json({ ok: true, deleted: id });
}
