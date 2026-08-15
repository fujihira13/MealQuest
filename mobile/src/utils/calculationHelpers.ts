import { getTotalXpRequiredForLevel } from "./levelHelpers";

export const calculateLevelProgress = (
  totalXp: number,
  level: number
): { pointsToNext: number; progressPercent: number } => {
  const currentLevelXp = getTotalXpRequiredForLevel(level);
  const nextLevelXp = getTotalXpRequiredForLevel(level + 1);
  const xpInLevel = Math.max(0, totalXp - currentLevelXp);
  const xpNeededForLevel = nextLevelXp - currentLevelXp;
  const pointsToNext = Math.max(0, nextLevelXp - totalXp);
  const progressPercent = xpNeededForLevel > 0 ? (xpInLevel / xpNeededForLevel) * 100 : 0;
  return { pointsToNext, progressPercent };
};

export const calculateGachaProgress = (
  points: number
): { pointsNeeded: number; progressPercent: number; canPlay: boolean; currentCyclePoints: number } => {
  const safePoints = Math.max(0, Math.floor(points));
  const canPlay = safePoints >= 100;
  const currentCyclePoints = canPlay ? 100 : safePoints;

  return {
    pointsNeeded: canPlay ? 0 : 100 - safePoints,
    progressPercent: canPlay ? 100 : safePoints,
    canPlay,
    currentCyclePoints,
  };
};
