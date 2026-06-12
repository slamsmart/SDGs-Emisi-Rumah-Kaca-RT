export const gamificationConfig = {
  maxPointsPerReport: 500,
  pointMultiplier: 100,
  dailyFirstReportBonus: 10,
  weeklyStreakBonus: 50,
  levelStep: 250,
} as const;

export function getLevelFromPoints(points: number) {
  return Math.max(1, Math.floor(points / gamificationConfig.levelStep) + 1);
}
