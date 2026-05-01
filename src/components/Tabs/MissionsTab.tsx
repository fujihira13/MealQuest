import React, { useEffect, useState } from "react";
import { useAppStore, useUIStore } from "@/store/useAppStore";
import { CircularProgress } from "@/components/Common/CircularProgress";
import type { Mission } from "@/types";

export const MissionsTab: React.FC = () => {
  const {
    missions,
    streaks,
    claimMissionReward,
    generateDailyMissions,
    generateWeeklyMissions,
  } = useAppStore();
  const { showNotification } = useUIStore();

  const [dailyResetTimer, setDailyResetTimer] = useState("--:--:--");
  const [weeklyResetTimer, setWeeklyResetTimer] = useState("--日--時間");

  useEffect(() => {
    const interval = setInterval(updateTimers, 1000);
    updateTimers();
    return () => clearInterval(interval);
  }, []);

  const updateTimers = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diff = tomorrow.getTime() - now.getTime();
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    setDailyResetTimer(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`);

    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + (7 - nextWeek.getDay()));
    nextWeek.setHours(0, 0, 0, 0);
    const wDiff = nextWeek.getTime() - now.getTime();
    const days = Math.floor(wDiff / 86400000);
    const wH = Math.floor((wDiff % 86400000) / 3600000);
    setWeeklyResetTimer(`${days}日${wH}時間`);
  };

  const handleClaimReward = (missionId: string) => {
    const success = claimMissionReward(missionId);
    if (success) {
      const mission = missions.daily[missionId] || missions.weekly[missionId];
      showNotification("success", `🎁 報酬を受け取りました: ${mission?.reward}pt!`);
    }
  };

  const allMissions = [
    ...Object.values(missions.daily),
    ...Object.values(missions.weekly),
  ];
  const totalMissions = allMissions.length;
  const completedCount = allMissions.filter((m) => m.completed).length;
  const availablePoints = allMissions.filter((m) => m.completed && !m.claimed).reduce((s, m) => s + m.reward, 0);
  const progressPct = totalMissions > 0 ? Math.round((completedCount / totalMissions) * 100) : 0;

  const renderMissionCard = (mission: Mission & { id: string }) => {
    const pct = Math.min((mission.progress / mission.target) * 100, 100);
    return (
      <div
        key={mission.id}
        className={`mission-card ${mission.completed ? "completed" : ""} ${mission.claimed ? "claimed" : ""}`}
      >
        <div className="mission-icon">{mission.icon}</div>
        <div className="mission-content">
          <h5>{mission.title}</h5>
          <p>{mission.description}</p>
          <div className="mission-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="progress-text">{mission.progress}/{mission.target}</span>
          </div>
          <div className="mission-reward">+{mission.reward}pt</div>
        </div>
        <div className="mission-action">
          {mission.completed && !mission.claimed ? (
            <button className="claim-btn" onClick={() => handleClaimReward(mission.id)}>受取</button>
          ) : mission.claimed ? (
            <span className="claimed-text">受取済</span>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <section className="tab-content active">
      {/* サマリーカード */}
      <div className="missions-header">
        <div className="missions-summary-row">
          <div className="missions-progress-wrap">
            <CircularProgress value={progressPct} size={64} strokeWidth={7} color="#4caf50" />
            <div>
              <div className="missions-completion-text">{completedCount}/{totalMissions}完了</div>
              <div className="missions-completion-sub">今日の達成</div>
            </div>
          </div>
          <div className="missions-timer-wrap">
            <div className="missions-timer-label">リセットまで</div>
            <div className="missions-timer">{dailyResetTimer}</div>
          </div>
        </div>
        <div className="missions-meta-row">
          {availablePoints > 0 && (
            <span className="missions-pt-badge">獲得可能 {availablePoints}pt</span>
          )}
          {streaks.noWasteStreak > 0 && (
            <span className="streak-badge">🔥 連続記録 {streaks.noWasteStreak}日</span>
          )}
        </div>
      </div>

      {/* デイリーミッション */}
      <div className="missions-section">
        <h4>デイリーミッション</h4>
        <div className="mission-reset-timer">毎日0時リセット: {dailyResetTimer}</div>
        <div className="missions-grid">
          {Object.entries(missions.daily).map(([id, mission]) =>
            renderMissionCard({ ...mission, id })
          )}
          {Object.keys(missions.daily).length === 0 && (
            <div className="no-missions">
              <p>デイリーミッションがありません</p>
              <button className="generate-btn" onClick={generateDailyMissions}>ミッションを生成</button>
            </div>
          )}
        </div>
      </div>

      {/* ウィークリーミッション */}
      <div className="missions-section">
        <h4>ウィークリーミッション</h4>
        <div className="mission-reset-timer">今週残り: {weeklyResetTimer}</div>
        <div className="missions-grid">
          {Object.entries(missions.weekly).map(([id, mission]) =>
            renderMissionCard({ ...mission, id })
          )}
          {Object.keys(missions.weekly).length === 0 && (
            <div className="no-missions">
              <p>ウィークリーミッションがありません</p>
              <button className="generate-btn" onClick={generateWeeklyMissions}>ミッションを生成</button>
            </div>
          )}
        </div>
      </div>

      {availablePoints > 0 && (
        <button
          className="missions-claim-all-btn"
          onClick={() => {
            [...Object.entries(missions.daily), ...Object.entries(missions.weekly)]
              .filter(([, m]) => m.completed && !m.claimed)
              .forEach(([id]) => handleClaimReward(id));
          }}
        >
          🎁 報酬を受け取る（{availablePoints}pt）
        </button>
      )}

      {/* 達成履歴 */}
      <div className="missions-section" style={{ marginTop: "0.75rem" }}>
        <h4>達成履歴</h4>
        <div className="mission-history">
          {missions.completedHistory.length === 0 ? (
            <p className="no-history">まだ達成したミッションはありません</p>
          ) : (
            missions.completedHistory.slice(-10).reverse().map((h, i) => (
              <div key={i} className="history-item">
                <span className="history-title">{h.title}</span>
                <span className="history-reward">+{h.reward}pt</span>
                <span className="history-date">{new Date(h.claimedAt).toLocaleDateString()}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
