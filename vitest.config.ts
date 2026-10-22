import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@core": resolve("src/core"),
      "@phaser": resolve("src/phaser"),
      "@ui": resolve("src/ui"),
      "@data": resolve("src/data"),
      "@localization": resolve("src/localization"),
      "@balance": resolve("src/balance"),
    },
  },
  test: {
    environment: "happy-dom",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/core/**"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },
  },
});
