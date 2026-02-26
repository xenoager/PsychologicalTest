// scripts/build-seo.mjs
// Static prerender + sitemap + RSS for Vite React SPA
// - Creates dist/<route>/index.html with SEO meta (title/desc/og/twitter/json-ld)
// - Generates dist/sitemap.xml with all pages (tests + 결과 + 정책/컨텐츠)
// - Generates dist/rss.xml (칼럼 + 테스트 혼합)
// Usage: run after 'vite build'
import fs from "node:fs";
import path from "node:path";

const SITE = process.env.SITE_ORIGIN || "https://www.mindpickq.com";
const DIST = path.resolve("dist");
const PUBLIC_DIR = path.resolve("public");

const CATALOG = JSON.parse(
  fs.readFileSync(path.join(PUBLIC_DIR, "catalog.json"), "utf8")
);

const ARTICLES_DIR = path.join(PUBLIC_DIR, "articles");
const ARTICLES_INDEX_PATH = path.join(ARTICLES_DIR, "index.json");

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
    "MBTI, 연애, 성격 유형, 감정, 성향, 공감 테스트"
  );
}

function ogImageForQuiz(slug) {
  const svg = path.join(PUBLIC_DIR, "og", `${slug}.svg`);
  const png = path.join(PUBLIC_DIR, "og", `${slug}.png`);
  if (exists(svg)) return `${SITE}/og/${slug}.svg`;
  if (exists(png)) return `${SITE}/og/${slug}.png`;
  return `${SITE}/og-plain.png`;
}

function stripTemplateSeo(html) {
  // dist/index.html에 기본 title/description이 존재하므로, 프리렌더 페이지에서는 제거 후 주입
  let out = html;
  out = out.replace(/<title>[\s\S]*?<\/title>\s*/i, "");
  out = out.replace(
    /<meta\s+name=["']description["'][^>]*>\s*/i,
    ""
  );
  out = out.replace(/<link\s+rel=["']canonical["'][^>]*>\s*/i, "");
  return out;
}

function injectHeadAndNoscript(html, head, noscript = "") {
  let out = html.replace(/<head>/i, `<head>\n${head}\n`);
  if (noscript) {
    out = out.replace(/<\/body>/i, `${noscript}\n</body>`);
  }
  return out;
}

function headGeneric({
  title,
  desc,
  url,
  image = `${SITE}/og-plain.png`,
  type = "website",
  canonical = url,
  jsonld = null,
}) {
  const safeTitle = esc(title);
  const safeDesc = esc(desc);
  const safeUrl = esc(url);
  const safeImg = esc(image);

  const ld = jsonld
    ? `\n<script type="application/ld+json">\n${JSON.stringify(jsonld, null, 2)}\n</script>`
    : "";

  return `
<title>${safeTitle}</title>
<meta name="description" content="${safeDesc}" />
<meta name="robots" content="index,follow" />
<link rel="canonical" href="${esc(canonical)}" />
<meta property="og:site_name" content="마인드픽Q" />
<meta property="og:type" content="${esc(type)}" />
<meta property="og:title" content="${safeTitle}" />
<meta property="og:description" content="${safeDesc}" />
<meta property="og:url" content="${safeUrl}" />
<meta property="og:image" content="${safeImg}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${safeTitle}" />
<meta name="twitter:description" content="${safeDesc}" />
<meta name="twitter:image" content="${safeImg}" />
<link rel="alternate" type="application/rss+xml" title="마인드픽Q RSS" href="${SITE}/rss.xml" />
${ld}
  `.trim();
}

function headForHome() {
  const title = "유형테스트 포털 - 마인드픽Q";
  const desc = "MBTI, 연애, 성격 유형, 감정, 성향, 공감 테스트";
  const url = `${SITE}/`;
  return headGeneric({
    title,
    desc,
    url,
    type: "website",
    jsonld: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: title,
      description: desc,
      url,
      inLanguage: "ko-KR",
      publisher: { "@type": "Organization", name: "마인드픽Q", url: SITE },
    },
  });
}

function headForQuiz(item, quiz) {
  const url = `${SITE}/${item.slug}`;
  const title = `${item.title} - 마인드픽Q`;
  const desc = pickDesc(item, quiz);
  const image = ogImageForQuiz(item.slug);
  return headGeneric({
    title,
    desc,
    url,
    image,
    type: "article",
    jsonld: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: item.title,
      description: desc,
      url,
      image,
      author: { "@type": "Organization", name: "마인드픽Q" },
      inLanguage: "ko-KR",
    },
  });
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
  const image = ogImageForQuiz(item.slug);

  return headGeneric({
    title,
    desc,
    url,
    image,
    type: "article",
    jsonld: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: `${baseT} — ${rTitle}`,
      description: desc,
      url,
      image,
      about: rTitle,
      inLanguage: "ko-KR",
    },
  });
}

