import { NextResponse, type NextRequest } from "next/server";

import { handler, HttpError } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { loadDoubt } from "@/lib/doubts";
import { emitToSession } from "@/lib/socket";
import { Doubt } from "@/models/Doubt";

// Toggle the current student's upvote. Each branch is a single atomic update
// whose filter guarantees one vote per user even under concurrent clicks.
export const POST = handler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const user = await requireRole(req, "student");
  const { id } = await params;
  await connectDB();

  const { doubt, session } = await loadDoubt(id);
  if (!session.isActive) throw new HttpError(410, "This session has ended");
  if (doubt.status !== "open") throw new HttpError(409, "This doubt has already been answered");
  if (doubt.authorId._id.toString() === user.id) throw new HttpError(400, "You can't upvote your own doubt");

  let hasUpvoted = true;
  let updated = await Doubt.findOneAndUpdate(
    { _id: id, upvotes: { $ne: user.id } },
    { $addToSet: { upvotes: user.id }, $inc: { upvoteCount: 1 } },
    { returnDocument: "after", projection: { upvoteCount: 1, sessionId: 1 } },
  ).lean();
  if (!updated) {
    hasUpvoted = false;
    updated = await Doubt.findOneAndUpdate(
      { _id: id, upvotes: user.id },
      { $pull: { upvotes: user.id }, $inc: { upvoteCount: -1 } },
      { returnDocument: "after", projection: { upvoteCount: 1, sessionId: 1 } },
    ).lean();
  }
  if (!updated) throw new HttpError(409, "Couldn't update the vote, please try again");

  emitToSession(session._id.toString(), "doubt:upvoted", { doubtId: id, upvoteCount: updated.upvoteCount });
  return NextResponse.json({ doubtId: id, upvoteCount: updated.upvoteCount, hasUpvoted });
});
