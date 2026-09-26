import { Types } from "mongoose";

import { Doubt } from "@/models/Doubt";
import { Session } from "@/models/Session";

export type Analytics = Awaited<ReturnType<typeof teacherAnalytics>>;

/** Everything on the teacher analytics page, computed with MongoDB aggregation pipelines. */
export async function teacherAnalytics(teacherId: string, timezone = "UTC") {
  const teacher = new Types.ObjectId(teacherId);
  const sessionIds = await Session.find({ teacherId: teacher }).distinct("_id");
  const inMySessions = { sessionId: { $in: sessionIds } };
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [topTopics, statusCounts, byHour, perSession] = await Promise.all([
    // Top 5 most-doubted topics in the last 7 days.
    Doubt.aggregate<{ topic: string; count: number; upvotes: number }>([
      { $match: { ...inMySessions, createdAt: { $gte: weekAgo } } },
      { $group: { _id: { $ifNull: ["$topic", "General"] }, count: { $sum: 1 }, upvotes: { $sum: "$upvoteCount" } } },
      { $sort: { count: -1, upvotes: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, topic: "$_id", count: 1, upvotes: 1 } },
    ]),

    // Answered vs still open.
    Doubt.aggregate<{ _id: "open" | "answered"; count: number }>([
      { $match: inMySessions },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),

    // Doubts per hour of day (in the teacher's timezone) to spot peak times.
    Doubt.aggregate<{ hour: number; count: number }>([
      { $match: inMySessions },
      { $group: { _id: { $hour: { date: "$createdAt", timezone } }, count: { $sum: 1 } } },
      { $project: { _id: 0, hour: "$_id", count: 1 } },
      { $sort: { hour: 1 } },
    ]),

    // Per-session summary.
    Session.aggregate<{
      id: Types.ObjectId;
      title: string;
      subject: string;
      isActive: boolean;
      createdAt: Date;
      total: number;
      answered: number;
      upvotes: number;
      answeredPct: number;
    }>([
      { $match: { teacherId: teacher } },
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
        $project: {
          _id: 0,
          id: "$_id",
          title: 1,
          subject: 1,
          isActive: 1,
          createdAt: 1,
          total: { $size: "$doubts" },
          answered: { $size: { $filter: { input: "$doubts", cond: { $eq: ["$$this.status", "answered"] } } } },
          upvotes: { $sum: "$doubts.upvoteCount" },
        },
      },
      {
        $addFields: {
          answeredPct: {
            $cond: [{ $eq: ["$total", 0] }, 0, { $round: [{ $multiply: [{ $divide: ["$answered", "$total"] }, 100] }, 0] }],
          },
        },
      },
      { $sort: { createdAt: -1 } },
    ]),
  ]);

  const answered = statusCounts.find((s) => s._id === "answered")?.count ?? 0;
  const open = statusCounts.find((s) => s._id === "open")?.count ?? 0;
  const hourMap = new Map(byHour.map((h) => [h.hour, h.count]));

  return {
    timezone,
    topTopics,
    status: { answered, open, total: answered + open },
    byHour: Array.from({ length: 24 }, (_, hour) => ({ hour, count: hourMap.get(hour) ?? 0 })),
    sessions: perSession.map((s) => ({ ...s, id: s.id.toString(), createdAt: s.createdAt.toISOString() })),
  };
}
