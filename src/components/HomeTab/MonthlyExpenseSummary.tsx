import React from "react";
import { useAppStore } from "@/store/useAppStore";
import { CircularProgress } from "@/components/Common/CircularProgress";

export const MonthlyExpenseSummary: React.FC = () => {
  const { expenses, goals } = useAppStore();

  const today = new Date().toISOString().slice(0, 10);
  const currentMonth = today.slice(0, 7);

  const todayExpenses = expenses.filter((e) => e.date === today);
  const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

  const monthlyExpenses = expenses.filter((e) => e.date.startsWith(currentMonth));
  const monthlyTotal = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

  const budgetGoal = goals.monthlyExpenseGoal || 80000;
  const achievePercent = budgetGoal > 0
    ? Math.round((monthlyTotal / budgetGoal) * 100)
    : 0;

  const remaining = Math.max(0, budgetGoal - monthlyTotal);

  const gaugeColor = achievePercent >= 90 ? "#f44336" : achievePercent >= 70 ? "#ff9800" : "#4caf50";

  return (
    <div className="today-summary-card">
      <div className="today-expense-col">
        <div className="today-expense-label">今日の食費</div>
        <div className="today-expense-amount">¥{todayTotal.toLocaleString()}</div>
        <div className="today-expense-remaining">残り ¥{remaining.toLocaleString()}</div>
      </div>
      <div className="budget-gauge-col">
        <div className="budget-gauge-label">今月の予算</div>
        <CircularProgress
          value={achievePercent}
          size={76}
          strokeWidth={8}
          color={gaugeColor}
          label="達成率"
        />
        <div className="budget-gauge-bottom">
          ¥{monthlyTotal.toLocaleString()} / ¥{budgetGoal.toLocaleString()}
        </div>
      </div>
    </div>
  );
};
