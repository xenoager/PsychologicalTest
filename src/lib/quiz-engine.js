/**
 * quiz-engine.js (v2)
 * - Evaluates Likert and MCQ quiz JSONs.
 */
export function evaluateQuiz(quiz, answers) {
  if (!quiz || !Array.isArray(quiz.questions)) {
    throw new Error('Invalid quiz JSON');
  }
  const type = quiz.type || 'likert';
  if (type === 'likert') {
    const scores = quiz.scoring?.option_scores || [0,1,2,3,4];
    let sum = 0;
    quiz.questions.forEach((q, i) => {
      const sel = answers[i] ?? 0;
      sum += scores[sel] ?? 0;
    });
    let band = null;
    if (Array.isArray(quiz.results)) {
      band = quiz.results.find(b => sum >= b.range[0] && sum <= b.range[1]) || null;
    }
    return { type, score: sum, band, totals: { max: (scores[scores.length-1]||4)*quiz.questions.length } };
  } else if (type === 'mcq') {
    let correct = 0;
    quiz.questions.forEach((q, i) => {
      const sel = answers[i];
      if (typeof sel === 'number' && sel === q.correct_index) correct += 1;
    });
    let band = null;
    if (Array.isArray(quiz.result_bands)) {
      band = quiz.result_bands.find(b => correct >= b.min && correct <= b.max) || null;
    }
    return { type, score: correct, band, totals: { max: quiz.questions.length } };
  } else if (type === 'external') {
    return { type, score: 0, band: null, totals: { max: 0 } };
  }
  throw new Error('Unsupported quiz type: ' + type);
}
