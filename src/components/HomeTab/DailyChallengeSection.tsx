import React from "react";
import { useAppStore, useUIStore } from "@/store/useAppStore";

export const DailyChallengeSection: React.FC = () => {
  const { streaks, recordNoWasteDay, recordSnackFreeDay } = useAppStore();
  const { showNotification } = useUIStore();

  const handleNoWasteDay = () => {
    recordNoWasteDay();
    showNotification(
      "success",
      `🔥 無駄遣いなし ${streaks.noWasteStreak + 1}日連続！素晴らしい！`
    );
  };

  const handleSnackFreeDay = () => {
    recordSnackFreeDay();
    showNotification(
      "success",
      `🍭 お菓子我慢 ${streaks.snackFreeStreak + 1}日連続！頑張ってる！`
    );
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="daily-challenge-section">
      <h3>💪 今日のチャレンジ</h3>
      <div className="challenge-buttons">
        <button
          className={`challenge-btn ${
            streaks.lastNoWasteDate === today ? "completed" : ""
          }`}
          onClick={handleNoWasteDay}
          disabled={streaks.lastNoWasteDate === today}
        >
          {streaks.lastNoWasteDate === today
            ? "✅ 無駄遣いなし達成！"
            : "🔥 無駄遣いなし"}
        </button>
        <button
          className={`challenge-btn ${
            streaks.lastSnackFreeDate === today ? "completed" : ""
          }`}
          onClick={handleSnackFreeDay}
          disabled={streaks.lastSnackFreeDate === today}
        >
          {streaks.lastSnackFreeDate === today
            ? "✅ お菓子我慢達成！"
            : "🍭 お菓子我慢"}
        </button>
      </div>
      <p className="challenge-note">
        毎日チャレンジして連続記録を伸ばそう！
      </p>
    </div>
  );
};