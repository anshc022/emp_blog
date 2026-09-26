import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export const DOUBT_STATUSES = ["open", "answered"] as const;
export type DoubtStatus = (typeof DOUBT_STATUSES)[number];

const doubtSchema = new Schema(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: "Session", required: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isAnonymous: { type: Boolean, default: true },
    text: { type: String, required: true, trim: true, maxlength: 500 },
    topic: { type: String, trim: true, maxlength: 40, default: "General" },
    upvotes: { type: [{ type: Schema.Types.ObjectId, ref: "User" }], default: [], select: false },
    upvoteCount: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: DOUBT_STATUSES, default: "open" },
    answer: { type: String, trim: true, maxlength: 2000 },
    answeredAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// Duplicate-doubt search ("similar doubts already asked").
doubtSchema.index({ text: "text" });
// The live feed: one session, one status, most upvoted first.
doubtSchema.index({ sessionId: 1, status: 1, upvoteCount: -1 });

export type DoubtDoc = InferSchemaType<typeof doubtSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
};

export const Doubt: Model<DoubtDoc> =
  (mongoose.models.Doubt as Model<DoubtDoc>) || mongoose.model<DoubtDoc>("Doubt", doubtSchema);
