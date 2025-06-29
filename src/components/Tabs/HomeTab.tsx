import React from 'react';
import { useAppStore, useUIStore } from '@/store/useAppStore';
import { Avatar } from '@/components/Common/Avatar';
import type { ExpenseCategory, MealTime } from '@/types';

export const HomeTab: React.FC = () => {
  const {
    userData,
    goals,
    gachaItems,
    toggleCookingRecord,
    addSavingsRecord,
    playGacha,
    recordNoWasteDay,
    recordSnackFreeDay,
    streaks,
    checkLevelUp,
    checkSavingsLevelUp,
    savingsEquivalents
  } = useAppStore();

  const { openInputModal, showNotification } = useUIStore();

  const handleCookingRecord = (meal: MealTime) => {
    toggleCookingRecord(meal);
    const leveledUp = checkLevelUp();
    const savingsLeveledUp = checkSavingsLevelUp();
    
    if (leveledUp) {
      showNotification('success', `レベルアップ！ Lv.${userData.level}になりました！`);
    }
    if (savingsLeveledUp) {
      showNotification('success', `節約レベルアップ！ 節約Lv.${userData.savingsLevel}になりました！`);
    }
  };

  const handleSavingsRecord = (amount: number) => {
    addSavingsRecord(amount);
    showNotification('success', `節約成功！ ¥${amount.toLocaleString()}を節約貯金に追加しました！`);
    
    const leveledUp = checkLevelUp();
    const savingsLeveledUp = checkSavingsLevelUp();
    
    if (leveledUp) {
      showNotification('success', `レベルアップ！ Lv.${userData.level}になりました！`);
    }
    if (savingsLeveledUp) {
      showNotification('success', `節約レベルアップ！ 節約Lv.${userData.savingsLevel}になりました！`);
    }
  };

  const handleCustomSavings = () => {
    const amount = prompt('節約できた金額を入力してください（円）');
    if (amount && !isNaN(Number(amount)) && parseInt(amount) > 0) {
      handleSavingsRecord(parseInt(amount));
    }
  };

  const handleGacha = () => {
    if (userData.points < 100) {
      showNotification('error', 'ポイントが不足しています（100pt必要）');
      return;
    }

    const result = playGacha();
    if (result) {
      const rarityText = {
        'common': '⭐',
        'rare': '⭐⭐',
        'epic': '⭐⭐⭐',
        'legendary': '⭐⭐⭐⭐'
      };
      showNotification('success', `ガチャ結果: ${rarityText[result.rarity]} ${result.name} ${result.icon}を獲得！`);
    }
  };

  const handleNoWasteDay = () => {
    recordNoWasteDay();
    showNotification('success', `🔥 無駄遣いなし ${streaks.noWasteStreak}日連続！素晴らしい！`);
  };

  const handleSnackFreeDay = () => {
    recordSnackFreeDay();
    showNotification('success', `🍭 お菓子我慢 ${streaks.snackFreeStreak}日連続！頑張ってる！`);
  };

  // 節約額で買える物を計算
  const getSavingsEquivalent = () => {
    const totalSavings = userData.totalSavings;
    
    if (totalSavings === 0) {
      return '節約を始めて、欲しい物を手に入れよう！';
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
      return `あと¥${remaining.toLocaleString()}で${cheapest.icon}${cheapest.item}が買えます！`;
    }
  };

  const remaining = Math.max(0, goals.allowanceGoal - userData.allowanceUsed);
  const gaugePercent = Math.max(0, (remaining / goals.allowanceGoal) * 100);
  const pointsToNext = (userData.level * 100) - userData.points;
  const progressPercent = (userData.points / (userData.level * 100)) * 100;

  return (
    <section className="tab-content active">
      {/* 消費許容ゲージセクション */}
      <div className="gauge-section">
        <h3>今月の消費許容ゲージ</h3>
        <div className="gauge-container">
          <div className="gauge-bar">
            <div className="gauge-fill" style={{ width: `${gaugePercent}%` }}></div>
          </div>
          <div className="gauge-text">
            残り許容額: ¥{remaining.toLocaleString()} / ¥{goals.allowanceGoal.toLocaleString()}
          </div>
        </div>
      </div>

      {/* アバター・ステータスセクション */}
      <div className="avatar-section">
        <div className="avatar-container">
          <Avatar />
          <div className="avatar-info">
            <div className="points-display">💰 {userData.points.toLocaleString()}pt</div>
            <div className="level-progress">
              <div className="level-text">次のレベルまで: {Math.max(0, pointsToNext).toLocaleString()}pt</div>
              <div className="level-bar">
                <div className="level-fill" style={{ width: `${Math.min(100, progressPercent)}%` }}></div>
              </div>
            </div>
            <div className="savings-level">
              💰 節約Lv.{userData.savingsLevel} (次まで: ¥{Math.max(0, userData.savingsLevel * 1000 - userData.totalSavings).toLocaleString()})
            </div>
            <div className="savings-bank">
              <i className="fas fa-coins"></i> 合計貯金: ¥{userData.totalSavings.toLocaleString()}
            </div>
            <div className="monthly-savings">
              <i className="fas fa-calendar-alt"></i> 今月の貯金: ¥{userData.monthlySavings.toLocaleString()}
            </div>
            <div className="savings-equivalent">
              <div className="savings-can-buy">
                <span>{getSavingsEquivalent()}</span>
              </div>
            </div>
            <div className="monthly-stats">
              <span>今月の自炊: {userData.cookingCount}回</span>
              <span>食費: ¥{userData.monthlyExpense.toLocaleString()}</span>
            </div>
            <div className="streak-stats">
              <div className="streak-item">
                🔥 無駄遣いなし: {streaks.noWasteStreak}日連続
                <span className="best-record">(最高: {streaks.bestNoWasteStreak}日)</span>
              </div>
              <div className="streak-item">
                🍭 お菓子我慢: {streaks.snackFreeStreak}日連続
                <span className="best-record">(最高: {streaks.bestSnackFreeStreak}日)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 自炊記録セクション */}
      <div className="cooking-section">
        <h3>今日の自炊記録</h3>
        <div className="cooking-buttons">
          <button 
            className="cooking-btn" 
            onClick={() => handleCookingRecord('morning')}
          >
            朝
          </button>
          <button 
            className="cooking-btn" 
            onClick={() => handleCookingRecord('lunch')}
          >
            昼
          </button>
          <button 
            className="cooking-btn" 
            onClick={() => handleCookingRecord('dinner')}
          >
            夜
          </button>
        </div>
      </div>

      {/* 節約成功記録セクション */}
      <div className="savings-record-section">
        <h3>節約成功記録</h3>
        <p>誘惑に負けずに節約できましたか？</p>
        <div className="savings-buttons">
          <button className="savings-quick-btn" onClick={() => handleSavingsRecord(500)}>
            コンビニ我慢<br />¥500
          </button>
          <button className="savings-quick-btn" onClick={() => handleSavingsRecord(120)}>
            自販機我慢<br />¥120
          </button>
          <button className="savings-custom-btn" onClick={handleCustomSavings}>
            その他<br />自由入力
          </button>
        </div>
      </div>

      {/* 連続記録セクション */}
      <div className="streak-record-section">
        <h3>今日の連続記録</h3>
        <div className="streak-buttons">
          <button 
            className={`streak-btn ${streaks.lastNoWasteDate === new Date().toISOString().split('T')[0] ? 'recorded' : ''}`}
            onClick={handleNoWasteDay}
          >
            {streaks.lastNoWasteDate === new Date().toISOString().split('T')[0] 
              ? '✅ 今日は記録済み' 
              : '🔥 今日は無駄遣いなし！'
            }
          </button>
          <button 
            className={`streak-btn ${streaks.lastSnackFreeDate === new Date().toISOString().split('T')[0] ? 'recorded' : ''}`}
            onClick={handleSnackFreeDay}
          >
            {streaks.lastSnackFreeDate === new Date().toISOString().split('T')[0]
              ? '✅ 今日は記録済み'
              : '🍭 今日はお菓子我慢！'
            }
          </button>
        </div>
        <p className="streak-note">毎日記録して連続記録を伸ばそう！</p>
      </div>

      {/* カテゴリ選択ボタン */}
      <div className="category-section">
        <h3>支出を記録する</h3>
        <div className="category-grid">
          <button className="category-btn category-supermarket" onClick={() => openInputModal('スーパー')}>
            🛒<br />スーパー
          </button>
          <button className="category-btn category-vending" onClick={() => openInputModal('自販機')}>
            🥤<br />自販機
          </button>
          <button className="category-btn category-convenience" onClick={() => openInputModal('コンビニ')}>
            🏪<br />コンビニ
          </button>
          <button className="category-btn category-drinking" onClick={() => openInputModal('飲み会')}>
            🍻<br />飲み会
          </button>
          <button className="category-btn category-date" onClick={() => openInputModal('デート')}>
            💕<br />デート
          </button>
          <button className="category-btn category-other" onClick={() => openInputModal('その他')}>
            📝<br />その他
          </button>
        </div>
      </div>

      {/* ガチャボタン */}
      <div className="gacha-section">
        <button 
          className="gacha-btn" 
          onClick={handleGacha}
          disabled={userData.points < 100}
        >
          <i className="fas fa-gift"></i> ガチャを引く (100pt)
        </button>
      </div>
    </section>
  );
};