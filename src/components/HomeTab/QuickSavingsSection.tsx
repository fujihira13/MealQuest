import React from "react";
import { useAppStore, useUIStore } from "@/store/useAppStore";

export const QuickSavingsSection: React.FC = () => {
  const { addSavingsRecord, checkLevelUp, checkSavingsLevelUp, userData } = useAppStore();
  const { showNotification } = useUIStore();

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

  return (
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
  );
};