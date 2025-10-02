// src/lib/engine.js
// 유연한 채점 엔진: 기존 MBTI + 합계-구간(sum-range) 모두 지원
// 사용법: scoreMBTI(quiz, answers)
// - quiz.scoring.engine === 'sum-range' 일 때: 각 보기의 score/points 합산 후 results[].range로 매핑
// - 그 외: MBTI( E/I, S/N, T/F, J/P ) 방식

export function scoreMBTI(quiz, answers) {
  const engine =
    (quiz && quiz.scoring && quiz.scoring.engine) || quiz?.engine || "mbti";

  if (engine === "sum-range") {
    let total = 0;
    for (const q of quiz?.questions || []) {
      const ans = answers[q.id];
      const opt = (q.options || []).find((o) => o.id === ans);
      if (!opt) continue;
      const s =
        typeof opt.score === "number"
          ? opt.score
          : typeof opt.points === "number"
          ? opt.points
          : 0;
      total += s;
    }

    const results = quiz?.results || [];
    let picked = results.find((r) => {
      const [min, max] = r.range || [0, 0];
      return total >= min && total <= max;
    });

    if (!picked && results.length) {
      // fallback: 중앙값이 가장 가까운 결과
      picked = results.reduce((acc, r) => {
        const [min, max] = r.range || [0, 0];
        const center = (min + max) / 2;
        const accCenter = ((acc.range?.[0] || 0) + (acc.range?.[1] || 0)) / 2;
        return Math.abs(total - center) < Math.abs(total - accCenter) ? r : acc;
      }, results[0]);
    }

    return { type: picked?.id, score: total, engine };
  }

  // ===== MBTI 기본 엔진 =====
  const tally = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  const add = (k, v = 1) => {
    if (Object.prototype.hasOwnProperty.call(tally, k)) tally[k] += v;
  };

  for (const q of quiz?.questions || []) {
    const ans = answers[q.id];
    const opt = (q.options || []).find((o) => o.id === ans);
    if (!opt) continue;

    if (typeof opt.mbti === "string") {
      add(opt.mbti, 1);
    } else if (typeof opt.dim === "string") {
      add(opt.dim, 1);
    } else if (opt.axis && opt.choice) {
      add(opt.choice, 1);
    } else if (opt.score_map && typeof opt.score_map === "object") {
      for (const k in opt.score_map) add(k, opt.score_map[k]);
    } else if (typeof opt.code === "string") {
      // e.g. code: 'E', 'I', ...
      add(opt.code, 1);
    }
  }

  const type =
    (tally.E >= tally.I ? "E" : "I") +
    (tally.S >= tally.N ? "S" : "N") +
    (tally.T >= tally.F ? "T" : "F") +
    (tally.J >= tally.P ? "J" : "P");

  return { type, tally, engine: "mbti" };
}

export default scoreMBTI;

// === Added: evaluateQuiz (Likert + MCQ + sum-range) ===
export function evaluateQuiz(quiz, answers = {}, normalized = null) {
  const type = (quiz && quiz.type) || null;
  const res = { type: null, score: 0, max: 0, band: null, engine: null };

  function selectedIndex(q) {
    const sel = answers[q.id];
    if (typeof sel === "number") return sel;
    if (typeof sel === "string") {
      const opts =
        normalized?.questions?.find((x) => x.id === q.id)?.options ||
        q.options ||
        [];
      const idx = opts.findIndex((o) => String(o.id) === sel);
      if (idx >= 0) return idx;
      const m = sel.match(/^[a-z]$/i);
      if (m) return sel.toLowerCase().charCodeAt(0) - 97;
      const n = parseInt(sel, 10);
      if (!isNaN(n)) return n;
    }
    return 0;
  }

  if (type === "likert") {
    const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
    const scores =
      quiz.scoring && Array.isArray(quiz.scoring.option_scores)
        ? quiz.scoring.option_scores
        : null;
    let sum = 0;
    res.max = 0;
    for (const q of questions) {
      const idx = selectedIndex(q);
      const opt = (q.options || [])[idx] || {};
      const s =
        opt.score != null
          ? Number(opt.score)
          : scores
          ? Number(scores[idx] || 0)
          : idx;
      const rowMax = Math.max(
        ...(q.options || []).map((o) => Number(o.score ?? 0)),
        scores ? Math.max(...scores) : 4
      );
      res.max += scores ? Math.max(...scores) : rowMax;
      sum += s;
    }
    res.type = "likert";
    res.score = sum;
    res.engine = "likert";
    const bands = Array.isArray(quiz.results) ? quiz.results : [];
    res.band =
      bands.find(
        (b) => sum >= (b.range?.[0] ?? -1e9) && sum <= (b.range?.[1] ?? 1e9)
      ) || null;
    return res;
  }

  if (type === "mcq") {
    const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
    let correct = 0;
    for (const q of questions) {
      const idx = selectedIndex(q);
      if (typeof q.correct_index === "number" && idx === q.correct_index)
        correct += 1;
    }
    res.type = "mcq";
    res.score = correct;
    res.max = questions.length;
    res.engine = "mcq";
    const bands = Array.isArray(quiz.result_bands) ? quiz.result_bands : [];
    res.band =
      bands.find(
        (b) => correct >= (b.min ?? -1e9) && correct <= (b.max ?? 1e9)
      ) || null;
    return res;
  }

  if (quiz?.scoring?.engine === "sum-range") {
    let total = 0;
    const qlist = quiz.questions || quiz.items || [];
    for (const q of qlist) {
      const idx = selectedIndex(q);
      const opt = (q.options || q.choices || q.answers || [])[idx];
      if (!opt) continue;
      const s = Number(opt.score ?? opt.points ?? 0);
      if (!isNaN(s)) total += s;
    }
    res.type = "sum-range";
    res.score = total;
    res.engine = "sum-range";
    const bands = Array.isArray(quiz.results) ? quiz.results : [];
    res.band =
      bands.find(
        (b) => total >= (b.range?.[0] ?? -1e9) && total <= (b.range?.[1] ?? 1e9)
      ) || null;
    return res;
  }

  // fallback to MBTI
  return scoreMBTI(quiz, answers, normalized);
}
