import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Card from "../components/Card.jsx";

/**
 * Home.jsx (v3.4)
 * - 카테고리/검색 URL 동기화
 * - 스크롤 복원(카테고리별)
 * - 카테고리 전환: 즉시 상단(0) 고정 + last-cat 즉시 저장
 * - 상세 → 홈 복귀: ps:quiz-list:* 기반으로 "카테고리 + 위치" 정확히 복원
 * - [NEW] '홈으로' 버튼(앵커 포함)으로 '/' 진입(새로고침/POP 포함)해도 Back처럼 동작
 *   · navType에 의존하지 않고, 항상 최신 스크롤 키에서 복원 타겟(cat/q)을 추론해 need 합성
 */

export default function Home() {
  const location = useLocation();
  const nav = useNavigate();

  const [catalog, setCatalog] = useState({ items: [], categories: [] });
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("전체");

  // --- helpers ---------------------------------------------------------------
  function buildSearch(c, query) {
    const parts = [];
    if (c && c !== "전체") parts.push("cat=" + encodeURIComponent(c));
    if (query) parts.push("q=" + encodeURIComponent(query));
    return parts.join("&");
  }

  // 세션에 남아있는 scroll-pos-ts 키들 중, 가장 최근에 사용된 카테고리를 유추
  function deriveCatFromScrollKeys() {
    try {
      let bestCat = null;
      let bestTs = -1;
      for (let i = 0; i < sessionStorage.length; i++) {
        const k = sessionStorage.key(i);
        if (!k || !k.startsWith("scroll-pos-ts:")) continue;
        // 예: "scroll-pos-ts:/?cat=연애&q=..."
        const pathSearch = k.slice("scroll-pos-ts:".length); // "/?cat=..."
        const idx = pathSearch.indexOf("?");
        if (idx < 0) continue;
        const search = pathSearch.slice(idx); // "?cat=...&q=..."
        const sp = new URLSearchParams(search);
        const c = sp.get("cat");
        if (!c || c === "전체") continue;
        const ts = Number(sessionStorage.getItem(k) || "0");
        if (!Number.isNaN(ts) && ts > bestTs) {
          bestTs = ts;
          bestCat = c;
        }
      }
      return bestCat;
    } catch {
      return null;
    }
  }

  // 카테고리 클릭 시: 세션 즉시 업데이트 + 스크롤 0 고정 + 상태 변경
  function handleCategoryClick(next) {
    try {
      // 1) 마지막 카테고리 즉시 기록
      sessionStorage.setItem("last-cat:/", next);
      // 상세 진입 시 사용할 값도 함께 최신화
      sessionStorage.setItem("ps:quiz-list:cat", next);
      sessionStorage.setItem("ps:quiz-list:q", q);
      // 2) 전환될 경로 키의 스크롤 값을 0으로 선기록 → 전환 직후 상단 고정
      const searchStr = buildSearch(next, q);
      const key = "/" + (searchStr ? "?" + searchStr : "");
      sessionStorage.setItem("scroll-pos:" + key, "0");
      sessionStorage.setItem("scroll-pos-ts:" + key, String(Date.now()));
    } catch {}
    // 3) 상태/URL 동기화는 아래 effect가 수행
    setCat(next);
    // 4) 즉시 화면 상단으로
    try { window.scrollTo(0, 0); } catch {}
  }

  // --- 초기 상태 확정 --------------------------------------------------------
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const catFromUrl = sp.get("cat");
    const qFromUrl = sp.get("q") || "";

    // last-cat 원본 값(raw)을 먼저 읽어, 존재 여부로 분기한다.
    let lastCatRaw = null;
    try {
      lastCatRaw = sessionStorage.getItem("last-cat:/"); // 존재하지 않으면 null
    } catch {}

    const catFromSession = lastCatRaw || "전체";

    // URL 'cat'도 없고, 세션 last-cat도 전혀 없을 때만 scroll-key로 유추
    const derivedCat =
      !catFromUrl && lastCatRaw == null ? deriveCatFromScrollKeys() : null;

    // 우선순위: URL(cat) > 세션(last-cat) > 유추(스크롤키) > "전체"
    const nextCat =
      catFromUrl != null
        ? catFromUrl
        : lastCatRaw != null
        ? catFromSession
        : derivedCat || "전체";

    setCat(nextCat);
    setQ(qFromUrl);

    // URL 정규화 (replace)
    const sp2 = new URLSearchParams(location.search);
    let changed = false;
    if ((sp2.get("cat") || "전체") !== nextCat) {
      if (nextCat && nextCat !== "전체") sp2.set("cat", nextCat);
      else sp2.delete("cat");
      changed = true;
    }
    if ((sp2.get("q") || "") !== qFromUrl) {
      if (qFromUrl) sp2.set("q", qFromUrl);
      else sp2.delete("q");
      changed = true;
    }
    if (changed) {
      nav(
        { pathname: "/", search: sp2.toString() ? `?${sp2}` : "" },
        { replace: true }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- 카탈로그 로드 ---------------------------------------------------------
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/catalog.json", { cache: "no-cache" });
        const data = await res.json();
        if (!alive) return;
        const categories =
          Array.isArray(data.categories) && data.categories.length
            ? data.categories
            : Array.from(
                new Set(
                  (data.items || []).map((i) => i.category).filter(Boolean)
                )
              );
        setCatalog({ items: data.items || [], categories });
      } catch {
        if (!alive) return;
        setCatalog({ items: [], categories: [] });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // --- 카테고리 리스트 -------------------------------------------------------
  const categoryList = useMemo(() => {
    const base =
      (catalog &&
        Array.isArray(catalog.categories) &&
        catalog.categories.length
        ? catalog.categories
        : Array.from(
            new Set((catalog.items || []).map((i) => i.category).filter(Boolean))
          )) || [];
    return ["전체", ...base];
  }, [catalog]);

  // --- 필터링 ----------------------------------------------------------------
  const tokens = useMemo(
    () =>
      (q || "")
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean),
    [q]
  );

  const match = (it) => {
    if (!tokens.length) return true;
    const hay = [
      it.title,
      it.subtitle,
      it.category,
      Array.isArray(it.tags) ? it.tags.join(" ") : "",
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
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

  // --- 상태 -> URL/세션 동기화 -----------------------------------------------
  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    let changed = false;
    if ((sp.get("cat") || "전체") !== cat) {
      if (cat && cat !== "전체") sp.set("cat", cat);
      else sp.delete("cat");
      changed = true;
    }
    if ((sp.get("q") || "") !== q) {
      if (q) sp.set("q", q);
      else sp.delete("q");
      changed = true;
    }
    if (changed) {
      nav(
        { pathname: "/", search: sp.toString() ? `?${sp}` : "" },
        { replace: true }
      );
    }
    try {
      sessionStorage.setItem("last-cat:/", cat);
      // 상세 페이지에서 홈 복귀 시 사용할 참조값도 항상 최신화
      sessionStorage.setItem("ps:quiz-list:cat", cat);
      sessionStorage.setItem("ps:quiz-list:q", q);
    } catch {}
  }, [cat, q, location.search, nav]);

  // --- [NEW] 합성 need: '/' 진입 시(POP 포함) 최신 스크롤 키에서 타겟 추론 -------
  useEffect(() => {
    try {
      if (location.pathname !== "/") return;
      if (sessionStorage.getItem("ps:quiz-list:need")) return; // 이미 Back 시나리오

      // 후보 키: (catWanted+qWanted), (catWanted), '/'
      const catWanted0 =
        sessionStorage.getItem("ps:quiz-list:cat") ||
        sessionStorage.getItem("last-cat:/") ||
        "전체";
      const qWanted0 = sessionStorage.getItem("ps:quiz-list:q") || "";

      const makeKey = (c, query) =>
        "/" + (buildSearch(c, query) ? "?" + buildSearch(c, query) : "");

      const candidates = [
        makeKey(catWanted0, qWanted0),
        makeKey(catWanted0, ""),
        "/",
      ];

      let bestKey = null;
      let bestTs = -1;
      for (const k of candidates) {
        const ts = Number(sessionStorage.getItem("scroll-pos-ts:" + k) || "0");
        if (!Number.isNaN(ts) && ts > bestTs) {
          bestTs = ts;
          bestKey = k;
        }
      }

      const fresh = bestTs > 0 && Date.now() - bestTs < 10 * 60 * 1000;
      if (!fresh || !bestKey) return;

      // bestKey 로부터 복원 타겟(cat/q) 추론
      let resumeCat = "전체";
      let resumeQ = "";
      if (bestKey !== "/") {
        const idx = bestKey.indexOf("?");
        if (idx >= 0) {
          const sp = new URLSearchParams(bestKey.slice(idx));
          resumeCat = sp.get("cat") || "전체";
          resumeQ = sp.get("q") || "";
        }
      }

      // need 합성 + 타겟 고정
      sessionStorage.setItem("ps:quiz-list:need", "1");
      sessionStorage.setItem("ps:quiz-list:cat", resumeCat);
      sessionStorage.setItem("ps:quiz-list:q", resumeQ);

      // 상태를 먼저 맞춰 놓으면 복원 effect가 안정적으로 동작
      if (resumeCat !== cat) setCat(resumeCat);
      if (resumeQ !== q) setQ(resumeQ);
    } catch {}
  // pathname 바뀔 때마다 체크 (앵커/새로고침 포함)
  }, [location.pathname]);

  // --- [KEEP] 상세 → 홈 복귀 시, 우선 cat/q를 맞춘 뒤 복원 --------------------
  useEffect(() => {
    try {
      const need = sessionStorage.getItem("ps:quiz-list:need");
      if (!need) return;
      const catWanted = sessionStorage.getItem("ps:quiz-list:cat");
      const qWanted = sessionStorage.getItem("ps:quiz-list:q");
      // cat/q가 원하는 값과 다르면 먼저 동기화
      let updated = false;
      if (catWanted && catWanted !== cat) {
        setCat(catWanted);
        updated = true;
      }
      if (qWanted != null && qWanted !== q) {
        setQ(qWanted);
        updated = true;
      }
      // need는 스크롤 복원 시점에서 제거
      if (updated) {
        // 다음 렌더 후 스크롤 복원 effect가 실행됨
      }
    } catch {}
  }, [cat, q, location.pathname, location.search]);

  // --- 스크롤 복원 -----------------------------------------------------------
  useEffect(() => {
    const currentKey = location.pathname + location.search; // 런타임 현재
    const stateKey =
      "/" + (buildSearch(cat, q) ? "?" + buildSearch(cat, q) : "");
    const stateKeyNoQ =
      "/" + (buildSearch(cat, "") ? "?" + buildSearch(cat, "") : "");

    let needNow = null;
    let needCat = null;
    try {
      needNow = sessionStorage.getItem("ps:quiz-list:need");
      needCat = sessionStorage.getItem("ps:quiz-list:cat");
    } catch {}

    // need + needCat이 지정되어 있고, 아직 cat이 맞춰지지 않았다면 대기
    if (needNow && needCat && needCat !== cat) {
      return;
    }

    const candidates = [];
    if (needNow) {
      // 상세→목록 복귀: 지정된 카테고리의 키만 후보로 사용
      if (needCat && needCat !== "전체") {
        candidates.push(stateKey, stateKeyNoQ, currentKey);
      } else {
        // 전체로 복귀하거나 cat 정보가 없을 때만 '/' 후보 허용
        candidates.push(currentKey, stateKey, stateKeyNoQ, "/");
      }
    } else {
      // 일반 진입/전환: '/' 후보 제외
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

      const fresh = bestTs > 0 && Date.now() - bestTs < 10 * 60 * 1000;
      if (fresh && best) {
        // need 신호는 일회성 — 실제 복원 시에만 제거
        if (needNow) sessionStorage.removeItem("ps:quiz-list:need");

        let yRaw = sessionStorage.getItem("scroll-pos:" + best);
        // 혹시 키가 비어있으면 안전망 (과거 버전 호환)
        if (yRaw == null) {
          yRaw = sessionStorage.getItem("ps:quiz-list:scroll");
        }

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
              <button className="clear" onClick={() => setQ("")}>
                ×
              </button>
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
                  onClick={() => handleCategoryClick(c)}
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
