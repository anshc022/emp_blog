import { NextResponse, type NextRequest } from "next/server";

import { handler, HttpError } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { loadSessionFor, serializeSession } from "@/lib/sessions";
import { Session } from "@/models/Session";

export const PATCH = handler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const user = await requireRole(req, "teacher");
  const { id } = await params;
  await connectDB();
  await loadSessionFor(user, id); // 404 / 403 for sessions the teacher doesn't own

  const session = await Session.findOneAndUpdate(
    { _id: id, isActive: true },
    { isActive: false, endedAt: new Date() },
    { returnDocument: "after" },
  ).lean();
  if (!session) throw new HttpError(409, "This session has already ended");

  return NextResponse.json({ session: serializeSession(session, user) });
});
