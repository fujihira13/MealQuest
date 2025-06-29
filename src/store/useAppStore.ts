import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AppState,
  UIState,
  UserData,
  ExpenseRecord,
  CookingRecord,
  SavingsRecord,
  CollectionItem,
  Mission,
  Badge,
  ExpenseCategory,
  MealTime,
  TabType,
  NotificationType,
  GachaItem,
  SavingsEquivalent
} from '@/types';

// 初期データ定義
const initialUserData: UserData = {
  level: 1,
  points: 0,
  totalSavings: 0,
  monthlySavings: 0,
  monthlyExpense: 0,
  cookingCount: 0,
  allowanceUsed: 0,
  lastUpdated: new Date().toISOString().split('T')[0],
  savingsLevel: 1
};

const initialGoals = {
  monthlyExpenseGoal: 25000,
  allowanceGoal: 15000,
  cookingGoal: 20
};

const gachaItems: GachaItem[] = [
  { id: 1, name: '金のコイン', icon: '🪙', rarity: 'common', description: '普通の金貨です' },
  { id: 2, name: '節約レシピ本', icon: '📚', rarity: 'common', description: '簡単節約レシピが載っています' },
  { id: 3, name: 'おにぎり', icon: '🍙', rarity: 'common', description: '美味しいおにぎりです' },
  { id: 4, name: '魔法の財布', icon: '👛', rarity: 'rare', description: '節約効果がアップします' },
  { id: 5, name: '料理の達人証', icon: '🏆', rarity: 'rare', description: '自炊ポイントがアップします' },
  { id: 6, name: '宝石', icon: '💎', rarity: 'epic', description: 'キラキラ光る宝石です' },
  { id: 7, name: '黄金のフライパン', icon: '🍳', rarity: 'epic', description: '何でも美味しく作れます' },
  { id: 8, name: '伝説の食材', icon: '🌟', rarity: 'legendary', description: '最高級の食材です' },
  { id: 9, name: '節約の王冠', icon: '👑', rarity: 'legendary', description: '節約マスターの証です' },
  { id: 10, name: 'ピザ', icon: '🍕', rarity: 'common', description: '美味しいピザです' },
  { id: 11, name: 'ハンバーガー', icon: '🍔', rarity: 'common', description: 'ジューシーなハンバーガーです' },
  { id: 12, name: 'アイスクリーム', icon: '🍦', rarity: 'rare', description: '冷たくて甘いアイスです' },
  { id: 13, name: 'ケーキ', icon: '🎂', rarity: 'rare', description: '特別な日のケーキです' },
  { id: 14, name: 'ドラゴンフルーツ', icon: '🐉', rarity: 'epic', description: '神秘的な果物です' },
  { id: 15, name: '虹色のキャンディ', icon: '🌈', rarity: 'legendary', description: '食べると幸せになれます' }
];

