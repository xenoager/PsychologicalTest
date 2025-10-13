import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { assetUrl } from "../utils/asset.js";
import { evaluateQuiz } from "../lib/engine.js";

/* ===================== helpers ===================== */
function isMbtiCode(s) {
  if (!s) return false;
  const t = String(s).trim().toUpperCase();
  return /^[EI][SN][TF][JP]$/.test(t);
}
function extractMbtiFromText(str) {
  const txt = String(str || "").toUpperCase();
  const m = txt.match(/(E|I)(S|N)(T|F)(J|P)/g);
  return m ? Array.from(new Set(m)) : [];
}
function detectTypeFromUrl(typeFromRoute, location) {
  const qs = new URLSearchParams(location?.search || "");
  // support many query keys for robustness
  const qtype =
    qs.get("type") ||
    qs.get("t") ||
    qs.get("r") ||
    qs.get("result") ||
    qs.get("code");
  if (qtype) return qtype;
  if (typeFromRoute) return typeFromRoute;
  // last segment fallback (in case router missed param)
  const last =
    (location?.pathname || "").split("/").filter(Boolean).pop() || "";
  const m = last.match(/^[a-z0-9_-]{2,}$/i) ? last : null;
  return m || "";
}
function firstNonEmpty(obj, keys, fallback = "") {
  for (const k of keys) {
    const v = obj?.[k];
    if (v === null || v === undefined) continue;
    if (Array.isArray(v) && v.length) return v;
    if (typeof v === "string" && v.trim().length) return v;
  }
  return fallback;
}
function toArray(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  if (typeof v === "string") return v.split(/\s*[\n•\-]\s*/).filter(Boolean);
  return [];
}
function normalizeResults(raw) {
  // Accept results | outcomes | profiles | personas | types (object or array)
  const candidates = [
    raw?.results,
    raw?.outcomes,
    raw?.profiles,
    raw?.personas,
    raw?.types,
  ];
  let selected = null;
  for (const c of candidates) {
    if (!c) continue;
    if (Array.isArray(c)) {
      selected = c;
      break;
    }
    if (typeof c === "object") {
      selected = Object.entries(c).map(([id, obj]) => ({ id, ...(obj || {}) }));
      break;
    }
  }
  return Array.isArray(selected) ? selected : [];
}

/* === Added: type-aware resolve from scored === */
function buildPickedFromScored(quiz, scored) {
  if (!quiz || !scored) return null;
  if (quiz.type === "likert" && scored.band) {
    const band = scored.band;
    return {
      id: band.label,
      title: band.label,
      summary: band.label,
      desc: band.desc || "",
      hashtags: [],
      good_match: [],
      bad_match: [],
    };
  }
  if (quiz.type === "mcq") {
    const label = scored.band?.label || "";
    const desc = scored.band?.desc || "";
    return {
      id: label,
      title: `${label} (${scored.score}/${scored.max})`,
      summary: label,
      desc,
      hashtags: [],
      good_match: [],
      bad_match: [],
    };
  }
  if (quiz?.scoring?.engine === "sum-range" && scored.band) {
    const band = scored.band;
    return {
      id: band.label,
      title: band.label,
      summary: band.label,
      desc: band.desc || "",
      hashtags: [],
    };
  }
  return null;
}