function headForStaticPage({ title, desc, routePath }) {
  const url = `${SITE}${routePath}`;
  return headGeneric({
    title: `${title} - 마인드픽Q`,
    desc,
    url,
    type: "website",
    jsonld: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      description: desc,
      url,
      inLanguage: "ko-KR",
      publisher: { "@type": "Organization", name: "마인드픽Q", url: SITE },
    },
  });
}

function headForArticlesIndex() {
  const title = "가이드·칼럼";
  const desc =
    "테스트 결과를 일상에 적용할 수 있도록 정리한 가이드/칼럼 모음입니다.";
  return headForStaticPage({ title, desc, routePath: "/articles" });
}

function headForArticleDetail(article) {
  const slug = article?.slug || "";
  const title = article?.title || "가이드·칼럼";
  const desc =
    article?.subtitle ||
    "테스트 결과를 일상에 적용할 수 있도록 정리한 가이드/칼럼입니다.";
  const url = `${SITE}/articles/${slug}`;

  return headGeneric({
    title: `${title} - 마인드픽Q`,
    desc,
    url,
    type: "article",
    jsonld: {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description: desc,
      url,
      inLanguage: "ko-KR",
      author: { "@type": "Organization", name: "마인드픽Q" },
    },
  });
}

function headForCategory(cat) {
  const title = `카테고리: ${cat}`;
  const desc = `${cat} 카테고리의 테스트를 모아보는 페이지입니다.`;
  const routePath = `/category/${encodeURIComponent(cat)}`;
  return headForStaticPage({ title, desc, routePath });
}

