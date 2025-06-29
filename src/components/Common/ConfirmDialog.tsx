import React from 'react';
import { useUIStore } from '@/store/useAppStore';

export const ConfirmDialog: React.FC = () => {
  const { 
    isConfirmDialogOpen, 
    confirmMessage, 
    hideConfirmDialog, 
    executeConfirmAction 
  } = useUIStore();

  if (!isConfirmDialogOpen) {
    return null;
  }

  return (
    <div className="confirm-dialog show">
      <div className="confirm-content">
        <h4>確認</h4>
        <p>{confirmMessage}</p>
        <div className="confirm-buttons">
          <button className="confirm-btn" onClick={executeConfirmAction}>
            はい
          </button>
          <button className="cancel-btn" onClick={hideConfirmDialog}>
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
};