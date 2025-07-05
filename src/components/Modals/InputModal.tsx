import React, { useState, useEffect } from 'react';
import { useAppStore, useUIStore } from '@/store/useAppStore';
import type { MealTime } from '@/types';

export const InputModal: React.FC = () => {
  const {
    addExpenseRecord,
    updateExpenseRecord,
    checkLevelUp,
    checkSavingsLevelUp
  } = useAppStore();

  const {
    isInputModalOpen,
    currentInputCategory,
    currentAmount,
    selectedMeal,
    editingRecord,
    setAmount,
    setSelectedMeal,
    closeInputModal,
    showNotification
  } = useUIStore();

  const [displayAmount, setDisplayAmount] = useState('');

  useEffect(() => {
    if (editingRecord && isInputModalOpen) {
      setAmount(editingRecord.amount.toString());
      setSelectedMeal(editingRecord.meal);
      setDisplayAmount(editingRecord.amount.toLocaleString());
    } else if (isInputModalOpen) {
      setAmount('');
      setSelectedMeal('lunch');
      setDisplayAmount('');
    }
  }, [editingRecord, isInputModalOpen, setAmount, setSelectedMeal]);

  useEffect(() => {
    const formatted = currentAmount ? parseInt(currentAmount).toLocaleString() : '';
    setDisplayAmount(formatted);
  }, [currentAmount]);

  const handleDigit = (digit: string) => {
    if (currentAmount.length < 8) {
      setAmount(currentAmount + digit);
    }
  };

  const handleDelete = () => {
    setAmount(currentAmount.slice(0, -1));
  };

  const handleClear = () => {
    setAmount('');
  };

  const handleMealSelect = (meal: MealTime) => {
    setSelectedMeal(meal);
  };

  const handleSave = () => {
    if (!currentAmount || !selectedMeal || !currentInputCategory) {
      showNotification('error', '金額と時間帯を選択してください');
      return;
    }

    const amount = parseInt(currentAmount);

    if (editingRecord) {
      updateExpenseRecord(editingRecord.id, currentInputCategory, amount, selectedMeal);
      showNotification('success', '支出記録を更新しました');
    } else {
      addExpenseRecord(currentInputCategory, amount, selectedMeal);
      showNotification('success', `${currentInputCategory}の支出を記録しました: ¥${amount.toLocaleString()}`);
    }

    const leveledUp = checkLevelUp();
    const savingsLeveledUp = checkSavingsLevelUp();
    
    if (leveledUp) {
      showNotification('success', 'レベルアップしました！');
    }
    if (savingsLeveledUp) {
      showNotification('success', '節約レベルアップしました！');
    }

    closeInputModal();
  };

  if (!isInputModalOpen) {
    return null;
  }

  return (
    <div className="input-modal show">
      <div className="input-modal-content">
        <div className="input-header">
          <button className="back-btn" onClick={closeInputModal}>
            <i className="fas fa-arrow-left"></i> 戻る
          </button>
          <h2>{currentInputCategory}</h2>
          <div className="spacer"></div>
        </div>

        <div className="input-content">
          {/* 金額入力 */}
          <div className="amount-section">
            <input 
              type="text" 
              className="amount-input" 
              value={displayAmount}
              placeholder="0" 
              readOnly 
            />
          </div>

          {/* 数字キーパッド */}
          <div className="keypad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button 
                key={num}
                className="key-btn" 
                onClick={() => handleDigit(num.toString())}
              >
                {num}
              </button>
            ))}
            <button className="key-btn clear-btn" onClick={handleClear}>C</button>
            <button className="key-btn" onClick={() => handleDigit('0')}>0</button>
            <button className="key-btn delete-btn" onClick={handleDelete}>⌫</button>
          </div>

          {/* 時間帯選択 */}
          <div className="meal-selection">
            <h4>食事の時間帯</h4>
            <div className="meal-buttons">
              <button 
                className={`meal-btn ${selectedMeal === 'morning' ? 'selected' : ''}`}
                onClick={() => handleMealSelect('morning')}
              >
                朝
              </button>
              <button 
                className={`meal-btn ${selectedMeal === 'lunch' ? 'selected' : ''}`}
                onClick={() => handleMealSelect('lunch')}
              >
                昼
              </button>
              <button 
                className={`meal-btn ${selectedMeal === 'dinner' ? 'selected' : ''}`}
                onClick={() => handleMealSelect('dinner')}
              >
                夜
              </button>
            </div>
          </div>

          {/* 保存ボタン */}
          <button 
            className="save-btn" 
            onClick={handleSave}
            disabled={!currentAmount || !selectedMeal}
          >
            <i className="fas fa-save"></i> 記録する
          </button>
        </div>
      </div>
    </div>
  );
};