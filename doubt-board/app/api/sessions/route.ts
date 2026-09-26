import { NextResponse, type NextRequest } from "next/server";

import { handler, parseBody } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { createSessionWithCode, serializeSession, sessionsWithCounts } from "@/lib/sessions";
import { createSessionSchema } from "@/lib/validators";

export const POST = handler(async (req: NextRequest) => {
  const user = await requireRole(req, "teacher");
  const { title, subject } = await parseBody(req, createSessionSchema);
  await connectDB();
  const session = await createSessionWithCode({ title, subject, teacherId: user.id });
  return NextResponse.json({ session: serializeSession(session, user) }, { status: 201 });
});

export const GET = handler(async (req: NextRequest) => {
  const user = await requireRole(req, "teacher");
  await connectDB();
  return NextResponse.json({ sessions: await sessionsWithCounts(user.id) });
});
