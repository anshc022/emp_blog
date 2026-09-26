import { NextResponse, type NextRequest } from "next/server";

import { handler } from "@/lib/api";
import { requireRole, signSocketToken } from "@/lib/auth";

// Short-lived token for the Socket.io handshake (the httpOnly cookie is not
// readable from JS, so the client asks for this and passes it in `auth.token`).
export const GET = handler(async (req: NextRequest) => {
  const user = await requireRole(req);
  return NextResponse.json({ token: signSocketToken(user) }, { headers: { "Cache-Control": "no-store" } });
});
