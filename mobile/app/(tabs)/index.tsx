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

const HOME_CATEGORIES: { key: ExpenseCategory; icon: string; label: string }[] =
  [
    { key: "スーパー", icon: "🛒", label: "スーパー" },
    { key: "自販機", icon: "🥤", label: "自販機" },
    { key: "コンビニ", icon: "🏪", label: "コンビニ" },
    { key: "外食", icon: "🍽️", label: "外食" },
    { key: "飲み会", icon: "🍻", label: "飲み会" },
    { key: "デート", icon: "💕", label: "デート" },
    { key: "その他", icon: "📝", label: "その他" },
  ];

function getBudgetPercent(used: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min((used / goal) * 100, 100);
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

function getBudgetColor(percent: number, isOver: boolean): string {
  if (isOver || percent >= 100) return "#F44336";
  if (percent >= 80) return "#FF9800";
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

  const budgetItems = [
    {
      label: "スーパーの予算",
      used: supermarketUsed,
      goal: goals.monthlyExpenseGoal,
      status: getBudgetStatus(supermarketUsed, goals.monthlyExpenseGoal),
      percent: getBudgetPercent(supermarketUsed, goals.monthlyExpenseGoal),
    },
    {
      label: "お小遣い",
      used: allowanceUsed,
      goal: goals.allowanceGoal,
      status: getBudgetStatus(allowanceUsed, goals.allowanceGoal),
      percent: getBudgetPercent(allowanceUsed, goals.allowanceGoal),
    },
    {
      label: "食費合計",
      used: totalUsed,
      goal: totalGoal,
      status: totalBudgetStatus,
      percent: getBudgetPercent(totalUsed, totalGoal),
    },
  ];

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
        {/* 今日の食費 */}
        <View style={styles.card}>
          <View style={styles.cardIconRow}>
            <Text style={styles.cardIcon}>🍽️</Text>
            <Text style={styles.cardLabel}>今日の食費</Text>
          </View>
          <Text style={styles.todayAmount}>{formatCurrency(todayTotal)}</Text>
          <Text
            style={[
              styles.subLabel,
              totalBudgetStatus.isOver && styles.textOver,
            ]}
          >
            今月合計 {totalBudgetStatus.text}
          </Text>
        </View>

        {/* レベル進捗 */}
        <View style={styles.card}>
          <View style={styles.levelHeader}>
            <View>
              <Text style={styles.cardLabel}>レベル進捗</Text>
              <Text style={styles.levelValue}>Lv.{userData.level}</Text>
            </View>
            <View style={styles.levelMeta}>
              <Text style={styles.levelNext}>
                次のレベルまであと {xpToNext}XP
              </Text>
              <Text style={styles.levelTotal}>
                累計 {userData.totalXp.toLocaleString()}XP
              </Text>
            </View>
          </View>
          <View style={styles.levelBarBg}>
            <View
              style={[styles.levelBarFill, { width: `${levelProgressWidth}%` }]}
            />
          </View>
        </View>

        {/* 今月の予算 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>今月の予算</Text>
          <View style={styles.budgetList}>
            {budgetItems.map((item) => {
              const barColor = getBudgetColor(item.percent, item.status.isOver);

              return (
                <View key={item.label} style={styles.budgetItem}>
                  <View style={styles.budgetHeader}>
                    <Text style={styles.budgetLabel}>{item.label}</Text>
                    <Text
                      style={[
                        styles.budgetStatus,
                        item.status.isOver && styles.textOver,
                      ]}
                    >
                      {item.status.text}
                    </Text>
                  </View>
                  <View style={styles.budgetBarBg}>
                    <View
                      style={[
                        styles.budgetBarFill,
                        {
                          width: `${item.percent}%`,
                          backgroundColor: barColor,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.budgetMeta}>
                    使用 {formatCurrency(item.used)} /{" "}
                    {formatCurrency(item.goal)}
                  </Text>
                </View>
              );
            })}
          </View>
          <View style={styles.budgetNote}>
            <Text style={styles.budgetNoteText}>
              食費合計はスーパーの予算 + お小遣いを目安にしています
            </Text>
          </View>
        </View>

        {/* カテゴリー入力 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>カテゴリー入力</Text>
          <View style={styles.categoryGrid}>
            {HOME_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={styles.categoryBtn}
                onPress={() => handleCategoryPress(cat.key)}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
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
              <Text style={styles.actionSub}>{savingsToday ? '記録済み' : '節約した金額を入力'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, styles.flex1, noWasteToday && styles.actionCardDone]}
              onPress={() => { if (!noWasteToday) recordNoWasteDay(); }}
              activeOpacity={noWasteToday ? 1 : 0.7}
            >
              <Text style={styles.actionIcon}>✨</Text>
              <Text style={styles.actionTitle}>無駄遣いなし</Text>
              <Text style={styles.actionSub}>{noWasteToday ? '記録済み！' : `連続${streaks.noWasteStreak}日`}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, styles.flex1, snackFreeToday && styles.actionCardDone]}
              onPress={() => { if (!snackFreeToday) recordSnackFreeDay(); }}
              activeOpacity={snackFreeToday ? 1 : 0.7}
            >
              <Text style={styles.actionIcon}>🥗</Text>
              <Text style={styles.actionTitle}>間食なし</Text>
              <Text style={styles.actionSub}>{snackFreeToday ? '記録済み！' : `連続${streaks.snackFreeStreak}日`}</Text>
            </TouchableOpacity>
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
            onPress={() => router.push("/(tabs)/collection")}
          >
            <Text style={styles.gachaBtnText}>報酬をチェック →</Text>
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
            <Text style={styles.savingsSub}>節約した金額を入力してください（¥10 = 1pt）</Text>
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
  cardIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardIcon: {
    fontSize: 16,
  },
  cardLabel: {
    fontSize: 12,
    color: "#757575",
    fontWeight: "500",
  },
  todayAmount: {
    fontSize: 26,
    fontWeight: "800",
    color: "#212121",
  },
  subLabel: {
    fontSize: 12,
    color: "#9E9E9E",
  },
  textOver: {
    color: "#F44336",
  },
  levelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  levelValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2E7D32",
    marginTop: 2,
  },
  levelMeta: {
    flex: 1,
    alignItems: "flex-end",
    gap: 2,
  },
  levelNext: {
    fontSize: 13,
    fontWeight: "700",
    color: "#212121",
    textAlign: "right",
  },
  levelTotal: {
    fontSize: 11,
    color: "#757575",
    textAlign: "right",
  },
  levelBarBg: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  levelBarFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 4,
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
  categoryIcon: {
    fontSize: 22,
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
  actionIcon: {
    fontSize: 28,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#212121",
    textAlign: "center",
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
  budgetList: {
    gap: 12,
  },
  budgetItem: {
    gap: 6,
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  budgetLabel: {
    flex: 1,
    fontSize: 13,
    color: "#212121",
    fontWeight: "700",
  },
  budgetStatus: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "700",
    textAlign: "right",
  },
  budgetBarBg: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  budgetBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  budgetMeta: {
    fontSize: 11,
    color: "#9E9E9E",
  },
  budgetNote: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  budgetNoteText: {
    fontSize: 11,
    color: "#757575",
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
