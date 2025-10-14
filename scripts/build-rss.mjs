import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const catalogPath = path.join(ROOT, "public", "catalog.json");
const outPath = path.join(ROOT, "public", "rss.xml");

const site = process.env.SITE_ORIGIN || "https://your-domain.example"; // 배포 도메인으로
const nowRfc822 = new Date().toUTCString();

const data = JSON.parse(fs.readFileSync(catalogPath, "utf8"));
const items = Array.isArray(data.items) ? data.items : [];

function escapeXml(s = "") {
  return s.replace(
    /[<&>]/g,
    (m) => ({ "<": "&lt;", "&": "&amp;", ">": "&gt;" }[m])
  );
}

const body = items
  .slice(0, 50)
  .map((it) => {
    const slug = it.slug || "";
    const title = escapeXml(it.title || slug);
    const desc = (it.subtitle || it.description || "").toString();
    const link = `${site}/${slug}`;
    const pubDate = new Date(it.date || Date.now()).toUTCString();
    return `
    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${desc}]]></description>
    </item>
  `.trim();
  })
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>마인드픽Q</title>
    <link>${site}/</link>
    <description>최신 심리/성격 테스트</description>
    <language>ko</language>
    <lastBuildDate>${nowRfc822}</lastBuildDate>
${body}
  </channel>
</rss>
`;
fs.writeFileSync(outPath, xml, "utf8");
console.log(`[rss] wrote ${outPath}`);
