import React, { useState } from "react";
import { useAppStore, useUIStore } from "@/store/useAppStore";

export const SettingsTab: React.FC = () => {
  const { goals, userData, updateGoals, updateMonthlyData, resetAllData } = useAppStore();
  const { showNotification, showConfirmDialog, setHelpOpen } = useUIStore();

  const [tempGoals, setTempGoals] = useState({
    monthlyExpenseGoal: goals.monthlyExpenseGoal,
    allowanceGoal:      goals.allowanceGoal,
    cookingGoal:        goals.cookingGoal,
    monthlySavingsGoal: goals.monthlySavingsGoal,
  });

  const [notifyDaily,   setNotifyDaily]   = useState(false);
  const [notifyMission, setNotifyMission] = useState(false);

  const handleTempGoalUpdate = (
    type: keyof typeof tempGoals,
    value: string
  ) => {
    if (value === "") { setTempGoals((p) => ({ ...p, [type]: 0 })); return; }
    const n = parseInt(value);
    if (isNaN(n) || n < 0) return;
    setTempGoals((p) => ({ ...p, [type]: n }));
  };

  const handleSaveGoals = () => {
    if (Object.values(tempGoals).some((v) => v <= 0)) {
      showNotification("error", "目標値は1以上の値を入力してください");
      return;
    }
    updateGoals("expense",  tempGoals.monthlyExpenseGoal);
    updateGoals("allowance", tempGoals.allowanceGoal);
    updateGoals("cooking",  tempGoals.cookingGoal);
    updateGoals("savings",  tempGoals.monthlySavingsGoal);
    updateMonthlyData();
    showNotification("success", "目標を保存しました");
  };

  const handleDataReset = () => {
    showConfirmDialog("全てのデータをリセットしますか？この操作は元に戻せません。", () => {
      resetAllData();
      showNotification("success", "データをリセットしました");
    });
  };

  const goalItems: { label: string; key: keyof typeof tempGoals }[] = [
    { label: "月の食費予算（円）",  key: "monthlyExpenseGoal" },
    { label: "消費許容額（円）",    key: "allowanceGoal"      },
    { label: "自炊回数目標（回）",  key: "cookingGoal"        },
    { label: "月間節約目標（円）",  key: "monthlySavingsGoal" },
  ];

  return (
    <section className="tab-content active">
      {/* アカウント */}
      <div className="settings-account-card">
        <div className="settings-avatar">🏆</div>
        <div className="settings-account-info">
          <h4>節約マスター</h4>
          <div className="settings-account-meta">
            <span>Lv.{userData.level}</span>
            <span>🪙 {userData.points.toLocaleString()}pt</span>
          </div>
        </div>
      </div>

      {/* 予算・目標設定 */}
      <div className="settings-section">
        <h3>予算・目標設定</h3>
        <div className="setting-items">
          {goalItems.map(({ label, key }) => (
            <div key={key} className="setting-item">
              <label>{label}</label>
              <input
                type="number"
                value={tempGoals[key] === 0 ? "" : tempGoals[key]}
                onChange={(e) => handleTempGoalUpdate(key, e.target.value)}
                placeholder={`例: ${key === "cookingGoal" ? 20 : 30000}`}
              />
            </div>
          ))}
        </div>
        <div className="goal-actions">
          <button className="save-btn" onClick={handleSaveGoals}>
            保存する
          </button>
        </div>
      </div>

      {/* 通知（UIのみ） */}
      <div className="settings-section">
        <h3>通知</h3>
        <div className="setting-items">
          <div className="setting-item">
            <label>デイリー通知</label>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notifyDaily}
                onChange={(e) => setNotifyDaily(e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
          <div className="setting-item">
            <label>ミッション通知</label>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notifyMission}
                onChange={(e) => setNotifyMission(e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>
      </div>

      {/* データ管理 */}
      <div className="settings-section">
        <h3>データ管理</h3>
        <div className="data-btn-row" style={{ marginBottom: "0.5rem" }}>
          <button
            className="data-export-btn"
            onClick={() => showNotification("info", "この機能は準備中です")}
          >
            📤 書き出す
          </button>
          <button
            className="data-import-btn"
            onClick={() => showNotification("info", "この機能は準備中です")}
          >
            📥 読み込む
          </button>
        </div>
      </div>

      {/* アプリ情報 */}
      <div className="settings-section">
        <h3>アプリ情報</h3>
        <div className="setting-items">
          <div className="app-info-row" onClick={() => setHelpOpen(true)}>
            <span className="app-info-label">ヘルプ</span>
            <span className="app-info-chevron">›</span>
          </div>
          <div className="app-info-row" style={{ cursor: "default" }}>
            <span className="app-info-label">バージョン</span>
            <span className="app-info-value">1.0.0</span>
          </div>
        </div>
      </div>

      {/* リセット */}
      <div style={{ padding: "0 0 0.5rem" }}>
        <button
          className="reset-btn"
          onClick={handleDataReset}
          style={{ width: "100%" }}
        >
          ⚠️ すべてのデータをリセット
        </button>
      </div>
    </section>
  );
};
