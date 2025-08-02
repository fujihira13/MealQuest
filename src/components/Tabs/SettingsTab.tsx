import React, { useState } from "react";
import { useAppStore, useUIStore } from "@/store/useAppStore";

export const SettingsTab: React.FC = () => {
  const { goals, updateGoals, updateMonthlyData, resetAllData } = useAppStore();

  const { showNotification, showConfirmDialog } = useUIStore();

  // 一時的な入力値を保持するための状態（保存前の値）
  const [tempGoals, setTempGoals] = useState({
    monthlyExpenseGoal: goals.monthlyExpenseGoal,
    allowanceGoal: goals.allowanceGoal,
    cookingGoal: goals.cookingGoal,
  });

  // 入力値が変更された時は一時的な状態のみを更新
  const handleTempGoalUpdate = (
    type: "monthlyExpenseGoal" | "allowanceGoal" | "cookingGoal",
    value: string
  ) => {
    const numValue = parseInt(value);
    // 数値チェック：無効な値の場合は更新しない
    if (isNaN(numValue) || numValue < 0) return;

    // 一時的な状態を更新
    setTempGoals((prev) => ({
      ...prev,
      [type]: numValue,
    }));
  };

  // 保存ボタンを押した時に実際にストアを更新
  const handleSaveGoals = () => {
    // 各目標値が有効かチェック
    if (
      tempGoals.monthlyExpenseGoal <= 0 ||
      tempGoals.allowanceGoal <= 0 ||
      tempGoals.cookingGoal <= 0
    ) {
      showNotification("error", "目標値は1以上の値を入力してください");
      return;
    }

    // 実際にストアの値を更新
    updateGoals("expense", tempGoals.monthlyExpenseGoal);
    updateGoals("allowance", tempGoals.allowanceGoal);
    updateGoals("cooking", tempGoals.cookingGoal);

    // 月間データも更新
    updateMonthlyData();

    // 成功メッセージを表示
    showNotification("success", "目標を保存しました");
  };

  // キャンセルボタン：一時的な状態を元の値に戻す
  const handleCancelGoals = () => {
    setTempGoals({
      monthlyExpenseGoal: goals.monthlyExpenseGoal,
      allowanceGoal: goals.allowanceGoal,
      cookingGoal: goals.cookingGoal,
    });
    showNotification("info", "入力をキャンセルしました");
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
              value={tempGoals.monthlyExpenseGoal}
              onChange={(e) =>
                handleTempGoalUpdate("monthlyExpenseGoal", e.target.value)
              }
              placeholder="例: 30000"
            />
          </div>
          <div className="setting-item">
            <label>消費許容額 (円)</label>
            <input
              type="number"
              value={tempGoals.allowanceGoal}
              onChange={(e) =>
                handleTempGoalUpdate("allowanceGoal", e.target.value)
              }
              placeholder="例: 5000"
            />
          </div>
          <div className="setting-item">
            <label>自炊回数目標 (回)</label>
            <input
              type="number"
              value={tempGoals.cookingGoal}
              onChange={(e) =>
                handleTempGoalUpdate("cookingGoal", e.target.value)
              }
              placeholder="例: 20"
            />
          </div>
        </div>

        {/* 保存・キャンセルボタン */}
        <div className="goal-actions">
          <button className="save-btn" onClick={handleSaveGoals}>
            <i className="fas fa-save"></i>
            目標を保存
          </button>
          <button className="cancel-btn" onClick={handleCancelGoals}>
            <i className="fas fa-undo"></i>
            キャンセル
          </button>
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
    </section>
  );
};
