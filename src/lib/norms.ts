export const NORMS = {
  "TMT-A": { mean: 29.0, sd: 10.0 },
  "TMT-B": { mean: 75.0, sd: 25.0 },
  "Level-1": { mean: 10.0, sd: 3.0 },
  "Level-2": { mean: 15.0, sd: 5.0 },
  "Level-3": { mean: 40.0, sd: 15.0 },
  "Level-4": { mean: 50.0, sd: 20.0 },
  "Level-5": { mean: 80.0, sd: 30.0 }
};

export function calculateTScore(type: string, duration: number) {
  const norm = NORMS[type as keyof typeof NORMS];
  if (!norm) return 50;
  
  // T = 50 + (10 * (Mean - Raw) / SD)
  // Lower duration is better, so (Mean - Raw) is positive if better than average
  const tScore = 50 + (10 * (norm.mean - duration) / norm.sd);
  return Math.round(tScore);
}

export function getInterpretation(tScore: number) {
  if (tScore >= 70) return "High (Superior)";
  if (tScore >= 60) return "Above Average";
  if (tScore >= 40) return "Average (Normal Range)";
  if (tScore >= 30) return "Below Average (Mild Weakness)";
  return "Well Below Average (Significant Deficit)";
}

export function getPercentile(tScore: number) {
  // Rough T-to-percentile conversion
  // 50 = 50%, 60 = 84%, 70 = 98%, 40 = 16%, 30 = 2%
  const z = (tScore - 50) / 10;
  const p = 0.5 * (1 + erf(z / Math.sqrt(2)));
  return Math.round(p * 100);
}

function erf(x: number) {
  // Approximation of error function
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const z = Math.abs(x);
  const t = 1 / (1 + p * z);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);
  return sign * y;
}
