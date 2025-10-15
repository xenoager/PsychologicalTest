// scripts/verify-seo.mjs
// Quick SEO verification for mindpickq.com and IndexNow readiness.
// Usage:
//   SITE=https://mindpickq.com node scripts/verify-seo.mjs
// Options:
//   --smoke-indexnow --key <KEY>   -> also try a tiny IndexNow POST with two URLs
//   --verbose

const SITE = process.env.SITE || 'https://mindpickq.com';
const VERBOSE = process.argv.includes('--verbose');

function abs(p){ return p.startsWith('http') ? p : SITE.replace(/\/$/, '') + p; }

async function get(url) {
  try {
    const res = await fetch(url, { method: 'GET' });
    const ct = res.headers.get('content-type') || '';
    const text = (ct.includes('html') || ct.includes('xml') || ct.includes('text')) ? (await res.text()) : '';
    return { url, status: res.status, ct, text };
  } catch (e) {
    return { url, status: 0, ct: '', text: '', error: e.message };
  }
}

function pick(tag, html) {
  const m = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return m ? m[1].trim() : '';
}
function meta(name, html) {
  const re = new RegExp(`<meta[^>]+(?:name|property)=(?:"|')${name}(?:"|')[^>]+>`, 'i');
  const m = html.match(re);
  if (!m) return '';
  const m2 = m[0].match(/content=(?:"|')([^"']+)(?:"|')/i);
  return m2 ? m2[1] : '';
}
function hasNoindex(html) {
  return /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html)
      || /x-robots-tag/i.test(html);
}

(async () => {
  console.log(`[verify] Checking ${SITE} ...`);
  const targets = [
    '/', '/robots.txt', '/sitemap.xml', '/rss.xml',
    '/teenping-mbti', '/teenping-mbti/result/ENTP'
  ];

  for (const p of targets) {
    const url = abs(p);
    const { status, ct, text, error } = await get(url);
    if (error) console.log(`- ${url} -> ERROR: ${error}`);
    else console.log(`- ${url} -> ${status} (${ct || 'unknown'})`);

    if (ct.includes('html') && status === 200) {
      const t = pick('title', text);
      const ogt = meta('og:title', text);
      const can = (text.match(/<link[^>]+rel=["']canonical["'][^>]+>/i)||[''])[0];
      console.log(`   title: ${t}`);
      console.log(`   og:title: ${ogt}`);
      console.log(`   canonical: ${can ? can : 'N/A'}`);
      console.log(`   noindex: ${hasNoindex(text) ? 'YES' : 'no'}`);
    }
  }

  if (process.argv.includes('--smoke-indexnow')) {
    const key = process.argv[process.argv.indexOf('--key')+1];
    if (!key) {
      console.log('[verify] --smoke-indexnow requires --key <KEY>');
      process.exit(1);
    }
    const keyUrl = abs(`/${key}.txt`);
    const head = await fetch(keyUrl, { method: 'HEAD' });
    console.log(`- ${keyUrl} -> ${head.status} [key file HEAD]`);
    const urls = [abs('/'), abs('/teenping-mbti')];
    const body = {
      host: new URL(SITE).host,
      key,
      keyLocation: keyUrl,
      urlList: urls
    };
    const ep = 'https://searchadvisor.naver.com/indexnow';
    const res = await fetch(ep, {
      method: 'POST',
      headers: { 'Content-Type':'application/json; charset=utf-8' },
      body: JSON.stringify(body)
    });
    const txt = await res.text().catch(()=>'');
    console.log(`- POST ${ep} -> ${res.status} (smoke)`);
    if (VERBOSE && txt) console.log(txt.slice(0, 500));
  }
})();