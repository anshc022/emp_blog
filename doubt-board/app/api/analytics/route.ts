import { NextResponse, type NextRequest } from "next/server";

import { teacherAnalytics } from "@/lib/analytics";
import { handler } from "@/lib/api";
import { requireRole } from "@/lib/auth";
import { connectDB } from "@/lib/db";

function validTimezone(tz: string | null) {
  if (!tz) return "UTC";
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return tz;
  } catch {
    return "UTC";
  }
}

export const GET = handler(async (req: NextRequest) => {
  const user = await requireRole(req, "teacher");
  await connectDB();
  const analytics = await teacherAnalytics(user.id, validTimezone(req.nextUrl.searchParams.get("tz")));
  return NextResponse.json(analytics);
});
