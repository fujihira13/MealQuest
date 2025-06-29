import React from 'react';
import { useAppStore } from '@/store/useAppStore';

export const Header: React.FC = () => {
  const userData = useAppStore((state) => state.userData);

  return (
    <header className="app-header">
      <h1>
        <i className="fas fa-piggy-bank"></i> 節約マスター
      </h1>
      <div className="user-info">
        <div className="level-badge">
          Lv.<span>{userData.level}</span>
        </div>
      </div>
    </header>
  );
};