// @ts-check
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap, { ChangeFreqEnum } from '@astrojs/sitemap';

const appRoot = fileURLToPath(new URL('.', import.meta.url));
// Dependencies are hoisted to the monorepo root, which sits outside this app's
// project root. Vite refuses to serve files from outside its `fs.allow` list
// with a 403, which breaks React island hydration in dev.
const monorepoRoot = fileURLToPath(new URL('../..', import.meta.url));

// https://astro.build/config
export default defineConfig({
  site: 'https://kaundinya.co.in',
  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.includes("/404"),
      serialize(item) {
        const isHome = item.url === "https://kaundinya.co.in/";
        const isService = item.url.includes("/services");
        return {
          ...item,
          changefreq: ChangeFreqEnum.MONTHLY,
          priority: isHome ? 1.0 : isService ? 0.8 : 0.6,
        };
      },
    })
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