const badgeDefinitions: Badge[] = [
  // 自炊関連
  { id: 'cooking_start', category: 'cooking', title: '自炊デビュー', description: '初回自炊記録', icon: '🍳', requirement: { type: 'cooking_count', value: 1 }, earned: false },
  { id: 'cooking_novice', category: 'cooking', title: '自炊初心者', description: '自炊5回達成', icon: '👨‍🍳', requirement: { type: 'cooking_count', value: 5 }, earned: false },
  { id: 'cooking_adept', category: 'cooking', title: '自炊上手', description: '自炊20回達成', icon: '🧑‍🍳', requirement: { type: 'cooking_count', value: 20 }, earned: false },
  { id: 'cooking_master', category: 'cooking', title: '自炊マスター', description: '自炊50回達成', icon: '👑', requirement: { type: 'cooking_count', value: 50 }, earned: false },
  { id: 'cooking_legend', category: 'cooking', title: '料理の達人', description: '自炊100回達成', icon: '🌟', requirement: { type: 'cooking_count', value: 100 }, earned: false },

  // 節約関連
  { id: 'savings_start', category: 'savings', title: '節約デビュー', description: '初回節約記録', icon: '💰', requirement: { type: 'savings_count', value: 1 }, earned: false },
  { id: 'savings_saver', category: 'savings', title: '節約家', description: '1000円節約達成', icon: '💳', requirement: { type: 'total_savings', value: 1000 }, earned: false },
  { id: 'savings_expert', category: 'savings', title: '節約上手', description: '5000円節約達成', icon: '💎', requirement: { type: 'total_savings', value: 5000 }, earned: false },
  { id: 'savings_master', category: 'savings', title: '節約マスター', description: '10000円節約達成', icon: '👑', requirement: { type: 'total_savings', value: 10000 }, earned: false },
  { id: 'savings_champion', category: 'savings', title: '節約チャンピオン', description: '30000円節約達成', icon: '🏆', requirement: { type: 'total_savings', value: 30000 }, earned: false },
  { id: 'savings_legend', category: 'savings', title: '節約の王様', description: '50000円節約達成', icon: '👑', requirement: { type: 'total_savings', value: 50000 }, earned: false },
  
  // 節約レベル関連
  { id: 'savings_level_5', category: 'savings', title: '節約ビギナー', description: '節約レベル5達成', icon: '⭐', requirement: { type: 'savings_level', value: 5 }, earned: false },
  { id: 'savings_level_10', category: 'savings', title: '節約アドバンス', description: '節約レベル10達成', icon: '⭐⭐', requirement: { type: 'savings_level', value: 10 }, earned: false },
  { id: 'savings_level_20', category: 'savings', title: '節約プロ', description: '節約レベル20達成', icon: '⭐⭐⭐', requirement: { type: 'savings_level', value: 20 }, earned: false },
  
  // 連続記録関連
  { id: 'streak_week', category: 'special', title: '継続の力', description: '7日連続無駄遣いなし', icon: '🔥', requirement: { type: 'no_waste_streak', value: 7 }, earned: false },
  { id: 'streak_month', category: 'special', title: '鉄の意志', description: '30日連続無駄遣いなし', icon: '💪', requirement: { type: 'no_waste_streak', value: 30 }, earned: false },

  // レベル関連
  { id: 'level_5', category: 'level', title: '成長中', description: 'レベル5達成', icon: '⭐', requirement: { type: 'level', value: 5 }, earned: false },
  { id: 'level_10', category: 'level', title: '中級者', description: 'レベル10達成', icon: '⭐⭐', requirement: { type: 'level', value: 10 }, earned: false },
  { id: 'level_20', category: 'level', title: '上級者', description: 'レベル20達成', icon: '⭐⭐⭐', requirement: { type: 'level', value: 20 }, earned: false },
  { id: 'level_50', category: 'level', title: 'エキスパート', description: 'レベル50達成', icon: '🌟', requirement: { type: 'level', value: 50 }, earned: false },

  // 特別称号
  { id: 'first_week', category: 'special', title: '継続は力なり', description: '7日連続記録', icon: '🔥', requirement: { type: 'consecutive_days', value: 7 }, earned: false },
  { id: 'monthly_goal', category: 'special', title: '目標達成者', description: '月間目標達成', icon: '🎯', requirement: { type: 'monthly_goal_achieved', value: 1 }, earned: false },
  { id: 'gacha_collector', category: 'special', title: 'コレクター', description: 'ガチャアイテム10種獲得', icon: '🎁', requirement: { type: 'gacha_items', value: 10 }, earned: false },
  { id: 'mission_master', category: 'special', title: 'ミッションマスター', description: 'ミッション20個達成', icon: '🏅', requirement: { type: 'missions_completed', value: 20 }, earned: false }
];

