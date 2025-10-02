// src/lib/engine.js
// 유연한 채점 엔진: 기존 MBTI + 합계-구간(sum-range) 모두 지원
// 사용법: scoreMBTI(quiz, answers)
// - quiz.scoring.engine === 'sum-range' 일 때: 각 보기의 score/points 합산 후 results[].range로 매핑
// - 그 외: MBTI( E/I, S/N, T/F, J/P ) 방식

export function scoreMBTI(quiz, answers) {
  const engine = (quiz && quiz.scoring && quiz.scoring.engine) || quiz?.engine || 'mbti';

  if (engine === 'sum-range') {
    let total = 0;
    for (const q of quiz?.questions || []) {
      const ans = answers[q.id];
      const opt = (q.options || []).find(o => o.id === ans);
      if (!opt) continue;
      const s = typeof opt.score === 'number' ? opt.score :
                typeof opt.points === 'number' ? opt.points : 0;
      total += s;
    }

    const results = quiz?.results || [];
    let picked = results.find(r => {
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
  const tally = {E:0,I:0,S:0,N:0,T:0,F:0,J:0,P:0};
  const add = (k, v=1) => { if (Object.prototype.hasOwnProperty.call(tally, k)) tally[k] += v; };

  for (const q of quiz?.questions || []) {
    const ans = answers[q.id];
    const opt = (q.options || []).find(o => o.id === ans);
    if (!opt) continue;

    if (typeof opt.mbti === 'string') {
      add(opt.mbti, 1);
    } else if (typeof opt.dim === 'string') {
      add(opt.dim, 1);
    } else if (opt.axis && opt.choice) {
      add(opt.choice, 1);
    } else if (opt.score_map && typeof opt.score_map === 'object') {
      for (const k in opt.score_map) add(k, opt.score_map[k]);
    } else if (typeof opt.code === 'string') {
      // e.g. code: 'E', 'I', ...
      add(opt.code, 1);
    }
  }

  const type =
    (tally.E >= tally.I ? 'E' : 'I') +
    (tally.S >= tally.N ? 'S' : 'N') +
    (tally.T >= tally.F ? 'T' : 'F') +
    (tally.J >= tally.P ? 'J' : 'P');

  return { type, tally, engine: 'mbti' };
}

export default scoreMBTI;