function findResultFlexible(results, type) {
  if (!Array.isArray(results) || !type) return null;
  const norm = String(type).toUpperCase();
  for (const x of results) {
    const pool = [
      x?.id,
      x?.type,
      x?.code,
      x?.mbti,
      x?.slug,
      x?.key,
      x?.value,
      x?.tag,
      x?.kind,
    ]
      .filter(Boolean)
      .map((v) => String(v).toUpperCase());
    if (pool.includes(norm)) return x;
    if (
      Array.isArray(x?.types) &&
      x.types.map((v) => String(v).toUpperCase()).includes(norm)
    )
      return x;
    if (isMbtiCode(norm)) {
      const codesInTitle = extractMbtiFromText(x?.title);
      if (codesInTitle.includes(norm)) return x;
    }
  }
  return null;
}
const MBTI_META = {
  ISTJ: {
    summary: "성실한 관리자형",
    desc: "책임감이 강하고 현실적이며 체계적으로 일을 수행합니다.",
  },
  ISFJ: {
    summary: "용감한 수호자형",
    desc: "세심하고 따뜻하며 도움을 주는 것을 즐깁니다.",
  },
  INFJ: {
    summary: "선의의 옹호자형",
    desc: "통찰력이 뛰어나고 가치지향적입니다.",
  },
  INTJ: {
    summary: "용의주도한 전략가형",
    desc: "비전을 계획으로 바꾸는 전략가입니다.",
  },
  ISTP: {
    summary: "만능 재주꾼형",
    desc: "문제 해결에 능하고 탐구심이 강합니다.",
  },
  ISFP: {
    summary: "호기심 많은 예술가형",
    desc: "유연하고 감수성이 풍부합니다.",
  },
  INFP: {
    summary: "열정적인 중재자형",
    desc: "이상주의적이며 공감 능력이 뛰어납니다.",
  },
  INTP: {
    summary: "논리적인 사색가형",
    desc: "분석적이고 호기심이 많은 사색가입니다.",
  },
  ESTP: {
    summary: "모험을 즐기는 사업가형",
    desc: "현실적이고 대담하며 행동 지향적입니다.",
  },
  ESFP: {
    summary: "자유로운 영혼의 연예인형",
    desc: "사교적이고 에너지가 넘칩니다.",
  },
  ENFP: {
    summary: "재기발랄한 활동가형",
    desc: "창의적이고 열정이 풍부합니다.",
  },
  ENTP: {
    summary: "뜨거운 논쟁을 즐기는 변론가형",
    desc: "도전과 변화를 즐깁니다.",
  },
  ESTJ: {
    summary: "엄격한 관리자형",
    desc: "실용적이고 논리적, 조직과 절차를 중시합니다.",
  },
  ESFJ: {
    summary: "사교적인 외교관형",
    desc: "배려심이 깊고 협력을 중시합니다.",
  },
  ENFJ: {
    summary: "정의로운 사회운동가형",
    desc: "공감 능력과 리더십이 뛰어납니다.",
  },
  ENTJ: {
    summary: "대담한 통솔자형",
    desc: "결단력이 강하고 목표 달성에 집중합니다.",
  },
};
function synthesizeMbtiResult(type) {
  const t = String(type).toUpperCase();
  const meta = MBTI_META[t] || {};
  return {
    id: t,
    title: t,
    summary: meta.summary || "MBTI 결과",
    desc: meta.desc || "",
  };
}
function normalizePicked(p) {
  if (!p) return null;
  const summary = firstNonEmpty(p, [
    "summary",
    "subtitle",
    "short",
    "tagline",
    "caption",
  ]);
  const descRaw = firstNonEmpty(p, [
    "desc",
    "description",
    "detail",
    "details",
    "content",
    "body",
    "explain",
    "text",
    "about",
  ]);
  const strengths = toArray(p.strengths || p.pros || p.good || p.advantages);
  const cautions = toArray(
    p.cautions || p.cons || p.warnings || p.weaknesses || p.risks
  );
  const tips = toArray(
    p.tips || p.advice || p.suggestions || p.actions || p.recommendations
  );
  const goodMatch = toArray(
    p.good_match || p.best_match || p.compatible || p.match_good
  );
  const badMatch = toArray(
    p.bad_match || p.avoid || p.incompatible || p.worst_match || p.match_bad
  );
  const hashtags = toArray(p.hashtags || p.tags);
  const image = p.image || p.img || p.thumbnail || p.thumb || null;
  const desc = Array.isArray(descRaw) ? descRaw.join("\\n") : descRaw || "";
  return {
    ...p,
    summary,
    desc,
    strengths,
    cautions,
    tips,
    good_match: goodMatch,
    bad_match: badMatch,
    hashtags,
    image,
  };
}

