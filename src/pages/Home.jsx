import React, { useEffect, useMemo, useState } from "react";
import Card from "../components/Card.jsx";

/**
 * Home.jsx (with category counts)
 * - 기존 레이아웃/클래스명을 유지합니다 (.wrap .panel .grid .sidebar .kicker .category .cat .main .section .cards)
 * - 좌측 카테고리 버튼에 "이름(개수)" 형태로 개수를 표시합니다.
 * - 개수는 "검색어"가 적용된 현재 결과 기준으로 계산됩니다. (검색 중에 동적으로 업데이트)
 * - 카탈로그는 /catalog.json에서 가져오며, categories 배열이 없을 경우 items의 category로 생성합니다.
 */
export default function Home() {
  const [catalog, setCatalog] = useState({ items: [], categories: [] });
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("전체");

  // 카탈로그 로드
  useEffect(() => {
    fetch("/catalog.json")
      .then((r) => r.json())
      .then((data) => {
        setCatalog(data || { items: [], categories: [] });
      })
      .catch(() => setCatalog({ items: [], categories: [] }));
  }, []);

  // 카테고리 원본
  const categoryList = useMemo(() => {
    const base =
      (catalog && Array.isArray(catalog.categories) && catalog.categories.length
        ? catalog.categories
        : Array.from(
            new Set(
              (catalog.items || []).map((i) => i.category).filter(Boolean)
            )
          )) || [];
    return ["전체", ...base];
  }, [catalog]);

  // 검색 토큰
  const tokens = useMemo(
    () => q.toLowerCase().trim().split(/\s+/).filter(Boolean),
    [q]
  );

  // 아이템 매칭
  const match = (item) => {
    if (!tokens.length) return true;
    const hay = [
      item.title,
      item.subtitle,
      item.category,
      item.badge,
      item.author,
      item.slug,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return tokens.every((t) => hay.includes(t));
  };

  // 검색이 적용된 전체 아이템
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
    if (cat && cat !== "전체") {
      base = base.filter((i) => i.category === cat);
    }
    return base;
  }, [filteredBySearch, cat]);

  // 상세에서 뒤로 오면 스크롤 복원(최소 기능)
  useEffect(() => {
    const ss = typeof window !== "undefined" ? window.sessionStorage : null;
    if (!ss) return;
    const need = ss.getItem("ps:quiz-list:need") === "1";
    if (!need) return;
    ss.removeItem("ps:quiz-list:need");
    const sc = parseInt(ss.getItem("ps:quiz-list:scroll") || "0", 10);
    const savedCat = ss.getItem("ps:quiz-list:category");
    if (savedCat) setCat(savedCat);
    // 목록이 렌더링될 때까지 몇 프레임 기다렸다가 스크롤
    let tries = 0;
    const tick = () => {
      tries++;
      if (tries > 20 || document.querySelectorAll(".card").length >= 1) {
        window.scrollTo(0, sc);
      } else {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }, [filteredBySearch.length]);

  // 카테고리 클릭 시 세션에 저장(스크롤 복원과 함께 사용됨)
  const onClickCat = (c) => {
    setCat(c);
    try {
      window.sessionStorage.setItem("ps:quiz-list:category", c);
    } catch {}
  };

  return (
    <div className="wrap">
      <div className="panel">
        <div className="header">
          <div className="logo">
            <span>유형</span>
            <b>테스트 포털</b>
          </div>
          <div className="search" role="search">
            <input
              placeholder="테스트 검색"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            {q.trim() && (
              <button
                className="clear"
                type="button"
                aria-label="검색어 지우기"
                onClick={() => setQ("")}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="grid">
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="kicker">CATEGORY</div>
            <nav className="category" aria-label="카테고리">
              {categoryList.map((c) => (
                <button
                  key={c}
                  className={`cat${cat === c ? " active" : ""}`}
                  onClick={() => onClickCat(c)}
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
                  <div className="empty">
                    검색/필터 조건에 맞는 결과가 없어요.
                  </div>
                ) : (
                  items.map((item) => <Card key={item.slug} item={item} />)
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
