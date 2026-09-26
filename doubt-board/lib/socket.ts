import type { Server as IOServer } from "socket.io";

// server.ts creates the io instance and stores it here; route handlers run in the
// same Node process, so they can read it back and emit after DB writes.
const globalForIO = globalThis as unknown as { __io?: IOServer };

export function setIO(io: IOServer) {
  globalForIO.__io = io;
}

export function getIO(): IOServer | null {
  return globalForIO.__io ?? null;
}
