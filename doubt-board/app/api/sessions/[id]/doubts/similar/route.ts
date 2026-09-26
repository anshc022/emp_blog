import { NextResponse, type NextRequest } from "next/server";

import { handler, parseWith } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { AUTHOR_POPULATE, DOUBT_SELECT } from "@/lib/doubts";
import { serializeDoubt, type DoubtLike } from "@/lib/serialize";
import { loadSessionFor } from "@/lib/sessions";
import { similarQuerySchema } from "@/lib/validators";
import { Doubt } from "@/models/Doubt";

// Top 3 open doubts in this session ranked by MongoDB text score — used as a
// "someone already asked this" hint while a student types.
export const GET = handler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const user = await requireRole(req);
  const { id } = await params;
  const { q } = parseWith(similarQuerySchema, { q: req.nextUrl.searchParams.get("q") ?? "" });

  await connectDB();
  await loadSessionFor(user, id);

  const doubts = await Doubt.find(
    { sessionId: id, status: "open", $text: { $search: q } },
    { score: { $meta: "textScore" } },
  )
    .select(DOUBT_SELECT)
    .populate(AUTHOR_POPULATE)
    .sort({ score: { $meta: "textScore" } })
    .limit(3)
    .lean<DoubtLike[]>();

  return NextResponse.json({ doubts: doubts.map((d) => serializeDoubt(d, user.id)) });
});
