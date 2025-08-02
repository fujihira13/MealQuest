import React, { useState } from "react";
import { useAppStore, useUIStore } from "@/store/useAppStore";
import type { MealTime } from "@/types";

export const CookingRecordSection: React.FC = () => {
  const {
    cookingRecords,
    toggleCookingRecord,
    toggleCookingRecordWithDate,
    checkLevelUp,
    checkSavingsLevelUp,
    userData,
  } = useAppStore();

  const { showNotification } = useUIStore();

  const [selectedCookingDate, setSelectedCookingDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const handleCookingRecord = (meal: MealTime) => {
    const today = new Date().toISOString().split("T")[0];

    if (selectedCookingDate === today) {
      toggleCookingRecord(meal);
    } else {
      toggleCookingRecordWithDate(meal, selectedCookingDate);
    }

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

  const selectedDateCooking = cookingRecords.filter(
    (r) => r.date === selectedCookingDate
  );

  const isCookingRecordedForSelectedDate = (meal: MealTime) => {
    return selectedDateCooking.some((r) => r.meal === meal);
  };

  return (
    <div className="cooking-section">
      <h3>🍳 自炊記録</h3>

      <div className="cooking-date-selector">
        <label htmlFor="cooking-date">📅 記録日付:</label>
        <input
          type="date"
          id="cooking-date"
          value={selectedCookingDate}
          onChange={(e) => setSelectedCookingDate(e.target.value)}
          className="date-input"
        />
      </div>

      <div className="cooking-buttons">
        <button
          className={`cooking-btn ${
            isCookingRecordedForSelectedDate("morning") ? "active" : ""
          }`}
          onClick={() => handleCookingRecord("morning")}
        >
          朝
        </button>
        <button
          className={`cooking-btn ${
            isCookingRecordedForSelectedDate("lunch") ? "active" : ""
          }`}
          onClick={() => handleCookingRecord("lunch")}
        >
          昼
        </button>
        <button
          className={`cooking-btn ${
            isCookingRecordedForSelectedDate("dinner") ? "active" : ""
          }`}
          onClick={() => handleCookingRecord("dinner")}
        >
          夜
        </button>
      </div>
    </div>
  );
};
