import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  SavingsEquivalent,
  MissionType,
} from "@/types";
import { COOKING_RECORD_POINTS } from "@/constants/game";
import { WASTE_CATEGORIES } from "@/constants/categories";
import {
  applyXpChange,
  calculateLevelFromTotalXp,
  getTotalXpRequiredForLevel,
} from "@/utils/levelHelpers";
import { formatDateKey, getCurrentDate, getDaysAgo } from "@/utils/dateHelpers";

// 初期データ定義
const initialUserData: UserData = {
  level: 1,
  points: 0,
  totalXp: 0,
  totalSavings: 0,
  monthlySavings: 0,
  monthlyExpense: 0,
  cookingCount: 0,
  allowanceUsed: 0,
  lastUpdated: getCurrentDate(),
  savingsLevel: 1,
};

const initialGoals = {
  monthlyExpenseGoal: 25000,
  allowanceGoal: 15000,
  cookingGoal: 20,
  monthlySavingsGoal: 5000,
};

// 累計節約額から節約レベルを算出（1,000円ごとに1レベル）
const calculateSavingsLevel = (totalSavings: number): number =>
  Math.floor(Math.max(0, totalSavings) / 1000) + 1;

const gachaItems: GachaItem[] = [
  { id: 1, name: "金のコイン", icon: "🪙", rarity: "common", description: "普通の金貨です" },
  { id: 2, name: "節約レシピ本", icon: "📚", rarity: "common", description: "簡単節約レシピが載っています" },
  { id: 3, name: "おにぎり", icon: "🍙", rarity: "common", description: "美味しいおにぎりです" },
  { id: 4, name: "魔法の財布", icon: "👛", rarity: "rare", description: "節約効果がアップします" },
  { id: 5, name: "料理の達人証", icon: "🏆", rarity: "rare", description: "自炊ポイントがアップします" },
  { id: 6, name: "宝石", icon: "💎", rarity: "epic", description: "キラキラ光る宝石です" },
  { id: 7, name: "黄金のフライパン", icon: "🍳", rarity: "epic", description: "何でも美味しく作れます" },
  { id: 8, name: "伝説の食材", icon: "🌟", rarity: "legendary", description: "最高級の食材です" },
  { id: 9, name: "節約の王冠", icon: "👑", rarity: "legendary", description: "節約マスターの証です" },
  { id: 10, name: "ピザ", icon: "🍕", rarity: "common", description: "美味しいピザです" },
  { id: 11, name: "ハンバーガー", icon: "🍔", rarity: "common", description: "ジューシーなハンバーガーです" },
  { id: 12, name: "アイスクリーム", icon: "🍦", rarity: "rare", description: "冷たくて甘いアイスです" },
  { id: 13, name: "ケーキ", icon: "🎂", rarity: "rare", description: "特別な日のケーキです" },
  { id: 14, name: "ドラゴンフルーツ", icon: "🐉", rarity: "epic", description: "神秘的な果物です" },
  { id: 15, name: "虹色のキャンディ", icon: "🌈", rarity: "legendary", description: "食べると幸せになれます" },
];

