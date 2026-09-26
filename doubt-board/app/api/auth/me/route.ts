import { NextResponse, type NextRequest } from "next/server";

import { handler, HttpError } from "@/lib/api";
import { requireRole, toAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export const GET = handler(async (req: NextRequest) => {
  const auth = await requireRole(req);
  await connectDB();
  const user = await User.findById(auth.id).lean();
  if (!user) throw new HttpError(401, "Your account no longer exists");
  return NextResponse.json({ user: { ...toAuthUser(user), email: user.email } });
});