const savingsEquivalents: SavingsEquivalent[] = [
  { amount: 120, item: 'ペットボトル飲料1本', icon: '🥤' },
  { amount: 200, item: 'おにぎり1個', icon: '🍙' },
  { amount: 300, item: 'コンビニサンドイッチ', icon: '🥪' },
  { amount: 500, item: 'コンビニ弁当', icon: '🍱' },
  { amount: 800, item: 'ファストフード1食', icon: '🍔' },
  { amount: 1000, item: '好きな文庫本1冊', icon: '📚' },
  { amount: 1500, item: 'スタバのコーヒー2杯', icon: '☕' },
  { amount: 2000, item: 'ランチ外食1回', icon: '🍽️' },
  { amount: 3000, item: '映画鑑賞チケット', icon: '🎬' },
  { amount: 5000, item: '洋服1着', icon: '👕' },
  { amount: 8000, item: '高級ランチコース', icon: '🍽️' },
  { amount: 10000, item: '欲しかった雑貨', icon: '🛍️' },
  { amount: 15000, item: '美容院でのトリートメント', icon: '💇' },
  { amount: 20000, item: '友達との旅行(日帰り)', icon: '🚌' },
  { amount: 30000, item: '新しいスニーカー', icon: '👟' },
  { amount: 50000, item: '憧れのブランドバッグ', icon: '👜' },
  { amount: 100000, item: '1泊2日の温泉旅行', icon: '♨️' }
];

// Zustand ストア定義
interface AppStore extends AppState {
  // アクション
  // 支出記録
  addExpenseRecord: (category: ExpenseCategory, amount: number, meal: MealTime) => void;
  updateExpenseRecord: (id: number, category: ExpenseCategory, amount: number, meal: MealTime) => void;
  deleteExpenseRecord: (id: number) => void;
  
  // 自炊記録
  toggleCookingRecord: (meal: MealTime) => void;
  deleteCookingRecord: (id: number) => void;
  
  // 節約記録
  addSavingsRecord: (amount: number) => void;
  
  // ガチャ
  playGacha: () => CollectionItem | null;
  
  // レベルアップ
  checkLevelUp: () => boolean;
  checkSavingsLevelUp: () => boolean;
  
  // ミッション
  updateMissionProgress: (actionType: string, value?: number) => void;
  claimMissionReward: (missionId: string) => boolean;
  resetDailyMissions: () => void;
  resetWeeklyMissions: () => void;
  
  // バッジ
  checkBadgeProgress: () => string[];
  
  // 連続記録
  recordNoWasteDay: () => void;
  recordSnackFreeDay: () => void;
  resetStreakIfNeeded: (category: ExpenseCategory) => void;
  
  // 目標設定
  updateGoals: (type: 'expense' | 'allowance' | 'cooking', value: number) => void;
  
  // データ更新
  updateMonthlyData: () => void;
  
  // リセット
  resetAllData: () => void;
}

interface UIStore extends UIState {
  // UI アクション
  setCurrentTab: (tab: TabType) => void;
  openInputModal: (category: ExpenseCategory) => void;
  closeInputModal: () => void;
  setAmount: (amount: string) => void;
  setSelectedMeal: (meal: MealTime) => void;
  setEditingRecord: (record: ExpenseRecord | null) => void;
  showNotification: (type: NotificationType, message: string) => void;
  removeNotification: (id: string) => void;
  showConfirmDialog: (message: string, action: () => void) => void;
  hideConfirmDialog: () => void;
  executeConfirmAction: () => void;
}