const badgeDefinitions: Badge[] = [
  { id: "cooking_start", category: "cooking", title: "自炊デビュー", description: "初回自炊記録", icon: "🍳", requirement: { type: "cooking_count", value: 1 }, earned: false },
  { id: "cooking_novice", category: "cooking", title: "自炊初心者", description: "自炊5回達成", icon: "👨‍🍳", requirement: { type: "cooking_count", value: 5 }, earned: false },
  { id: "cooking_adept", category: "cooking", title: "自炊上手", description: "自炊20回達成", icon: "🧑‍🍳", requirement: { type: "cooking_count", value: 20 }, earned: false },
  { id: "cooking_master", category: "cooking", title: "自炊マスター", description: "自炊50回達成", icon: "👑", requirement: { type: "cooking_count", value: 50 }, earned: false },
  { id: "cooking_legend", category: "cooking", title: "料理の達人", description: "自炊100回達成", icon: "🌟", requirement: { type: "cooking_count", value: 100 }, earned: false },
  { id: "savings_start", category: "savings", title: "節約デビュー", description: "初回節約記録", icon: "💰", requirement: { type: "savings_count", value: 1 }, earned: false },
  { id: "savings_saver", category: "savings", title: "節約家", description: "1000円節約達成", icon: "💳", requirement: { type: "total_savings", value: 1000 }, earned: false },
  { id: "savings_expert", category: "savings", title: "節約上手", description: "5000円節約達成", icon: "💎", requirement: { type: "total_savings", value: 5000 }, earned: false },
  { id: "savings_master", category: "savings", title: "節約マスター", description: "10000円節約達成", icon: "👑", requirement: { type: "total_savings", value: 10000 }, earned: false },
  { id: "savings_champion", category: "savings", title: "節約チャンピオン", description: "30000円節約達成", icon: "🏆", requirement: { type: "total_savings", value: 30000 }, earned: false },
  { id: "savings_legend", category: "savings", title: "節約の王様", description: "50000円節約達成", icon: "👑", requirement: { type: "total_savings", value: 50000 }, earned: false },
  { id: "savings_level_5", category: "savings", title: "節約ビギナー", description: "節約レベル5達成", icon: "⭐", requirement: { type: "savings_level", value: 5 }, earned: false },
  { id: "savings_level_10", category: "savings", title: "節約アドバンス", description: "節約レベル10達成", icon: "⭐⭐", requirement: { type: "savings_level", value: 10 }, earned: false },
  { id: "savings_level_20", category: "savings", title: "節約プロ", description: "節約レベル20達成", icon: "⭐⭐⭐", requirement: { type: "savings_level", value: 20 }, earned: false },
  { id: "streak_week", category: "special", title: "継続の力", description: "7日連続無駄遣いなし", icon: "🔥", requirement: { type: "no_waste_streak", value: 7 }, earned: false },
  { id: "streak_month", category: "special", title: "鉄の意志", description: "30日連続無駄遣いなし", icon: "💪", requirement: { type: "no_waste_streak", value: 30 }, earned: false },
  { id: "level_5", category: "level", title: "成長中", description: "レベル5達成", icon: "⭐", requirement: { type: "level", value: 5 }, earned: false },
  { id: "level_10", category: "level", title: "中級者", description: "レベル10達成", icon: "⭐⭐", requirement: { type: "level", value: 10 }, earned: false },
  { id: "level_20", category: "level", title: "上級者", description: "レベル20達成", icon: "⭐⭐⭐", requirement: { type: "level", value: 20 }, earned: false },
  { id: "level_50", category: "level", title: "エキスパート", description: "レベル50達成", icon: "🌟", requirement: { type: "level", value: 50 }, earned: false },
  { id: "first_week", category: "special", title: "継続は力なり", description: "7日連続記録", icon: "🔥", requirement: { type: "consecutive_days", value: 7 }, earned: false },
  { id: "monthly_goal", category: "special", title: "目標達成者", description: "月間目標達成", icon: "🎯", requirement: { type: "monthly_goal_achieved", value: 1 }, earned: false },
  { id: "gacha_collector", category: "special", title: "コレクター", description: "ガチャアイテム10種獲得", icon: "🎁", requirement: { type: "gacha_items", value: 10 }, earned: false },
  { id: "mission_master", category: "special", title: "クエストマスター", description: "クエスト20個達成", icon: "🏅", requirement: { type: "missions_completed", value: 20 }, earned: false },
];

const savingsEquivalents: SavingsEquivalent[] = [
  { amount: 300, item: "オーガニック野菜", icon: "🥬" },
  { amount: 500, item: "プロテイン1回分", icon: "🥛" },
  { amount: 800, item: "ヘルシーサラダランチ", icon: "🥗" },
  { amount: 1000, item: "栄養補助食品", icon: "💊" },
  { amount: 1500, item: "スムージーボウル", icon: "🍓" },
  { amount: 2000, item: "ヨガクラス1回", icon: "🧘" },
  { amount: 3000, item: "フィットネス1日券", icon: "🏃" },
  { amount: 5000, item: "健康的な食材セット", icon: "🥕" },
  { amount: 8000, item: "マッサージ1回", icon: "💆" },
  { amount: 10000, item: "良質なオリーブオイル", icon: "🫒" },
];

type PersistedAppState = Partial<AppState> & {
  userData?: Partial<UserData>;
  allDayCookingBonusDates?: string[];
};

// ストアインターフェース
interface AppStore extends AppState {
  allDayCookingBonusDates: string[];

  addExpenseRecord: (category: ExpenseCategory, amount: number, meal: MealTime, date?: string) => void;
  updateExpenseRecord: (id: number, category: ExpenseCategory, amount: number, meal: MealTime, date: string) => void;
  deleteExpenseRecord: (id: number) => void;

  toggleCookingRecord: (meal: MealTime) => void;
  toggleCookingRecordWithDate: (meal: MealTime, date: string, memo?: string) => void;
  addCookingRecord: (meal: MealTime, date: string, memo?: string) => void;
  updateCookingRecordMemo: (meal: MealTime, date: string, memo: string) => void;
  deleteCookingRecord: (id: number) => void;

  addSavingsRecord: (amount: number) => void;

