import React from "react";
import { useAppStore } from "@/store/useAppStore";

export const BudgetGauge: React.FC = () => {
  const { userData, goals } = useAppStore();

  const remaining = Math.max(0, goals.allowanceGoal - userData.allowanceUsed);
  const gaugePercent = Math.max(0, (remaining / goals.allowanceGoal) * 100);

  return (
    <div className="gauge-section-compact">
      <h4>📊 消費許容額</h4>
      <div className="gauge-container">
        <div className="gauge-bar">
          <div
            className="gauge-fill"
            style={{ width: `${gaugePercent}%` }}
          ></div>
        </div>
        <div className="gauge-text">
          ¥{userData.allowanceUsed.toLocaleString()}/¥
          {goals.allowanceGoal.toLocaleString()}
        </div>
      </div>
    </div>
  );
};
