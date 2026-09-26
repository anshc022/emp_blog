import { NextResponse, type NextRequest } from "next/server";

import { handler } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { loadSessionFor, serializeSession } from "@/lib/sessions";

export const GET = handler(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const user = await requireRole(req);
  const { id } = await params;
  await connectDB();
  const session = await loadSessionFor(user, id);
  return NextResponse.json({ session: serializeSession(session, user) });
});
