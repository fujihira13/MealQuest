import React from "react";
import { useAppStore, useUIStore } from "@/store/useAppStore";
import type { MealTime } from "@/types";

export const CookingRecordSection: React.FC = () => {
  const {
    cookingRecords,
    toggleCookingRecord,
    checkLevelUp,
    checkSavingsLevelUp,
    userData,
  } = useAppStore();

  const { showNotification } = useUIStore();

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

  const today = new Date().toISOString().split("T")[0];
  const todayCooking = cookingRecords.filter((r) => r.date === today);

  const isCookingRecordedToday = (meal: MealTime) => {
    return todayCooking.some((r) => r.meal === meal);
  };

  return (
    <div className="cooking-section">
      <h3>🍳 自炊記録</h3>

      <div className="cooking-buttons">
        <button
          className={`cooking-btn ${
            isCookingRecordedToday("morning") ? "active" : ""
          }`}
          onClick={() => handleCookingRecord("morning")}
        >
          朝
        </button>
        <button
          className={`cooking-btn ${
            isCookingRecordedToday("lunch") ? "active" : ""
          }`}
          onClick={() => handleCookingRecord("lunch")}
        >
          昼
        </button>
        <button
          className={`cooking-btn ${
            isCookingRecordedToday("dinner") ? "active" : ""
          }`}
          onClick={() => handleCookingRecord("dinner")}
        >
          夜
        </button>
      </div>
    </div>
  );
};
