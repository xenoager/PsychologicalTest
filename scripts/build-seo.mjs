// scripts/build-seo.mjs
// Static prerender + sitemap + RSS for Vite React SPA
// - Creates dist/<slug>/index.html with SEO meta (title/desc/og/twitter/json-ld)
// - Creates dist/<slug>/result/<MBTI>/index.html for quizzes that define MBTI results
// - Generates dist/sitemap.xml with all pages
// - Generates dist/rss.xml (Naver 권장)
// Usage: run after 'vite build'
import fs from "node:fs";
import path from "node:path";

const SITE = process.env.SITE_ORIGIN || "https://mindpickq.com";
const DIST = path.resolve("dist");
const PUBLIC_DIR = path.resolve("public");
const CATALOG = JSON.parse(
  fs.readFileSync(path.join(PUBLIC_DIR, "catalog.json"), "utf8")
);

// Helpers
const esc = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const exists = (p) => {
  try {
    fs.accessSync(p, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
};
const readJSON = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

function slugifyAscii(s) {
  return (
    String(s || "")
      .normalize("NFKD")
      .replace(/[^\x00-\x7F]/g, "") // strip non-ASCII
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || ""
  );
}

function fileMtimeISO(p) {
  try {
    const st = fs.statSync(p);
    return new Date(st.mtime).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function pickDesc(item, quiz) {
  return (
    (quiz?.desc && String(quiz.desc).trim()) ||
    (item?.subtitle && String(item.subtitle).trim()) ||
    "최신 심테, 연애 심리, 성격 유형, 감정 성향 테스트 등 재미있는 테스트가 가득한 사이트입니다."
  );
}

function ogImage(slug) {
  const svg = path.join(PUBLIC_DIR, "og", `${slug}.svg`);
  const png = path.join(PUBLIC_DIR, "og", `${slug}.png`);
  if (exists(svg)) return `${SITE}/og/${slug}.svg`;
  if (exists(png)) return `${SITE}/og/${slug}.png`;
  return `${SITE}/og-plain.png`;
}

function injectHeadAndNoscript(html, head, noscript = "") {
  let out = html.replace(/<head>/i, `<head>\n${head}\n`);
  if (noscript) {
    out = out.replace(/<\/body>/i, `${noscript}\n</body>`);
  }
  return out;
}

function headForHome() {
  const title = "유형테스트 포털 - 마인드픽Q";
  const desc =
    "최신 심테, 연애 심리, 성격 유형, 감정 성향 테스트 등 재미있는 테스트가 가득한 사이트입니다.";
  const url = `${SITE}/`;
  const image = `${SITE}/og-plain.png`;
  return `
<meta name="robots" content="index,follow" />
<link rel="canonical" href="${url}" />
<meta property="og:site_name" content="마인드픽Q" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
<meta property="og:url" content="${esc(url)}" />
<meta property="og:image" content="${esc(image)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(desc)}" />
<meta name="twitter:image" content="${esc(image)}" />
<link rel="alternate" type="application/rss+xml" title="마인드픽Q RSS" href="${SITE}/rss.xml" />
<script type="application/ld+json">
${JSON.stringify(
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description: desc,
    url: url,
    inLanguage: "ko-KR",
    publisher: { "@type": "Organization", name: "마인드픽Q", url: SITE },
  },
  null,
  2
)}
</script>`.trim();
}

function headForQuiz(item, quiz) {
  const url = `${SITE}/${item.slug}`;
  const title = `${item.title} - 마인드픽Q`;
  const desc = pickDesc(item, quiz);
  const image = ogImage(item.slug);
  return `
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}" />
<meta name="robots" content="index,follow" />
<link rel="canonical" href="${url}" />
<meta property="og:site_name" content="마인드픽Q" />
<meta property="og:type" content="article" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
<meta property="og:url" content="${esc(url)}" />
<meta property="og:image" content="${esc(image)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(desc)}" />
<meta name="twitter:image" content="${esc(image)}" />
<link rel="alternate" type="application/rss+xml" title="마인드픽Q RSS" href="${SITE}/rss.xml" />
<script type="application/ld+json">
${JSON.stringify(
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: item.title,
    description: desc,
    url: url,
    image: image,
    author: { "@type": "Organization", name: "마인드픽Q" },
    inLanguage: "ko-KR",
  },
  null,
  2
)}
</script>`.trim();
}

function noscriptForQuiz(item, quiz) {
  const url = `${SITE}/${item.slug}`;
  const desc = pickDesc(item, quiz);
  return `
<noscript>
  <main style="max-width:720px;margin:40px auto;padding:0 16px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Apple SD Gothic Neo,Malgun Gothic,Arial,sans-serif">
    <h1 style="font-size:28px;margin:0 0 12px">${esc(item.title)}</h1>
    <p style="font-size:16px;margin:0 0 24px;color:#444">${esc(desc)}</p>
    <p style="margin:24px 0 0"><a href="${url}" style="display:inline-block;padding:10px 16px;border:1px solid #999;border-radius:8px;text-decoration:none">테스트 시작하기</a></p>
  </main>
</noscript>`.trim();
}

function headForResult(item, quiz, rId, rObj) {
  const url = `${SITE}/${item.slug}/result/${encodeURIComponent(rId)}`;
  const baseT = item.title || item.slug;
  const rTitle = rObj?.title || rObj?.label || rId;
  const title = `${baseT} — ${rTitle} - 마인드픽Q`;
  const desc =
    rObj?.subtitle || rObj?.summary || rObj?.desc || pickDesc(item, quiz);
  const image = ogImage(item.slug); // fallback; per-result 이미지 있으면 규칙적으로 바꿔도 됨
  return `
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}" />
<meta name="robots" content="index,follow" />
<link rel="canonical" href="${url}" />
<meta property="og:site_name" content="마인드픽Q" />
<meta property="og:type" content="article" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
<meta property="og:url" content="${esc(url)}" />
<meta property="og:image" content="${esc(image)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(desc)}" />
<meta name="twitter:image" content="${esc(image)}" />
<script type="application/ld+json">
${JSON.stringify(
  {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${baseT} — ${rTitle}`,
    description: desc,
    url: url,
    image: image,
    about: rTitle,
    inLanguage: "ko-KR",
  },
  null,
  2
)}
</script>`.trim();
}

function buildSitemap(urls) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];
  for (const { loc, lastmod, changefreq = "daily", priority = "0.7" } of urls) {
    lines.push(
      `  <url><loc>${esc(
        loc
      )}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`
    );
  }
  lines.push("</urlset>");
  return lines.join("\n");
}

function buildRSS(items) {
  const now = new Date().toUTCString();
  const header = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    "<channel>",
    `<title>마인드픽Q</title>`,
    `<link>${SITE}</link>`,
    `<description>최신 심테, 연애 심리, 성격 유형, 감정 성향 테스트</description>`,
    `<language>ko-kr</language>`,
    `<lastBuildDate>${now}</lastBuildDate>`,
  ];
  const body = [];
  for (const it of items) {
    const quizPath = path.join(PUBLIC_DIR, "quizzes", `${it.slug}.json`);
    const pub = fileMtimeISO(quizPath);
    const desc = esc(
      pickDesc(it, exists(quizPath) ? readJSON(quizPath) : null)
    );
    body.push(
      [
        "<item>",
        `<title>${esc(it.title)}</title>`,
        `<link>${SITE}/${it.slug}</link>`,
        `<guid isPermaLink="true">${SITE}/${it.slug}</guid>`,
        `<description><![CDATA[${desc}]]></description>`,
        `<pubDate>${new Date(pub).toUTCString()}</pubDate>`,
        "</item>",
      ].join("\n")
    );
  }
  const footer = ["</channel>", "</rss>"];
  return [...header, ...body, ...footer].join("\n");
}

// MAIN
if (!exists(DIST)) {
  console.error("dist/ not found. Run `vite build` first.");
  process.exit(1);
}
const template = fs.readFileSync(path.join(DIST, "index.html"), "utf8");

const urls = [
  {
    loc: `${SITE}/`,
    lastmod: new Date().toISOString(),
    changefreq: "hourly",
    priority: "1.0",
  },
];

// Home: add richer head
const homeOut = injectHeadAndNoscript(template, headForHome());
fs.writeFileSync(path.join(DIST, "index.html"), homeOut, "utf8");

for (const it of CATALOG.items || []) {
  const quizPath = path.join(PUBLIC_DIR, "quizzes", `${it.slug}.json`);
  if (!exists(quizPath)) continue;
  const quiz = readJSON(quizPath);
  const lastmod = fileMtimeISO(quizPath);

  // quiz page
  const head = headForQuiz(it, quiz);
  const noscript = noscriptForQuiz(it, quiz);
  const dir = path.join(DIST, it.slug);
  ensureDir(dir);
  fs.writeFileSync(
    path.join(dir, "index.html"),
    injectHeadAndNoscript(template, head, noscript),
    "utf8"
  );
  urls.push({
    loc: `${SITE}/${it.slug}`,
    lastmod,
    changefreq: "weekly",
    priority: "0.8",
  });

  // result pages (MBTI-like only)
  const results = Array.isArray(quiz.results) ? quiz.results : [];
  const mbtiResults = results.filter((r) =>
    /^[EI][SN][TF][JP]$/.test(String(r?.id || r?.code || ""))
  );
  for (const r of mbtiResults) {
    const rId = String(r.id || r.code).toUpperCase();
    const rHead = headForResult(it, quiz, rId, r);
    const rDir = path.join(DIST, it.slug, "result", rId);
    ensureDir(rDir);
    fs.writeFileSync(
      path.join(rDir, "index.html"),
      injectHeadAndNoscript(template, rHead),
      "utf8"
    );
    urls.push({
      loc: `${SITE}/${it.slug}/result/${rId}`,
      lastmod,
      changefreq: "monthly",
      priority: "0.6",
    });
  }
}

// write sitemap + rss (overwrite any copied from public/)
fs.writeFileSync(path.join(DIST, "sitemap.xml"), buildSitemap(urls), "utf8");
fs.writeFileSync(
  path.join(DIST, "rss.xml"),
  buildRSS(CATALOG.items || []),
  "utf8"
);

console.log(`[seo] prerendered ${urls.length} URLs (including home). Done.`);
