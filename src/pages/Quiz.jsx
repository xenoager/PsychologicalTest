import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Progress from "../components/Progress.jsx";
import { evaluateQuiz } from "../lib/engine.js";
import { assetUrl } from "../utils/asset.js";

export default function Quiz() {
  const { slug } = useParams();
  const nav = useNavigate();

  const [raw, setRaw] = useState(null);
  const [quiz, setQuiz] = useState(null); // normalized
  const [answers, setAnswers] = useState({});
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError(null);
      setQuiz(null);
      setRaw(null);
      setIndex(0);
      setAnswers({});

      const tryPaths = [
        assetUrl(`quizzes/${slug}.json`),
        assetUrl(`quizzes/${(slug || "").replace(/-/g, "_")}.json`),
        assetUrl(`quizzes/${(slug || "").replace(/_/g, "-")}.json`),
      ];

      let data = null;
      let lastErr = null;
      for (const p of tryPaths) {
        try {
          const res = await fetch(p, { cache: "no-store" });
          if (res.ok) {
            data = await res.json();
            break;
          }
          lastErr = new Error(`HTTP ${res.status} @ ${p}`);
        } catch (e) {
          lastErr = e;
        }
      }

      if (!alive) return;

      if (!data) {
        setError(lastErr || new Error("퀴즈 로드 실패"));
        setLoading(false);
        return;
      }

      setRaw(data);
      setQuiz(normalizeQuiz(data));
      setLoading(false);
    }
    load();
    return () => {
      alive = false;
    };
  }, [slug]);

  function normalizeQuiz(raw) {
    const list = Array.isArray(raw?.questions)
      ? raw.questions
      : Array.isArray(raw?.items)
      ? raw.items
      : [];
    const questions = list.map((q, idx) => {
      const id = q.id ?? `q${idx + 1}`;
      const title = q.title ?? q.question ?? q.text ?? `문항 ${idx + 1}`;
      const optsSrc = Array.isArray(q.options)
        ? q.options
        : Array.isArray(q.choices)
        ? q.choices
        : Array.isArray(q.answers)
        ? q.answers
        : [];
      const options = optsSrc.map((o, j) => ({
        id: o.id ?? o.value ?? String.fromCharCode(97 + j),
        label: o.label ?? o.text ?? o.title ?? o.content ?? o.name ?? "",
        score: o.score ?? o.points,
        mbti: o.mbti ?? o.code,
        axis: o.axis,
        choice: o.choice,
        score_map: o.score_map,
      }));
      return { id, title, options };
    });
    const scoring = raw?.scoring || { engine: raw?.engine || "mbti" };
    return { ...raw, questions, scoring };
  }

  const questions = quiz?.questions || [];
  const q = questions[index];
  const total = Math.max(1, questions.length);
  const progress = Math.round(((index + 1) / total) * 100);
  const hasOptions = Array.isArray(q?.options) && q.options.length > 0;
  const selected = q ? answers[q.id] : undefined;

  function choose(qid, oid) {
    setAnswers((prev) => ({ ...prev, [qid]: oid }));
  }
  function goNext() {
    if (index < questions.length - 1) {
      setIndex(index + 1);
      return;
    }
    // 마지막 문항이 선택되지 않았으면 경고 후 중단
    const lastQ = questions[questions.length - 1];
    if (!answers[lastQ.id]) {
      alert('마지막 응답을 해주세요.');
      return;
    }
    const scored = evaluateQuiz(quiz || raw, answers);
    const t = String(scored.type).toUpperCase();
    const results = Array.isArray((quiz || raw)?.results)
      ? (quiz || raw).results
      : typeof (quiz || raw)?.results === "object" && (quiz || raw)?.results
      ? Object.entries((quiz || raw).results).map(([id, obj]) => ({
          id,
          ...(obj || {}),
        }))
      : [];
    const result =
      results.find((r) => {
        const pool = [
          r.id,
          r.type,
          r.code,
          r.mbti,
          r.slug,
          r.key,
          r.value,
          r.tag,
          r.kind,
        ]
          .filter(Boolean)
          .map((x) => String(x).toUpperCase());
        const hit = pool.includes(t);
        const titleHit = String(r?.title || "")
          .toUpperCase()
          .includes(t);
        const listHit =
          Array.isArray(r?.types) &&
          r.types.map((x) => String(x).toUpperCase()).includes(t);
        return hit || titleHit || listHit;
      }) || null;
    try {
      sessionStorage.setItem(`answers:${slug}`, JSON.stringify(answers));
    } catch {}
    nav(`/${slug}/result/${scored.type}`, {
      state: { result, scored, quiz: quiz || raw, answers },
    });
  }
  function goPrev() {
    if (index > 0) setIndex(index - 1);
  }

  if (loading)
    return (
      <div className="wrap">
        <div className="card">로딩 중…</div>
      </div>
    );
  if (error) {
    const msg = (error?.message || "").toString();
    return (
      <div className="wrap">
        <div className="card" style={{ maxWidth: 880 }}>
          <div className="topbar">
            <button className="btn ghost" onClick={() => nav("/")}>
              ← 홈으로
            </button>
          </div>
          <div className="kicker">로딩 오류</div>
          <div style={{ color: "#9fb6d1", marginBottom: 8 }}>
            퀴즈 파일을 불러오지 못했습니다.
          </div>
          <div style={{ fontSize: 12, color: "#7a90ad" }}>{msg}</div>
          <div className="hr" />
          <button className="btn" onClick={() => location.reload()}>
            다시 시도
          </button>
        </div>
      </div>
    );
  }
  if (!quiz)
    return (
      <div className="wrap">
        <div className="card">퀴즈를 찾을 수 없습니다.</div>
      </div>
    );

  return (
    <div className="wrap">
      <div className="card" style={{ width: "100%", maxWidth: 880 }}>
        <div className="topbar">
          <button className="btn ghost" onClick={() => nav("/")}>
            ← 홈으로
          </button>
        </div>

        <div className="kicker">{quiz.title}</div>
        <Progress value={progress} />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 6,
            fontSize: 12,
            color: "#8aa2c1",
          }}
        >
          <div>
            문항 {Math.min(index + 1, total)} / {total}
          </div>
          <div>{progress}%</div>
        </div>

        <div style={{ height: 12 }} />
        <div className="qtitle">
          {index + 1}. {q?.title || "문항"}
        </div>

        {hasOptions ? (
          <div className="options">
            {q.options.map((opt) => (
              <button
                key={opt.id}
                className={`opt ${selected === opt.id ? "selected" : ""}`}
                onClick={() => choose(q.id, opt.id)}
              >
                {opt.label || "선택지"}
              </button>
            ))}
          </div>
        ) : (
          <div
            className="card"
            style={{ background: "transparent", border: "1px dashed #263041" }}
          >
            보기(option)가 정의되어 있지 않아요.
            <small style={{ display: "block", marginTop: 6, color: "#9fb6d1" }}>
              JSON의 <code>questions[{index}].options</code> 또는{" "}
              <code>choices/answers</code>를 확인해 주세요.
            </small>
          </div>
        )}

        <div className="toolbar">
          <button className="btn" onClick={goPrev} disabled={index === 0}>
            이전
          </button>
          <div style={{ flex: 1 }} />
          <button className="btn primary" onClick={goNext} disabled={index < total - 1 && !selected}>
            {index < total - 1 ? "다음" : "결과 보기"}
          </button>
        </div>
      </div>
    </div>
  );
}
