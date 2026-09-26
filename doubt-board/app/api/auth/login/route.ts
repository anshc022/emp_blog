import bcrypt from "bcryptjs";
import { NextResponse, type NextRequest } from "next/server";

import { handler, HttpError, parseBody } from "@/lib/api";
import { setAuthCookie, toAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { loginSchema } from "@/lib/validators";
import { User } from "@/models/User";

export const POST = handler(async (req: NextRequest) => {
  const { email, password } = await parseBody(req, loginSchema);
  await connectDB();

  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new HttpError(401, "Incorrect email or password");
  }

  const authUser = toAuthUser(user);
  const res = NextResponse.json({ user: { ...authUser, email: user.email } });
  setAuthCookie(res, authUser);
  return res;
});
