import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This project lives next to another app with its own lockfile; pin the root.
  outputFileTracingRoot: path.join(__dirname),
  serverExternalPackages: ["mongoose", "socket.io"],
};

export default nextConfig;