  playGacha: () => CollectionItem | null;

  checkLevelUp: () => boolean;
  checkSavingsLevelUp: () => boolean;

  generateDailyMissions: () => void;
  generateWeeklyMissions: () => void;
  initializeMissions: () => void;
  updateMissionProgress: (
    actionType: string,
    value?: number,
    options?: { updateDaily?: boolean; updateWeekly?: boolean }
  ) => void;
  claimMissionReward: (missionId: string) => boolean;
  resetDailyMissions: () => void;
  resetWeeklyMissions: () => void;

  checkBadgeProgress: () => string[];

  recordNoWasteDay: () => void;
  recordSnackFreeDay: () => void;
  resetStreakIfNeeded: (category: ExpenseCategory, meal: MealTime) => void;

  updateGoals: (type: "expense" | "allowance" | "cooking" | "savings", value: number) => void;
  updateMonthlyData: () => void;
  resetAllData: () => void;
}

interface UIStore extends UIState {
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
  setHelpOpen: (isOpen: boolean) => void;
  setAppHeaderHeight: (height: number) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      userData: initialUserData,
      goals: initialGoals,
      expenses: [],
      cookingRecords: [],
      savingsRecords: [],
      collection: [],
      missions: {
        daily: {},
        weekly: {},
        lastDailyReset: "",
        lastWeeklyReset: "",
        completedHistory: [],
      },
      badges: {
        earned: [],
        currentTitle: "beginner",
      },
      streaks: {
        noWasteStreak: 0,
        lastNoWasteDate: "",
        bestNoWasteStreak: 0,
        snackFreeStreak: 0,
        lastSnackFreeDate: "",
        bestSnackFreeStreak: 0,
      },
      gachaItems,
      badgeDefinitions,
      savingsEquivalents,
      allDayCookingBonusDates: [],

