import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const catalogPath = path.join(ROOT, "public", "catalog.json");
const articlesIndexPath = path.join(ROOT, "public", "articles", "index.json");
const outPublic = path.join(ROOT, "public", "rss.xml");
const outDist = path.join(ROOT, "dist", "rss.xml");

const site = process.env.SITE_ORIGIN || "https://www.mindpickq.com"; // 배포 도메인
const nowRfc822 = new Date().toUTCString();

const data = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const items = Array.isArray(data.items) ? data.items : [];

let articles = [];
try {
  if (fs.existsSync(articlesIndexPath)) {
    const aidx = JSON.parse(fs.readFileSync(articlesIndexPath, "utf8"));
    articles = Array.isArray(aidx.items) ? aidx.items : [];
  }
} catch {
  articles = [];
}

function escapeXml(s = "") {
  return s.replace(
    /[<&>]/g,
    (m) => ({ "<": "&lt;", "&": "&amp;", ">": "&gt;" }[m])
  );
}

// RSS: 최신 칼럼 20개 + 테스트 30개 (합쳐서 날짜순 정렬)
const combined = [];

for (const a of articles.slice(0, 50)) {
  const slug = a.slug || "";
  const title = escapeXml(a.title || slug);
  const desc = (a.subtitle || "").toString();
  const link = `${site}/articles/${slug}`;
  const pubDate = new Date(a.date || Date.now());
  combined.push({ title, desc, link, pubDate });
}

for (const it of items.slice(0, 80)) {
  const slug = it.slug || "";
  const title = escapeXml(it.title || slug);
  const desc = (it.subtitle || it.description || "").toString();
  const link = `${site}/${slug}`;
  // catalog.json에 날짜가 없을 수 있어 최근 빌드 시각으로 처리
  const pubDate = new Date(it.date || Date.now());
  combined.push({ title, desc, link, pubDate });
}

combined.sort((a, b) => b.pubDate - a.pubDate);
const body = combined
  .slice(0, 50)
  .map(({ title, desc, link, pubDate }) =>
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

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>마인드픽Q</title>
    <link>${site}/</link>
    <description>MBTI·연애·성향 테스트 + 결과 활용 가이드·칼럼</description>
    <language>ko</language>
    <lastBuildDate>${nowRfc822}</lastBuildDate>
${body}
  </channel>
</rss>
`;
fs.writeFileSync(outPublic, xml, "utf8");
console.log(`[rss] wrote ${outPublic}`);

// build 이후에는 dist에도 함께 생성(배포 타겟이 dist인 경우를 대비)
try {
  if (fs.existsSync(path.join(ROOT, "dist"))) {
    fs.writeFileSync(outDist, xml, "utf8");
    console.log(`[rss] wrote ${outDist}`);
  }
} catch {}
