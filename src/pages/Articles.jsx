import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "../components/PageShell.jsx";

function ArticleCard({ a }) {
  return (
    <Link to={`/articles/${a.slug}`} className="card" style={{ display: "block" }}>
      <div className="meta">
        <div className="title">{a.title}</div>
        {a.subtitle && <div className="sub">{a.subtitle}</div>}
        <div className="content-meta" style={{ marginTop: 10 }}>
          {a.category ? <span>#{a.category}</span> : null}
          {a.readingTime ? <span>· {a.readingTime}</span> : null}
          {a.date ? <span>· {a.date}</span> : null}
        </div>
      </div>
    </Link>
  );
}

export default function Articles() {
  const [data, setData] = useState({ items: [], categories: [] });
  const [cat, setCat] = useState("전체");
  const [q, setQ] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/articles/index.json", { cache: "no-cache" });
        const json = res.ok ? await res.json() : { items: [], categories: [] };
        if (!alive) return;
        setData({
          items: Array.isArray(json.items) ? json.items : [],
          categories: Array.isArray(json.categories) ? json.categories : [],
        });
      } catch {
        if (!alive) return;
        setData({ items: [], categories: [] });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const cats = useMemo(() => ["전체", ...(data.categories || [])], [data.categories]);

  const items = useMemo(() => {
    let list = Array.isArray(data.items) ? data.items : [];
    if (cat !== "전체") list = list.filter((a) => a.category === cat);
    if (!q.trim()) return list;
    const qq = q.trim().toLowerCase();
    return list.filter((a) =>
      `${a.title || ""} ${a.subtitle || ""} ${(a.tags || []).join(" ")}`
        .toLowerCase()
        .includes(qq)
    );
  }, [data.items, cat, q]);

  return (
    <PageShell
      title="가이드·칼럼"
      sidebarTitle="CONTENTS"
      sidebarLinks={[
        { to: "/", label: "테스트 홈" },
        { to: "/site-map", label: "사이트맵" },
        { to: "/faq", label: "FAQ" },
        { to: "/privacy", label: "개인정보처리방침" },
        { href: "/rss.xml", label: "RSS" },
      ]}
    >
      <div className="content-body">
        <p>
          테스트를 “해보기”에서 끝내지 않고, 결과를 일상에 적용할 수 있도록 정리한
          가이드/칼럼입니다.
        </p>

        <div className="search" style={{ margin: "10px 0 12px" }} role="search">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="키워드로 검색 (예: 번아웃, 대화, 습관)"
            aria-label="칼럼 검색"
          />
          {q && (
            <button className="clear" onClick={() => setQ("")} aria-label="검색어 지우기">
              ×
            </button>
          )}
        </div>

        <div className="pill-row" style={{ marginBottom: 14 }}>
          {cats.map((c) => (
            <button
              key={c}
              className={`pill ${cat === c ? "active" : ""}`}
              onClick={() => setCat(c)}
              style={{ cursor: "pointer" }}
            >
              {c}
            </button>
          ))}
        </div>

        {items.length === 0 ? (
          <div className="empty">조건에 맞는 글이 없어요.</div>
        ) : (
          <div className="cards">
            {items.map((a) => (
              <ArticleCard key={a.slug} a={a} />
            ))}
          </div>
        )}

        <div className="content-callout">
          <b>추천 흐름</b>
          1) 테스트 → 2) 결과 정리 → 3) 관련 가이드 읽기 → 4) 1주일 실험(행동 1개만)
        </div>
      </div>
    </PageShell>
  );
}
