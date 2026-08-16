import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useAppStore } from "@/store/useAppStore";
import {
  calculateGachaProgress,
  calculateLevelProgress,
} from "@/utils/calculationHelpers";
import { formatCurrency } from "@/utils/formatHelpers";
import { getCurrentDate } from "@/utils/dateHelpers";
import { InputModal } from "@/components/InputModal";
import { CookingModal } from "@/components/CookingModal";
import type { ExpenseCategory, MealTime } from "@/types";
import { COOKING_RECORD_POINTS } from "@/constants/game";
import {
  CATEGORY_LIST,
  CATEGORY_ICONS,
  CATEGORY_COLORS,
  WASTE_CATEGORIES,
} from "@/constants/categories";

const HOME_CATEGORIES: { key: ExpenseCategory; icon: string; label: string }[] =
  CATEGORY_LIST.map((key) => ({
    key,
    icon: CATEGORY_ICONS[key],
    label: key,
  }));

// スーパーは食材費として別枠のため1行目に単独配置し、残りをグリッドに並べる
const SUPERMARKET_HOME_CATEGORY = HOME_CATEGORIES.find(
  (cat) => cat.key === "スーパー",
)!;
const OTHER_HOME_CATEGORIES = HOME_CATEGORIES.filter(
  (cat) => cat.key !== "スーパー",
);

// 残量（残り予算）の割合を返す。使い切った・超過した場合は 0。
function getBudgetPercent(used: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.max(((goal - used) / goal) * 100, 0);
}

function getBudgetStatus(
  used: number,
  goal: number,
): { text: string; isOver: boolean } {
  const remaining = goal - used;
  if (remaining >= 0) {
    return { text: `残り ${formatCurrency(remaining)}`, isOver: false };
  }

  return { text: `超過 ${formatCurrency(Math.abs(remaining))}`, isOver: true };
}

// 残量の割合（getBudgetPercent の戻り値）が少ないほど警戒色にする。
// 目標未設定（goal <= 0）は「使い切った」と区別するためグレーにする。
function getBudgetColor(remainingPercent: number, goal: number): string {
  if (goal <= 0) return "#9E9E9E";
  if (remainingPercent <= 20) return "#F44336";
  if (remainingPercent <= 40) return "#FF9800";
  return "#4CAF50";
}

