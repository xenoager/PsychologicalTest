import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageShell from "../components/PageShell.jsx";
import Card from "../components/Card.jsx";

export default function CategoryPage() {
  const { name } = useParams();
  const category = decodeURIComponent(name || "");

  const [catalog, setCatalog] = useState({ items: [], categories: [] });
  const [q, setQ] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/catalog.json", { cache: "no-cache" });
        const data = res.ok ? await res.json() : { items: [], categories: [] };
        if (!alive) return;
        setCatalog({ items: data.items || [], categories: data.categories || [] });
      } catch {
        if (!alive) return;
        setCatalog({ items: [], categories: [] });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const items = useMemo(() => {
    const all = Array.isArray(catalog.items) ? catalog.items : [];
    const filtered = all.filter((it) =>
      String(it.category || "").trim() === String(category).trim()
    );
    if (!q.trim()) return filtered;
    const qq = q.trim().toLowerCase();
    return filtered.filter((it) =>
      `${it.title || ""} ${it.subtitle || ""} ${it.badge || ""}`
        .toLowerCase()
        .includes(qq)
    );
  }, [catalog.items, category, q]);

  return (
    <PageShell
      title={`카테고리: ${category}`}
      sidebarTitle="BROWSE"
      sidebarLinks={[
        { to: "/", label: "테스트 홈" },
        { to: "/articles", label: "가이드·칼럼" },
        { to: "/site-map", label: "사이트맵" },
        { to: "/privacy", label: "개인정보처리방침" },
      ]}
    >
      <div className="content-body">
        <p>
          <b>{category}</b> 카테고리 테스트를 모아봤어요. 키워드로 빠르게 찾을 수 있습니다.
        </p>

        <div className="search" style={{ margin: "10px 0 16px" }} role="search">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="이 카테고리에서 검색"
            aria-label="카테고리 내 검색"
          />
          {q && (
            <button className="clear" onClick={() => setQ("")}
              aria-label="검색어 지우기">
              ×
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="empty">해당 조건의 테스트가 없어요.</div>
        ) : (
          <div className="cards">
            {items.map((it) => (
              <Card key={it.slug} item={it} activeCat={category} q={q} />
            ))}
          </div>
        )}

        <div className="content-callout">
          <b>다른 카테고리 보기</b>
          <Link to="/site-map">사이트맵</Link>에서 전체 카테고리를 한눈에 볼 수 있어요.
        </div>
      </div>
    </PageShell>
  );
}
