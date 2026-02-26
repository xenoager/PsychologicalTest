import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageShell from "../components/PageShell.jsx";
import Card from "../components/Card.jsx";

/**
 * TagPage
 * - catalog.json의 `badge`를 태그처럼 사용
 */
export default function TagPage() {
  const { tag } = useParams();
  const badge = decodeURIComponent(tag || "");

  const [catalog, setCatalog] = useState({ items: [] });
  const [q, setQ] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/catalog.json", { cache: "no-cache" });
        const data = res.ok ? await res.json() : { items: [] };
        if (!alive) return;
        setCatalog({ items: data.items || [] });
      } catch {
        if (!alive) return;
        setCatalog({ items: [] });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const items = useMemo(() => {
    const all = Array.isArray(catalog.items) ? catalog.items : [];
    const filtered = all.filter((it) =>
      String(it.badge || "").trim().toLowerCase() ===
      String(badge).trim().toLowerCase()
    );
    if (!q.trim()) return filtered;
    const qq = q.trim().toLowerCase();
    return filtered.filter((it) =>
      `${it.title || ""} ${it.subtitle || ""} ${it.category || ""}`
        .toLowerCase()
        .includes(qq)
    );
  }, [catalog.items, badge, q]);

  return (
    <PageShell
      title={`태그: ${badge}`}
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
          <b>{badge}</b> 뱃지가 붙은 테스트를 모아봤어요. (예: MBTI, 연애, 습관 등)
        </p>

        <div className="search" style={{ margin: "10px 0 16px" }} role="search">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="이 태그에서 검색"
            aria-label="태그 내 검색"
          />
          {q && (
            <button className="clear" onClick={() => setQ("")}
              aria-label="검색어 지우기">
              ×
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="empty">해당 태그의 테스트가 없어요.</div>
        ) : (
          <div className="cards">
            {items.map((it) => (
              <Card key={it.slug} item={it} activeCat={it.category || "전체"} q={q} />
            ))}
          </div>
        )}

        <div className="content-callout">
          <b>태그는 어디서 보나요?</b>
          홈 카드의 뱃지(예: MBTI/연애/습관)를 누르면 더 많은 태그 페이지를 확장할 수
          있도록 준비 중입니다.
        </div>
      </div>
    </PageShell>
  );
}
