import { NextResponse, type NextRequest } from "next/server";

import { handler, HttpError } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { loadDoubt } from "@/lib/doubts";
import { Doubt } from "@/models/Doubt";

// The author can delete their own doubt; the session's teacher can delete any.
export const DELETE = handler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const user = await requireRole(req);
  const { id } = await params;
  await connectDB();

  const { doubt, session } = await loadDoubt(id);
  const isAuthor = doubt.authorId._id.toString() === user.id;
  const isOwner = user.role === "teacher" && session.teacherId.toString() === user.id;
  if (!isAuthor && !isOwner) throw new HttpError(403, "You can only delete your own doubts");

  await Doubt.deleteOne({ _id: id });
  return NextResponse.json({ ok: true, doubtId: id });
});
