import type { Server as HttpServer } from "node:http";

import { Types } from "mongoose";
import { Server } from "socket.io";

import { verifyToken } from "@/lib/jwt";
import { connectDB } from "@/lib/db";
import { sessionRoom, setIO, type AppServer } from "@/lib/socket";
import { Session } from "@/models/Session";

/** Live number of distinct students connected to a session room. */
async function broadcastPresence(io: AppServer, sessionId: string) {
  const sockets = await io.in(sessionRoom(sessionId)).fetchSockets();
  const students = new Set(sockets.filter((s) => s.data.user.role === "student").map((s) => s.data.user.id));
  io.to(sessionRoom(sessionId)).emit("presence:count", { sessionId, count: students.size });
}

const roomsOf = (rooms: Set<string>) =>
  [...rooms].filter((r) => r.startsWith("session:")).map((r) => r.slice("session:".length));

export function createSocketServer(httpServer: HttpServer): AppServer {
  const io: AppServer = new Server(httpServer, {
    path: "/socket.io",
    // Same origin as the app in production; allow any origin in dev for LAN testing on phones.
    cors: process.env.NODE_ENV === "production" ? undefined : { origin: true, credentials: true },
  });

  // Every connection must present a short-lived token from /api/auth/socket-token.
  io.use((socket, next) => {
    const user = verifyToken(socket.handshake.auth?.token as string | undefined, "socket");
    if (!user) return next(new Error("unauthorized"));
    socket.data.user = user;
    next();
  });

  io.on("connection", (socket) => {
    const { user } = socket.data;

    socket.on("session:join", async (payload, ack) => {
      const sessionId = payload?.sessionId;
      try {
        if (typeof sessionId !== "string" || !Types.ObjectId.isValid(sessionId)) throw new Error("Invalid session");
        await connectDB();
        const session = await Session.findById(sessionId).select("teacherId").lean();
        if (!session) throw new Error("Session not found");
        if (user.role === "teacher" && session.teacherId.toString() !== user.id) throw new Error("Not your session");

        await socket.join(sessionRoom(sessionId));
        ack?.({ ok: true });
        await broadcastPresence(io, sessionId);
      } catch (err) {
        ack?.({ ok: false, error: err instanceof Error ? err.message : "Couldn't join" });
      }
    });

    socket.on("session:leave", async (payload) => {
      const sessionId = payload?.sessionId;
      if (typeof sessionId !== "string" || !socket.rooms.has(sessionRoom(sessionId))) return;
      await socket.leave(sessionRoom(sessionId));
      await broadcastPresence(io, sessionId);
    });

    // Rooms are still readable in "disconnecting"; recount once the socket is gone.
    socket.on("disconnecting", () => {
      const sessionIds = roomsOf(socket.rooms);
      socket.once("disconnect", () => {
        for (const id of sessionIds) broadcastPresence(io, id).catch(() => {});
      });
    });
  });

  setIO(io);
  return io;
}
