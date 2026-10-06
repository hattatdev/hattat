import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["packages/core/src/**/*.ts"],
      exclude: ["**/types.ts", "**/index.ts"],
      reporter: ["text", "json-summary", "html"],
      thresholds: { lines: 90 },
    },
  },
});
