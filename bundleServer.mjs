// scripts/build-server.mjs
import { build } from "esbuild";

// Your server entry file (adjust if different)
const entryFile = "src/server/main-production.ts";

// Build it
build({
  entryPoints: [entryFile],
  bundle: true,
  platform: "node",
  format: "esm",
  outdir: "dist/server",
  target: "node21",
  sourcemap: true,
  external: [
    // leave Prisma client and native deps out of bundle
    "@prisma/client",
    "bcrypt",
    "ws",
    "node_modules",
    "next",
    "@opentelemetry/api",
    "webpack",
    "webpack/*",
    "react-dom/server-rendering-stub",
    "react-dom/server.edge",
    "react-server-dom-turbopack/*",
    "critters",
  ],
  resolveExtensions: [".ts", ".js"],
  outExtension: { ".js": ".mjs" }, // optional, but useful
  loader: {
    ".ts": "ts",
  },
  logLevel: "info",
}).catch(() => process.exit(1));
