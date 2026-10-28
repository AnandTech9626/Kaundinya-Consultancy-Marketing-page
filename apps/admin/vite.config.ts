import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Dependencies are hoisted to the monorepo root, outside this app's project
// root, so allow Vite to serve them in dev.
const monorepoRoot = fileURLToPath(new URL("../..", import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    fs: {
      allow: [monorepoRoot]
    }
  }
});
