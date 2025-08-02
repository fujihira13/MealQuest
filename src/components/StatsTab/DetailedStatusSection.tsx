import React from "react";
import { useAppStore } from "@/store/useAppStore";

export const DetailedStatusSection: React.FC = () => {
  const { userData, savingsEquivalents, streaks } = useAppStore();

  const getSavingsEquivalent = () => {
    if (userData.totalSavings === 0) {
      return "節約を始めて、欲しい物を手に入れよう！";
    }

    let bestMatch = null;
    for (let i = savingsEquivalents.length - 1; i >= 0; i--) {
      if (userData.totalSavings >= savingsEquivalents[i].amount) {
        bestMatch = savingsEquivalents[i];
        break;
      }
    }

    if (bestMatch) {
      const count = Math.floor(userData.totalSavings / bestMatch.amount);
      return count === 1
        ? `${bestMatch.icon} ${bestMatch.item}が買えます！`
        : `${bestMatch.icon} ${bestMatch.item}が${count}個買えます！`;
    } else {
      const cheapest = savingsEquivalents[0];
      const remaining = cheapest.amount - userData.totalSavings;
      return `あと¥${remaining.toLocaleString()}で${cheapest.icon}${
        cheapest.item
      }が買えます！`;
    }
  };

  const pointsToNext = userData.level * 100 - userData.points;
  const progressPercent = (userData.points / (userData.level * 100)) * 100;

  return (
    <div className="detailed-status-section">
      <h3>💰 詳細ステータス</h3>

      <div className="savings-detail-cards">
        <div className="savings-card total-savings">
          <div className="savings-icon">💰</div>
          <div className="savings-info">
            <h4>合計貯金</h4>
            <div className="savings-amount">
              ¥{userData.totalSavings.toLocaleString()}
            </div>
          </div>
        </div>
        <div className="savings-card monthly-savings">
          <div className="savings-icon">📅</div>
          <div className="savings-info">
            <h4>今月の貯金</h4>
            <div className="savings-amount">
              ¥{userData.monthlySavings.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="savings-equivalent-section">
        <h4>🛍️ 節約で買える物</h4>
        <div className="savings-equivalent-display">
          <span>{getSavingsEquivalent()}</span>
        </div>
      </div>

      <div className="level-detail-section">
        <h4>🏆 レベル進捗</h4>
        <div className="level-cards">
          <div className="level-card">
            <div className="level-info">
              <span className="level-label">現在レベル</span>
              <span className="level-value">Lv.{userData.level}</span>
            </div>
            <div className="level-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${Math.min(100, progressPercent)}%` }}
                ></div>
              </div>
              <div className="progress-text">
                次のレベルまで: {Math.max(0, pointsToNext).toLocaleString()}pt
              </div>
            </div>
          </div>
          <div className="level-card">
            <div className="level-info">
              <span className="level-label">節約レベル</span>
              <span className="level-value">
                節約Lv.{userData.savingsLevel}
              </span>
            </div>
            <div className="level-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill savings-progress"
                  style={{
                    width: `${Math.min(
                      100,
                      (userData.totalSavings /
                        (userData.savingsLevel * 1000)) *
                        100
                    )}%`,
                  }}
                ></div>
              </div>
              <div className="progress-text">
                次まで: ¥
                {Math.max(
                  0,
                  userData.savingsLevel * 1000 - userData.totalSavings
                ).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="detailed-streaks-section">
        <h4>🔥 連続記録詳細</h4>
        <div className="streak-detail-cards">
          <div className="streak-card">
            <div className="streak-icon">🔥</div>
            <div className="streak-info">
              <h5>無駄遣いなし</h5>
              <div className="streak-current">
                {streaks.noWasteStreak}日連続
              </div>
              <div className="streak-best">
                最高記録: {streaks.bestNoWasteStreak}日
              </div>
            </div>
          </div>
          <div className="streak-card">
            <div className="streak-icon">🍭</div>
            <div className="streak-info">
              <h5>お菓子我慢</h5>
              <div className="streak-current">
                {streaks.snackFreeStreak}日連続
              </div>
              <div className="streak-best">
                最高記録: {streaks.bestSnackFreeStreak}日
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};