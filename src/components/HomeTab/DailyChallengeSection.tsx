import React from "react";
import { useAppStore, useUIStore } from "@/store/useAppStore";

export const DailyChallengeSection: React.FC = () => {
  const { streaks, recordNoWasteDay, recordSnackFreeDay } = useAppStore();
  const { showNotification } = useUIStore();

  const today = new Date().toISOString().split("T")[0];

  const handleNoWasteDay = () => {
    recordNoWasteDay();
    showNotification("success", `🔥 無駄遣いなし ${streaks.noWasteStreak + 1}日連続！`);
  };

  const handleSnackFreeDay = () => {
    recordSnackFreeDay();
    showNotification("success", `🍭 お菓子我慢 ${streaks.snackFreeStreak + 1}日連続！`);
  };

  const noWasteDone  = streaks.lastNoWasteDate  === today;
  const snackFreeDone = streaks.lastSnackFreeDate === today;

  return (
    <div className="daily-challenge-section">
      <h3>🚩 今日のミッション</h3>
      <div className="challenge-buttons">
        <button
          className={`challenge-btn ${noWasteDone ? "completed" : ""}`}
          onClick={handleNoWasteDay}
          disabled={noWasteDone}
        >
          {noWasteDone ? "✓ 無駄遣いなし" : "🔥 無駄遣いなし"}
        </button>
        <button
          className={`challenge-btn ${snackFreeDone ? "completed" : ""}`}
          onClick={handleSnackFreeDay}
          disabled={snackFreeDone}
        >
          {snackFreeDone ? "✓ お菓子我慢" : "🍭 お菓子我慢"}
        </button>
      </div>
      <p className="challenge-note">連続記録を伸ばそう！</p>
    </div>
  );
};
