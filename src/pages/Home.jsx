import React, { useEffect, useMemo, useState } from "react";
import Card from "../components/Card.jsx";

export default function Home() {
  const [catalog, setCatalog] = useState({ items: [], categories: [] });
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("전체");

  useEffect(() => {
    fetch("/catalog.json")
      .then((r) => r.json())
      .then(setCatalog);
  }, []);

  const items = useMemo(() => {
    let arr = catalog.items || [];
    if (cat && cat !== "전체") arr = arr.filter((i) => i.category === cat);
    if (q.trim()) {
      const t = q.trim().toLowerCase();
      arr = arr.filter((i) =>
        (i.title + " " + (i.subtitle || "")).toLowerCase().includes(t)
      );
    }
    return arr;
  }, [catalog, q, cat]);

  const cats = ["전체", ...(catalog.categories || [])];

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
