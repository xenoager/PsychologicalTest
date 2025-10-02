import React, { useEffect, useMemo, useState } from "react";
import Card from "../components/Card.jsx";

export default function Home() {
  const [catalog, setCatalog] = useState({ items: [], categories: [] });
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("전체");

  // 카탈로그 로드
  useEffect(() => {
    fetch("/catalog.json")
      .then((r) => r.json())
      .then(setCatalog);
  }, []);

  // 필터링된 목록
  const items = useMemo(() => {
    let arr = Array.isArray(catalog.items) ? catalog.items : [];
    if (cat && cat !== "전체") arr = arr.filter((i) => i.category === cat);
    if (q.trim()) {
      const t = q.trim().toLowerCase();
      arr = arr.filter((i) =>
        (String(i.title) + " " + String(i.subtitle || "")).toLowerCase().includes(t)
      );
    }
    return arr;
  }, [catalog, q, cat]);

  // 카테고리 목록
  const cats = useMemo(() => ["전체", ...(catalog.categories || [])], [catalog]);

  // --- 카테고리 복원/저장 (Home에서만 관리) ---
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("ps:quiz-list:category");
      if (saved && saved !== cat) setCat(saved);
    } catch {}
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem("ps:quiz-list:category", cat);
    } catch {}
  }, [cat]);

  // --- 스크롤 복원: 목록이 충분히 렌더된 뒤 1회만 수행 ---
  useEffect(() => {
    const need = sessionStorage.getItem("ps:quiz-list:need") === "1";
    if (!need) return;

    const raw = sessionStorage.getItem("ps:quiz-list:scroll");
    const y = raw ? parseInt(raw, 10) : 0;
    if (!y) {
      sessionStorage.removeItem("ps:quiz-list:need");
      return;
    }

    let tries = 0;
    const maxTries = 120; // 최대 ~2초 (60fps 기준)
    const tick = () => {
      tries += 1;
      // 페이지 높이가 복원 위치 이상으로 충분히 그려졌는지 확인
      const ready =
        (document.documentElement.scrollHeight - window.innerHeight) >= (y - 4);
      if (ready) {
        window.scrollTo(0, y);
        sessionStorage.removeItem("ps:quiz-list:need");
      } else if (tries < maxTries) {
        requestAnimationFrame(tick);
      } else {
        // 마지막 보루
        window.scrollTo(0, y);
        sessionStorage.removeItem("ps:quiz-list:need");
      }
    };
    requestAnimationFrame(tick);
  }, [items.length, cat]);

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
                ×
              </button>
            )}
          </div>
        </div>

        <div className="grid">
          <aside className="sidebar">
            <div className="kicker">Category</div>
            <div className="category">
              {cats.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`cat ${cat === c ? "active" : ""}`}
                  onClick={() => setCat(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </aside>

          <main className="main">
            <section className="section">
              <h2>{cat === "전체" ? "추천" : cat}</h2>
              <div className="cards">
                {items.length === 0 ? (
                  <div className="empty">검색/필터 조건에 맞는 결과가 없어요.</div>
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
