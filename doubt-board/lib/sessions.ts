import { randomInt } from "node:crypto";
import { Types } from "mongoose";

import { HttpError } from "@/lib/api";
import type { AuthUser } from "@/lib/auth";
import { Doubt } from "@/models/Doubt";
import { Session, type SessionDoc } from "@/models/Session";

export const generateJoinCode = () => randomInt(0, 1_000_000).toString().padStart(6, "0");

/** Create a session, retrying if the random join code collides with an existing one. */
export async function createSessionWithCode(data: { title: string; subject: string; teacherId: string }) {
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      return await Session.create({ ...data, joinCode: generateJoinCode() });
    } catch (err) {
      if ((err as { code?: number }).code !== 11000) throw err;
    }
  }
  throw new HttpError(503, "Couldn't generate a unique join code, please try again");
}

/** Public shape of a session. The join code is only shown to the owning teacher. */
export function serializeSession(s: SessionDoc, viewer?: AuthUser | null) {
  const isOwner = !!viewer && s.teacherId.toString() === viewer.id;
  return {
    id: s._id.toString(),
    title: s.title,
    subject: s.subject,
    isActive: s.isActive,
    createdAt: s.createdAt.toISOString(),
    endedAt: s.endedAt ? s.endedAt.toISOString() : null,
    joinCode: isOwner ? s.joinCode : undefined,
    isOwner,
  };
}

export type SessionDTO = ReturnType<typeof serializeSession>;

/**
 * Load a session the viewer is allowed to see: teachers only their own,
 * students any session (they reach it through the join code).
 */
export async function loadSessionFor(user: AuthUser, sessionId: string) {
  if (!Types.ObjectId.isValid(sessionId)) throw new HttpError(400, "Invalid session id");
  const session = await Session.findById(sessionId).lean<SessionDoc>();
  if (!session) throw new HttpError(404, "Session not found");
  if (user.role === "teacher" && session.teacherId.toString() !== user.id) {
    throw new HttpError(403, "This isn't your session");
  }
  return session;
}

/** A teacher's sessions with doubt counts, newest first. */
export async function sessionsWithCounts(teacherId: string) {
  const rows = await Session.aggregate<SessionDoc & { total: number; open: number; answered: number; upvotes: number }>([
    { $match: { teacherId: new Types.ObjectId(teacherId) } },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: Doubt.collection.name,
        localField: "_id",
        foreignField: "sessionId",
        as: "doubts",
        pipeline: [{ $project: { status: 1, upvoteCount: 1 } }],
      },
    },
    {
      $addFields: {
        total: { $size: "$doubts" },
        open: { $size: { $filter: { input: "$doubts", cond: { $eq: ["$$this.status", "open"] } } } },
        answered: { $size: { $filter: { input: "$doubts", cond: { $eq: ["$$this.status", "answered"] } } } },
        upvotes: { $sum: "$doubts.upvoteCount" },
      },
    },
    { $project: { doubts: 0 } },
  ]);
  return rows.map((r) => ({
    ...serializeSession(r, { id: teacherId, name: "", role: "teacher" }),
    stats: { total: r.total, open: r.open, answered: r.answered, upvotes: r.upvotes },
  }));
}
