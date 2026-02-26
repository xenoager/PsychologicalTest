import React, { useEffect, useMemo, useState } from "react";
import PageShell from "../components/PageShell.jsx";
import { Link } from "react-router-dom";

export default function SiteMapPage() {
  const [catalog, setCatalog] = useState({ items: [], categories: [] });
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [cRes, aRes] = await Promise.all([
          fetch("/catalog.json", { cache: "no-cache" }),
          fetch("/articles/index.json", { cache: "no-cache" }),
        ]);
        const cData = cRes.ok ? await cRes.json() : { items: [], categories: [] };
        const aData = aRes.ok ? await aRes.json() : { items: [] };
        if (!alive) return;
        setCatalog({ items: cData.items || [], categories: cData.categories || [] });
        setArticles(Array.isArray(aData.items) ? aData.items : []);
      } catch {
        if (!alive) return;
        setCatalog({ items: [], categories: [] });
        setArticles([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const it of catalog.items || []) {
      const c = it.category || "기타";
      if (!map.has(c)) map.set(c, []);
      map.get(c).push(it);
    }
    // sort by title for readability
    for (const [k, v] of map.entries()) {
      v.sort((a, b) => String(a.title || "").localeCompare(String(b.title || "")));
    }
    return Array.from(map.entries());
  }, [catalog.items]);

  return (
    <PageShell
      title="사이트맵"
      sidebarTitle="NAV"
      sidebarLinks={[
        { to: "/", label: "테스트 홈" },
        { to: "/articles", label: "가이드·칼럼" },
        { to: "/faq", label: "FAQ" },
        { to: "/privacy", label: "개인정보처리방침" },
        { href: "/sitemap.xml", label: "XML 사이트맵" },
      ]}
    >
      <article className="content-body">
        <p>
          아래는 사람이 보기 좋은 사이트맵입니다. 검색 엔진용 XML은{' '}
          <a href="/sitemap.xml">/sitemap.xml</a> 에서 확인할 수 있어요.
        </p>

        <h3>고정 페이지</h3>
        <div className="pill-row">
          <Link to="/about" className="pill">
            소개
          </Link>
          <Link to="/contact" className="pill">
            문의
          </Link>
          <Link to="/faq" className="pill">
            FAQ
          </Link>
          <Link to="/terms" className="pill">
            이용약관
          </Link>
          <Link to="/privacy" className="pill">
            개인정보처리방침
          </Link>
          <Link to="/cookies" className="pill">
            쿠키·광고
          </Link>
          <Link to="/disclaimer" className="pill">
            면책
          </Link>
        </div>

        <h3>가이드·칼럼</h3>
        {articles.length === 0 ? (
          <p>칼럼 목록을 불러오는 중이거나, 아직 준비 중입니다.</p>
        ) : (
          <ul>
            {articles.slice(0, 25).map((a) => (
              <li key={a.slug}>
                <Link to={`/articles/${a.slug}`}>{a.title}</Link>
                {a.category ? ` · ${a.category}` : ""}
              </li>
            ))}
          </ul>
        )}
        {articles.length > 25 && (
          <div className="content-callout">
            <b>더 보기</b>
            <Link to="/articles">가이드·칼럼 전체 목록</Link>에서 더 많은 글을 확인할 수
            있어요.
          </div>
        )}

        <h3>테스트(카테고리별)</h3>
        {grouped.map(([cat, list]) => (
          <div key={cat} style={{ marginBottom: 18 }}>
            <h4>
              <Link to={`/category/${encodeURIComponent(cat)}`}>{cat}</Link>
            </h4>
            <div className="mini-grid">
              {list.slice(0, 8).map((it) => (
                <Link key={it.slug} to={`/${it.slug}`} className="cat">
                  {it.title}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </article>
    </PageShell>
  );
}