// アプリケーションストア
export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // 初期状態
      userData: initialUserData,
      goals: initialGoals,
      expenses: [],
      cookingRecords: [],
      savingsRecords: [],
      collection: [],
      missions: {
        daily: {},
        weekly: {},
        lastDailyReset: '',
        lastWeeklyReset: '',
        completedHistory: []
      },
      badges: {
        earned: [],
        currentTitle: 'beginner'
      },
      streaks: {
        noWasteStreak: 0,
        lastNoWasteDate: '',
        bestNoWasteStreak: 0,
        snackFreeStreak: 0,
        lastSnackFreeDate: '',
        bestSnackFreeStreak: 0
      },
      gachaItems,
      badgeDefinitions,
      savingsEquivalents,

      // アクション
      addExpenseRecord: (category, amount, meal) => {
        const record: ExpenseRecord = {
          id: Date.now(),
          date: new Date().toISOString().split('T')[0],
          category,
          amount,
          meal,
          timestamp: new Date().toISOString()
        };
        
        set((state) => {
          const newExpenses = [record, ...state.expenses];
          return {
            expenses: newExpenses,
            userData: {
              ...state.userData,
              monthlyExpense: state.userData.monthlyExpense + amount,
              allowanceUsed: category !== 'スーパー' 
                ? state.userData.allowanceUsed + amount 
                : state.userData.allowanceUsed
            }
          };
        });
        
        get().resetStreakIfNeeded(category);
        get().updateMissionProgress('expense_record');
      },

      updateExpenseRecord: (id, category, amount, meal) => {
        set((state) => {
          const expenses = state.expenses.map(exp => 
            exp.id === id 
              ? { ...exp, category, amount, meal, timestamp: new Date().toISOString() }
              : exp
          );
          return { expenses };
        });
        get().updateMonthlyData();
      },

      deleteExpenseRecord: (id) => {
        set((state) => ({
          expenses: state.expenses.filter(exp => exp.id !== id)
        }));
        get().updateMonthlyData();
      },

      toggleCookingRecord: (meal) => {
        const today = new Date().toISOString().split('T')[0];
        const state = get();
        const existingRecord = state.cookingRecords.find(
          r => r.date === today && r.meal === meal
        );

        if (existingRecord) {
          // 削除
          set((state) => ({
            cookingRecords: state.cookingRecords.filter(
              r => !(r.date === today && r.meal === meal)
            )
          }));
        } else {
          // 追加
          const record: CookingRecord = {
            id: Date.now(),
            date: today,
            meal,
            timestamp: new Date().toISOString()
          };
          
          set((state) => ({
            cookingRecords: [...state.cookingRecords, record],
            userData: {
              ...state.userData,
              points: state.userData.points + 20
            }
          }));
          
          get().updateMissionProgress('cooking');
        }
        
        get().updateMonthlyData();
      },

      deleteCookingRecord: (id) => {
        set((state) => ({
          cookingRecords: state.cookingRecords.filter(r => r.id !== id)
        }));
        get().updateMonthlyData();
      },

      addSavingsRecord: (amount) => {
        const record: SavingsRecord = {
          id: Date.now(),
          date: new Date().toISOString().split('T')[0],
          amount,
          timestamp: new Date().toISOString()
        };

        set((state) => ({
          savingsRecords: [...state.savingsRecords, record],
          userData: {
            ...state.userData,
            totalSavings: state.userData.totalSavings + amount,
            points: state.userData.points + Math.floor(amount / 10)
          }
        }));

        get().updateMissionProgress('savings');
        get().updateMissionProgress('total_savings', amount);
        get().updateMonthlyData();
      },

      playGacha: () => {
        const state = get();
        if (state.userData.points < 100) {
          return null;
        }

        // レアリティ確率設定
        const rarityProbabilities = {
          'common': 60,
          'rare': 25,
          'epic': 12,
          'legendary': 3
        };

        // レアリティを決定
        const random = Math.random() * 100;
        let cumulative = 0;
        let selectedRarity: keyof typeof rarityProbabilities = 'common';

        for (const [rarity, probability] of Object.entries(rarityProbabilities)) {
          cumulative += probability;
          if (random <= cumulative) {
            selectedRarity = rarity as keyof typeof rarityProbabilities;
            break;
          }
        }

        // 該当レアリティのアイテムから選択
        const availableItems = state.gachaItems.filter(item => item.rarity === selectedRarity);
        const selectedItem = availableItems[Math.floor(Math.random() * availableItems.length)];

        // レアリティボーナスポイント
        const bonusPoints = {
          'common': 0,
          'rare': 20,
          'epic': 50,
          'legendary': 100
        };

        set((state) => {
          const existingItem = state.collection.find(item => item.id === selectedItem.id);
          let newCollection;
          
          if (existingItem) {
            newCollection = state.collection.map(item =>
              item.id === selectedItem.id
                ? { ...item, count: item.count + 1 }
                : item
            );
          } else {
            newCollection = [
              ...state.collection,
              { ...selectedItem, count: 1, obtained: new Date().toISOString() }
            ];
          }

          return {
            collection: newCollection,
            userData: {
              ...state.userData,
              points: state.userData.points - 100 + bonusPoints[selectedRarity]
            }
          };
        });

        return { ...selectedItem, count: 1, obtained: new Date().toISOString() };
      },

      checkLevelUp: () => {
        const state = get();
        const requiredPoints = state.userData.level * 100;
        
        if (state.userData.points >= requiredPoints) {
          set((state) => ({
            userData: {
              ...state.userData,
              level: state.userData.level + 1,
              points: state.userData.points - requiredPoints
            }
          }));
          return true;
        }
        return false;
      },

      checkSavingsLevelUp: () => {
        const state = get();
        const requiredSavings = state.userData.savingsLevel * 1000;
        
        if (state.userData.totalSavings >= requiredSavings) {
          const newLevel = Math.floor(state.userData.totalSavings / 1000) + 1;
          if (newLevel > state.userData.savingsLevel) {
            const bonus = (newLevel - state.userData.savingsLevel) * 20;
            
            set((state) => ({
              userData: {
                ...state.userData,
                savingsLevel: newLevel,
                points: state.userData.points + bonus
              }
            }));
            return true;
          }
        }
        return false;
      },

      updateMissionProgress: (actionType, value = 1) => {
        // ミッション進捗更新の実装
        // 実際の実装はより複雑になりますが、ここでは簡略化
      },

      claimMissionReward: (missionId) => {
        // ミッション報酬受取の実装
        return false;
      },

      resetDailyMissions: () => {
        // デイリーミッションリセットの実装
      },

      resetWeeklyMissions: () => {
        // ウィークリーミッションリセットの実装
      },

      checkBadgeProgress: () => {
        // バッジ進捗チェックの実装
        return [];
      },

      recordNoWasteDay: () => {
        const today = new Date().toISOString().split('T')[0];
        const state = get();
        
        if (state.streaks.lastNoWasteDate === today) {
          return;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        set((state) => {
          const newStreak = state.streaks.lastNoWasteDate === yesterdayStr
            ? state.streaks.noWasteStreak + 1
            : 1;
          
          const bonus = Math.min(newStreak * 5, 50);
          
          return {
            streaks: {
              ...state.streaks,
              noWasteStreak: newStreak,
              lastNoWasteDate: today,
              bestNoWasteStreak: Math.max(newStreak, state.streaks.bestNoWasteStreak)
            },
            userData: {
              ...state.userData,
              points: state.userData.points + bonus
            }
          };
        });
      },

      recordSnackFreeDay: () => {
        const today = new Date().toISOString().split('T')[0];
        const state = get();
        
        if (state.streaks.lastSnackFreeDate === today) {
          return;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        set((state) => {
          const newStreak = state.streaks.lastSnackFreeDate === yesterdayStr
            ? state.streaks.snackFreeStreak + 1
            : 1;
          
          const bonus = Math.min(newStreak * 3, 30);
          
          return {
            streaks: {
              ...state.streaks,
              snackFreeStreak: newStreak,
              lastSnackFreeDate: today,
              bestSnackFreeStreak: Math.max(newStreak, state.streaks.bestSnackFreeStreak)
            },
            userData: {
              ...state.userData,
              points: state.userData.points + bonus
            }
          };
        });
      },

      resetStreakIfNeeded: (category) => {
        const today = new Date().toISOString().split('T')[0];
        
        if (['コンビニ', '自販機'].includes(category)) {
          set((state) => ({
            streaks: {
              ...state.streaks,
              noWasteStreak: 0,
              lastNoWasteDate: '',
              snackFreeStreak: 0,
              lastSnackFreeDate: ''
            }
          }));
        }
      },

      updateGoals: (type, value) => {
        set((state) => {
          const newGoals = { ...state.goals };
          switch (type) {
            case 'expense':
              newGoals.monthlyExpenseGoal = value;
              break;
            case 'allowance':
              newGoals.allowanceGoal = value;
              break;
            case 'cooking':
              newGoals.cookingGoal = value;
              break;
          }
          return { goals: newGoals };
        });
      },

      updateMonthlyData: () => {
        const state = get();
        const currentMonth = new Date().toISOString().slice(0, 7);
        
        const monthlyExpenses = state.expenses.filter(e => e.date.startsWith(currentMonth));
        const monthlyCooking = state.cookingRecords.filter(r => r.date.startsWith(currentMonth));
        const monthlySavings = state.savingsRecords.filter(r => r.date.startsWith(currentMonth));
        
        const monthlyExpense = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
        const wastefulExpenses = monthlyExpenses.filter(e => e.category !== 'スーパー');
        const allowanceUsed = wastefulExpenses.reduce((sum, e) => sum + e.amount, 0);
        const cookingCount = monthlyCooking.length;
        const monthlySavingsAmount = monthlySavings.reduce((sum, r) => sum + r.amount, 0);

        set((state) => ({
          userData: {
            ...state.userData,
            monthlyExpense,
            allowanceUsed,
            cookingCount,
            monthlySavings: monthlySavingsAmount
          }
        }));
      },

      resetAllData: () => {
        set({
          userData: initialUserData,
          goals: initialGoals,
          expenses: [],
          cookingRecords: [],
          savingsRecords: [],
          collection: [],
          missions: {
            daily: {},
            weekly: {},
            lastDailyReset: '',
            lastWeeklyReset: '',
            completedHistory: []
          },
          badges: {
            earned: [],
            currentTitle: 'beginner'
          },
          streaks: {
            noWasteStreak: 0,
            lastNoWasteDate: '',
            bestNoWasteStreak: 0,
            snackFreeStreak: 0,
            lastSnackFreeDate: '',
            bestSnackFreeStreak: 0
          },
          gachaItems,
          badgeDefinitions,
          savingsEquivalents
        });
      }
    }),
    {
      name: 'food-expense-app-storage',
      storage: createJSONStorage(() => localStorage),
      version: 1
    }
  )
);

