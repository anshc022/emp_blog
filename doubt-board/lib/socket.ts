import type { Server as IOServer } from "socket.io";

import { serializeDoubt, type DoubtDTO, type DoubtLike } from "@/lib/serialize";

/** Data the server attaches to every authenticated socket. */
export type SocketUser = { id: string; role: "student" | "teacher"; name: string };

export type ServerToClientEvents = {
  "doubt:created": (doubt: DoubtDTO) => void;
  "doubt:upvoted": (payload: { doubtId: string; upvoteCount: number }) => void;
  "doubt:answered": (doubt: DoubtDTO) => void;
  "doubt:deleted": (payload: { doubtId: string }) => void;
  "session:ended": (payload: { sessionId: string; endedAt: string }) => void;
  "presence:count": (payload: { sessionId: string; count: number }) => void;
};

export type ClientToServerEvents = {
  "session:join": (payload: { sessionId: string }, ack?: (res: { ok: boolean; error?: string }) => void) => void;
  "session:leave": (payload: { sessionId: string }) => void;
};

export type SocketData = { user: SocketUser };

export type AppServer = IOServer<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

// server.ts creates the io instance and stores it here; route handlers run in the
// same Node process, so they can read it back and emit after DB writes.
const globalForIO = globalThis as unknown as { __io?: AppServer };

export function setIO(io: AppServer) {
  globalForIO.__io = io;
}

export function getIO(): AppServer | null {
  return globalForIO.__io ?? null;
}

export const sessionRoom = (sessionId: string) => `session:${sessionId}`;

/** Emit an event with no per-viewer fields to everyone in a session room. */
export function emitToSession<E extends keyof ServerToClientEvents>(
  sessionId: string,
  event: E,
  ...args: Parameters<ServerToClientEvents[E]>
) {
  getIO()
    ?.to(sessionRoom(sessionId))
    .emit(event, ...args);
}

/**
 * Emit a doubt to every socket in the room, serialized per viewer so `isMine`
 * and `hasUpvoted` are right for each person. Goes through serializeDoubt, so
 * anonymous authors are never revealed — same rule as the REST API.
 */
export async function emitDoubtToSession(
  sessionId: string,
  event: "doubt:created" | "doubt:answered",
  doubt: DoubtLike,
) {
  const io = getIO();
  if (!io) return;
  try {
    const sockets = await io.in(sessionRoom(sessionId)).fetchSockets();
    for (const socket of sockets) socket.emit(event, serializeDoubt(doubt, socket.data.user?.id));
  } catch (err) {
    console.error("[socket] emit failed", err);
  }
}
