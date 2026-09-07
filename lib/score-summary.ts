export function scoreSummary(scores: (number | null)[]) {
  const values = scores.filter((score): score is number =>
    score !== null && Number.isFinite(score) && score >= 0 && score <= 100);
  return {
    count: values.length,
    average: values.length ? Math.round(values.reduce((sum, score) => sum + score, 0) / values.length) : null,
  };
}