/* ===================== component ===================== */
export default function Result() {
  const { slug, type: typeParam } = useParams();
  const nav = useNavigate();
  const location = useLocation();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareMsg, setShareMsg] = useState("");

  const targetType = useMemo(
    () => detectTypeFromUrl(typeParam, location),
    [typeParam, location]
  );

  const stateResult = location.state?.result;
  const stateScored = location.state?.scored;
  const stateQuiz = location.state?.quiz;

  const stateAnswers = location.state?.answers;
  const answers = useMemo(() => {
    if (stateAnswers && typeof stateAnswers === "object") return stateAnswers;
    try {
      const raw = sessionStorage.getItem(`answers:${slug}`);
      if (raw) return JSON.parse(raw);
    } catch {}
    return {};
  }, [slug, stateAnswers]);

  useEffect(() => {
    if (stateResult && stateScored && stateQuiz) {
      setQuiz(stateQuiz);
      setLoading(false);
      return;
    }
    let alive = true;
    async function load() {
      setLoading(true);
      const tryPaths = [
        assetUrl(`quizzes/${slug}.json`),
        assetUrl(`quizzes/${(slug || "").replace(/-/g, "_")}.json`),
        assetUrl(`quizzes/${(slug || "").replace(/_/g, "-")}.json`),
      ];
      let data = null;
      for (const p of tryPaths) {
        try {
          const res = await fetch(p, { cache: "no-store" });
          if (res.ok) {
            data = await res.json();
            break;
          }
        } catch {}
      }
      if (!alive) return;
      setQuiz(data);
      setLoading(false);
    }
    load();
    return () => {
      alive = false;
    };
  }, [slug]);

  const normalizedResults = useMemo(() => normalizeResults(quiz || {}), [quiz]);
  const scored = useMemo(() => {
    if (stateScored) return stateScored;
    if (quiz) return evaluateQuiz(quiz, answers);
    return null;
  }, [quiz, answers, stateScored]);

  const matched = useMemo(() => {
    if (stateResult) return stateResult;
    return findResultFlexible(normalizedResults, targetType);
  }, [normalizedResults, targetType, stateResult]);

  const picked = useMemo(() => {
    if (matched) return normalizePicked(matched);
    if (scored) {
      const viaScore = buildPickedFromScored(quiz || {}, scored);
      if (viaScore) return viaScore;
    }
    if (isMbtiCode(targetType))
      return normalizePicked(synthesizeMbtiResult(targetType));
    return null;
  }, [matched, targetType, scored, quiz]);

  // === Share URL: distinct from normal result URL (adds ?r=TYPE&share=1) ===
  const shareUrl = (() => {
    if (typeof window === "undefined") return "";
    const u = new URL(window.location.href);
    u.searchParams.set("share", "1");
    u.searchParams.set("r", targetType || "");
    return u.toString();
  })();
  const shareTitle = `${quiz?.title ?? slug} — ${picked?.title ?? ""}`;
  const shareText = picked?.summary || picked?.desc || quiz?.subtitle || "";

  async function doShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        setShareMsg("공유 링크를 열었어요.");
      } else if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
        setShareMsg("공유 링크가 복사되었어요.");
      } else {
        const ta = document.createElement("textarea");
        ta.value = shareUrl;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setShareMsg("공유 링크가 복사되었어요.");
      }
    } catch (e) {
      setShareMsg("공유가 취소되었거나 실패했어요.");
    } finally {
      setTimeout(() => setShareMsg(""), 1800);
    }
  }

  // --- NEW: 메인 '마인드Q' 버튼 동작 (초기 홈: 전체 + 스크롤 최상단) ---------
  function goInitialHome() {
    try {
      sessionStorage.removeItem("ps:quiz-list:need");
      sessionStorage.setItem("last-cat:/", "전체");
      sessionStorage.setItem("ps:quiz-list:cat", "전체");
      sessionStorage.setItem("ps:quiz-list:q", "");
      sessionStorage.setItem("scroll-pos:/", "0");
      sessionStorage.setItem("scroll-pos-ts:/", String(Date.now()));
    } catch {}
    try {
      window.scrollTo(0, 0);
    } catch {}
    nav("/", { replace: true });
  }

  /* ===================== NEW: 홈으로(스마트) =====================
   * 1) 가능한 경우 pop 2단계(nav(-2))로 Home 복귀
   * 2) 불가(인덱스 부족/딥링크) 시:
   *    - Home 복원 신호(need/cat/q) 세팅
   *    - '/' 로 replace 이동 → Home.jsx가 Back처럼 복원
   */
  function buildSearch(c, query) {
    const parts = [];
    if (c && c !== "전체") parts.push("cat=" + encodeURIComponent(c));
    if (query) parts.push("q=" + encodeURIComponent(query));
    return parts.join("&");
  }
  function prepareHomeResume() {
    try {
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

      let resumeCat = catWanted0;
      let resumeQ = qWanted0;
      if (bestKey && bestKey !== "/") {
        const idx = bestKey.indexOf("?");
        if (idx >= 0) {
          const sp = new URLSearchParams(bestKey.slice(idx));
          resumeCat = sp.get("cat") || "전체";
          resumeQ = sp.get("q") || "";
        }
      }

      sessionStorage.setItem("ps:quiz-list:need", "1");
      sessionStorage.setItem("ps:quiz-list:cat", resumeCat);
      sessionStorage.setItem("ps:quiz-list:q", resumeQ);
    } catch {}
  }
  function goHomeSmart() {
    // 항상 복원 신호를 먼저 세팅 (뒤로가기 시나리오에서도 스크롤/카테고리 복원 보장)
    prepareHomeResume();
    try {
      const idx = window.history?.state?.idx;
      // Home(0) -> Quiz(1) -> Result(2) 라면 -2가 가능
      if (typeof idx === "number" && idx >= 2) {
        nav(-2);
        return;
      }
    } catch {}
    // 딥링크/새로고침 등으로 pop 불가 → '/'로 대체
    nav("/", { replace: true });
  }

  const HeaderBrand = (
    <div
      className="header header--brand"
      style={{
        marginBottom: 14,
        paddingBottom: 10,
        borderBottom: "1px solid rgba(255,255,255,.12)",
      }}
    >
      <div
        className="logo"
        role="button"
        tabIndex={0}
        aria-label="마인드Q 홈"
        onClick={goInitialHome}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") goInitialHome();
        }}
      >
        <b className="brand">마인드Q</b>
      </div>
    </div>
  );

  const TopBar = (
    <div className="topbar" style={{ marginTop: 12 }}>
      <button className="btn ghost" onClick={goHomeSmart}>
        ← 홈으로
      </button>
      <div style={{ flex: 1 }} />
      <button className="btn" onClick={() => nav(`/${slug}`)}>
        다시 테스트
      </button>
      <button className="btn primary" onClick={doShare}>
        공유하기
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="wrap">
        <div className="card" style={{ width: "100%", maxWidth: 880 }}>
          {HeaderBrand}
          {TopBar}
          <div>결과를 불러오는 중…</div>
        </div>
      </div>
    );
  }

  if (!picked) {
    return (
      <div className="wrap">
        <div className="card" style={{ width: "100%", maxWidth: 880 }}>
          {HeaderBrand}
          {TopBar}
          <div className="kicker">알림</div>
          <div style={{ color: "#9fb6d1", marginBottom: 8 }}>
            결과 정보를 찾을 수 없습니다.
          </div>
          <div className="hr" />
          <button className="btn" onClick={() => nav(`/${slug}`)}>
            테스트로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const hashtags = Array.isArray(picked.hashtags) ? picked.hashtags : [];

  return (
    <div className="wrap">
      <div className="card" style={{ width: "100%", maxWidth: 880 }}>
        {HeaderBrand}
        {TopBar}

        <div className="result-head">
          <div className="kicker">{quiz?.title || slug}</div>
          <h1 className="result-title">{picked.title}</h1>
          {picked.summary && <p className="result-summary">{picked.summary}</p>}
          {hashtags?.length > 0 && (
            <div className="pills">
              {hashtags.map((h) => (
                <span key={h} className="pill">
                  {h}
                </span>
              ))}
            </div>
          )}
          {typeof scored?.score === "number" && (
            <div className="score-chip">
              점수 <b>{scored.score}</b>
            </div>
          )}
        </div>

        {!!picked.desc && (
          <div className="result-card">
            <h4>설명</h4>
            <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{picked.desc}</p>
          </div>
        )}

        <div className="result-grid">
          {picked.strengths?.length > 0 && (
            <div className="result-card">
              <h4>강점</h4>
              <ul className="result-list">
                {picked.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {picked.cautions?.length > 0 && (
            <div className="result-card">
              <h4>주의할 점</h4>
              <ul className="result-list">
                {picked.cautions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {picked.tips?.length > 0 && (
          <div className="result-card">
            <h4>연애 팁</h4>
            <ol className="result-list">
              {picked.tips.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ol>
          </div>
        )}

        {(picked.good_match?.length > 0 || picked.bad_match?.length > 0) && (
          <div className="result-grid">
            {picked.good_match?.length > 0 && (
              <div className="result-card">
                <h4>잘 맞는 궁합</h4>
                <div className="pills">
                  {picked.good_match.map((g) => (
                    <span key={g} className="pill good">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {picked.bad_match?.length > 0 && (
              <div className="result-card">
                <h4>주의할 궁합</h4>
                <div className="pills">
                  {picked.bad_match.map((g) => (
                    <span key={g} className="pill warn">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {(picked.ideal_date || picked.communication || picked.gift_idea) && (
          <div className="result-grid">
            {picked.ideal_date && (
              <div className="result-card">
                <h4>이런 데이트 좋아요</h4>
                <p style={{ margin: 0 }}>{picked.ideal_date}</p>
              </div>
            )}
            {picked.communication && (
              <div className="result-card">
                <h4>대화 포인트</h4>
                <p style={{ margin: 0 }}>{picked.communication}</p>
              </div>
            )}
            {picked.gift_idea && (
              <div className="result-card">
                <h4>선물 아이디어</h4>
                <p style={{ margin: 0 }}>{picked.gift_idea}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {!!shareMsg && <div className="toast">{shareMsg}</div>}
    </div>
  );
}