// UI ストア
export const useUIStore = create<UIStore>((set, get) => ({
  // 初期状態
  currentTab: 'home',
  isInputModalOpen: false,
  currentInputCategory: null,
  currentAmount: '',
  selectedMeal: null,
  editingRecord: null,
  notifications: [],
  isConfirmDialogOpen: false,
  confirmMessage: '',
  confirmAction: null,

  // アクション
  setCurrentTab: (tab) => set({ currentTab: tab }),
  
  openInputModal: (category) => set({ 
    isInputModalOpen: true, 
    currentInputCategory: category,
    currentAmount: '',
    selectedMeal: null 
  }),
  
  closeInputModal: () => set({ 
    isInputModalOpen: false, 
    currentInputCategory: null,
    currentAmount: '',
    selectedMeal: null,
    editingRecord: null
  }),
  
  setAmount: (amount) => set({ currentAmount: amount }),
  
  setSelectedMeal: (meal) => set({ selectedMeal: meal }),
  
  setEditingRecord: (record) => set({ editingRecord: record }),
  
  showNotification: (type, message) => {
    const notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: Date.now()
    };
    
    set((state) => ({
      notifications: [...state.notifications, notification]
    }));

    // 3秒後に自動削除
    setTimeout(() => {
      get().removeNotification(notification.id);
    }, 3000);
  },
  
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },
  
  showConfirmDialog: (message, action) => set({ 
    isConfirmDialogOpen: true, 
    confirmMessage: message, 
    confirmAction: action 
  }),
  
  hideConfirmDialog: () => set({ 
    isConfirmDialogOpen: false, 
    confirmMessage: '', 
    confirmAction: null 
  }),
  
  executeConfirmAction: () => {
    const { confirmAction } = get();
    if (confirmAction) {
      confirmAction();
    }
    get().hideConfirmDialog();
  }
}));