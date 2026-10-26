// @ts-check
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

const appRoot = fileURLToPath(new URL('.', import.meta.url));
// Dependencies are hoisted to the monorepo root, which sits outside this app's
// project root. Vite refuses to serve files from outside its `fs.allow` list
// with a 403, which breaks React island hydration in dev.
const monorepoRoot = fileURLToPath(new URL('../..', import.meta.url));

// https://astro.build/config
export default defineConfig({
  site: 'https://kaundinyaconsultancy.com',
  integrations: [
    react(),
    sitemap()
  ],
  vite: {
    plugins: [tailwindcss()],
    server: {
      fs: {
        allow: [appRoot, monorepoRoot]
      }
    }
  }
});
