import { NextResponse, type NextRequest } from "next/server";

import { handler, HttpError, parseBody } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { serializeSession } from "@/lib/sessions";
import { joinSessionSchema } from "@/lib/validators";
import { Session } from "@/models/Session";

export const POST = handler(async (req: NextRequest) => {
  const user = await requireRole(req, "student");
  const { joinCode } = await parseBody(req, joinSessionSchema);
  await connectDB();

  const session = await Session.findOne({ joinCode }).lean();
  if (!session) throw new HttpError(404, "No session found with that code");
  if (!session.isActive) throw new HttpError(410, "That session has already ended");

  return NextResponse.json({ session: serializeSession(session, user) });
});
