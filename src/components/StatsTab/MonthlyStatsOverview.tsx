import React from "react";
import { useAppStore } from "@/store/useAppStore";

export const MonthlyStatsOverview: React.FC = () => {
  const { userData, goals } = useAppStore();

  return (
    <div className="stats-overview">
      <h3>📊 今月の統計</h3>
      <div className="stats-cards">
        <div className="stat-card">
          <h4>総支出</h4>
          <div className="stat-value">
            ¥{userData.monthlyExpense.toLocaleString()}
          </div>
          <div className="stat-detail">
            目標: ¥{goals.monthlyExpenseGoal.toLocaleString()}
          </div>
          <div className="gauge-container">
            <div className="gauge-background">
              <div
                className="gauge-fill expense-gauge"
                style={{
                  width: `${Math.min(
                    (userData.monthlyExpense / goals.monthlyExpenseGoal) *
                      100,
                    100
                  )}%`,
                }}
              ></div>
            </div>
            <div className="gauge-text">
              {(
                (userData.monthlyExpense / goals.monthlyExpenseGoal) *
                100
              ).toFixed(1)}
              %
            </div>
          </div>
        </div>
        <div className="stat-card">
          <h4>節約額</h4>
          <div className="stat-value">
            ¥{userData.totalSavings.toLocaleString()}
          </div>
          <div className="stat-detail">
            今月: ¥{userData.monthlySavings.toLocaleString()}
          </div>
          <div className="gauge-container">
            <div className="gauge-background">
              <div
                className="gauge-fill savings-gauge"
                style={{
                  width: `${Math.min(
                    (userData.monthlySavings / 10000) * 100,
                    100
                  )}%`,
                }}
              ></div>
            </div>
            <div className="gauge-text">
              ¥{userData.monthlySavings.toLocaleString()}
            </div>
          </div>
        </div>
        <div className="stat-card">
          <h4>自炊回数</h4>
          <div className="stat-value">{userData.cookingCount}回</div>
          <div className="stat-detail">目標: {goals.cookingGoal}回</div>
          <div className="gauge-container">
            <div className="gauge-background">
              <div
                className="gauge-fill cooking-gauge"
                style={{
                  width: `${Math.min(
                    (userData.cookingCount / goals.cookingGoal) * 100,
                    100
                  )}%`,
                }}
              ></div>
            </div>
            <div className="gauge-text">
              {((userData.cookingCount / goals.cookingGoal) * 100).toFixed(1)}
              %
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};