      addExpenseRecord: (category, amount, meal, date) => {
        const recordDate = date || getCurrentDate();
        const record: ExpenseRecord = {
          id: Date.now(),
          date: recordDate,
          category,
          amount,
          meal,
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          expenses: [record, ...state.expenses],
        }));

        if (recordDate === getCurrentDate()) {
          get().resetStreakIfNeeded(category, meal);
          get().updateMissionProgress("expense_record");
          get().updateMissionProgress("record_habit");
        }
        get().checkBadgeProgress();
        get().updateMonthlyData();
      },

      updateExpenseRecord: (id, category, amount, meal, date) => {
        set((state) => ({
          expenses: state.expenses.map((exp) =>
            exp.id === id
              ? { ...exp, category, amount, meal, date, timestamp: new Date().toISOString() }
              : exp
          ),
        }));
        get().updateMonthlyData();
        get().checkBadgeProgress();
      },

      deleteExpenseRecord: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((exp) => exp.id !== id),
        }));
        get().updateMonthlyData();
        get().checkBadgeProgress();
      },

      toggleCookingRecord: (meal) => {
        const today = getCurrentDate();
        const state = get();
        const existingRecord = state.cookingRecords.find(
          (r) => r.date === today && r.meal === meal
        );

        if (existingRecord) {
          set((state) => ({
            cookingRecords: state.cookingRecords.filter(
              (r) => !(r.date === today && r.meal === meal)
            ),
            userData: applyXpChange(
              {
                ...state.userData,
                points: Math.max(0, state.userData.points - COOKING_RECORD_POINTS),
              },
              -COOKING_RECORD_POINTS
            ),
          }));
        } else {
          const record: CookingRecord = {
            id: Date.now(),
            date: today,
            meal,
            timestamp: new Date().toISOString(),
          };
          set((state) => ({
            cookingRecords: [...state.cookingRecords, record],
            userData: applyXpChange(
              {
                ...state.userData,
                points: state.userData.points + COOKING_RECORD_POINTS,
              },
              COOKING_RECORD_POINTS
            ),
          }));
          get().updateMissionProgress("cooking");
          get().updateMissionProgress("record_habit");
          get().checkBadgeProgress();
        }
        get().updateMonthlyData();
      },

      toggleCookingRecordWithDate: (meal, date, memo) => {
        const state = get();
        const existingRecord = state.cookingRecords.find(
          (r) => r.date === date && r.meal === meal
        );

        if (existingRecord) {
          set((state) => ({
            cookingRecords: state.cookingRecords.filter(
              (r) => !(r.date === date && r.meal === meal)
            ),
            userData: applyXpChange(
              {
                ...state.userData,
                points: Math.max(0, state.userData.points - COOKING_RECORD_POINTS),
              },
              -COOKING_RECORD_POINTS
            ),
          }));
        } else {
          const record: CookingRecord = {
            id: Date.now(),
            date,
            meal,
            memo,
            timestamp: new Date().toISOString(),
          };
          set((state) => ({
            cookingRecords: [...state.cookingRecords, record],
            userData: applyXpChange(
              {
                ...state.userData,
                points: state.userData.points + COOKING_RECORD_POINTS,
              },
              COOKING_RECORD_POINTS
            ),
          }));
          const isTodayRecord = date === getCurrentDate();
          get().updateMissionProgress("cooking", 1, {
            updateDaily: isTodayRecord,
            updateWeekly: true,
          });
          if (isTodayRecord) {
            get().updateMissionProgress("record_habit");
          }
          get().checkBadgeProgress();
        }
        get().updateMonthlyData();
      },

      addCookingRecord: (meal, date, memo) => {
        const record: CookingRecord = {
          id: Date.now(),
          date,
          meal,
          memo,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          cookingRecords: [...state.cookingRecords, record],
          userData: applyXpChange(
            {
              ...state.userData,
              points: state.userData.points + COOKING_RECORD_POINTS,
            },
            COOKING_RECORD_POINTS
          ),
        }));
        const isTodayRecord = date === getCurrentDate();
        get().updateMissionProgress("cooking", 1, {
          updateDaily: isTodayRecord,
          updateWeekly: true,
        });
        if (isTodayRecord) {
          get().updateMissionProgress("record_habit");
        }
        get().checkBadgeProgress();
        get().updateMonthlyData();
      },

      updateCookingRecordMemo: (meal, date, memo) => {
        set((state) => ({
          cookingRecords: state.cookingRecords.map((record) =>
            record.date === date && record.meal === meal ? { ...record, memo } : record
          ),
        }));
      },

      deleteCookingRecord: (id) => {
        set((state) => {
          const exists = state.cookingRecords.some((r) => r.id === id);

          return {
            cookingRecords: state.cookingRecords.filter((r) => r.id !== id),
            userData: exists
              ? applyXpChange(
                  {
                    ...state.userData,
                    points: Math.max(
                      0,
                      state.userData.points - COOKING_RECORD_POINTS
                    ),
                  },
                  -COOKING_RECORD_POINTS
                )
              : state.userData,
          };
        });
        get().updateMonthlyData();
      },

      addSavingsRecord: (amount) => {
        const reward = Math.floor(amount / 10);
        const record: SavingsRecord = {
          id: Date.now(),
          date: getCurrentDate(),
          amount,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          savingsRecords: [...state.savingsRecords, record],
          userData: applyXpChange(
            {
              ...state.userData,
              totalSavings: state.userData.totalSavings + amount,
              points: state.userData.points + reward,
            },
            reward
          ),
        }));
        get().updateMissionProgress("savings");
        get().updateMissionProgress("total_savings", amount);
        get().checkSavingsLevelUp();
        get().checkBadgeProgress();
        get().updateMonthlyData();
      },

      playGacha: () => {
        const state = get();
        if (state.userData.points < 100) return null;

        const rarityProbabilities = { common: 60, rare: 25, epic: 12, legendary: 3 };
        const random = Math.random() * 100;
        let cumulative = 0;
        let selectedRarity: keyof typeof rarityProbabilities = "common";

        for (const [rarity, probability] of Object.entries(rarityProbabilities)) {
          cumulative += probability;
          if (random <= cumulative) {
            selectedRarity = rarity as keyof typeof rarityProbabilities;
            break;
          }
        }

        const availableItems = state.gachaItems.filter((item) => item.rarity === selectedRarity);
        const selectedItem = availableItems[Math.floor(Math.random() * availableItems.length)];
        const bonusPoints = { common: 0, rare: 20, epic: 50, legendary: 100 };

        set((state) => {
          const existingItem = state.collection.find((item) => item.id === selectedItem.id);
          const newCollection = existingItem
            ? state.collection.map((item) =>
                item.id === selectedItem.id ? { ...item, count: item.count + 1 } : item
              )
            : [...state.collection, { ...selectedItem, count: 1, obtained: new Date().toISOString() }];

          return {
            collection: newCollection,
            userData: {
              ...state.userData,
              points: state.userData.points - 100 + bonusPoints[selectedRarity],
            },
          };
        });

        return { ...selectedItem, count: 1, obtained: new Date().toISOString() };
      },

      checkLevelUp: () => {
        const state = get();
        const level = calculateLevelFromTotalXp(state.userData.totalXp);
        if (level !== state.userData.level) {
          set((state) => ({
            userData: {
              ...state.userData,
              level,
            },
          }));
          return level > state.userData.level;
        }
        return false;
      },

      checkSavingsLevelUp: () => {
        const state = get();
        const newLevel = calculateSavingsLevel(state.userData.totalSavings);
        if (newLevel > state.userData.savingsLevel) {
          const bonus = (newLevel - state.userData.savingsLevel) * 20;
          set((state) => ({
            userData: applyXpChange(
              {
                ...state.userData,
                savingsLevel: newLevel,
                points: state.userData.points + bonus,
              },
              bonus
            ),
          }));
          return true;
        }
        return false;
      },

      generateDailyMissions: () => {
        const templates = [
          { id: "daily_cooking_1", title: "自炊チャレンジ", description: "今日1回自炊する", target: 1, reward: 30, type: "cooking" as MissionType, icon: "🍳" },
          { id: "daily_expenses_record", title: "記録の習慣", description: "支出または自炊を1回記録する", target: 1, reward: 20, type: "record_habit" as MissionType, icon: "📝" },
          { id: "daily_savings", title: "節約成功", description: "誘惑に負けず節約を記録する", target: 1, reward: 25, type: "savings" as MissionType, icon: "💰" },
        ];

        set((state) => {
          const newDaily: Record<string, Mission> = {};
          templates.forEach((t) => {
            newDaily[t.id] = { ...t, progress: 0, completed: false, claimed: false };
          });
          return {
            missions: {
              ...state.missions,
              daily: newDaily,
              lastDailyReset: getCurrentDate(),
            },
          };
        });
      },

      generateWeeklyMissions: () => {
        const templates = [
          { id: "weekly_cooking_goal", title: "週間自炊マスター", description: "1週間で10回自炊する", target: 10, reward: 100, type: "cooking" as MissionType, icon: "👨‍🍳" },
          { id: "weekly_expense_goal", title: "支出管理上手", description: "1週間で食費を目標以下に抑える", target: 1, reward: 80, type: "expense_control" as MissionType, icon: "📊" },
          { id: "weekly_savings_goal", title: "節約チャンピオン", description: "1週間で1000円節約する", target: 1000, reward: 120, type: "total_savings" as MissionType, icon: "🏆" },
        ];

        set((state) => {
          const newWeekly: Record<string, Mission> = {};
          templates.forEach((t) => {
            newWeekly[t.id] = { ...t, progress: 0, completed: false, claimed: false };
          });
          const now = new Date();
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          return {
            missions: {
              ...state.missions,
              weekly: newWeekly,
              lastWeeklyReset: formatDateKey(startOfWeek),
            },
          };
        });
      },

      updateMissionProgress: (actionType, value = 1, options = {}) => {
        set((state) => {
          const updateDaily = options.updateDaily ?? true;
          const updateWeekly = options.updateWeekly ?? true;
          let updated = false;

          const applyProgress = (
            map: Record<string, Mission>,
            computeProgress: (m: Mission) => number
          ): Record<string, Mission> => {
            const next: Record<string, Mission> = {};
            Object.keys(map).forEach((id) => {
              const m = map[id];
              if (!m.completed && m.type === actionType) {
                const progress = Math.min(computeProgress(m), m.target);
                next[id] = { ...m, progress, completed: progress >= m.target };
                updated = true;
              } else {
                next[id] = m;
              }
            });
            return next;
          };

          const weekStart = state.missions.lastWeeklyReset;
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 7);
          const weekEndKey = formatDateKey(weekEnd);

          const weeklyProgress = (m: Mission): number => {
            if (actionType === "total_savings") {
              return state.savingsRecords
                .filter((r) => r.date >= weekStart && r.date < weekEndKey)
                .reduce((sum, r) => sum + r.amount, 0);
            }
            if (actionType === "cooking") {
              return state.cookingRecords.filter(
                (r) => r.date >= weekStart && r.date < weekEndKey
              ).length;
            }
            return m.progress + value;
          };

          const newDaily = updateDaily
            ? applyProgress(state.missions.daily, (m) => m.progress + value)
            : state.missions.daily;
          const newWeekly = updateWeekly
            ? applyProgress(state.missions.weekly, weeklyProgress)
            : state.missions.weekly;

          if (!updated) return state;
          return {
            missions: { ...state.missions, daily: newDaily, weekly: newWeekly },
          };
        });
      },

      claimMissionReward: (missionId) => {
        const state = get();
        const isDaily = missionId in state.missions.daily;
        const mission = isDaily
          ? state.missions.daily[missionId]
          : state.missions.weekly[missionId];
        if (!mission || !mission.completed || mission.claimed) return false;

        set((state) => {
          const updatedEntry = { ...mission, claimed: true };
          const newDaily = isDaily
            ? { ...state.missions.daily, [missionId]: updatedEntry }
            : state.missions.daily;
          const newWeekly = !isDaily
            ? { ...state.missions.weekly, [missionId]: updatedEntry }
            : state.missions.weekly;

          return {
            missions: {
              ...state.missions,
              daily: newDaily,
              weekly: newWeekly,
              completedHistory: [
                ...state.missions.completedHistory,
                {
                  id: missionId,
                  title: mission.title,
                  reward: mission.reward,
                  claimedAt: new Date().toISOString(),
                  type: isDaily ? "daily" : "weekly",
                },
              ],
            },
            userData: applyXpChange(
              {
                ...state.userData,
                points: state.userData.points + mission.reward,
              },
              mission.reward
            ),
          };
        });
        get().checkBadgeProgress();
        return true;
      },

      resetDailyMissions: () => {
        const today = getCurrentDate();
        if (get().missions.lastDailyReset !== today) {
          set((state) => ({
            missions: { ...state.missions, daily: {}, lastDailyReset: today },
          }));
        }
      },

      resetWeeklyMissions: () => {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const weekKey = formatDateKey(startOfWeek);
        if (get().missions.lastWeeklyReset !== weekKey) {
          set((state) => ({
            missions: { ...state.missions, weekly: {}, lastWeeklyReset: weekKey },
          }));
        }
      },

      initializeMissions: () => {
        const today = getCurrentDate();
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const weekKey = formatDateKey(startOfWeek);

        const dailyTemplates = [
          { id: "daily_cooking_1", title: "自炊チャレンジ", description: "今日1回自炊する", target: 1, reward: 30, type: "cooking" as MissionType, icon: "🍳" },
          { id: "daily_expenses_record", title: "記録の習慣", description: "支出または自炊を1回記録する", target: 1, reward: 20, type: "record_habit" as MissionType, icon: "📝" },
          { id: "daily_savings", title: "節約成功", description: "誘惑に負けず節約を記録する", target: 1, reward: 25, type: "savings" as MissionType, icon: "💰" },
        ];

        const weeklyTemplates = [
          { id: "weekly_cooking_goal", title: "週間自炊マスター", description: "1週間で10回自炊する", target: 10, reward: 100, type: "cooking" as MissionType, icon: "👨‍🍳" },
          { id: "weekly_expense_goal", title: "支出管理上手", description: "1週間で食費を目標以下に抑える", target: 1, reward: 80, type: "expense_control" as MissionType, icon: "📊" },
          { id: "weekly_savings_goal", title: "節約チャンピオン", description: "1週間で1000円節約する", target: 1000, reward: 120, type: "total_savings" as MissionType, icon: "🏆" },
        ];

        const current = get().missions;
        let daily = current.daily;
        let weekly = current.weekly;
        let lastDailyReset = current.lastDailyReset;
        let lastWeeklyReset = current.lastWeeklyReset;

        if (current.lastDailyReset !== today) {
          daily = {};
          lastDailyReset = today;
        }

        if (current.lastWeeklyReset !== weekKey) {
          weekly = {};
          lastWeeklyReset = weekKey;
        }

        if (Object.keys(daily).length === 0) {
          const newDaily: Record<string, Mission> = {};
          dailyTemplates.forEach((t) => {
            newDaily[t.id] = { ...t, progress: 0, completed: false, claimed: false };
          });
          daily = newDaily;
          lastDailyReset = today;
        }

        if (Object.keys(weekly).length === 0) {
          const newWeekly: Record<string, Mission> = {};
          weeklyTemplates.forEach((t) => {
            newWeekly[t.id] = { ...t, progress: 0, completed: false, claimed: false };
          });
          weekly = newWeekly;
          lastWeeklyReset = weekKey;
        }

        set((state) => ({
          missions: {
            ...state.missions,
            daily,
            weekly,
            lastDailyReset,
            lastWeeklyReset,
          },
        }));
      },

      checkBadgeProgress: () => {
        const state = get();
        const newBadges: string[] = [];

        badgeDefinitions.forEach((badge) => {
          if (!state.badges.earned.includes(badge.id)) {
            const req = badge.requirement;
            let shouldEarn = false;

            switch (req.type) {
              case "cooking_count": shouldEarn = state.cookingRecords.length >= req.value; break;
              case "total_savings": shouldEarn = state.userData.totalSavings >= req.value; break;
              case "savings_count": shouldEarn = state.savingsRecords.length >= req.value; break;
              case "level": shouldEarn = state.userData.level >= req.value; break;
              case "savings_level": shouldEarn = state.userData.savingsLevel >= req.value; break;
              case "no_waste_streak": shouldEarn = state.streaks.noWasteStreak >= req.value; break;
              case "consecutive_days": {
                const dateDayMs = 24 * 60 * 60 * 1000;
                const recordedDates = new Set([
                  ...state.expenses.map((e) => e.date),
                  ...state.cookingRecords.map((r) => r.date),
                ]);
                const sorted = Array.from(recordedDates).sort();
                let maxStreak = 0;
                let streak = 1;
                for (let i = 1; i < sorted.length; i++) {
                  const diff =
                    new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime();
                  streak = diff === dateDayMs ? streak + 1 : 1;
                  if (streak > maxStreak) maxStreak = streak;
                }
                if (sorted.length === 1) maxStreak = 1;
                shouldEarn = maxStreak >= req.value;
                break;
              }
              case "monthly_goal_achieved":
                shouldEarn =
                  state.userData.monthlyExpense <= state.goals.monthlyExpenseGoal &&
                  state.userData.cookingCount >= state.goals.cookingGoal &&
                  state.userData.allowanceUsed <= state.goals.allowanceGoal;
                break;
              case "gacha_items": shouldEarn = state.collection.length >= req.value; break;
              case "missions_completed":
                shouldEarn = state.missions.completedHistory.length >= req.value;
                break;
            }

            if (shouldEarn) newBadges.push(badge.id);
          }
        });

        if (newBadges.length > 0) {
          set((state) => {
            const earnedBadges = [...state.badges.earned, ...newBadges];
            const priorities: Record<string, number> = { special: 4, level: 3, cooking: 2, savings: 1 };
            const earnedBadgeObjects = badgeDefinitions.filter((b) => earnedBadges.includes(b.id));
            earnedBadgeObjects.sort((a, b) => {
              const diff = priorities[b.category] - priorities[a.category];
              return diff !== 0 ? diff : earnedBadges.indexOf(b.id) - earnedBadges.indexOf(a.id);
            });
            return {
              badges: {
                earned: earnedBadges,
                currentTitle: earnedBadgeObjects.length > 0 ? earnedBadgeObjects[0].id : "beginner",
              },
            };
          });
        }

        return newBadges;
      },

      recordNoWasteDay: () => {
        const today = getCurrentDate();
        const state = get();
        if (state.streaks.lastNoWasteDate === today) return;

        const yesterdayStr = getDaysAgo(1);

        set((state) => {
          const newStreak =
            state.streaks.lastNoWasteDate === yesterdayStr ? state.streaks.noWasteStreak + 1 : 1;
          const bonus = Math.min(newStreak * 5, 50);
          return {
            streaks: {
              ...state.streaks,
              noWasteStreak: newStreak,
              lastNoWasteDate: today,
              bestNoWasteStreak: Math.max(newStreak, state.streaks.bestNoWasteStreak),
            },
            userData: applyXpChange(
              {
                ...state.userData,
                points: state.userData.points + bonus,
              },
              bonus
            ),
          };
        });
        get().checkBadgeProgress();
      },

      recordSnackFreeDay: () => {
        const today = getCurrentDate();
        const state = get();
        if (state.streaks.lastSnackFreeDate === today) return;

        const yesterdayStr = getDaysAgo(1);

        set((state) => {
          const newStreak =
            state.streaks.lastSnackFreeDate === yesterdayStr ? state.streaks.snackFreeStreak + 1 : 1;
          const bonus = Math.min(newStreak * 3, 30);
          return {
            streaks: {
              ...state.streaks,
              snackFreeStreak: newStreak,
              lastSnackFreeDate: today,
              bestSnackFreeStreak: Math.max(newStreak, state.streaks.bestSnackFreeStreak),
            },
            userData: applyXpChange(
              {
                ...state.userData,
                points: state.userData.points + bonus,
              },
              bonus
            ),
          };
        });
        get().checkBadgeProgress();
      },

      resetStreakIfNeeded: (category, meal) => {
        const resetNoWaste = WASTE_CATEGORIES.includes(category);
        const resetSnackFree = meal === "snack";

        if (!resetNoWaste && !resetSnackFree) return;

        set((state) => ({
          streaks: {
            ...state.streaks,
            ...(resetNoWaste ? { noWasteStreak: 0, lastNoWasteDate: "" } : {}),
            ...(resetSnackFree ? { snackFreeStreak: 0, lastSnackFreeDate: "" } : {}),
          },
        }));
      },

      updateGoals: (type, value) => {
        set((state) => {
          const newGoals = { ...state.goals };
          switch (type) {
            case "expense": newGoals.monthlyExpenseGoal = value; break;
            case "allowance": newGoals.allowanceGoal = value; break;
            case "cooking": newGoals.cookingGoal = value; break;
            case "savings": newGoals.monthlySavingsGoal = value; break;
          }
          return { goals: newGoals };
        });
      },

      updateMonthlyData: () => {
        const state = get();
        const currentMonth = getCurrentDate().slice(0, 7);

        const monthlyExpenses = state.expenses.filter((e) => e.date.startsWith(currentMonth));
        const monthlyExpense = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
        const allowanceUsed = monthlyExpenses
          .filter((e) => e.category !== "スーパー")
          .reduce((sum, e) => sum + e.amount, 0);
        const cookingCount = state.cookingRecords.filter((r) => r.date.startsWith(currentMonth)).length;
        const monthlySavings = state.savingsRecords
          .filter((r) => r.date.startsWith(currentMonth))
          .reduce((sum, r) => sum + r.amount, 0);

        set((state) => ({
          userData: { ...state.userData, monthlyExpense, allowanceUsed, cookingCount, monthlySavings },
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
          missions: { daily: {}, weekly: {}, lastDailyReset: "", lastWeeklyReset: "", completedHistory: [] },
          badges: { earned: [], currentTitle: "beginner" },
          streaks: { noWasteStreak: 0, lastNoWasteDate: "", bestNoWasteStreak: 0, snackFreeStreak: 0, lastSnackFreeDate: "", bestSnackFreeStreak: 0 },
          gachaItems,
          badgeDefinitions,
          savingsEquivalents,
          allDayCookingBonusDates: [],
        });
      },
    }),
    {
      name: "food-expense-app-storage",
      storage: createJSONStorage(() => AsyncStorage),
      version: 3,
      migrate: (persistedState) => {
        const state = persistedState as PersistedAppState;
        if (!state?.userData) return persistedState;

        const currentLevel = state.userData.level ?? initialUserData.level;
        const currentPoints = state.userData.points ?? initialUserData.points;
        const totalXp = Math.max(
          state.userData.totalXp ?? currentPoints,
          getTotalXpRequiredForLevel(currentLevel)
        );

        // checkSavingsLevelUp() が呼ばれていなかった期間に取り残された savingsLevel を
        // 累計節約額から復元する（ボーナスポイントは遡って付与しない）
        const totalSavings =
          state.userData.totalSavings ?? initialUserData.totalSavings;
        const savingsLevel = Math.max(
          state.userData.savingsLevel ?? initialUserData.savingsLevel,
          calculateSavingsLevel(totalSavings)
        );

        return {
          ...state,
          userData: {
            ...initialUserData,
            ...state.userData,
            totalXp,
            level: Math.max(currentLevel, calculateLevelFromTotalXp(totalXp)),
            savingsLevel,
          },
        };
      },
    }
  )
);

