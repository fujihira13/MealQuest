import React, { useState } from "react";
import { useAppStore, useUIStore } from "@/store/useAppStore";
import type { GachaItem } from "@/types";

export const CollectionTab: React.FC = () => {
  const { collection, gachaItems, userData, playGacha } = useAppStore();

  const { showNotification } = useUIStore();

  const [selectedRarity, setSelectedRarity] = useState<string>("all");

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

  const filterByRarity = (items: GachaItem[]): GachaItem[] => {
    if (selectedRarity === "all") {
      return items;
    }
    return items.filter((item) => item.rarity === selectedRarity);
  };

  const handleRarityFilter = (rarity: string) => {
    setSelectedRarity(rarity);
  };

  const getRarityText = (rarity: string): string => {
    const rarityTexts: { [key: string]: string } = {
      common: "⭐ コモン",
      rare: "⭐⭐ レア",
      epic: "⭐⭐⭐ エピック",
      legendary: "⭐⭐⭐⭐ レジェンド",
    };
    return rarityTexts[rarity] || rarity;
  };

  const filteredItems = filterByRarity(gachaItems);
  const totalCollectionCount = collection.reduce(
    (sum, item) => sum + item.count,
    0
  );
  const uniqueItems = collection.length;
  const totalItems = gachaItems.length;
  const completionRate = Math.round((uniqueItems / totalItems) * 100);

  return (
    <section className="tab-content active">
      <div className="collection-header">
        <h3>🎁 ガチャリスト</h3>
        <div className="collection-stats">
          <span>所持アイテム: {totalCollectionCount}個</span>
          <span>コンプリート率: {completionRate}%</span>
        </div>
      </div>

      {/* レアリティ別フィルター */}
      <div className="rarity-filter">
        <button
          className={`filter-btn ${selectedRarity === "all" ? "active" : ""}`}
          onClick={() => handleRarityFilter("all")}
        >
          全て
        </button>
        <button
          className={`filter-btn ${
            selectedRarity === "common" ? "active" : ""
          }`}
          onClick={() => handleRarityFilter("common")}
        >
          ⭐ コモン
        </button>
        <button
          className={`filter-btn ${selectedRarity === "rare" ? "active" : ""}`}
          onClick={() => handleRarityFilter("rare")}
        >
          ⭐⭐ レア
        </button>
        <button
          className={`filter-btn ${selectedRarity === "epic" ? "active" : ""}`}
          onClick={() => handleRarityFilter("epic")}
        >
          ⭐⭐⭐ エピック
        </button>
        <button
          className={`filter-btn ${
            selectedRarity === "legendary" ? "active" : ""
          }`}
          onClick={() => handleRarityFilter("legendary")}
        >
          ⭐⭐⭐⭐ レジェンド
        </button>
      </div>

      {/* コレクションアイテム一覧 */}
      <div className="collection-grid">
        {filteredItems.length === 0 ? (
          <div className="collection-empty">
            <div className="collection-empty-icon">📦</div>
            <p>このレアリティのアイテムはありません</p>
          </div>
        ) : (
          filteredItems.map((gachaItem) => {
            const collectionItem = collection.find(
              (item) => item.id === gachaItem.id
            );
            const isObtained = !!collectionItem;

            return (
              <div
                key={gachaItem.id}
                className={`collection-item rarity-${gachaItem.rarity} ${
                  !isObtained ? "locked" : ""
                }`}
              >
                <div className="item-icon">
                  {isObtained ? gachaItem.icon : "❓"}
                </div>
                <div className="item-name">
                  {isObtained ? gachaItem.name : "???"}
                </div>
                <div className="item-rarity">
                  {getRarityText(gachaItem.rarity)}
                </div>
                <div className="item-count">
                  {isObtained ? `×${collectionItem.count}` : "未獲得"}
                </div>
                {isObtained && (
                  <div
                    className="item-description"
                    title={gachaItem.description}
                  >
                    {gachaItem.description}
                  </div>
                )}
              </div>
            );
          })
        )}
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
        <p className="gacha-info">
          ※ポイントが足りない場合は節約や自炊でポイントを貯めましょう！
        </p>
      </div>
    </section>
  );
};
