import React from "react";
import { useAppStore, useUIStore } from "@/store/useAppStore";
import type { MealTime } from "@/types";

export const HomeTab: React.FC = () => {
  const {
    userData,
    goals,
    expenses,
    cookingRecords,
    toggleCookingRecord,
    addSavingsRecord,
    playGacha,
    recordNoWasteDay,
    recordSnackFreeDay,
    streaks,
    checkLevelUp,
    checkSavingsLevelUp,
  } = useAppStore();

  const { openInputModal, showNotification } = useUIStore();

  const handleCookingRecord = (meal: MealTime) => {
    toggleCookingRecord(meal);
    const leveledUp = checkLevelUp();
    const savingsLeveledUp = checkSavingsLevelUp();

    if (leveledUp) {
      showNotification(
        "success",
        `レベルアップ！ Lv.${userData.level}になりました！`
      );
    }
    if (savingsLeveledUp) {
      showNotification(
        "success",
        `節約レベルアップ！ 節約Lv.${userData.savingsLevel}になりました！`
      );
    }
  };

  const handleSavingsRecord = (amount: number) => {
    addSavingsRecord(amount);
    showNotification(
      "success",
      `節約成功！ ¥${amount.toLocaleString()}を節約貯金に追加しました！`
    );

    const leveledUp = checkLevelUp();
    const savingsLeveledUp = checkSavingsLevelUp();

    if (leveledUp) {
      showNotification(
        "success",
        `レベルアップ！ Lv.${userData.level}になりました！`
      );
    }
    if (savingsLeveledUp) {
      showNotification(
        "success",
        `節約レベルアップ！ 節約Lv.${userData.savingsLevel}になりました！`
      );
    }
  };

  const handleCustomSavings = () => {
    const amount = prompt("節約できた金額を入力してください（円）");
    if (amount && !isNaN(Number(amount)) && parseInt(amount) > 0) {
      handleSavingsRecord(parseInt(amount));
    }
  };

  const handleGacha = () => {
    if (userData.points < 100) {
      showNotification("error", "ポイントが不足しています（100pt必要）");
      return;
    }

    const result = playGacha();
    if (result) {
      const rarityText = {
        common: "⭐",
        rare: "⭐⭐",
        epic: "⭐⭐⭐",
        legendary: "⭐⭐⭐⭐",
      };
      showNotification(
        "success",
        `ガチャ結果: ${rarityText[result.rarity]} ${result.name} ${
          result.icon
        }を獲得！`
      );
    }
  };

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

  const remaining = Math.max(0, goals.allowanceGoal - userData.allowanceUsed);
  const gaugePercent = Math.max(0, (remaining / goals.allowanceGoal) * 100);

  // 今月の総支出を計算
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyExpenses = expenses.filter(expense => 
    expense.date.startsWith(currentMonth)
  );
  const totalMonthlyExpense = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // 今日の自炊記録をチェック
  const today = new Date().toISOString().split("T")[0];
  const todayCooking = cookingRecords.filter((r) => r.date === today);
  const isCookingRecorded = (meal: MealTime) => {
    return todayCooking.some((r) => r.meal === meal);
  };

  return (
    <section className="tab-content active">
      {/* 支出記録セクション - 最上部に移動 */}
      <div className="expense-priority-section">
        <h3>💰 今日の支出を記録する</h3>
        <div className="category-grid">
          <button
            className="category-btn category-supermarket"
            onClick={() => openInputModal("スーパー")}
          >
            🛒
            <br />
            スーパー
          </button>
          <button
            className="category-btn category-vending"
            onClick={() => openInputModal("自販機")}
          >
            🥤
            <br />
            自販機
          </button>
          <button
            className="category-btn category-convenience"
            onClick={() => openInputModal("コンビニ")}
          >
            🏪
            <br />
            コンビニ
          </button>
          <button
            className="category-btn category-restaurant"
            onClick={() => openInputModal("外食")}
          >
            🍽️
            <br />
            外食
          </button>
          <button
            className="category-btn category-drinking"
            onClick={() => openInputModal("飲み会")}
          >
            🍻
            <br />
            飲み会
          </button>
          <button
            className="category-btn category-date"
            onClick={() => openInputModal("デート")}
          >
            💕
            <br />
            交際費
          </button>
          <button
            className="category-btn category-other"
            onClick={() => openInputModal("その他")}
          >
            📝
            <br />
            その他
          </button>
        </div>
      </div>

      {/* 今月の支出状況 - 重要な情報を目立つ位置に */}
      <div className="expense-summary">
        <div className="total-expense">
          <span className="expense-label">今月の総支出</span>
          <span className="expense-amount">¥{totalMonthlyExpense.toLocaleString()}</span>
        </div>
      </div>

      {/* コンパクトなステータス表示 */}
      <div className="status-compact">
        <div className="status-item-small">
          <span className="status-icon">💰</span>
          <span className="status-text">{userData.points.toLocaleString()}pt</span>
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

      {/* 今月の消費許容ゲージ - コンパクト化 */}
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
            残り: ¥{remaining.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 今日の自炊記録と今日のチャレンジを並列配置 */}
      <div className="daily-activities-row">
        {/* 今日の自炊記録セクション */}
        <div className="cooking-section">
          <h3>🍳 今日の自炊記録</h3>
          <div className="cooking-buttons">
            <button
              className={`cooking-btn ${
                isCookingRecorded("morning") ? "active" : ""
              }`}
              onClick={() => handleCookingRecord("morning")}
            >
              朝
            </button>
            <button
              className={`cooking-btn ${
                isCookingRecorded("lunch") ? "active" : ""
              }`}
              onClick={() => handleCookingRecord("lunch")}
            >
              昼
            </button>
            <button
              className={`cooking-btn ${
                isCookingRecorded("dinner") ? "active" : ""
              }`}
              onClick={() => handleCookingRecord("dinner")}
            >
              夜
            </button>
          </div>
        </div>

        {/* 今日のチャレンジセクション */}
        <div className="daily-challenge-section">
          <h3>💪 今日のチャレンジ</h3>
          <div className="challenge-buttons">
            <button
              className={`challenge-btn ${
                streaks.lastNoWasteDate === new Date().toISOString().split("T")[0]
                  ? "completed"
                  : ""
              }`}
              onClick={handleNoWasteDay}
              disabled={
                streaks.lastNoWasteDate === new Date().toISOString().split("T")[0]
              }
            >
              {streaks.lastNoWasteDate === new Date().toISOString().split("T")[0]
                ? "✅ 無駄遣いなし達成！"
                : "🔥 無駄遣いなし"}
            </button>
            <button
              className={`challenge-btn ${
                streaks.lastSnackFreeDate ===
                new Date().toISOString().split("T")[0]
                  ? "completed"
                  : ""
              }`}
              onClick={handleSnackFreeDay}
              disabled={
                streaks.lastSnackFreeDate ===
                new Date().toISOString().split("T")[0]
              }
            >
              {streaks.lastSnackFreeDate ===
              new Date().toISOString().split("T")[0]
                ? "✅ お菓子我慢達成！"
                : "🍭 お菓子我慢"}
            </button>
          </div>
          <p className="challenge-note">毎日チャレンジして連続記録を伸ばそう！</p>
        </div>
      </div>

      {/* 簡潔な節約記録セクション */}
      <div className="quick-savings-section">
        <h3>💡 節約できました！</h3>
        <div className="savings-buttons">
          <button
            className="savings-quick-btn"
            onClick={() => handleSavingsRecord(800)}
          >
            🥗 外食を自炊に
            <br />
            ¥800節約
          </button>
          <button
            className="savings-quick-btn"
            onClick={() => handleSavingsRecord(300)}
          >
            🍵 カフェでお茶我慢
            <br />
            ¥300節約
          </button>
          <button className="savings-custom-btn" onClick={handleCustomSavings}>
            📝 その他
            <br />
            自由入力
          </button>
        </div>
      </div>

      {/* ガチャボタン */}
      <div className="gacha-section">
        <button
          className="gacha-btn"
          onClick={handleGacha}
          disabled={userData.points < 100}
        >
          <i className="fas fa-gift"></i> ガチャを引く (100pt)
        </button>
      </div>
    </section>
  );
};
