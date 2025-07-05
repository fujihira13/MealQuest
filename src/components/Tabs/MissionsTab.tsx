import React, { useEffect, useState } from 'react';
import { useAppStore, useUIStore } from '@/store/useAppStore';
import type { Mission } from '@/types';

export const MissionsTab: React.FC = () => {
  const {
    missions,
    claimMissionReward,
    generateDailyMissions,
    generateWeeklyMissions,
  } = useAppStore();

  const { showNotification } = useUIStore();

  const [dailyResetTimer, setDailyResetTimer] = useState('--:--:--');
  const [weeklyResetTimer, setWeeklyResetTimer] = useState('--日--時間');

  useEffect(() => {
    // ミッションタイマーを開始
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, []);

  const updateTimers = () => {
    // デイリーリセットタイマー
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeToReset = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(timeToReset / (1000 * 60 * 60));
    const minutes = Math.floor((timeToReset % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeToReset % (1000 * 60)) / 1000);
    
    setDailyResetTimer(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);

    // ウィークリーリセットタイマー
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + (7 - nextWeek.getDay()));
    nextWeek.setHours(0, 0, 0, 0);
    
    const timeToWeekReset = nextWeek.getTime() - now.getTime();
    const days = Math.floor(timeToWeekReset / (1000 * 60 * 60 * 24));
    const weekHours = Math.floor((timeToWeekReset % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    setWeeklyResetTimer(`${days}日${weekHours}時間`);
  };

  const handleClaimReward = (missionId: string) => {
    const success = claimMissionReward(missionId);
    if (success) {
      const mission = missions.daily[missionId] || missions.weekly[missionId];
      showNotification('success', `🎁 報酬を受け取りました: ${mission?.reward}pt!`);
    }
  };

  const renderMissionCard = (mission: Mission & { id: string }) => {
    const progressPercent = Math.min((mission.progress / mission.target) * 100, 100);
    
    return (
      <div 
        key={mission.id}
        className={`mission-card ${mission.completed ? 'completed' : ''} ${mission.claimed ? 'claimed' : ''}`}
      >
        <div className="mission-icon">{mission.icon}</div>
        <div className="mission-content">
          <h5>{mission.title}</h5>
          <p>{mission.description}</p>
          <div className="mission-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <span className="progress-text">{mission.progress}/{mission.target}</span>
          </div>
          <div className="mission-reward">報酬: {mission.reward}pt</div>
        </div>
        <div className="mission-action">
          {mission.completed && !mission.claimed ? (
            <button 
              className="claim-btn" 
              onClick={() => handleClaimReward(mission.id)}
            >
              受取
            </button>
          ) : mission.claimed ? (
            <span className="claimed-text">受取済</span>
          ) : null}
        </div>
      </div>
    );
  };

  // 獲得可能ポイントを計算
  const availablePoints = [
    ...Object.values(missions.daily),
    ...Object.values(missions.weekly)
  ]
    .filter(m => m.completed && !m.claimed)
    .reduce((sum, m) => sum + m.reward, 0);

  return (
    <section className="tab-content active">
      <div className="missions-header">
        <h3>🎯 デイリー・ウィークリーミッション</h3>
        <div className="missions-stats">
          <span>獲得可能ポイント: {availablePoints}pt</span>
        </div>
      </div>

      {/* デイリーミッション */}
      <div className="missions-section">
        <h4>📅 今日のミッション</h4>
        <div className="mission-reset-timer">
          リセットまで: {dailyResetTimer}
        </div>
        <div className="missions-grid">
          {Object.entries(missions.daily).map(([id, mission]) => 
            renderMissionCard({ ...mission, id })
          )}
          {Object.keys(missions.daily).length === 0 && (
            <div className="no-missions">
              <p>デイリーミッションがありません</p>
              <button 
                className="generate-btn"
                onClick={generateDailyMissions}
              >
                ミッションを生成
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ウィークリーミッション */}
      <div className="missions-section">
        <h4>📊 今週のミッション</h4>
        <div className="mission-reset-timer">
          リセットまで: {weeklyResetTimer}
        </div>
        <div className="missions-grid">
          {Object.entries(missions.weekly).map(([id, mission]) => 
            renderMissionCard({ ...mission, id })
          )}
          {Object.keys(missions.weekly).length === 0 && (
            <div className="no-missions">
              <p>ウィークリーミッションがありません</p>
              <button 
                className="generate-btn"
                onClick={generateWeeklyMissions}
              >
                ミッションを生成
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ミッション報酬履歴 */}
      <div className="missions-section">
        <h4>🏆 今週の達成履歴</h4>
        <div className="mission-history">
          {missions.completedHistory.length === 0 ? (
            <p className="no-history">まだ達成したミッションはありません</p>
          ) : (
            missions.completedHistory
              .slice(-10) // 最新10件
              .reverse()
              .map((history, index) => (
                <div key={index} className="history-item">
                  <span className="history-title">{history.title}</span>
                  <span className="history-reward">+{history.reward}pt</span>
                  <span className="history-date">
                    {new Date(history.claimedAt).toLocaleDateString()}
                  </span>
                </div>
              ))
          )}
        </div>
      </div>
    </section>
  );
};