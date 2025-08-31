// ユーザーデータ型定義
export interface UserData {
  level: number;
  points: number;
  totalSavings: number;
  monthlySavings: number;
  monthlyExpense: number;
  cookingCount: number;
  allowanceUsed: number;
  lastUpdated: string;
  savingsLevel: number;
}

// カテゴリ型定義
export type ExpenseCategory =
  | "スーパー"
  | "自販機"
  | "コンビニ"
  | "外食"
  | "飲み会"
  | "デート"
  | "その他";

// 食事時間帯型定義
export type MealTime = "morning" | "lunch" | "dinner" | "snack";

// 支出記録型定義
export interface ExpenseRecord {
  id: number;
  date: string;
  category: ExpenseCategory;
  amount: number;
  meal: MealTime;
  timestamp: string;
}

// 自炊記録型定義
export interface CookingRecord {
  id: number;
  date: string;
  meal: MealTime;
  timestamp: string;
  memo?: string; // 料理名や簡単なメモ（オプション）
}

// 節約記録型定義
export interface SavingsRecord {
  id: number;
  date: string;
  amount: number;
  timestamp: string;
}

// ガチャアイテム型定義
export type ItemRarity = "common" | "rare" | "epic" | "legendary";

export interface GachaItem {
  id: number;
  name: string;
  icon: string;
  rarity: ItemRarity;
  description: string;
}

// コレクションアイテム型定義
export interface CollectionItem extends GachaItem {
  count: number;
  obtained: string;
}

// ミッション型定義
export type MissionType =
  | "cooking"
  | "expense_record"
  | "record_habit"
  | "savings"
  | "total_savings"
  | "expense_control";

export interface Mission {
  id: string;
  title: string;
  description: string;
  target: number;
  reward: number;
  type: MissionType;
  icon: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
}

// ミッション履歴型定義
export interface MissionHistory {
  id: string;
  title: string;
  reward: number;
  claimedAt: string;
  type: "daily" | "weekly";
}

// ミッション管理型定義
export interface MissionState {
  daily: Record<string, Mission>;
  weekly: Record<string, Mission>;
  lastDailyReset: string;
  lastWeeklyReset: string;
  completedHistory: MissionHistory[];
}

// バッジ要件型定義
export type BadgeRequirementType =
  | "cooking_count"
  | "total_savings"
  | "savings_count"
  | "level"
  | "consecutive_days"
  | "monthly_goal_achieved"
  | "gacha_items"
  | "missions_completed"
  | "savings_level"
  | "no_waste_streak";

export interface BadgeRequirement {
  type: BadgeRequirementType;
  value: number;
}

// バッジ型定義
export type BadgeCategory = "cooking" | "savings" | "level" | "special";

export interface Badge {
  id: string;
  category: BadgeCategory;
  title: string;
  description: string;
  icon: string;
  requirement: BadgeRequirement;
  earned: boolean;
}

// バッジ状態型定義
export interface BadgeState {
  earned: string[];
  currentTitle: string;
}

// 連続記録型定義
export interface Streaks {
  noWasteStreak: number;
  lastNoWasteDate: string;
  bestNoWasteStreak: number;
  snackFreeStreak: number;
  lastSnackFreeDate: string;
  bestSnackFreeStreak: number;
}

// 目標設定型定義
export interface Goals {
  monthlyExpenseGoal: number;
  allowanceGoal: number;
  cookingGoal: number;
  monthlySavingsGoal: number;
}

// 節約額相当型定義
export interface SavingsEquivalent {
  amount: number;
  item: string;
  icon: string;
}

// アプリケーション状態型定義
export interface AppState {
  userData: UserData;
  goals: Goals;
  expenses: ExpenseRecord[];
  cookingRecords: CookingRecord[];
  savingsRecords: SavingsRecord[];
  collection: CollectionItem[];
  missions: MissionState;
  badges: BadgeState;
  streaks: Streaks;
  gachaItems: GachaItem[];
  badgeDefinitions: Badge[];
  savingsEquivalents: SavingsEquivalent[];
}

// タブ型定義
export type TabType =
  | "home"
  | "stats"
  | "missions"
  | "badges"
  | "collection"
  | "settings";

// 通知型定義
export type NotificationType = "success" | "error" | "info" | "warning";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: number;
}

// UI状態型定義
export interface UIState {
  currentTab: TabType;
  isInputModalOpen: boolean;
  currentInputCategory: ExpenseCategory | null;
  currentAmount: string;
  selectedMeal: MealTime | null;
  editingRecord: ExpenseRecord | null;
  notifications: Notification[];
  isConfirmDialogOpen: boolean;
  confirmMessage: string;
  confirmAction: (() => void) | null;
  isHelpOpen: boolean; // ヘルプ画面の表示状態
}
