import React from "react";
import { useAppStore, useUIStore } from "@/store/useAppStore";

export const GachaSection: React.FC = () => {
  const { userData, playGacha } = useAppStore();
  const { showNotification } = useUIStore();

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

  return (
    <div className="gacha-section">
      <button
        className="gacha-btn"
        onClick={handleGacha}
        disabled={userData.points < 100}
      >
        <i className="fas fa-gift"></i> ガチャを引く (100pt)
      </button>
    </div>
  );
};