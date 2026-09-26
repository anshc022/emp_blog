import { NextResponse } from "next/server";

import { handler } from "@/lib/api";
import { clearAuthCookie } from "@/lib/auth";

export const POST = handler(async () => {
  const res = NextResponse.json({ ok: true });
  clearAuthCookie(res);
  return res;
});
