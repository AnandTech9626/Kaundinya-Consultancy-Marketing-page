import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Dependencies are hoisted to the monorepo root, which sits outside this app's
// project root. Vite refuses to serve files from outside its `fs.allow` list
// with a 403, which would break imports from `@kaundinya/*` in dev.
const monorepoRoot = fileURLToPath(new URL("../..", import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    fs: {
      allow: [monorepoRoot]
    }
  }
});
