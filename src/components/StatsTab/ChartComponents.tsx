import React, { useRef, useEffect, useCallback, useState } from "react";
import { Chart, registerables } from "chart.js";
import type { ExpenseRecord } from "@/types";

Chart.register(...registerables);

interface ChartComponentsProps {
  expenses: ExpenseRecord[];
  cookingRecords: { date: string; [key: string]: any }[];
  savingsRecords: { date: string; amount: number; [key: string]: any }[];
}

export const ChartComponents: React.FC<ChartComponentsProps> = ({
  expenses,
  cookingRecords,
  savingsRecords,
}) => {
  const expenseChartRef = useRef<HTMLCanvasElement>(null);
  const categoryChartRef = useRef<HTMLCanvasElement>(null);
  const cookingChartRef = useRef<HTMLCanvasElement>(null);
  const savingsChartRef = useRef<HTMLCanvasElement>(null);

  const chartInstances = useRef<{ [key: string]: Chart }>({});
  
  // 週の開始日を状態として管理
  const [selectedWeekStart, setSelectedWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    return startOfWeek.toISOString().split("T")[0];
  });

  // 週のナビゲーション関数
  const goToPreviousWeek = () => {
    const previousWeek = new Date(selectedWeekStart);
    previousWeek.setDate(previousWeek.getDate() - 7);
    setSelectedWeekStart(previousWeek.toISOString().split("T")[0]);
  };

  const goToNextWeek = () => {
    const nextWeek = new Date(selectedWeekStart);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setSelectedWeekStart(nextWeek.toISOString().split("T")[0]);
  };

  const goToCurrentWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    setSelectedWeekStart(startOfWeek.toISOString().split("T")[0]);
  };

  // 週の表示用フォーマット
  const getWeekDisplayText = () => {
    const weekStart = new Date(selectedWeekStart);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    const formatDate = (date: Date) => {
      return `${date.getMonth() + 1}/${date.getDate()}`;
    };
    
    return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
  };

  const renderCharts = useCallback(() => {
    Object.values(chartInstances.current).forEach((chart) => chart.destroy());
    chartInstances.current = {};

    renderExpenseChart();
    renderCategoryChart();
    renderCookingChart();
    renderSavingsChart();
  }, [expenses, cookingRecords, savingsRecords, selectedWeekStart]);

  useEffect(() => {
    renderCharts();
    return () => {
      Object.values(chartInstances.current).forEach((chart) => chart.destroy());
    };
  }, [renderCharts]);

  const renderExpenseChart = () => {
    if (!expenseChartRef.current) return;

    const ctx = expenseChartRef.current.getContext("2d");
    if (!ctx) return;

    const dates = [];
    const expenseData = [];
    const weekStart = new Date(selectedWeekStart);

    // 1週間分のデータを生成
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
      dates.push(`${date.getDate()}日(${dayNames[date.getDay()]})`);

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

    const dates = [];
    const cookingCounts = [];
    const weekStart = new Date(selectedWeekStart);

    // 1週間分のデータを生成
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
      dates.push(`${date.getDate()}日(${dayNames[date.getDay()]})`);

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

    const dates = [];
    const weeklySavings = [];
    const weekStart = new Date(selectedWeekStart);

    // 1週間分のデータを生成
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
      dates.push(`${date.getDate()}日(${dayNames[date.getDay()]})`);

      const daySavings = savingsRecords
        .filter((record) => record.date === dateStr)
        .reduce((sum, record) => sum + record.amount, 0);

      weeklySavings.push(daySavings);
    }

    chartInstances.current.savings = new Chart(ctx, {
      type: "bar",
      data: {
        labels: dates,
        datasets: [
          {
            label: "日別節約額 (円)",
            data: weeklySavings,
            backgroundColor: "rgba(0, 184, 148, 0.7)",
            borderColor: "#00b894",
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

  return (
    <div className="charts-section">
      <h3>📈 グラフ分析</h3>
      
      {/* 週選択コントロール */}
      <div className="week-navigation">
        <button className="nav-btn" onClick={goToPreviousWeek}>
          ← 前の週
        </button>
        <span className="week-display">{getWeekDisplayText()}</span>
        <button className="nav-btn" onClick={goToNextWeek}>
          次の週 →
        </button>
        <button className="nav-btn current-week" onClick={goToCurrentWeek}>
          今週
        </button>
      </div>

      <div className="chart-container">
        <h4>支出推移（週表示）</h4>
        <canvas ref={expenseChartRef} width="400" height="200"></canvas>
      </div>
      <div className="chart-container">
        <h4>カテゴリ別支出</h4>
        <canvas ref={categoryChartRef} width="400" height="200"></canvas>
      </div>
      <div className="chart-container">
        <h4>自炊回数推移（週表示）</h4>
        <canvas ref={cookingChartRef} width="400" height="200"></canvas>
      </div>
      <div className="chart-container">
        <h4>節約額推移（週表示）</h4>
        <canvas ref={savingsChartRef} width="400" height="200"></canvas>
      </div>
    </div>
  );
};