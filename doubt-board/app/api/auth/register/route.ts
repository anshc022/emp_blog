import bcrypt from "bcryptjs";
import { NextResponse, type NextRequest } from "next/server";

import { handler, HttpError, parseBody } from "@/lib/api";
import { setAuthCookie, toAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { registerSchema } from "@/lib/validators";
import { User } from "@/models/User";

export const POST = handler(async (req: NextRequest) => {
  const { name, email, password, role } = await parseBody(req, registerSchema);
  await connectDB();

  if (await User.exists({ email })) throw new HttpError(409, "An account with this email already exists");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, role });

  const authUser = toAuthUser(user);
  const res = NextResponse.json({ user: { ...authUser, email: user.email } }, { status: 201 });
  setAuthCookie(res, authUser);
  return res;
});
