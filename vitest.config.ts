import { resolve } from "path";
import { defineConfig } from "vitest/config";

// Mirrors tsconfig: baseUrl "./src" so `shared/*`, `frontend/*`, etc. resolve in tests the same
// way they do in the app. Keeps the tests resolvable without pulling in Next.js.
export default defineConfig({
  resolve: {
    alias: {
      shared: resolve(__dirname, "src/shared"),
      frontend: resolve(__dirname, "src/frontend"),
      server: resolve(__dirname, "src/server"),
      pixi: resolve(__dirname, "src/pixi"),
      components: resolve(__dirname, "src/components"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
