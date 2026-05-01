import type { ExpenseRecord } from "@/types";
import { getCurrentMonth } from "./dateHelpers";

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

export const calculateBudgetPercent = (
  remaining: number,
  allowanceGoal: number
): number => {
  return Math.max(0, (remaining / allowanceGoal) * 100);
};

export const calculateLevelProgress = (
  points: number,
  level: number
): { pointsToNext: number; progressPercent: number } => {
  const pointsToNext = level * 100 - points;
  const progressPercent = (points / (level * 100)) * 100;
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
