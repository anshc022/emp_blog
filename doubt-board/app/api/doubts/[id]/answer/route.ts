import { NextResponse, type NextRequest } from "next/server";

import { handler, parseBody } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { assertSessionOwner, loadDoubt } from "@/lib/doubts";
import { serializeDoubt } from "@/lib/serialize";
import { answerDoubtSchema } from "@/lib/validators";

export const PATCH = handler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const user = await requireRole(req, "teacher");
  const { id } = await params;
  const { answer } = await parseBody(req, answerDoubtSchema);
  await connectDB();

  const { doubt, session } = await loadDoubt(id);
  assertSessionOwner(user, session);

  doubt.status = "answered";
  doubt.answer = answer || undefined;
  doubt.answeredAt = new Date();
  await doubt.save();

  return NextResponse.json({ doubt: serializeDoubt(doubt, user.id) });
});
