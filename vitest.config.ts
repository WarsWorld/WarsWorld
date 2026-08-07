import { resolve } from "path";
import { defineConfig } from "vitest/config";

// Mirrors tsconfig: baseUrl "./src" + path alias "shared/*".
// Keeps the engine tests resolvable without pulling in Next.js.
export default defineConfig({
  resolve: {
    alias: {
      shared: resolve(__dirname, "src/shared"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
