import React, { useState, useRef, useEffect } from "react";
import { useAppStore, useUIStore } from "@/store/useAppStore";
import { Chart, registerables } from "chart.js";
import type { ExpenseRecord } from "@/types";

Chart.register(...registerables);

export const StatsTab: React.FC = () => {
  const {
    userData,
    goals,
    expenses,
    cookingRecords,
    savingsRecords,
    deleteExpenseRecord,
    deleteCookingRecord,
    savingsEquivalents,
    streaks,
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

  // Chart refs
  const expenseChartRef = useRef<HTMLCanvasElement>(null);
  const categoryChartRef = useRef<HTMLCanvasElement>(null);
  const cookingChartRef = useRef<HTMLCanvasElement>(null);
  const savingsChartRef = useRef<HTMLCanvasElement>(null);

  // Chart instances
  const chartInstances = useRef<{ [key: string]: Chart }>({});

  useEffect(() => {
    renderCharts();
    return () => {
      // Cleanup charts
      Object.values(chartInstances.current).forEach((chart) => chart.destroy());
    };
  }, [expenses, cookingRecords, savingsRecords]);

  // 節約額で買える物を計算
  const getSavingsEquivalent = () => {
    const totalSavings = userData.totalSavings;

    if (totalSavings === 0) {
      return "節約を始めて、欲しい物を手に入れよう！";
    }

    let bestMatch = null;
    for (let i = savingsEquivalents.length - 1; i >= 0; i--) {
      if (totalSavings >= savingsEquivalents[i].amount) {
        bestMatch = savingsEquivalents[i];
        break;
      }
    }

    if (bestMatch) {
      const count = Math.floor(totalSavings / bestMatch.amount);
      return count === 1
        ? `${bestMatch.icon} ${bestMatch.item}が買えます！`
        : `${bestMatch.icon} ${bestMatch.item}が${count}個買えます！`;
    } else {
      const cheapest = savingsEquivalents[0];
      const remaining = cheapest.amount - totalSavings;
      return `あと¥${remaining.toLocaleString()}で${cheapest.icon}${
        cheapest.item
      }が買えます！`;
    }
  };

  const renderCharts = () => {
    // Cleanup existing charts
    Object.values(chartInstances.current).forEach((chart) => chart.destroy());
    chartInstances.current = {};

    renderExpenseChart();
    renderCategoryChart();
    renderCookingChart();
    renderSavingsChart();
  };

  const renderExpenseChart = () => {
    if (!expenseChartRef.current) return;

    const ctx = expenseChartRef.current.getContext("2d");
    if (!ctx) return;

    // 過去30日のデータを生成
    const dates = [];
    const expenseData = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      dates.push(date.getDate() + "日");

      // その日の支出合計を計算
      const dayExpense = expenses
        .filter((expense) => expense.date === dateStr)
        .reduce((sum, expense) => sum + expense.amount, 0);
      expenseData.push(dayExpense);
    }

    chartInstances.current.expense = new Chart(ctx, {
      type: "line",
      data: {
        labels: dates,
        datasets: [
          {
            label: "日次支出 (円)",
            data: expenseData,
            borderColor: "#4a90e2",
            backgroundColor: "rgba(74, 144, 226, 0.1)",
            borderWidth: 2,
            fill: true,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return "¥" + value.toLocaleString();
              },
            },
          },
          x: {
            display: true,
          },
        },
        plugins: {
          legend: {
            display: true,
            position: "top",
          },
        },
      },
    });
  };

  const renderCategoryChart = () => {
    if (!categoryChartRef.current) return;

    const ctx = categoryChartRef.current.getContext("2d");
    if (!ctx) return;

    // カテゴリ別支出を集計
    const categoryData: { [key: string]: number } = {};
    const categoryColors: { [key: string]: string } = {
      スーパー: "#4CAF50",
      自販機: "#FF9800",
      コンビニ: "#2196F3",
      飲み会: "#E91E63",
      デート: "#9C27B0",
      その他: "#607D8B",
    };

    expenses.forEach((expense) => {
      if (!categoryData[expense.category]) {
        categoryData[expense.category] = 0;
      }
      categoryData[expense.category] += expense.amount;
    });

    const labels = Object.keys(categoryData);
    const data = Object.values(categoryData);
    const colors = labels.map((label) => categoryColors[label] || "#757575");

    chartInstances.current.category = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: colors,
            borderWidth: 2,
            borderColor: "#ffffff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const total = context.dataset.data.reduce(
                  (a: number, b: number) => a + b,
                  0
                );
                const percentage = ((context.parsed / total) * 100).toFixed(1);
                return (
                  context.label +
                  ": ¥" +
                  context.parsed.toLocaleString() +
                  " (" +
                  percentage +
                  "%)"
                );
              },
            },
          },
        },
      },
    });
  };

  const renderCookingChart = () => {
    if (!cookingChartRef.current) return;

    const ctx = cookingChartRef.current.getContext("2d");
    if (!ctx) return;

    // 過去30日の自炊回数を集計
    const dates = [];
    const cookingCounts = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      dates.push(date.getDate() + "日");

      // その日の自炊回数を計算
      const dayCount = cookingRecords.filter(
        (record) => record.date === dateStr
      ).length;
      cookingCounts.push(dayCount);
    }

    chartInstances.current.cooking = new Chart(ctx, {
      type: "bar",
      data: {
        labels: dates,
        datasets: [
          {
            label: "自炊回数",
            data: cookingCounts,
            backgroundColor: "#4CAF50",
            borderColor: "#388E3C",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 3,
            ticks: {
              stepSize: 1,
            },
          },
          x: {
            display: true,
          },
        },
        plugins: {
          legend: {
            display: true,
            position: "top",
          },
        },
      },
    });
  };

  const renderSavingsChart = () => {
    if (!savingsChartRef.current) return;

    const ctx = savingsChartRef.current.getContext("2d");
    if (!ctx) return;

    // 過去30日の節約額推移を計算
    const dates = [];
    const cumulativeSavings = [];
    const today = new Date();
    let runningTotal = 0;

    // 30日前からの累積
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      dates.push(date.getDate() + "日");

      // その日の節約額を加算
      const daySavings = savingsRecords
        .filter((record) => record.date === dateStr)
        .reduce((sum, record) => sum + record.amount, 0);

      runningTotal += daySavings;
      cumulativeSavings.push(runningTotal);
    }

    chartInstances.current.savings = new Chart(ctx, {
      type: "line",
      data: {
        labels: dates,
        datasets: [
          {
            label: "累積節約額 (円)",
            data: cumulativeSavings,
            borderColor: "#00b894",
            backgroundColor: "rgba(0, 184, 148, 0.1)",
            borderWidth: 3,
            fill: true,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return "¥" + value.toLocaleString();
              },
            },
          },
          x: {
            display: true,
          },
        },
        plugins: {
          legend: {
            display: true,
            position: "top",
          },
        },
      },
    });
  };

  const loadRecordsForDate = () => {
    const dayExpenses = expenses.filter((e) => e.date === selectedDate);
    const dayCooking = cookingRecords.filter((r) => r.date === selectedDate);
    return { dayExpenses, dayCooking };
  };

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

  const { dayExpenses, dayCooking } = loadRecordsForDate();

  // レベル進捗計算
  const pointsToNext = userData.level * 100 - userData.points;
  const progressPercent = (userData.points / (userData.level * 100)) * 100;

  return (
    <section className="tab-content active">
      {/* 詳細ステータス情報 */}
      <div className="detailed-status-section">
        <h3>💰 詳細ステータス</h3>

        {/* 貯金情報 */}
        <div className="savings-detail-cards">
          <div className="savings-card total-savings">
            <div className="savings-icon">💰</div>
            <div className="savings-info">
              <h4>合計貯金</h4>
              <div className="savings-amount">
                ¥{userData.totalSavings.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="savings-card monthly-savings">
            <div className="savings-icon">📅</div>
            <div className="savings-info">
              <h4>今月の貯金</h4>
              <div className="savings-amount">
                ¥{userData.monthlySavings.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* 節約で買える物 */}
        <div className="savings-equivalent-section">
          <h4>🛍️ 節約で買える物</h4>
          <div className="savings-equivalent-display">
            <span>{getSavingsEquivalent()}</span>
          </div>
        </div>

        {/* レベル進捗詳細 */}
        <div className="level-detail-section">
          <h4>🏆 レベル進捗</h4>
          <div className="level-cards">
            <div className="level-card">
              <div className="level-info">
                <span className="level-label">現在レベル</span>
                <span className="level-value">Lv.{userData.level}</span>
              </div>
              <div className="level-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${Math.min(100, progressPercent)}%` }}
                  ></div>
                </div>
                <div className="progress-text">
                  次のレベルまで: {Math.max(0, pointsToNext).toLocaleString()}pt
                </div>
              </div>
            </div>
            <div className="level-card">
              <div className="level-info">
                <span className="level-label">節約レベル</span>
                <span className="level-value">
                  節約Lv.{userData.savingsLevel}
                </span>
              </div>
              <div className="level-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill savings-progress"
                    style={{
                      width: `${Math.min(
                        100,
                        (userData.totalSavings /
                          (userData.savingsLevel * 1000)) *
                          100
                      )}%`,
                    }}
                  ></div>
                </div>
                <div className="progress-text">
                  次まで: ¥
                  {Math.max(
                    0,
                    userData.savingsLevel * 1000 - userData.totalSavings
                  ).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 詳細な連続記録 */}
        <div className="detailed-streaks-section">
          <h4>🔥 連続記録詳細</h4>
          <div className="streak-detail-cards">
            <div className="streak-card">
              <div className="streak-icon">🔥</div>
              <div className="streak-info">
                <h5>無駄遣いなし</h5>
                <div className="streak-current">
                  {streaks.noWasteStreak}日連続
                </div>
                <div className="streak-best">
                  最高記録: {streaks.bestNoWasteStreak}日
                </div>
              </div>
            </div>
            <div className="streak-card">
              <div className="streak-icon">🍭</div>
              <div className="streak-info">
                <h5>お菓子我慢</h5>
                <div className="streak-current">
                  {streaks.snackFreeStreak}日連続
                </div>
                <div className="streak-best">
                  最高記録: {streaks.bestSnackFreeStreak}日
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 月間統計 */}
      <div className="stats-overview">
        <h3>📊 今月の統計</h3>
        <div className="stats-cards">
          <div className="stat-card">
            <h4>総支出</h4>
            <div className="stat-value">
              ¥{userData.monthlyExpense.toLocaleString()}
            </div>
            <div className="stat-detail">
              目標: ¥{goals.monthlyExpenseGoal.toLocaleString()}
            </div>
            <div className="gauge-container">
              <div className="gauge-background">
                <div
                  className="gauge-fill expense-gauge"
                  style={{
                    width: `${Math.min(
                      (userData.monthlyExpense / goals.monthlyExpenseGoal) *
                        100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
              <div className="gauge-text">
                {(
                  (userData.monthlyExpense / goals.monthlyExpenseGoal) *
                  100
                ).toFixed(1)}
                %
              </div>
            </div>
          </div>
          <div className="stat-card">
            <h4>節約額</h4>
            <div className="stat-value">
              ¥{userData.totalSavings.toLocaleString()}
            </div>
            <div className="stat-detail">
              今月: ¥{userData.monthlySavings.toLocaleString()}
            </div>
            <div className="gauge-container">
              <div className="gauge-background">
                <div
                  className="gauge-fill savings-gauge"
                  style={{
                    width: `${Math.min(
                      (userData.monthlySavings / 10000) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
              <div className="gauge-text">
                ¥{userData.monthlySavings.toLocaleString()}
              </div>
            </div>
          </div>
          <div className="stat-card">
            <h4>自炊回数</h4>
            <div className="stat-value">{userData.cookingCount}回</div>
            <div className="stat-detail">目標: {goals.cookingGoal}回</div>
            <div className="gauge-container">
              <div className="gauge-background">
                <div
                  className="gauge-fill cooking-gauge"
                  style={{
                    width: `${Math.min(
                      (userData.cookingCount / goals.cookingGoal) * 100,
                      100
                    )}%`,
                  }}
                ></div>
              </div>
              <div className="gauge-text">
                {((userData.cookingCount / goals.cookingGoal) * 100).toFixed(1)}
                %
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* グラフエリア */}
      <div className="charts-section">
        <h3>📈 グラフ分析</h3>
        <div className="chart-container">
          <h4>支出推移</h4>
          <canvas ref={expenseChartRef} width="400" height="200"></canvas>
        </div>
        <div className="chart-container">
          <h4>カテゴリ別支出</h4>
          <canvas ref={categoryChartRef} width="400" height="200"></canvas>
        </div>
        <div className="chart-container">
          <h4>自炊回数推移</h4>
          <canvas ref={cookingChartRef} width="400" height="200"></canvas>
        </div>
        <div className="chart-container">
          <h4>節約額推移</h4>
          <canvas ref={savingsChartRef} width="400" height="200"></canvas>
        </div>
      </div>

      {/* 記録一覧・編集 */}
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
              {/* 支出記録 */}
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

              {/* 自炊記録 */}
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
    </section>
  );
};
