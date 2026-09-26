import { NextResponse, type NextRequest } from "next/server";

import { handler, HttpError, parseBody, parseWith } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { AUTHOR_POPULATE, DOUBT_SELECT } from "@/lib/doubts";
import { rateLimit } from "@/lib/rate-limit";
import { serializeDoubt, type DoubtLike } from "@/lib/serialize";
import { emitDoubtToSession } from "@/lib/socket";
import { loadSessionFor } from "@/lib/sessions";
import { createDoubtSchema, doubtStatusSchema } from "@/lib/validators";
import { Doubt } from "@/models/Doubt";

type Ctx = { params: Promise<{ id: string }> };

export const GET = handler(async (req: NextRequest, { params }: Ctx) => {
  const user = await requireRole(req);
  const { id } = await params;
  const statusParam = req.nextUrl.searchParams.get("status");
  const status = statusParam ? parseWith(doubtStatusSchema, statusParam) : undefined;

  await connectDB();
  await loadSessionFor(user, id);

  const doubts = await Doubt.find({ sessionId: id, ...(status && { status }) })
    .select(DOUBT_SELECT)
    .populate(AUTHOR_POPULATE)
    .sort({ upvoteCount: -1, createdAt: 1 })
    .lean<DoubtLike[]>();

  return NextResponse.json({ doubts: doubts.map((d) => serializeDoubt(d, user.id)) });
});

export const POST = handler(async (req: NextRequest, { params }: Ctx) => {
  const user = await requireRole(req, "student");
  const { id } = await params;
  const input = await parseBody(req, createDoubtSchema);

  await connectDB();
  const session = await loadSessionFor(user, id);
  if (!session.isActive) throw new HttpError(410, "This session has ended — no new doubts");

  rateLimit(`doubt:${user.id}`, 5, 60_000);

  const created = await Doubt.create({ ...input, sessionId: id, authorId: user.id });
  await created.populate(AUTHOR_POPULATE);
  const doubt = serializeDoubt(created, user.id);
  await emitDoubtToSession(id, "doubt:created", created);

  return NextResponse.json({ doubt }, { status: 201 });
});
