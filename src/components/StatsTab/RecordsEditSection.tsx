import React, { useState } from "react";
import { useAppStore, useUIStore } from "@/store/useAppStore";
import type { ExpenseRecord } from "@/types";

export const RecordsEditSection: React.FC = () => {
  const {
    expenses,
    cookingRecords,
    deleteExpenseRecord,
    deleteCookingRecord,
  } = useAppStore();

  const {
    showNotification,
    showConfirmDialog,
    openInputModal,
    setEditingRecord,
  } = useUIStore();

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const handleDeleteExpense = (id: number) => {
    showConfirmDialog("この支出記録を削除しますか？", () => {
      deleteExpenseRecord(id);
      showNotification("success", "支出記録を削除しました");
    });
  };

  const handleDeleteCooking = (id: number) => {
    showConfirmDialog("この自炊記録を削除しますか？", () => {
      deleteCookingRecord(id);
      showNotification("success", "自炊記録を削除しました");
    });
  };

  const handleEditExpense = (expense: ExpenseRecord) => {
    setEditingRecord(expense);
    openInputModal(expense.category);
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      スーパー: "🛒",
      自販機: "🥤",
      コンビニ: "🏪",
      飲み会: "🍻",
      デート: "💕",
      その他: "📝",
    };
    return icons[category] || "📝";
  };

  const getMealName = (meal: string) => {
    const names: { [key: string]: string } = {
      morning: "朝",
      lunch: "昼",
      dinner: "夜",
      snack: "間食",
    };
    return names[meal] || meal;
  };

  const dayExpenses = expenses.filter((e) => e.date === selectedDate);
  const dayCooking = cookingRecords.filter((r) => r.date === selectedDate);

  return (
    <div className="records-section">
      <h3>📝 記録の編集・削除</h3>
      <div className="date-selector">
        <label htmlFor="record-date">日付を選択:</label>
        <input
          type="date"
          id="record-date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>
      <div className="record-list">
        {dayExpenses.length === 0 && dayCooking.length === 0 ? (
          <p className="no-records">この日の記録はありません</p>
        ) : (
          <>
            {dayExpenses.map((expense) => (
              <div key={expense.id} className="record-item expense-record">
                <div className="record-info">
                  <span className="record-category">
                    {getCategoryIcon(expense.category)} {expense.category}
                  </span>
                  <span className="record-amount">
                    ¥{expense.amount.toLocaleString()}
                  </span>
                  <span className="record-time">
                    {getMealName(expense.meal)}
                  </span>
                </div>
                <div className="record-actions">
                  <button
                    className="edit-btn"
                    onClick={() => handleEditExpense(expense)}
                  >
                    編集
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteExpense(expense.id)}
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}

            {dayCooking.map((cooking) => (
              <div key={cooking.id} className="record-item cooking-record">
                <div className="record-info">
                  <span className="record-category">👨‍🍳 自炊記録</span>
                  <span className="record-amount">
                    {getMealName(cooking.meal)}
                  </span>
                  <span className="record-time"></span>
                </div>
                <div className="record-actions">
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteCooking(cooking.id)}
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};