// UI ストア
export const useUIStore = create<UIStore>((set, get) => ({
  currentTab: "home",
  isInputModalOpen: false,
  currentInputCategory: null,
  currentAmount: "",
  selectedMeal: null,
  editingRecord: null,
  notifications: [],
  isConfirmDialogOpen: false,
  confirmMessage: "",
  confirmAction: null,
  isHelpOpen: false,
  appHeaderHeight: 0,

  setCurrentTab: (tab) => set({ currentTab: tab }),

  openInputModal: (category) =>
    set({ isInputModalOpen: true, currentInputCategory: category, currentAmount: "", selectedMeal: null }),

  closeInputModal: () =>
    set({ isInputModalOpen: false, currentInputCategory: null, currentAmount: "", selectedMeal: null, editingRecord: null }),

  setAmount: (amount) => set({ currentAmount: amount }),
  setSelectedMeal: (meal) => set({ selectedMeal: meal }),
  setEditingRecord: (record) => set({ editingRecord: record }),

  showNotification: (type, message) => {
    const notification = { id: Date.now().toString(), type, message, timestamp: Date.now() };
    set((state) => ({ notifications: [...state.notifications, notification] }));
    setTimeout(() => get().removeNotification(notification.id), 3000);
  },

  removeNotification: (id) =>
    set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) })),

  showConfirmDialog: (message, action) =>
    set({ isConfirmDialogOpen: true, confirmMessage: message, confirmAction: action }),

  hideConfirmDialog: () =>
    set({ isConfirmDialogOpen: false, confirmMessage: "", confirmAction: null }),

  executeConfirmAction: () => {
    const { confirmAction } = get();
    if (confirmAction) confirmAction();
    get().hideConfirmDialog();
  },

  setHelpOpen: (isOpen) => set({ isHelpOpen: isOpen }),

  setAppHeaderHeight: (height) => set({ appHeaderHeight: height }),
}));
