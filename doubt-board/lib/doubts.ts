import { Types } from "mongoose";

import { HttpError } from "@/lib/api";
import type { AuthUser } from "@/lib/auth";
import { Doubt } from "@/models/Doubt";
import { Session } from "@/models/Session";

/** Fields every doubt query needs for serializeDoubt (upvotes is hidden by default). */
export const DOUBT_SELECT = "+upvotes";
export const AUTHOR_POPULATE = { path: "authorId", select: "name" } as const;

/** Load a doubt plus its session; throws 400/404. */
export async function loadDoubt(doubtId: string) {
  if (!Types.ObjectId.isValid(doubtId)) throw new HttpError(400, "Invalid doubt id");
  const doubt = await Doubt.findById(doubtId).select(DOUBT_SELECT).populate(AUTHOR_POPULATE);
  if (!doubt) throw new HttpError(404, "Doubt not found");
  const session = await Session.findById(doubt.sessionId).lean();
  if (!session) throw new HttpError(404, "Session not found");
  return { doubt, session };
}

export function assertSessionOwner(user: AuthUser, session: { teacherId: Types.ObjectId }) {
  if (user.role !== "teacher" || session.teacherId.toString() !== user.id) {
    throw new HttpError(403, "Only the teacher running this session can do that");
  }
}
