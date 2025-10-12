import React, { useEffect, useMemo, useState } from "react";
import Card from "../components/Card.jsx";

export default function Home() {
  const [catalog, setCatalog] = useState({ items: [], categories: [] });
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("전체");

  // 카탈로그 로드
  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch("/catalog.json", { cache: "no-cache" });
        const data = await res.json();
        if (!alive) return;
        const categories = Array.isArray(data.categories) && data.categories.length
          ? data.categories
          : Array.from(new Set((data.items || []).map((i) => i.category).filter(Boolean)));
        setCatalog({ items: data.items || [], categories });
      } catch (e) {
        if (!alive) return;
        setCatalog({ items: [], categories: [] });
      }
    }
    load();
    return () => { alive = false; };
  }, []);

  // 카테고리 리스트
  const categoryList = useMemo(() => {
    const base = (catalog && Array.isArray(catalog.categories) && catalog.categories.length
      ? catalog.categories
      : Array.from(new Set((catalog.items || []).map((i) => i.category).filter(Boolean)))) || [];
    return ["전체", ...base];
  }, [catalog]);

  // 검색 토큰
  const tokens = useMemo(() => (q || "").trim().toLowerCase().split(/\s+/).filter(Boolean), [q]);
  const match = (it) => {
    if (!tokens.length) return true;
    const hay = [it.title, it.subtitle, it.category, it.tags?.join?.(" ")].filter(Boolean).join(" ").toLowerCase();
    return tokens.every((t) => hay.includes(t));
  };

  // 검색 적용된 전체
  const filteredBySearch = useMemo(() => {
    const arr = Array.isArray(catalog.items) ? catalog.items : [];
    return arr.filter(match);
  }, [catalog, tokens]);

  // 카테고리별 개수(검색 적용)
  const counts = useMemo(() => {
    const map = Object.fromEntries(categoryList.map((c) => [c, 0]));
    map["전체"] = filteredBySearch.length;
    for (const it of filteredBySearch) {
      const c = it.category || "기타";
      if (map[c] == null) map[c] = 0;
      map[c]++;
    }
    return map;
  }, [categoryList, filteredBySearch]);

  // 실제 표시 목록(검색 + 카테고리)
  const items = useMemo(() => {
    let base = filteredBySearch;
    if (cat && cat !== "전체") base = base.filter((i) => i.category === cat);
    return base;
  }, [filteredBySearch, cat]);

  // ===== 스크롤 복원: 홈으로 돌아왔을 때 목록 위치 복원 =====
  useEffect(() => {
    // ScrollKeeper가 라우트 변경 시점에 플래그와 위치를 sessionStorage에 넣어둡니다.
    try {
      const need = sessionStorage.getItem("ps:quiz-list:need");
      sessionStorage.removeItem("ps:quiz-list:need");
      const key = "scroll-pos:/";
      const raw = sessionStorage.getItem(key);
      if (need && raw != null) {
        const y = parseInt(raw, 10) || 0;
        // 목록 렌더가 끝난 뒤 복원
        let tries = 0;
        const id = setInterval(() => {
          window.scrollTo(0, y);
          tries++;
          if (tries > 12) clearInterval(id);
        }, 50);
        return () => clearInterval(id);
      }
    } catch {}
  }, [items.length, cat]);

  return (
    <div className="wrap">
      <div className="panel">
        <div className="header">
          {/* 로고: '유형' 칩 + '테스트 포털' 제거 → '마인드Q' 단일 워드마크 */}
          <div className="logo">
            <b className="brand">마인드Q</b>
          </div>
          <div className="search" role="search">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="테스트 검색"
              aria-label="테스트 검색"
            />
            {q && (
              <button className="clear" onClick={() => setQ("")}>×</button>
            )}
          </div>
        </div>

        <div className="grid">
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="kicker">CATEGORY</div>
            <nav className="category">
              {categoryList.map((c) => (
                <button
                  key={c}
                  className={"cat " + (cat === c ? "active" : "")}
                  onClick={() => setCat(c)}
                >
                  {c}
                  {typeof counts[c] === "number" ? `(${counts[c]})` : ""}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main */}
          <main className="main">
            <section className="section">
              <h2>{cat}</h2>
              <div className="cards">
                {items.length === 0 ? (
                  <div className="empty">검색/필터 조건에 맞는 결과가 없어요.</div>
                ) : (
                  items.map((it) => <Card key={it.slug} item={it} />)
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
