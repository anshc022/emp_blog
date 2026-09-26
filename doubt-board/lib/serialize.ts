import type { Types } from "mongoose";

type Id = Types.ObjectId | string;
type PopulatedAuthor = { _id: Id; name: string };

/** Anything shaped like a Doubt document (lean or hydrated), optionally with author populated. */
export type DoubtLike = {
  _id: Id;
  sessionId: Id;
  authorId: Id | PopulatedAuthor;
  isAnonymous: boolean;
  text: string;
  topic?: string | null;
  upvotes?: Id[] | null;
  upvoteCount: number;
  status: "open" | "answered";
  answer?: string | null;
  createdAt: Date;
  answeredAt?: Date | null;
};

const isPopulated = (a: DoubtLike["authorId"]): a is PopulatedAuthor =>
  typeof a === "object" && a !== null && "name" in a;

/**
 * The ONLY way a doubt leaves the server (API responses and socket payloads).
 * Anonymous doubts never carry any author information — not the name, not the id.
 * The viewer just learns whether it is their own doubt (`isMine`).
 */
export function serializeDoubt(d: DoubtLike, viewerId?: string | null) {
  const authorId = isPopulated(d.authorId) ? d.authorId._id.toString() : d.authorId.toString();
  return {
    id: d._id.toString(),
    sessionId: d.sessionId.toString(),
    text: d.text,
    topic: d.topic || "General",
    isAnonymous: d.isAnonymous,
    author: !d.isAnonymous && isPopulated(d.authorId) ? { name: d.authorId.name } : null,
    isMine: !!viewerId && authorId === viewerId,
    hasUpvoted: !!viewerId && !!d.upvotes?.some((u) => u.toString() === viewerId),
    upvoteCount: d.upvoteCount,
    status: d.status,
    answer: d.answer || null,
    createdAt: d.createdAt.toISOString(),
    answeredAt: d.answeredAt ? d.answeredAt.toISOString() : null,
  };
}

export type DoubtDTO = ReturnType<typeof serializeDoubt>;
