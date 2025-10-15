// scripts/indexnow/ping-bulk.mjs
// Bulk IndexNow submitter for mindpickq.com
// Requirements: Node.js 18+ (global fetch), no extra deps
// Usage examples:
//   SITE_ORIGIN=https://mindpickq.com INDEXNOW_KEY=your_key node scripts/indexnow/ping-bulk.mjs
//   node scripts/indexnow/ping-bulk.mjs --site https://mindpickq.com --key your_key --sitemaps dist/sitemap.xml
// Optional flags:
//   --endpoints https://searchadvisor.naver.com/indexnow,https://api.indexnow.org/indexnow
//   --batch 10000 --dry-run --verbose --key-location https://mindpickq.com/your_key.txt
//   --extra routes.txt (one URL per line; merged with sitemap URLs)
//
// Exit code: 0 on success (with at least one 200/202 per endpoint), 1 on error.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---- small helpers ----
function arg(key, def = null) {
  const i = process.argv.indexOf(`--${key}`);
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1];
  return def;
}
function boolArg(key) {
  return process.argv.includes(`--${key}`);
}
function splitCsv(v) {
  if (!v) return [];
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
function nowTag() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(
    d.getHours()
  )}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}
function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

// ---- config ----
const SITE = arg("site", process.env.SITE_ORIGIN || "https://mindpickq.com");
const KEY = arg("key", process.env.INDEXNOW_KEY || "");
const KEY_LOCATION = arg(
  "key-location",
  process.env.INDEXNOW_KEY_LOCATION || `${SITE}/${KEY}.txt`
);
const ENDPOINTS = splitCsv(
  arg(
    "endpoints",
    process.env.INDEXNOW_ENDPOINTS || "https://searchadvisor.naver.com/indexnow"
  )
);
const BATCH_SZ = parseInt(
  arg("batch", process.env.INDEXNOW_BATCH_SIZE || "10000"),
  10
);
const SITEMAPS = splitCsv(
  arg("sitemaps", process.env.INDEXNOW_SITEMAPS || "dist/sitemap.xml")
);
const EXTRA = arg("extra", process.env.INDEXNOW_EXTRA || "");
const DRY_RUN = boolArg("dry-run") || process.env.DRY_RUN === "1";
const VERBOSE = boolArg("verbose") || process.env.VERBOSE === "1";

if (!KEY) {
  console.error("[indexnow] ERROR: INDEXNOW_KEY/--key is required");
  process.exit(1);
}

function loadSitemapUrls(file) {
  if (!fs.existsSync(file)) {
    console.warn(`[indexnow] WARN: sitemap not found: ${file}`);
    return [];
  }
  const xml = fs.readFileSync(file, "utf8");
  // Support sitemap-index or plain sitemap; collect all <loc>
  const urls = Array.from(xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)).map(
    (m) => m[1].trim()
  );
  return urls;
}

function loadExtraUrls(file) {
  if (!file) return [];
  if (!fs.existsSync(file)) {
    console.warn(`[indexnow] WARN: extra URL file not found: ${file}`);
    return [];
  }
  return fs
    .readFileSync(file, "utf8")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith("#"));
}

function normalize(url) {
  return url.replace(/\/+$/, ""); // trim trailing slash (except root)
}

function toBatches(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function fetchHead(url) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return { status: res.status, ok: res.ok };
  } catch (e) {
    return { status: 0, ok: false, error: e.message };
  }
}

async function postJson(url, body, attempt = 1) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });
  const text = await res.text().catch(() => "");
  if ((res.status === 429 || res.status >= 500) && attempt < 5) {
    const backoff = Math.min(30000, 1000 * Math.pow(2, attempt)); // 1s,2s,4s,8s,16s,30s cap
    if (VERBOSE)
      console.log(
        `[indexnow] ${url} -> ${res.status}, retry in ${backoff}ms (attempt ${
          attempt + 1
        })`
      );
    await sleep(backoff);
    return postJson(url, body, attempt + 1);
  }
  return {
    status: res.status,
    ok: res.status >= 200 && res.status < 300,
    body: text,
  };
}

// ---- main ----
(async () => {
  const host = new URL(SITE).host;
  const urls = new Set();
  // collect from sitemaps
  for (const sm of SITEMAPS) {
    for (const u of loadSitemapUrls(sm)) urls.add(normalize(u));
  }
  // collect from extra file
  for (const u of loadExtraUrls(EXTRA)) urls.add(normalize(u));

  // filter by SITE host
  const all = Array.from(urls).filter((u) => {
    try {
      return new URL(u).host === host;
    } catch (_) {
      return false;
    }
  });

  if (all.length === 0) {
    console.error(
      "[indexnow] ERROR: no URLs found. Check your sitemap path(s) or --extra."
    );
    process.exit(1);
  }

  // verify key file is reachable
  const keyLoc = KEY_LOCATION || `${SITE}/${KEY}.txt`;
  const head = await fetchHead(keyLoc);
  if (!head.ok) {
    console.warn(
      `[indexnow] WARN: key file not reachable at ${keyLoc} (status ${head.status}).`
    );
    console.warn(
      `        Make sure the file name is "${KEY}.txt" and its content is exactly the same key string.`
    );
    // continue anyway; some endpoints allow keyLocation inference, but success is unlikely if key is not accessible.
  }

  const batches = toBatches(all, BATCH_SZ);
  if (VERBOSE) {
    console.log(
      `[indexnow] collected ${all.length} URLs from ${SITEMAPS.join(",")} ${
        EXTRA ? "and " + EXTRA : ""
      }`
    );
    console.log(`[indexnow] batches: ${batches.length} x ${BATCH_SZ}`);
    console.log(`[indexnow] endpoints: ${ENDPOINTS.join(", ")}`);
  }

  if (DRY_RUN) {
    console.log("[indexnow] DRY RUN: not sending. First 10 URLs:");
    console.log(all.slice(0, 10).join("\n"));
    process.exit(0);
  }

  const summary = {
    site: SITE,
    keyLocation: keyLoc,
    total: all.length,
    endpoints: {},
    ts: new Date().toISOString(),
  };
  let globalOk = true;

  for (const ep of ENDPOINTS) {
    let okCount = 0,
      failCount = 0;
    for (let i = 0; i < batches.length; i++) {
      const urlList = batches[i];
      const body = { host, key: KEY, keyLocation: keyLoc, urlList };
      if (VERBOSE)
        console.log(
          `[indexnow] POST ${ep} (batch ${i + 1}/${batches.length}, urls=${
            urlList.length
          })`
        );
      const res = await postJson(ep, body);
      if (VERBOSE) console.log(`[indexnow] -> ${res.status}`);
      if (res.ok || res.status === 202) okCount++;
      else {
        failCount++;
        globalOk = false;
      }
    }
    summary.endpoints[ep] = {
      okBatches: okCount,
      failedBatches: failCount,
      batches: batches.length,
    };
  }

  // write log file
  const logDir = path.join(process.cwd(), "logs");
  fs.mkdirSync(logDir, { recursive: true });
  const logFile = path.join(logDir, `indexnow-${nowTag()}.json`);
  fs.writeFileSync(logFile, JSON.stringify(summary, null, 2), "utf8");
  console.log(`[indexnow] summary written: ${logFile}`);

  if (!globalOk) {
    console.error("[indexnow] some batches failed. See log for details.");
    process.exit(1);
  } else {
    console.log("[indexnow] DONE");
  }
})().catch((err) => {
  console.error("[indexnow] FATAL:", err);
  process.exit(1);
});
