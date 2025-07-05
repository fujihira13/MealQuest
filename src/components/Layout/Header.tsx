import React from 'react';
import { useAppStore, useUIStore } from '@/store/useAppStore';

export const Header: React.FC = () => {
  const userData = useAppStore((state) => state.userData);
  const { setCurrentTab } = useUIStore();

  const handleSettingsClick = () => {
    setCurrentTab('settings');
  };

  return (
    <header className="app-header">
      <h1>
        <i className="fas fa-piggy-bank"></i> 節約マスター
      </h1>
      <div className="user-info">
        <div className="level-badge">
          Lv.<span>{userData.level}</span>
        </div>
        <button 
          className="settings-btn"
          onClick={handleSettingsClick}
          title="設定"
        >
          <i className="fas fa-cog"></i>
        </button>
      </div>
    </header>
  );
};