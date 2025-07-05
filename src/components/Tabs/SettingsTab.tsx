import React from 'react';
import { useAppStore, useUIStore } from '@/store/useAppStore';

export const SettingsTab: React.FC = () => {
  const {
    goals,
    userData,
    updateGoals,
    updateMonthlyData,
    resetAllData
  } = useAppStore();

  const { showNotification, showConfirmDialog, setCurrentTab } = useUIStore();

  const handleBackToHome = () => {
    setCurrentTab('home');
  };

  const handleGoalUpdate = (type: 'expense' | 'allowance' | 'cooking', value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue <= 0) return;
    
    updateGoals(type, numValue);
    updateMonthlyData();
    showNotification('success', '目標を更新しました');
  };

  const handleDataReset = () => {
    showConfirmDialog(
      '全てのデータをリセットしますか？この操作は元に戻せません。',
      () => {
        resetAllData();
        showNotification('success', 'データをリセットしました');
      }
    );
  };

  // 貯金目標の進捗計算
  const savingsGoals = [
    { current: Math.min(userData.totalSavings, 5000), target: 5000, title: '短期目標' },
    { current: Math.min(userData.totalSavings, 20000), target: 20000, title: '中期目標' },
    { current: Math.min(userData.totalSavings, 50000), target: 50000, title: '長期目標' }
  ];

  return (
    <section className="tab-content active">
      {/* 設定ヘッダー */}
      <div className="settings-header">
        <button 
          className="back-to-home-btn"
          onClick={handleBackToHome}
          title="ホームに戻る"
        >
          <i className="fas fa-arrow-left"></i>
        </button>
        <div className="settings-title">
          <h3>⚙️ 設定</h3>
          <p>アプリの設定と目標を管理できます</p>
        </div>
        <div className="header-spacer"></div>
      </div>

      {/* 月間目標設定 */}
      <div className="settings-section">
        <h3>📊 月間目標設定</h3>
        <div className="setting-items">
          <div className="setting-item">
            <label>食費目標 (円)</label>
            <input 
              type="number" 
              defaultValue={goals.monthlyExpenseGoal}
              onChange={(e) => handleGoalUpdate('expense', e.target.value)}
            />
          </div>
          <div className="setting-item">
            <label>消費許容額 (円)</label>
            <input 
              type="number" 
              defaultValue={goals.allowanceGoal}
              onChange={(e) => handleGoalUpdate('allowance', e.target.value)}
            />
          </div>
          <div className="setting-item">
            <label>自炊回数目標 (回)</label>
            <input 
              type="number" 
              defaultValue={goals.cookingGoal}
              onChange={(e) => handleGoalUpdate('cooking', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* 貯金目標セクション */}
      <div className="savings-goals-section">
        <h3>💰 貯金目標</h3>
        <div className="savings-goal-cards">
          {savingsGoals.map((goal, index) => (
            <div key={index} className="savings-goal-card">
              <h4>{goal.title} (¥{goal.target.toLocaleString()})</h4>
              <div className="savings-progress">
                <div className="savings-progress-bar">
                  <div 
                    className="savings-progress-fill" 
                    style={{ 
                      width: `${Math.min((goal.current / goal.target) * 100, 100)}%`,
                      background: goal.current >= goal.target 
                        ? 'linear-gradient(135deg, #00b894, #00a085)' 
                        : 'linear-gradient(135deg, #667eea, #764ba2)'
                    }}
                  ></div>
                </div>
                <div className="savings-progress-text">
                  ¥{goal.current.toLocaleString()} / ¥{goal.target.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* アプリ情報 */}
      <div className="app-info-section">
        <h3>📱 アプリ情報</h3>
        <div className="info-items">
          <div className="info-item">
            <label>アプリ名</label>
            <span>食費管理アプリ - 節約マスター</span>
          </div>
          <div className="info-item">
            <label>バージョン</label>
            <span>1.0.0</span>
          </div>
          <div className="info-item">
            <label>現在のレベル</label>
            <span>Lv.{userData.level}</span>
          </div>
          <div className="info-item">
            <label>総ポイント</label>
            <span>{userData.points.toLocaleString()}pt</span>
          </div>
        </div>
      </div>

      {/* データ管理 */}
      <div className="data-management-section">
        <h3>🗂️ データ管理</h3>
        <div className="data-actions">
          <button 
            className="reset-btn"
            onClick={handleDataReset}
          >
            <i className="fas fa-trash-alt"></i>
            全データをリセット
          </button>
          <p className="reset-warning">
            ⚠️ この操作は全ての記録、進捗、設定を削除します。元に戻すことはできません。
          </p>
        </div>
      </div>

      {/* 使い方ガイド */}
      <div className="guide-section">
        <h3>📖 使い方ガイド</h3>
        <div className="guide-items">
          <div className="guide-item">
            <h4>💰 支出記録</h4>
            <p>ホーム画面でカテゴリボタンを押して日々の支出を記録しましょう</p>
          </div>
          <div className="guide-item">
            <h4>🍳 自炊記録</h4>
            <p>自炊をした時間帯（朝・昼・夜）をタップしてポイントを獲得しましょう</p>
          </div>
          <div className="guide-item">
            <h4>💎 節約記録</h4>
            <p>誘惑に負けずに節約できた時は節約記録で貯金額を積み上げましょう</p>
          </div>
          <div className="guide-item">
            <h4>🎯 ミッション</h4>
            <p>デイリー・ウィークリーミッションを達成してポイントを稼ぎましょう</p>
          </div>
        </div>
      </div>
    </section>
  );
};