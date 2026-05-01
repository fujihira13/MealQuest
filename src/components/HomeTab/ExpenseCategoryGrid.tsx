import React from "react";
import { useUIStore } from "@/store/useAppStore";

const categories = [
  { key: "スーパー",  cls: "category-supermarket", icon: "🛒" },
  { key: "自販機",   cls: "category-vending",      icon: "🥤" },
  { key: "コンビニ", cls: "category-convenience",  icon: "🏪" },
  { key: "外食",    cls: "category-restaurant",   icon: "🍽️" },
  { key: "飲み会",   cls: "category-drinking",     icon: "🍻" },
  { key: "デート",   cls: "category-date",         icon: "💕" },
  { key: "その他",   cls: "category-other",        icon: "📝" },
] as const;

export const ExpenseCategoryGrid: React.FC = () => {
  const { openInputModal, setCurrentTab } = useUIStore();

  return (
    <div className="expense-priority-section">
      <div className="card-header">
        <span className="card-title">カテゴリー入力</span>
        <span className="card-link" onClick={() => setCurrentTab("stats")}>
          履歴から入力 ›
        </span>
      </div>
      <div className="category-grid">
        {categories.map(({ key, cls, icon }) => (
          <button
            key={key}
            className={`category-btn ${cls}`}
            onClick={() => openInputModal(key)}
          >
            <span className="category-icon-circle">{icon}</span>
            {key}
          </button>
        ))}
      </div>
      <button
        className="record-expense-btn"
        onClick={() => openInputModal("スーパー")}
      >
        食費を記録する ›
      </button>
    </div>
  );
};
