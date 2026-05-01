import React from "react";
import { useAppStore, useUIStore } from "@/store/useAppStore";

export const GachaSection: React.FC = () => {
  const { userData, playGacha } = useAppStore();
  const { showNotification, setCurrentTab } = useUIStore();

  const currentPt = userData.points % 100;
  const progressPct = currentPt;
  const canPlay = userData.points >= 100;

  const handleGacha = () => {
    if (!canPlay) {
      showNotification("error", "ポイントが不足しています（100pt必要）");
      return;
    }
    const result = playGacha();
    if (result) {
      const rarityText: Record<string, string> = {
        common: "⭐", rare: "⭐⭐", epic: "⭐⭐⭐", legendary: "⭐⭐⭐⭐",
      };
      showNotification("success", `ガチャ結果: ${rarityText[result.rarity]} ${result.name} ${result.icon}を獲得！`);
    }
  };

  return (
    <div className="gacha-section">
      <div className="gacha-section-inner">
        <div className="gacha-left">
          <div className="gacha-title">
            {canPlay ? "ガチャが引けます！" : `ガチャまであと ${100 - currentPt}pt`}
          </div>
          <div className="gacha-progress-bar-wrap">
            <div
              className="gacha-progress-bar-fill"
              style={{ width: `${canPlay ? 100 : progressPct}%` }}
            />
          </div>
          <div className="gacha-progress-text">
            {canPlay ? userData.points : currentPt} / 100 pt
          </div>
        </div>
        <div className="gacha-emoji">🎰</div>
      </div>
      {canPlay ? (
        <button className="gacha-btn" onClick={handleGacha}>
          まわす（100pt）
        </button>
      ) : (
        <button className="gacha-check-btn" onClick={() => setCurrentTab("missions")}>
          報酬をチェック ›
        </button>
      )}
    </div>
  );
};
