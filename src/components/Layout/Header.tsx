import React from "react";
import { useAppStore, useUIStore } from "@/store/useAppStore";

export const Header: React.FC = () => {
  const userData = useAppStore((state) => state.userData);
  const { setCurrentTab } = useUIStore();

  return (
    <header className="app-header">
      <h1>🏅 節約マスター</h1>
      <div className="user-info">
        <div className="level-badge">🏆 Lv.{userData.level}</div>
        <div className="points-badge">🪙 {userData.points.toLocaleString()} pt</div>
        <button
          className="header-settings-btn"
          onClick={() => setCurrentTab("settings")}
          title="設定"
        >
          ⚙️
        </button>
      </div>
    </header>
  );
};
