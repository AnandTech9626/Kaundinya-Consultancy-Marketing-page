#!/usr/bin/env node
// One-shot health check for the kaundinya.co.in rollout.
// Usage: node scripts/check-domain.mjs [domain]
// Exit code 0 = everything critical is live, 1 = something is missing.

import { Resolver } from "node:dns/promises";

const DOMAIN = process.argv[2] || process.env.DOMAIN || "kaundinya.co.in";

const resolver = new Resolver({ timeout: 6000, tries: 2 });
resolver.setServers(["1.1.1.1", "8.8.8.8"]);

// Record lookups run against whichever nameserver is actually delegated, so we
// see the configured zone instead of stale resolver caches.
let zoneResolver = resolver;

const rows = [];

function record(name, status, detail) {
  rows.push({ name, status, detail: detail || "" });
}

async function attempt(fn) {
  try {
    return { value: await fn(), error: null };
  } catch (error) {
    return { value: null, error: error.code || error.message };
  }
}

const HTTP_TARGETS = [
  ["apex http", `https://${DOMAIN}/`],
  ["www http", `https://www.${DOMAIN}/`],
  ["app http", `https://app.${DOMAIN}/`],
  ["admin http", `https://admin.${DOMAIN}/`],
  ["api health", `https://api.${DOMAIN}/api/health`],
];

async function checkDns() {
  const ns = await attempt(() => resolver.resolveNs(DOMAIN));
  const google = await attempt(async () => {
    const second = new Resolver({ timeout: 6000, tries: 2 });
    second.setServers(["8.8.8.8"]);
    return second.resolveNs(DOMAIN);
  });
  const nsList = [...new Set([...(ns.value || []), ...(google.value || [])])];
  const cloudflare = nsList.filter((host) => host.endsWith(".ns.cloudflare.com"));

  if (cloudflare.length >= 2) {
    const nsIp = await attempt(() => resolver.resolve4(cloudflare[0]));
    const target = (nsIp.value && nsIp.value[0]) || "1.1.1.1";
    zoneResolver = new Resolver({ timeout: 6000, tries: 2 });
    zoneResolver.setServers([target]);
    record("NS", "OK", `${cloudflare.join(", ")} (authoritative checks via ${target})`);
  } else if (nsList.length > 0) {
    record("NS", "PENDING", `${nsList.join(", ")} (Cloudflare not delegated yet)`);
  } else {
    record("NS", "MISSING", ns.error || "no nameservers");
  }

  const apex4 = await attempt(() => zoneResolver.resolve4(DOMAIN));
  const apex6 = await attempt(() => zoneResolver.resolve6(DOMAIN));
  const apex = [...(apex4.value || []), ...(apex6.value || [])];
  record("apex A/AAAA", apex.length > 0 ? "OK" : "MISSING", apex.join(", ") || apex4.error || "none");

  for (const host of ["www", "app", "admin", "api"]) {
    const name = `${host}.${DOMAIN}`;
    const cname = await attempt(() => zoneResolver.resolveCname(name));
    const addr = await attempt(() => zoneResolver.resolve4(name));
    const detail = (cname.value || []).concat(addr.value || []);
    record(`${host} record`, detail.length > 0 ? "OK" : "MISSING", detail.join(", ") || cname.error || "none");
  }

  // Resend (2026 layout): CNAME `send` + `rsend`, TXT DKIM, TXT DMARC.
  for (const host of ["send", "rsend"]) {
    const name = `${host}.${DOMAIN}`;
    const cname = await attempt(() => zoneResolver.resolveCname(name));
    const target = (cname.value || [])[0] || "";
    const ok = /forge\.rmta\.net|amazonses\.com|resend/.test(target);
    record(`resend ${host} CNAME`, ok ? "OK" : "MISSING", target || cname.error || "none");
  }

  const dkim = await attempt(() => zoneResolver.resolveTxt(`resend._domainkey.${DOMAIN}`));
  const dkimValue = (dkim.value || []).map((parts) => parts.join("")).join(" ");
  record("DKIM", dkimValue.includes("p=") ? "OK" : "MISSING", dkimValue ? "present" : "none");

  const dmarc = await attempt(() => zoneResolver.resolveTxt(`_dmarc.${DOMAIN}`));
  const dmarcValue = (dmarc.value || []).map((parts) => parts.join("")).join(" ");
  record("DMARC", dmarcValue.includes("v=DMARC1") ? "OK" : "MISSING", dmarcValue || "none");
}

async function checkHttp() {
  for (const [name, url] of HTTP_TARGETS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(url, { method: "GET", redirect: "follow", signal: controller.signal });
      record(name, response.ok ? "OK" : "WARN", `${response.status} ${url}`);
    } catch (error) {
      record(name, "MISSING", error.name === "AbortError" ? "timeout" : error.message);
    } finally {
      clearTimeout(timer);
    }
  }
}

function print() {
  const width = rows.reduce((max, row) => Math.max(max, row.name.length), 0);
  console.log(`\nDomain check: ${DOMAIN}  (resolver 1.1.1.1, 8.8.8.8)\n`);
  for (const row of rows) {
    console.log(`[${row.status.padEnd(7)}] ${row.name.padEnd(width)}  ${row.detail}`);
  }
  const failed = rows.filter((row) => row.status === "MISSING");
  console.log(`\n${rows.length - failed.length}/${rows.length} checks passed`);
  if (failed.length > 0) {
    console.log("Still missing: " + failed.map((row) => row.name).join(", "));
  }
}

await checkDns();
await checkHttp();
print();
process.exit(rows.some((row) => row.status === "MISSING") ? 1 : 0);
