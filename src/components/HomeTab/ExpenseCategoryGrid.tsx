import React from "react";
import { useUIStore } from "@/store/useAppStore";

export const ExpenseCategoryGrid: React.FC = () => {
  const { openInputModal } = useUIStore();

  return (
    <div className="expense-priority-section">
      <h3>💰 今日の支出を記録する</h3>
      <div className="category-grid">
        <button
          className="category-btn category-supermarket"
          onClick={() => openInputModal("スーパー")}
        >
          🛒
          <br />
          スーパー
        </button>
        <button
          className="category-btn category-vending"
          onClick={() => openInputModal("自販機")}
        >
          🥤
          <br />
          自販機
        </button>
        <button
          className="category-btn category-convenience"
          onClick={() => openInputModal("コンビニ")}
        >
          🏪
          <br />
          コンビニ
        </button>
        <button
          className="category-btn category-restaurant"
          onClick={() => openInputModal("外食")}
        >
          🍽️
          <br />
          外食
        </button>
        <button
          className="category-btn category-drinking"
          onClick={() => openInputModal("飲み会")}
        >
          🍻
          <br />
          飲み会
        </button>
        <button
          className="category-btn category-date"
          onClick={() => openInputModal("デート")}
        >
          💕
          <br />
          交際費
        </button>
        <button
          className="category-btn category-other"
          onClick={() => openInputModal("その他")}
        >
          📝
          <br />
          その他
        </button>
      </div>
    </div>
  );
};