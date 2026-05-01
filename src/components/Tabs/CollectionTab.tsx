import React, { useState } from "react";
import { useAppStore, useUIStore } from "@/store/useAppStore";

const rarityFilters = [
  { key: "all",       label: "すべて" },
  { key: "unowned",   label: "未所持" },
  { key: "rare",      label: "⭐⭐ レア以上" },
] as const;

const rarityText: Record<string, string> = {
  common: "⭐", rare: "⭐⭐", epic: "⭐⭐⭐", legendary: "⭐⭐⭐⭐",
};

export const CollectionTab: React.FC = () => {
  const { collection, gachaItems, userData, playGacha } = useAppStore();
  const { showNotification } = useUIStore();
  const [filter, setFilter] = useState<"all" | "unowned" | "rare">("all");

  const handleGacha = () => {
    if (userData.points < 100) {
      showNotification("error", "ポイントが不足しています（100pt必要）");
      return;
    }
    const result = playGacha();
    if (result) {
      showNotification("success", `ガチャ結果: ${rarityText[result.rarity]} ${result.name} ${result.icon}を獲得！`);
    }
  };

  const uniqueItems = collection.length;
  const totalItems  = gachaItems.length;
  const currentPt   = userData.points % 100;
  const canPlay     = userData.points >= 100;

  const filteredItems = gachaItems.filter((item) => {
    const owned = collection.some((c) => c.id === item.id);
    if (filter === "unowned") return !owned;
    if (filter === "rare")    return item.rarity === "rare" || item.rarity === "epic" || item.rarity === "legendary";
    return true;
  });

  return (
    <section className="tab-content active">
      <div className="collection-header">
        <h3>🎁 コレクション</h3>
        <div className="collection-stats">
          <span className="collection-rate">
            収集率 <strong>{uniqueItems}/{totalItems}</strong>
          </span>
        </div>
      </div>

      {/* ガチャエリア */}
      <div className="gacha-top-section">
        <div className="gacha-top-title">節約ガチャ</div>
        <div className="gacha-top-subtitle">100ptで1回</div>
        <div className="gacha-top-progress-wrap">
          <div
            className="gacha-top-progress-fill"
            style={{ width: `${canPlay ? 100 : currentPt}%` }}
          />
        </div>
        <div className="gacha-top-progress-text">
          {canPlay ? userData.points : currentPt} / 100 pt
        </div>
        <button
          className="gacha-top-btn"
          onClick={handleGacha}
          disabled={!canPlay}
        >
          {canPlay ? "まわす 🎰" : `あと ${100 - currentPt}pt`}
        </button>
      </div>

      {/* フィルター */}
      <div className="rarity-filter">
        {rarityFilters.map(({ key, label }) => (
          <button
            key={key}
            className={`filter-btn ${filter === key ? "active" : ""}`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* アイテムグリッド */}
      <div className="collection-grid">
        {filteredItems.length === 0 ? (
          <div className="collection-empty" style={{ gridColumn: "1/-1" }}>
            <div className="collection-empty-icon">📦</div>
            <p>アイテムがありません</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const owned = collection.find((c) => c.id === item.id);
            return (
              <div
                key={item.id}
                className={`collection-item rarity-${item.rarity} ${!owned ? "locked" : ""}`}
              >
                <span className="item-icon">{owned ? item.icon : "❓"}</span>
                <div className="item-name">{owned ? item.name : "???"}</div>
                <div className="item-rarity">{rarityText[item.rarity]}</div>
                <div className="item-count">{owned ? `×${owned.count}` : "未獲得"}</div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