function headForTag(tag) {
  const title = `태그: ${tag}`;
  const desc = `${tag} 뱃지가 붙은 테스트를 모아보는 페이지입니다.`;
  const routePath = `/tag/${encodeURIComponent(tag)}`;
  return headForStaticPage({ title, desc, routePath });
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

function buildRSSCombined({ quizzes = [], articles = [] }) {
  const nowRfc822 = new Date().toUTCString();

  function escapeXml(s = "") {
    return String(s).replace(
      /[<&>]/g,
      (m) => ({ "<": "&lt;", "&": "&amp;", ">": "&gt;" }[m])
    );
  }

  const combined = [];

  for (const a of articles.slice(0, 80)) {
    const slug = a.slug || "";
    const title = escapeXml(a.title || slug);
    const desc = (a.subtitle || "").toString();
    const link = `${SITE}/articles/${slug}`;
    const pubDate = new Date(a.date || Date.now());
    combined.push({ title, desc, link, pubDate });
  }

  for (const it of quizzes.slice(0, 120)) {
    const slug = it.slug || "";
    const title = escapeXml(it.title || slug);
    const desc = (it.subtitle || it.description || "").toString();
    const link = `${SITE}/${slug}`;
    const pubDate = new Date(it.date || Date.now());
    combined.push({ title, desc, link, pubDate });
  }

  combined.sort((a, b) => b.pubDate - a.pubDate);

  const body = combined
    .slice(0, 50)
    .map(
      ({ title, desc, link, pubDate }) =>
        `
    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate.toUTCString()}</pubDate>
      <description><![CDATA[${desc}]]></description>
    </item>
  `.trim()
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>마인드픽Q</title>
    <link>${SITE}/</link>
    <description>MBTI·연애·성향 테스트 + 결과 활용 가이드·칼럼</description>
    <language>ko</language>
    <lastBuildDate>${nowRfc822}</lastBuildDate>
${body}
  </channel>
</rss>
`;
}

function routeToDistDir(routePath) {
  // routePath는 sitemap/라우팅 기준으로 encoded 형태일 수 있음
  // 실제 dist 경로는 decode 후 생성(정적 서버는 URL을 decode해서 파일시스템을 찾는 경우가 많음)
  const clean = String(routePath || "/")
    .replace(/[#?].*$/, "")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
  if (!clean) return DIST;
  const parts = clean
    .split("/")
    .filter(Boolean)
    .map((seg) => {
      try {
        return decodeURIComponent(seg);
      } catch {
        return seg;
      }
    })
    // 혹시라도 '/'가 포함된 비정상 데이터 방지
    .map((seg) => seg.replace(/\//g, "-"));

  return path.join(DIST, ...parts);
}

function writeRoute(template, routePath, head, noscript = "") {
  const dir = routeToDistDir(routePath);
  ensureDir(dir);
  const outPath =
    routePath === "/" ? path.join(DIST, "index.html") : path.join(dir, "index.html");
  fs.writeFileSync(outPath, injectHeadAndNoscript(template, head, noscript), "utf8");
}

// MAIN
if (!exists(DIST)) {
  console.error("dist/ not found. Run `vite build` first.");
  process.exit(1);
}

const templateRaw = fs.readFileSync(path.join(DIST, "index.html"), "utf8");
const template = stripTemplateSeo(templateRaw);

const urls = [];
const addUrl = (routePath, lastmod, changefreq, priority) => {
  urls.push({
    loc: `${SITE}${routePath}`,
    lastmod: lastmod || new Date().toISOString(),
    changefreq: changefreq || "weekly",
    priority: priority || "0.7",
  });
};

// 1) 홈
writeRoute(template, "/", headForHome());
addUrl("/", new Date().toISOString(), "hourly", "1.0");

// 2) 고정 페이지(정책/안내/서비스)
const staticPages = [
  {
    path: "/about",
    title: "소개",
    desc: "마인드픽Q는 테스트 결과를 자기이해와 소통에 활용할 수 있도록 돕는 컨텐츠를 제공합니다.",
  },
  {
    path: "/contact",
    title: "문의",
    desc: "콘텐츠 제안/오류 제보/제휴 문의를 남겨주세요.",
  },
  {
    path: "/faq",
    title: "FAQ",
    desc: "테스트 결과/개인정보/광고/공유 관련 자주 묻는 질문을 정리했습니다.",
  },
  {
    path: "/privacy",
    title: "개인정보처리방침",
    desc: "마인드픽Q는 회원가입 없이 이용 가능하며, 퀴즈 응답은 브라우저에서만 처리됩니다.",
  },
  {
    path: "/terms",
    title: "이용약관",
    desc: "서비스 이용 조건과 책임 범위를 안내합니다.",
  },
  {
    path: "/cookies",
    title: "쿠키·광고(AdSense)",
    desc: "AdSense 등 광고 파트너의 쿠키/식별자 사용에 대해 안내합니다.",
  },
  {
    path: "/disclaimer",
    title: "면책",
    desc: "테스트/칼럼은 참고 자료이며, 의학·진단·치료를 대체하지 않습니다.",
  },
  {
    path: "/site-map",
    title: "사이트맵",
    desc: "테스트/칼럼/정책 페이지를 한눈에 볼 수 있는 사이트맵입니다.",
  },
  {
    path: "/articles",
    title: "가이드·칼럼",
    desc: "테스트 결과를 일상에 적용할 수 있도록 정리한 가이드/칼럼 모음입니다.",
  },
];

for (const p of staticPages) {
  const head =
    p.path === "/articles" ? headForArticlesIndex() : headForStaticPage({
      title: p.title,
      desc: p.desc,
      routePath: p.path,
    });
  writeRoute(template, p.path, head);
  addUrl(p.path, new Date().toISOString(), "monthly", p.path === "/privacy" ? "0.5" : "0.6");
}

// 3) 칼럼 상세 프리렌더
let articlesIndex = { items: [], categories: [] };
try {
  if (exists(ARTICLES_INDEX_PATH)) {
    const aidx = readJSON(ARTICLES_INDEX_PATH);
    articlesIndex = {
      items: Array.isArray(aidx.items) ? aidx.items : [],
      categories: Array.isArray(aidx.categories) ? aidx.categories : [],
    };
  }
} catch {
  articlesIndex = { items: [], categories: [] };
}

for (const a of articlesIndex.items || []) {
  const slug = a.slug;
  if (!slug) continue;
  const aPath = path.join(ARTICLES_DIR, `${slug}.json`);
  let full = a;
  try {
    if (exists(aPath)) full = readJSON(aPath);
  } catch {
    full = a;
  }
  const route = `/articles/${encodeURIComponent(slug)}`;
  writeRoute(template, route, headForArticleDetail(full));
  addUrl(route, exists(aPath) ? fileMtimeISO(aPath) : new Date().toISOString(), "monthly", "0.7");
}

// 4) 카테고리/태그 프리렌더 (내부 링크 확장 + 페이지 수 증가)
const cats = new Set();
const tags = new Set();
for (const it of CATALOG.items || []) {
  if (it?.category) cats.add(String(it.category));
  if (it?.badge) tags.add(String(it.badge));
}

for (const c of cats) {
  const route = `/category/${encodeURIComponent(c)}`;
  writeRoute(template, route, headForCategory(c));
  addUrl(route, new Date().toISOString(), "weekly", "0.65");
}
for (const t of tags) {
  const route = `/tag/${encodeURIComponent(t)}`;
  writeRoute(template, route, headForTag(t));
  addUrl(route, new Date().toISOString(), "weekly", "0.6");
}

// 5) 테스트/결과 프리렌더 (기존 로직 유지)
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
  addUrl(`/${it.slug}`, lastmod, "weekly", "0.8");

  // result pages (MBTI-like only)
  const results = Array.isArray(quiz.results) ? quiz.results : [];
  const mbtiResults = results.filter((r) =>
    /^[EI][SN][TF][JP]$/.test(String(r?.id || r?.code || ""))
  );
  for (const r of mbtiResults) {
    const rId = String(r.id || r.code).toUpperCase();
    const rHead = headForResult(it, quiz, rId, r);
    const rRoute = `/${it.slug}/result/${encodeURIComponent(rId)}`;
    const rDir = routeToDistDir(rRoute);
    ensureDir(rDir);
    fs.writeFileSync(
      path.join(rDir, "index.html"),
      injectHeadAndNoscript(template, rHead),
      "utf8"
    );
    addUrl(rRoute, lastmod, "monthly", "0.6");
  }
}

// write sitemap
fs.writeFileSync(path.join(DIST, "sitemap.xml"), buildSitemap(urls), "utf8");

// write rss (dist)
try {
  const rss = buildRSSCombined({
    quizzes: Array.isArray(CATALOG.items) ? CATALOG.items : [],
    articles: Array.isArray(articlesIndex.items) ? articlesIndex.items : [],
  });
  fs.writeFileSync(path.join(DIST, "rss.xml"), rss, "utf8");
} catch {}

console.log(`[seo] prerendered ${urls.length} URLs (home + static + articles + browse + quizzes). Done.`);
