import { createServer } from "node:http";
import { parse } from "node:url";

import { loadEnvConfig } from "@next/env";
import next from "next";
import { Server } from "socket.io";

import { connectDB } from "@/lib/db";
import { setIO } from "@/lib/socket";

const dev = process.env.NODE_ENV !== "production";
loadEnvConfig(process.cwd(), dev);

const port = Number(process.env.PORT) || 3000;
const hostname = process.env.HOSTNAME || "0.0.0.0";

async function main() {
  const app = next({ dev, hostname, port });
  const handle = app.getRequestHandler();
  await app.prepare();

  const httpServer = createServer((req, res) => {
    handle(req, res, parse(req.url ?? "/", true));
  });

  const io = new Server(httpServer, { path: "/socket.io" });
  setIO(io);

  connectDB()
    .then(() => console.log("> MongoDB connected"))
    .catch((err) => console.error("> MongoDB connection failed:", err.message));

  httpServer.listen(port, () => {
    console.log(`> Live Doubt Board ready on http://localhost:${port} (${dev ? "dev" : "production"})`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
