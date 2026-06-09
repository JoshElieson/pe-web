import { cpSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

function copyDownloadsToDist(): Plugin {
  return {
    name: "copy-downloads-to-dist",
    closeBundle() {
      const src = resolve(__dirname, "downloads");
      const dest = resolve(__dirname, "dist/downloads");
      if (!existsSync(src)) {
        throw new Error(`Missing downloads folder: ${src}`);
      }
      cpSync(src, dest, { recursive: true });
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [react(), copyDownloadsToDist()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        download: resolve(__dirname, "download.html"),
        pricing: resolve(__dirname, "pricing.html"),
        documentation: resolve(__dirname, "forge-documentation.html"),
      },
    },
  },
});