export default function HomeTab() {
  const router = useRouter();
  const {
    userData,
    goals,
    expenses,
    missions,
    streaks,
    cookingRecords,
    savingsRecords,
    addSavingsRecord,
    recordNoWasteDay,
    recordSnackFreeDay,
  } = useAppStore();
  const [selectedCategory, setSelectedCategory] =
    useState<ExpenseCategory | null>(null);
  const [showInputModal, setShowInputModal] = useState(false);
  const [showCookingModal, setShowCookingModal] = useState(false);
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const [savingsAmount, setSavingsAmount] = useState('');

  const today = getCurrentDate();
  const currentMonth = today.slice(0, 7);

  const todayTotal = expenses
    .filter((e) => e.date === today)
    .reduce((sum, e) => sum + e.amount, 0);

  const supermarketUsed = expenses
    .filter((e) => e.date.startsWith(currentMonth) && e.category === "スーパー")
    .reduce((sum, e) => sum + e.amount, 0);
  const allowanceUsed = userData.allowanceUsed;
  const totalUsed = userData.monthlyExpense;
  const totalGoal = goals.monthlyExpenseGoal + goals.allowanceGoal;
  const totalBudgetStatus = getBudgetStatus(totalUsed, totalGoal);

  // お小遣い＝減らしたい支出（主役）
  const allowanceStatus = getBudgetStatus(allowanceUsed, goals.allowanceGoal);
  const allowancePercent = getBudgetPercent(allowanceUsed, goals.allowanceGoal);
  const allowanceColor = getBudgetColor(allowancePercent, goals.allowanceGoal);

  // スーパー＝自炊のための食材費（減らす必要のない支出・控えめ表示）
  const supermarketStatus = getBudgetStatus(
    supermarketUsed,
    goals.monthlyExpenseGoal,
  );
  const supermarketPercent = getBudgetPercent(
    supermarketUsed,
    goals.monthlyExpenseGoal,
  );
  const supermarketColor = getBudgetColor(
    supermarketPercent,
    goals.monthlyExpenseGoal,
  );

  const dailyList = Object.values(missions.daily);
  const completedDaily = dailyList.filter((m) => m.completed).length;
  const totalDaily = dailyList.length;
  const claimablePoints = dailyList
    .filter((m) => m.completed && !m.claimed)
    .reduce((sum, m) => sum + m.reward, 0);

  const gachaProgress = calculateGachaProgress(userData.points);
  const { pointsToNext: xpToNext, progressPercent: levelProgressPercent } =
    calculateLevelProgress(userData.totalXp, userData.level);
  const levelProgressWidth = Math.min(Math.max(levelProgressPercent, 0), 100);

  const COOKING_MEALS: MealTime[] = ["morning", "lunch", "dinner"];
  const todayMeals = cookingRecords
    .filter((r) => r.date === today && COOKING_MEALS.includes(r.meal))
    .map((r) => r.meal) as MealTime[];
  const allMealsComplete = COOKING_MEALS.every((m) => todayMeals.includes(m));

  const noWasteToday = streaks.lastNoWasteDate === today;
  const snackFreeToday = streaks.lastSnackFreeDate === today;
  const savingsToday = savingsRecords.some((r) => r.date === today);
  const wastedToday = expenses.some(
    (e) => e.date === today && WASTE_CATEGORIES.includes(e.category)
  );
  const snackedToday = expenses.some((e) => e.date === today && e.meal === "snack");

  const handleCategoryPress = (cat: ExpenseCategory) => {
    setSelectedCategory(cat);
    setShowInputModal(true);
  };

  const handleSaveSavings = () => {
    if (!savingsAmount || !/^\d+$/.test(savingsAmount)) {
      Alert.alert('入力エラー', '金額を正しく入力してください');
      return;
    }
    const parsed = Number(savingsAmount);
    if (parsed <= 0 || !Number.isSafeInteger(parsed)) {
      Alert.alert('入力エラー', '金額を正しく入力してください');
      return;
    }
    addSavingsRecord(parsed);
    setSavingsAmount('');
    setShowSavingsModal(false);
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* 今月の残り予算（お小遣いが主役の残量メーター） */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>今月の残り予算</Text>

          <View style={styles.allowanceBlock}>
            <Text style={styles.allowanceLabel}>👛 今月の無駄遣い枠</Text>
            <View style={styles.allowanceAmountRow}>
              <Text
                style={[
                  styles.allowanceAmount,
                  allowanceStatus.isOver && styles.textOver,
                ]}
              >
                {allowanceStatus.text}
              </Text>
              <Text style={styles.allowanceGoalText}>
                / {formatCurrency(goals.allowanceGoal)}
              </Text>
            </View>
            <View style={styles.allowanceBarBg}>
              <View
                style={[
                  styles.allowanceBarFill,
                  {
                    width: `${allowancePercent}%`,
                    backgroundColor: allowanceColor,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.supermarketBlock}>
            <View style={styles.supermarketHeader}>
              <Text style={styles.supermarketLabel}>
                🛒 スーパー（食材費）
              </Text>
              <Text
                style={[
                  styles.supermarketStatus,
                  supermarketStatus.isOver && styles.textOver,
                ]}
              >
                {supermarketStatus.text} /{" "}
                {formatCurrency(goals.monthlyExpenseGoal)}
              </Text>
            </View>
            <View style={styles.supermarketBarBg}>
              <View
                style={[
                  styles.supermarketBarFill,
                  {
                    width: `${supermarketPercent}%`,
                    backgroundColor: supermarketColor,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>食費合計</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(totalUsed)} / {formatCurrency(totalGoal)}
            </Text>
          </View>
        </View>

        {/* カテゴリー入力 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>カテゴリー入力</Text>
          <TouchableOpacity
            style={styles.categorySuperBtn}
            onPress={() => handleCategoryPress(SUPERMARKET_HOME_CATEGORY.key)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.categoryIconWrap,
                { borderColor: CATEGORY_COLORS[SUPERMARKET_HOME_CATEGORY.key] },
              ]}
            >
              <Text style={styles.categoryIcon}>
                {SUPERMARKET_HOME_CATEGORY.icon}
              </Text>
            </View>
            <Text style={styles.categorySuperLabel}>
              {SUPERMARKET_HOME_CATEGORY.label}
            </Text>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>食材費</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.categoryGrid}>
            {OTHER_HOME_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={styles.categoryBtn}
                onPress={() => handleCategoryPress(cat.key)}
              >
                <View
                  style={[
                    styles.categoryIconWrap,
                    { borderColor: CATEGORY_COLORS[cat.key] },
                  ]}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                </View>
                <Text style={styles.categoryLabel}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 今日のアクション */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>今日のアクション</Text>
            <Text style={styles.streakBadge}>
              🔥 連続{streaks.noWasteStreak}日
            </Text>
          </View>
          <View style={styles.row}>
            <TouchableOpacity
              style={[
                styles.actionCard,
                styles.flex1,
                allMealsComplete && styles.actionCardDone,
              ]}
              onPress={() => setShowCookingModal(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>🍳</Text>
              <Text style={styles.actionTitle}>自炊を記録</Text>
              <Text style={styles.actionSub}>
                {allMealsComplete
                  ? "全食完了！"
                  : todayMeals.length > 0
                    ? `${todayMeals.length}/3食 記録済み`
                    : "未記録"}
              </Text>
              <View style={styles.pointBadge}>
                <Text style={styles.pointBadgeText}>
                  +{COOKING_RECORD_POINTS}pt
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, styles.flex1, styles.missionCard]}
              onPress={() => router.push("/(tabs)/missions")}
            >
              <Text style={styles.actionIcon}>🚩</Text>
              <Text style={styles.actionTitle}>今日のミッション</Text>
              <Text style={styles.missionProgress}>
                {completedDaily}/{totalDaily} 完了
              </Text>
              {claimablePoints > 0 && (
                <View style={[styles.pointBadge, styles.pointBadgeOrange]}>
                  <Text style={styles.pointBadgeText}>
                    +{claimablePoints}pt
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.actionCard, styles.flex1, savingsToday && styles.actionCardDone]}
              onPress={() => { setSavingsAmount(''); setShowSavingsModal(true); }}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>💰</Text>
              <Text style={styles.actionTitle}>節約を記録</Text>
              <Text style={styles.actionSub}>{savingsToday ? '記録済み' : '買うのをやめた金額'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionCard,
                styles.flex1,
                noWasteToday && styles.actionCardDone,
                !noWasteToday && wastedToday && styles.actionCardMissed,
              ]}
              onPress={() => { if (!noWasteToday && !wastedToday) recordNoWasteDay(); }}
              activeOpacity={(noWasteToday || wastedToday) ? 1 : 0.7}
            >
              <Text style={styles.actionIcon}>✨</Text>
              <Text style={[styles.actionTitle, !noWasteToday && wastedToday && styles.actionTitleMissed]}>無駄遣いなし</Text>
              <Text style={styles.actionSub}>
                {noWasteToday ? '記録済み！' : wastedToday ? '無駄遣いあり' : `連続${streaks.noWasteStreak}日`}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionCard,
                styles.flex1,
                snackFreeToday && styles.actionCardDone,
                !snackFreeToday && snackedToday && styles.actionCardMissed,
              ]}
              onPress={() => { if (!snackFreeToday && !snackedToday) recordSnackFreeDay(); }}
              activeOpacity={(snackFreeToday || snackedToday) ? 1 : 0.7}
            >
              <Text style={styles.actionIcon}>🥗</Text>
              <Text style={[styles.actionTitle, !snackFreeToday && snackedToday && styles.actionTitleMissed]}>間食なし</Text>
              <Text style={styles.actionSub}>
                {snackFreeToday ? '記録済み！' : snackedToday ? '間食あり' : `連続${streaks.snackFreeStreak}日`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 今日の食費・レベル進捗（コンパクト表示） */}
        <View style={[styles.card, styles.compactCard]}>
          <View style={styles.compactRow}>
            <View style={styles.compactItem}>
              <Text style={styles.compactLabel}>🍽️ 今日の食費</Text>
              <Text style={styles.compactAmount}>
                {formatCurrency(todayTotal)}
              </Text>
              <Text
                style={[
                  styles.compactSub,
                  totalBudgetStatus.isOver && styles.textOver,
                ]}
              >
                今月合計 {totalBudgetStatus.text}
              </Text>
            </View>
            <View style={styles.compactDivider} />
            <View style={styles.compactItem}>
              <Text style={styles.compactLabel}>
                Lv.{userData.level} ・ 累計{userData.totalXp.toLocaleString()}XP
              </Text>
              <Text style={styles.compactAmount}>
                {xpToNext.toLocaleString()}XP
              </Text>
              <Text style={styles.compactSub}>次のレベルまで</Text>
              <View style={styles.compactLevelBarBg}>
                <View
                  style={[
                    styles.compactLevelBarFill,
                    { width: `${levelProgressWidth}%` },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* ガチャティザー */}
        <View style={styles.card}>
          <View style={styles.gachaRow}>
            <Text style={styles.gachaIcon}>🎰</Text>
            <View style={styles.flex1}>
              <Text style={styles.gachaTitle}>
                {gachaProgress.canPlay
                  ? "ガチャできます"
                  : `ガチャまであと ${gachaProgress.pointsNeeded}pt`}
              </Text>
              <View style={styles.gachaBarBg}>
                <View
                  style={[
                    styles.gachaBarFill,
                    { width: `${gachaProgress.progressPercent}%` },
                  ]}
                />
              </View>
              <Text style={styles.gachaSub}>
                {gachaProgress.currentCyclePoints} / 100 pt
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.gachaBtn}
            onPress={() =>
              router.push({ pathname: "/(tabs)/achievements", params: { segment: "items" } })
            }
          >
            <Text style={styles.gachaBtnText}>コレクションを見る →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <InputModal
        key={selectedCategory ?? "none"}
        visible={showInputModal}
        initialCategory={selectedCategory}
        onClose={() => {
          setShowInputModal(false);
          setSelectedCategory(null);
        }}
      />
      <CookingModal
        visible={showCookingModal}
        onClose={() => setShowCookingModal(false)}
        todayMeals={todayMeals}
      />

      <Modal
        visible={showSavingsModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowSavingsModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.savingsOverlay}
        >
          <View style={styles.savingsSheet}>
            <Text style={styles.savingsTitle}>節約を記録する</Text>
            <Text style={styles.savingsSub}>買うのをやめた金額を入力してください（¥10 = 1pt）</Text>
            <View style={styles.savingsInputRow}>
              <Text style={styles.savingsYen}>¥</Text>
              <TextInput
                style={styles.savingsInput}
                value={savingsAmount}
                onChangeText={setSavingsAmount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#BDBDBD"
                autoFocus
              />
            </View>
            <View style={styles.savingsBtnRow}>
              <TouchableOpacity
                style={styles.savingsCancelBtn}
                onPress={() => setShowSavingsModal(false)}
              >
                <Text style={styles.savingsCancelText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.savingsSaveBtn} onPress={handleSaveSavings}>
                <Text style={styles.savingsSaveText}>記録する</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    padding: 12,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    gap: 10,
  },
  textOver: {
    color: "#F44336",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#212121",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryBtn: {
    flexBasis: "30%",
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    backgroundColor: "#FAFAFA",
    gap: 4,
  },
  categorySuperBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    backgroundColor: "#FAFAFA",
  },
  categoryIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  categoryIcon: {
    fontSize: 20,
  },
  categorySuperLabel: {
    flex: 1,
    fontSize: 13,
    color: "#424242",
    fontWeight: "600",
  },
  categoryTag: {
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  categoryTagText: {
    fontSize: 11,
    color: "#2E7D32",
    fontWeight: "700",
  },
  categoryLabel: {
    fontSize: 11,
    color: "#424242",
    fontWeight: "500",
  },
  streakBadge: {
    fontSize: 12,
    color: "#FF9800",
    fontWeight: "600",
  },
  actionCard: {
    backgroundColor: "#F9FBF9",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "#E8F5E9",
    position: "relative",
  },
  missionCard: {
    backgroundColor: "#F3F8FF",
    borderColor: "#BBDEFB",
  },
  actionCardDone: {
    backgroundColor: "#E8F5E9",
    borderColor: "#A5D6A7",
  },
  actionCardMissed: {
    backgroundColor: "#F5F5F5",
    borderColor: "#E0E0E0",
  },
  actionIcon: {
    fontSize: 28,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#212121",
    textAlign: "center",
  },
  actionTitleMissed: {
    color: "#9E9E9E",
  },
  actionSub: {
    fontSize: 11,
    color: "#9E9E9E",
  },
  missionProgress: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2196F3",
  },
  pointBadge: {
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 2,
  },
  pointBadgeOrange: {
    backgroundColor: "#FF9800",
  },
  pointBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  gachaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  gachaIcon: {
    fontSize: 36,
  },
  gachaTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#212121",
    marginBottom: 6,
  },
  gachaBarBg: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  gachaBarFill: {
    height: "100%",
    backgroundColor: "#FF9800",
    borderRadius: 4,
  },
  gachaSub: {
    fontSize: 11,
    color: "#9E9E9E",
    marginTop: 4,
  },
  gachaBtn: {
    backgroundColor: "#FFF3E0",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFE0B2",
  },
  gachaBtnText: {
    color: "#E65100",
    fontSize: 14,
    fontWeight: "700",
  },
  allowanceBlock: {
    backgroundColor: "#F1F8E9",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#A5D6A7",
    gap: 6,
  },
  allowanceLabel: {
    fontSize: 13,
    color: "#2E7D32",
    fontWeight: "700",
  },
  allowanceAmountRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  allowanceAmount: {
    fontSize: 24,
    fontWeight: "800",
    color: "#212121",
  },
  allowanceGoalText: {
    fontSize: 13,
    color: "#757575",
  },
  allowanceBarBg: {
    height: 14,
    backgroundColor: "#E0E0E0",
    borderRadius: 7,
    overflow: "hidden",
  },
  allowanceBarFill: {
    height: "100%",
    borderRadius: 7,
  },
  supermarketBlock: {
    gap: 4,
  },
  supermarketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  supermarketLabel: {
    fontSize: 12,
    color: "#757575",
    fontWeight: "500",
  },
  supermarketStatus: {
    fontSize: 12,
    color: "#757575",
    fontWeight: "600",
  },
  supermarketBarBg: {
    height: 5,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    overflow: "hidden",
  },
  supermarketBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 12,
    color: "#9E9E9E",
  },
  totalValue: {
    fontSize: 12,
    color: "#9E9E9E",
    fontWeight: "600",
  },
  compactCard: {
    padding: 12,
  },
  compactRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 12,
  },
  compactItem: {
    flex: 1,
    gap: 2,
  },
  compactDivider: {
    width: 1,
    backgroundColor: "#E0E0E0",
  },
  compactLabel: {
    fontSize: 11,
    color: "#757575",
    fontWeight: "500",
  },
  compactAmount: {
    fontSize: 16,
    fontWeight: "800",
    color: "#212121",
  },
  compactSub: {
    fontSize: 11,
    color: "#9E9E9E",
  },
  compactLevelBarBg: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 2,
  },
  compactLevelBarFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 3,
  },
  savingsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 20,
  },
  savingsSheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  savingsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    textAlign: 'center',
  },
  savingsSub: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
  },
  savingsInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
  },
  savingsYen: {
    fontSize: 20,
    color: '#424242',
    marginRight: 4,
  },
  savingsInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: '700',
    color: '#212121',
    paddingVertical: 10,
  },
  savingsBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  savingsCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  savingsCancelText: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '600',
  },
  savingsSaveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  savingsSaveText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
