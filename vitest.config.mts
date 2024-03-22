import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    exclude: ["**/node_modules/**", "**/*.integration.test.ts/**"],
    hookTimeout: 30000,
  },
});
