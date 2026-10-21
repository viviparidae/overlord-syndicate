import { resolve } from "node:path";
import { defineConfig } from "vite";

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
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
