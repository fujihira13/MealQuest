import React from "react";
import { useAppStore, useUIStore } from "@/store/useAppStore";

export const SettingsTab: React.FC = () => {
  const { goals, updateGoals, updateMonthlyData, resetAllData } = useAppStore();

  const { showNotification, showConfirmDialog } = useUIStore();

  const handleGoalUpdate = (
    type: "expense" | "allowance" | "cooking",
    value: string
  ) => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue <= 0) return;

    updateGoals(type, numValue);
    updateMonthlyData();
    showNotification("success", "目標を更新しました");
  };

  const handleDataReset = () => {
    showConfirmDialog(
      "全てのデータをリセットしますか？この操作は元に戻せません。",
      () => {
        resetAllData();
        showNotification("success", "データをリセットしました");
      }
    );
  };

  return (
    <section className="tab-content active">
      {/* 月間目標設定 */}
      <div className="settings-section">
        <h3>📊 月間目標設定</h3>
        <div className="setting-items">
          <div className="setting-item">
            <label>食費目標 (円)</label>
            <input
              type="number"
              defaultValue={goals.monthlyExpenseGoal}
              onChange={(e) => handleGoalUpdate("expense", e.target.value)}
            />
          </div>
          <div className="setting-item">
            <label>消費許容額 (円)</label>
            <input
              type="number"
              defaultValue={goals.allowanceGoal}
              onChange={(e) => handleGoalUpdate("allowance", e.target.value)}
            />
          </div>
          <div className="setting-item">
            <label>自炊回数目標 (回)</label>
            <input
              type="number"
              defaultValue={goals.cookingGoal}
              onChange={(e) => handleGoalUpdate("cooking", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* データ管理 */}
      <div className="data-management-section">
        <h3>🗂️ データ管理</h3>
        <div className="data-actions">
          <button className="reset-btn" onClick={handleDataReset}>
            <i className="fas fa-trash-alt"></i>
            全データをリセット
          </button>
          <p className="reset-warning">
            ⚠️
            この操作は全ての記録、進捗、設定を削除します。元に戻すことはできません。
          </p>
        </div>
      </div>

      {/* 使い方ガイド */}
      <div className="guide-section">
        <h3>📖 使い方ガイド</h3>
        <div className="guide-items">
          <div className="guide-item">
            <h4>💰 支出記録</h4>
            <p>ホーム画面でカテゴリボタンを押して日々の支出を記録しましょう</p>
          </div>
          <div className="guide-item">
            <h4>🍳 自炊記録</h4>
            <p>
              自炊をした時間帯（朝・昼・夜）をタップしてポイントを獲得しましょう
            </p>
          </div>
          <div className="guide-item">
            <h4>💎 節約記録</h4>
            <p>
              誘惑に負けずに節約できた時は節約記録で貯金額を積み上げましょう
            </p>
          </div>
          <div className="guide-item">
            <h4>🎯 クエスト</h4>
            <p>
              デイリー・ウィークリークエストを達成してポイントを稼ぎましょう
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
