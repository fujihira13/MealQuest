import React from "react";
import { useAppStore } from "@/store/useAppStore";

export const StatusCompact: React.FC = () => {
  const { userData, streaks } = useAppStore();

  return (
    <div className="status-compact">
      <div className="status-item-small">
        <span className="status-icon">💰</span>
        <span className="status-text">
          {userData.points.toLocaleString()}pt
        </span>
      </div>
      <div className="status-item-small">
        <span className="status-icon">🏆</span>
        <span className="status-text">Lv.{userData.level}</span>
      </div>
      <div className="status-item-small">
        <span className="status-icon">🔥</span>
        <span className="status-text">{streaks.noWasteStreak}日</span>
      </div>
    </div>
  );
};