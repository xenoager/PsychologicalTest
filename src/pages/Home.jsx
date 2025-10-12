import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Card from "../components/Card.jsx";

/**
 * Home.jsx (v2) — 카테고리/검색 URL 동기화 + 스크롤 복원(카테고리별)
 * - 상태 원천: URL 쿼리 > sessionStorage('last-cat:/') > 기본 '전체'
 * - 스크롤 키: pathname+search 기준 + (cat,q) 기반 보조키도 함께 탐색하여 레이스 방지
 */
export default function Home() {
  const location = useLocation();
  const nav = useNavigate();

  const [catalog, setCatalog] = useState({ items: [], categories: [] });
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("전체");

  // 초기 상태 확정
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const catFromUrl = sp.get("cat");
    const qFromUrl = sp.get("q") || "";
    const catFromSession = sessionStorage.getItem("last-cat:/") || "전체";
    const nextCat = catFromUrl || catFromSession || "전체";
    setCat(nextCat);
    setQ(qFromUrl);
    // URL 정규화 (replace)
    const sp2 = new URLSearchParams(location.search);
    let changed = false;
    if ((sp2.get("cat") || "전체") !== nextCat) {
      if (nextCat && nextCat !== "전체") sp2.set("cat", nextCat); else sp2.delete("cat");
      changed = true;
    }
    if ((sp2.get("q") || "") !== qFromUrl) {
      if (qFromUrl) sp2.set("q", qFromUrl); else sp2.delete("q");
      changed = true;
    }
    if (changed) {
      nav({ pathname: "/", search: sp2.toString() ? `?${sp2}` : "" }, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 카탈로그 로드
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/catalog.json", { cache: "no-cache" });
        const data = await res.json();
        if (!alive) return;
        const categories = Array.isArray(data.categories) && data.categories.length
          ? data.categories
          : Array.from(new Set((data.items || []).map((i) => i.category).filter(Boolean)));
        setCatalog({ items: data.items || [], categories });
      } catch {
        if (!alive) return;
        setCatalog({ items: [], categories: [] });
      }
    })();
    return () => { alive = false; };
  }, []);

  // 카테고리 리스트
  const categoryList = useMemo(() => {
    const base = (catalog && Array.isArray(catalog.categories) && catalog.categories.length
      ? catalog.categories
      : Array.from(new Set((catalog.items || []).map((i) => i.category).filter(Boolean)))) || [];
    return ["전체", ...base];
  }, [catalog]);

  // 필터링
  const tokens = useMemo(() => (q || "").trim().toLowerCase().split(/\s+/).filter(Boolean), [q]);
  const match = (it) => {
    if (!tokens.length) return true;
    const hay = [it.title, it.subtitle, it.category, Array.isArray(it.tags) ? it.tags.join(" ") : ""].filter(Boolean).join(" ").toLowerCase();
    return tokens.every((t) => hay.includes(t));
  };

  const filteredBySearch = useMemo(() => {
    const arr = Array.isArray(catalog.items) ? catalog.items : [];
    return arr.filter(match);
  }, [catalog, tokens]);

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

  const items = useMemo(() => {
    let base = filteredBySearch;
    if (cat && cat !== "전체") base = base.filter((i) => i.category === cat);
    return base;
  }, [filteredBySearch, cat]);

  // 상태 -> URL/세션 동기화
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    let changed = false;
    if ((sp.get("cat") || "전체") !== cat) {
      if (cat && cat !== "전체") sp.set("cat", cat); else sp.delete("cat");
      changed = true;
    }
    if ((sp.get("q") || "") !== q) {
      if (q) sp.set("q", q); else sp.delete("q");
      changed = true;
    }
    if (changed) {
      nav({ pathname: "/", search: sp.toString() ? `?${sp}` : "" }, { replace: true });
    }
    try { sessionStorage.setItem("last-cat:/", cat); } catch {}
  }, [cat, q, location.search, nav]);

  // 스크롤 복원 (카테고리/검색별 키 후보 중 가장 최신 ts를 선택)
  useEffect(() => {
    function buildSearch(c, query) {
      const parts = [];
      if (c && c !== "전체") parts.push("cat=" + encodeURIComponent(c));
      if (query) parts.push("q=" + encodeURIComponent(query));
      return parts.join("&");
    }
    const candidates = [];
    const currentKey = location.pathname + location.search; // 런타임 현재
    const stateKey = "/" + (buildSearch(cat, q) ? "?" + buildSearch(cat, q) : "");
    const stateKeyNoQ = "/" + (buildSearch(cat, "") ? "?" + buildSearch(cat, "") : "");
    const needNow = sessionStorage.getItem("ps:quiz-list:need");
    // 카테고리 클릭/전환 시에는 '/'(전체) 키를 후보에서 제외하여 '전체' 스크롤로 튀는 현상을 방지
    if (needNow) {
      candidates.push(currentKey, stateKey, stateKeyNoQ, "/");
    } else {
      candidates.push(currentKey, stateKey, stateKeyNoQ);
    }
    // 중복 제거
    const uniq = Array.from(new Set(candidates));
    let best = null;
    let bestTs = -1;
    try {
      for (const k of uniq) {
        const ts = Number(sessionStorage.getItem("scroll-pos-ts:" + k) || "0");
        if (!isNaN(ts) && ts > bestTs) {
          bestTs = ts;
          best = k;
        }
      }
      const need = sessionStorage.getItem("ps:quiz-list:need");
      const fresh = bestTs > 0 && (Date.now() - bestTs < 10 * 60 * 1000);
      if ((need || best) && fresh) {
        sessionStorage.removeItem("ps:quiz-list:need");
        const yRaw = sessionStorage.getItem("scroll-pos:" + best);
        if (yRaw != null) {
          const y = parseInt(yRaw, 10) || 0;
          let tries = 0;
          const id = setInterval(() => {
            window.scrollTo(0, y);
            tries++;
            if (tries > 12) clearInterval(id);
          }, 50);
          return () => clearInterval(id);
        }
      }
    } catch {}
  }, [items.length, cat, q, location.pathname, location.search]);

  return (
    <div className="wrap">
      <div className="panel">
        <div className="header">
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

          <main className="main">
            <section className="section">
              <h2>{cat}</h2>
              <div className="cards">
                {items.length === 0 ? (
                  <div className="empty">검색/필터 조건에 맞는 결과가 없어요.</div>
                ) : (
                  items.map((it) => (
                    <Card key={it.slug} item={it} activeCat={cat} q={q} />
                  ))
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
