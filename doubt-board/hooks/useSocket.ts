"use client";

import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

import type { ClientToServerEvents, ServerToClientEvents } from "@/lib/socket";

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

async function fetchSocketToken(): Promise<string> {
  try {
    const res = await fetch("/api/auth/socket-token", { credentials: "same-origin", cache: "no-store" });
    if (!res.ok) return "";
    return ((await res.json()) as { token: string }).token;
  } catch {
    return "";
  }
}

/**
 * One authenticated Socket.io connection for the component's lifetime.
 * A fresh short-lived token is fetched on every (re)connect attempt, and the
 * client keeps retrying — including after auth errors, which socket.io
 * doesn't retry on its own.
 */
export function useSocket() {
  const [socket, setSocket] = useState<AppSocket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const s: AppSocket = io({
      path: "/socket.io",
      auth: (cb) => void fetchSocketToken().then((token) => cb({ token })),
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
    let retry: ReturnType<typeof setTimeout> | undefined;

    s.on("connect", () => setConnected(true));
    s.on("disconnect", () => setConnected(false));
    s.on("connect_error", () => {
      setConnected(false);
      if (!s.active) retry = setTimeout(() => s.connect(), 4000);
    });
    setSocket(s);

    return () => {
      clearTimeout(retry);
      s.removeAllListeners();
      s.disconnect();
      setSocket(null);
    };
  }, []);

  return { socket, connected };
}
