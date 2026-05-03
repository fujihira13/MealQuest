import type { ExpenseRecord } from "@/types";
import { getCurrentMonth } from "./dateHelpers";
import { getTotalXpRequiredForLevel } from "./levelHelpers";

export const calculateMonthlyExpenses = (expenses: ExpenseRecord[]): number => {
  const currentMonth = getCurrentMonth();
  return expenses
    .filter((expense) => expense.date.startsWith(currentMonth))
    .reduce((sum, expense) => sum + expense.amount, 0);
};

export const calculateBudgetRemaining = (
  allowanceGoal: number,
  allowanceUsed: number
): number => {
  return Math.max(0, allowanceGoal - allowanceUsed);
};


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

export const calculateSavingsLevelProgress = (
  totalSavings: number,
  savingsLevel: number
): { remainingToNext: number; progressPercent: number } => {
  const remainingToNext = savingsLevel * 1000 - totalSavings;
  const progressPercent = (totalSavings / (savingsLevel * 1000)) * 100;
  return { remainingToNext, progressPercent };
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
