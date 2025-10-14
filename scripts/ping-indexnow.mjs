
// scripts/ping-indexnow.mjs
// Send IndexNow batch to Naver after deployment
// Usage: SITE_ORIGIN=https://mindpickq.com INDEXNOW_KEY=YOUR_KEY node scripts/ping-indexnow.mjs
import fs from 'node:fs';
import path from 'node:path';

const SITE = process.env.SITE_ORIGIN || 'https://mindpickq.com';
const KEY  = process.env.INDEXNOW_KEY;
if (!KEY) {
  console.error('INDEXNOW_KEY env is required');
  process.exit(1);
}
const HOST = new URL(SITE).host;
const KEY_LOCATION = `${SITE}/${KEY}.txt`;

const sitemapPath = path.resolve('dist', 'sitemap.xml');
if (!fs.existsSync(sitemapPath)) {
  console.error('dist/sitemap.xml not found. Build first.');
  process.exit(1);
}
const xml = fs.readFileSync(sitemapPath, 'utf8');
const urls = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map(m=>m[1]);

async function sendBatch(list) {
  const res = await fetch('https://searchadvisor.naver.com/indexnow', {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList: list
    })
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`IndexNow failed: ${res.status} ${t}`);
  }
  return res.status;
}

const BATCH = 1000;
for (let i=0;i<urls.length;i+=BATCH) {
  const chunk = urls.slice(i, i+BATCH);
  const status = await sendBatch(chunk);
  console.log(`[indexnow] sent ${chunk.length} urls => ${status}`);
}
console.log('Done.');
