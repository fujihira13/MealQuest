import React, { useState, useRef, useEffect } from 'react';
import { useAppStore, useUIStore } from '@/store/useAppStore';
import { Chart, registerables } from 'chart.js';

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
    updateGoals,
    updateMonthlyData
  } = useAppStore();

  const { showNotification, showConfirmDialog } = useUIStore();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Chart refs
  const expenseChartRef = useRef<HTMLCanvasElement>(null);
  const categoryChartRef = useRef<HTMLCanvasElement>(null);
  const cookingChartRef = useRef<HTMLCanvasElement>(null);
  const savingsChartRef = useRef<HTMLCanvasElement>(null);
  
  // Chart instances
  const chartInstances = useRef<{[key: string]: Chart}>({});

  useEffect(() => {
    renderCharts();
    return () => {
      // Cleanup charts
      Object.values(chartInstances.current).forEach(chart => chart.destroy());
    };
  }, [expenses, cookingRecords, savingsRecords]);

  const renderCharts = () => {
    // Cleanup existing charts
    Object.values(chartInstances.current).forEach(chart => chart.destroy());
    chartInstances.current = {};

    renderExpenseChart();
    renderCategoryChart();
    renderCookingChart();
    renderSavingsChart();
  };

  const renderExpenseChart = () => {
    if (!expenseChartRef.current) return;

    const ctx = expenseChartRef.current.getContext('2d');
    if (!ctx) return;

    // 過去30日のデータを生成
    const dates = [];
    const expenseData = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dates.push(date.getDate() + '日');
      
      // その日の支出合計を計算
      const dayExpense = expenses
        .filter(expense => expense.date === dateStr)
        .reduce((sum, expense) => sum + expense.amount, 0);
      expenseData.push(dayExpense);
    }

    chartInstances.current.expense = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: '日次支出 (円)',
          data: expenseData,
          borderColor: '#4a90e2',
          backgroundColor: 'rgba(74, 144, 226, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '¥' + value.toLocaleString();
              }
            }
          },
          x: {
            display: true
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      }
    });
  };

  const renderCategoryChart = () => {
    if (!categoryChartRef.current) return;

    const ctx = categoryChartRef.current.getContext('2d');
    if (!ctx) return;

    // カテゴリ別支出を集計
    const categoryData: {[key: string]: number} = {};
    const categoryColors: {[key: string]: string} = {
      'スーパー': '#4CAF50',
      '自販機': '#FF9800',
      'コンビニ': '#2196F3',
      '飲み会': '#E91E63',
      'デート': '#9C27B0',
      'その他': '#607D8B'
    };

    expenses.forEach(expense => {
      if (!categoryData[expense.category]) {
        categoryData[expense.category] = 0;
      }
      categoryData[expense.category] += expense.amount;
    });

    const labels = Object.keys(categoryData);
    const data = Object.values(categoryData);
    const colors = labels.map(label => categoryColors[label] || '#757575');

    chartInstances.current.category = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((context.parsed / total) * 100).toFixed(1);
                return context.label + ': ¥' + context.parsed.toLocaleString() + ' (' + percentage + '%)';
              }
            }
          }
        }
      }
    });
  };

  const renderCookingChart = () => {
    if (!cookingChartRef.current) return;

    const ctx = cookingChartRef.current.getContext('2d');
    if (!ctx) return;

    // 過去30日の自炊回数を集計
    const dates = [];
    const cookingCounts = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dates.push(date.getDate() + '日');
      
      // その日の自炊回数を計算
      const dayCount = cookingRecords
        .filter(record => record.date === dateStr)
        .length;
      cookingCounts.push(dayCount);
    }

    chartInstances.current.cooking = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dates,
        datasets: [{
          label: '自炊回数',
          data: cookingCounts,
          backgroundColor: '#4CAF50',
          borderColor: '#388E3C',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 3,
            ticks: {
              stepSize: 1
            }
          },
          x: {
            display: true
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      }
    });
  };

  const renderSavingsChart = () => {
    if (!savingsChartRef.current) return;

    const ctx = savingsChartRef.current.getContext('2d');
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
      const dateStr = date.toISOString().split('T')[0];
      dates.push(date.getDate() + '日');
      
      // その日の節約額を加算
      const daySavings = savingsRecords
        .filter(record => record.date === dateStr)
        .reduce((sum, record) => sum + record.amount, 0);
      
      runningTotal += daySavings;
      cumulativeSavings.push(runningTotal);
    }

    chartInstances.current.savings = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: '累積節約額 (円)',
          data: cumulativeSavings,
          borderColor: '#00b894',
          backgroundColor: 'rgba(0, 184, 148, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '¥' + value.toLocaleString();
              }
            }
          },
          x: {
            display: true
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      }
    });
  };

  const loadRecordsForDate = () => {
    const dayExpenses = expenses.filter(e => e.date === selectedDate);
    const dayCooking = cookingRecords.filter(r => r.date === selectedDate);
    return { dayExpenses, dayCooking };
  };

  const handleDeleteExpense = (id: number) => {
    showConfirmDialog(
      'この支出記録を削除しますか？',
      () => {
        deleteExpenseRecord(id);
        showNotification('success', '支出記録を削除しました');
      }
    );
  };

  const handleDeleteCooking = (id: number) => {
    showConfirmDialog(
      'この自炊記録を削除しますか？',
      () => {
        deleteCookingRecord(id);
        showNotification('success', '自炊記録を削除しました');
      }
    );
  };


  const getCategoryIcon = (category: string) => {
    const icons: {[key: string]: string} = {
      'スーパー': '🛒',
      '自販機': '🥤',
      'コンビニ': '🏪',
      '飲み会': '🍻',
      'デート': '💕',
      'その他': '📝'
    };
    return icons[category] || '📝';
  };

  const getMealName = (meal: string) => {
    const names: {[key: string]: string} = {
      'morning': '朝',
      'lunch': '昼',
      'dinner': '夜'
    };
    return names[meal] || meal;
  };

  const { dayExpenses, dayCooking } = loadRecordsForDate();

  return (
    <section className="tab-content active">
      {/* 月間統計 */}
      <div className="stats-overview">
        <h3>今月の統計</h3>
        <div className="stats-cards">
          <div className="stat-card">
            <h4>総支出</h4>
            <div className="stat-value">¥{userData.monthlyExpense.toLocaleString()}</div>
            <div className="stat-detail">目標: ¥{goals.monthlyExpenseGoal.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <h4>節約額</h4>
            <div className="stat-value">¥{userData.totalSavings.toLocaleString()}</div>
            <div className="stat-detail">今月: ¥{userData.monthlySavings.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <h4>自炊回数</h4>
            <div className="stat-value">{userData.cookingCount}回</div>
            <div className="stat-detail">目標: {goals.cookingGoal}回</div>
          </div>
        </div>
      </div>


      {/* グラフエリア */}
      <div className="charts-section">
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
        <h3>記録の編集・削除</h3>
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
              {dayExpenses.map(expense => (
                <div key={expense.id} className="record-item expense-record">
                  <div className="record-info">
                    <span className="record-category">{getCategoryIcon(expense.category)} {expense.category}</span>
                    <span className="record-amount">¥{expense.amount.toLocaleString()}</span>
                    <span className="record-time">{getMealName(expense.meal)}</span>
                  </div>
                  <div className="record-actions">
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
              {dayCooking.map(cooking => (
                <div key={cooking.id} className="record-item cooking-record">
                  <div className="record-info">
                    <span className="record-category">👨‍🍳 自炊記録</span>
                    <span className="record-amount">{getMealName(cooking.meal)}</span>
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