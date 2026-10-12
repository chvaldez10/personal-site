import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
export default defineConfig({
  resolve: {
    alias: {
      "@convex": fileURLToPath(new URL("./convex", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    include: ["convex/**/*.test.ts", "tests/components/**/*.test.tsx"],
    environment: "edge-runtime",
    server: { deps: { inline: ["convex-test"] } },
  },
});
