import React from "react";
import { useAppStore } from "@/store/useAppStore";

export const MonthlyExpenseSummary: React.FC = () => {
  const { expenses } = useAppStore();

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyExpenses = expenses.filter((expense) =>
    expense.date.startsWith(currentMonth)
  );
  const totalMonthlyExpense = monthlyExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  return (
    <div className="expense-summary">
      <div className="total-expense">
        <span className="expense-label">今月の総支出</span>
        <span className="expense-amount">
          ¥{totalMonthlyExpense.toLocaleString()}
        </span>
      </div>
    </div>
  );
};