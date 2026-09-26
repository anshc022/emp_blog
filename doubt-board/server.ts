import { createServer } from "node:http";
import { parse } from "node:url";

import { loadEnvConfig } from "@next/env";
import next from "next";

import { connectDB } from "@/lib/db";
import { createSocketServer } from "@/lib/socket-server";

const dev = process.env.NODE_ENV !== "production";
loadEnvConfig(process.cwd(), dev);

const port = Number(process.env.PORT) || 3000;
const hostname = "localhost";

async function main() {
  const app = next({ dev, hostname, port });
  const handle = app.getRequestHandler();
  await app.prepare();

  const httpServer = createServer((req, res) => {
    handle(req, res, parse(req.url ?? "/", true));
  });

  // Socket.io shares the HTTP server (and port) with Next.js.
  createSocketServer(httpServer);

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
