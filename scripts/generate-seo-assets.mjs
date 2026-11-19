import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("apps/marketing");
const pub = path.join(root, "public");
const images = path.join(pub, "images");

const CHARCOAL = "#141414";
const GOLD = "#c9a227";

const overlay = Buffer.from(`
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${CHARCOAL}" stop-opacity="0.96"/>
      <stop offset="60%" stop-color="${CHARCOAL}" stop-opacity="0.80"/>
      <stop offset="100%" stop-color="${CHARCOAL}" stop-opacity="0.55"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#fade)"/>
  <rect x="0" y="0" width="10" height="630" fill="${GOLD}"/>
  <text x="80" y="200" font-family="Segoe UI, Arial, sans-serif" font-size="30" letter-spacing="6" fill="${GOLD}">KAUNDINYA CONSULTANCY</text>
  <text x="80" y="300" font-family="Segoe UI, Arial, sans-serif" font-size="64" font-weight="700" fill="#ffffff">Trusted Guidance.</text>
  <text x="80" y="376" font-family="Segoe UI, Arial, sans-serif" font-size="64" font-weight="700" fill="#ffffff">Complete Solutions.</text>
  <text x="80" y="452" font-family="Segoe UI, Arial, sans-serif" font-size="26" fill="#e6e6e6">Real Estate  ·  Insurance  ·  Home Services  ·  Loans</text>
  <text x="80" y="556" font-family="Segoe UI, Arial, sans-serif" font-size="30" font-weight="700" fill="${GOLD}">kaundinya.co.in</text>
  <text x="1120" y="556" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="24" fill="#ffffff">Hyderabad, Telangana</text>
</svg>`);

async function buildOgImage() {
  await sharp(overlay).png({ compressionLevel: 9 }).toFile(path.join(pub, "og-image.png"));
}

async function buildIcons() {
  const mark = await sharp(path.join(images, "brand-mark.webp"))
    .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const sizes = [
    ["favicon.png", 48],
    ["apple-touch-icon.png", 180],
    ["icon-192.png", 192],
    ["icon-512.png", 512],
  ];

  for (const [name, size] of sizes) {
    await sharp(mark)
      .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toFile(path.join(pub, name));
  }
}

async function buildManifest() {
  const manifest = {
    name: "Kaundinya Consultancy",
    short_name: "Kaundinya",
    description:
      "Integrated consultancy in Hyderabad for real estate, insurance, property & home services, and loans.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: CHARCOAL,
    lang: "en-IN",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };

  await writeFile(path.join(pub, "site.webmanifest"), JSON.stringify(manifest, null, 2) + "\n");
}

await mkdir(pub, { recursive: true });
await buildOgImage();
await buildIcons();
await buildManifest();
console.log("SEO assets written to apps/marketing/public");
