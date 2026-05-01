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
    if (leveledUp) showNotification("success", `レベルアップ！ Lv.${userData.level}になりました！`);
    if (savingsLeveledUp) showNotification("success", `節約レベルアップ！ 節約Lv.${userData.savingsLevel}になりました！`);
  };

  const isRecorded = (meal: MealTime) =>
    cookingRecords.some((r) => r.date === selectedCookingDate && r.meal === meal);

  const meals: { meal: MealTime; label: string }[] = [
    { meal: "morning", label: "朝" },
    { meal: "lunch",   label: "昼" },
    { meal: "dinner",  label: "夜" },
  ];

  return (
    <div className="cooking-section">
      <h3>🍳 自炊記録</h3>
      <div className="cooking-date-selector">
        <label htmlFor="cooking-date">記録日</label>
        <input
          type="date"
          id="cooking-date"
          value={selectedCookingDate}
          onChange={(e) => setSelectedCookingDate(e.target.value)}
          className="date-input"
          style={{ width: "100%", marginTop: "0.1rem" }}
        />
      </div>
      <div className="cooking-buttons">
        {meals.map(({ meal, label }) => (
          <button
            key={meal}
            className={`cooking-btn ${isRecorded(meal) ? "active" : ""}`}
            onClick={() => handleCookingRecord(meal)}
          >
            {isRecorded(meal) ? "✓" : label}
            <span className="cooking-pt-badge">+20pt</span>
          </button>
        ))}
      </div>
    </div>
  );
};
