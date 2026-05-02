import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { calculateLevelProgress } from '@/utils/calculationHelpers';
import { formatCurrency } from '@/utils/formatHelpers';
import { CircularProgress } from '@/components/CircularProgress';
import { InputModal } from '@/components/InputModal';
import { CookingModal } from '@/components/CookingModal';
import type { ExpenseCategory, MealTime } from '@/types';
import { COOKING_RECORD_POINTS } from '@/constants/game';

const HOME_CATEGORIES: { key: ExpenseCategory; icon: string; label: string }[] = [
  { key: 'スーパー', icon: '🛒', label: 'スーパー' },
  { key: '自販機', icon: '🥤', label: '自販機' },
  { key: 'コンビニ', icon: '🏪', label: 'コンビニ' },
  { key: '外食', icon: '🍽️', label: '外食' },
  { key: '飲み会', icon: '🍻', label: '飲み会' },
  { key: 'デート', icon: '💕', label: 'デート' },
  { key: 'その他', icon: '📝', label: 'その他' },
];

export default function HomeTab() {
  const router = useRouter();
  const { userData, goals, expenses, missions, streaks, cookingRecords } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);
  const [showInputModal, setShowInputModal] = useState(false);
  const [showCookingModal, setShowCookingModal] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const todayTotal = expenses
    .filter((e) => e.date === today)
    .reduce((sum, e) => sum + e.amount, 0);

  const remaining = Math.max(0, goals.monthlyExpenseGoal - userData.monthlyExpense);
  const budgetPercent = goals.monthlyExpenseGoal > 0
    ? Math.min((remaining / goals.monthlyExpenseGoal) * 100, 100)
    : 0;

  const dailyList = Object.values(missions.daily);
  const completedDaily = dailyList.filter((m) => m.completed).length;
  const totalDaily = dailyList.length;
  const claimablePoints = dailyList
    .filter((m) => m.completed && !m.claimed)
    .reduce((sum, m) => sum + m.reward, 0);

  const allowanceRemaining = Math.max(0, goals.allowanceGoal - userData.allowanceUsed);
  const allowancePercent = goals.allowanceGoal > 0
    ? Math.min((allowanceRemaining / goals.allowanceGoal) * 100, 100)
    : 0;

  const gachaPointsNeeded = 100 - (userData.points % 100);
  const gachaProgress = (userData.points % 100) / 100;
  const { pointsToNext: xpToNext, progressPercent: levelProgressPercent } =
    calculateLevelProgress(userData.totalXp, userData.level);
  const levelProgressWidth = Math.min(Math.max(levelProgressPercent, 0), 100);

  const COOKING_MEALS: MealTime[] = ['morning', 'lunch', 'dinner'];
  const todayMeals = cookingRecords
    .filter((r) => r.date === today && COOKING_MEALS.includes(r.meal))
    .map((r) => r.meal) as MealTime[];
  const allMealsComplete = COOKING_MEALS.every((m) => todayMeals.includes(m));

  const handleCategoryPress = (cat: ExpenseCategory) => {
    setSelectedCategory(cat);
    setShowInputModal(true);
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        {/* 今日の食費 */}
        <View style={styles.card}>
          <View style={styles.cardIconRow}>
            <Text style={styles.cardIcon}>🍽️</Text>
            <Text style={styles.cardLabel}>今日の食費</Text>
          </View>
          <Text style={styles.todayAmount}>{formatCurrency(todayTotal)}</Text>
          <Text style={styles.subLabel}>残り {formatCurrency(remaining)}</Text>
        </View>

        {/* レベル進捗 */}
        <View style={styles.card}>
          <View style={styles.levelHeader}>
            <View>
              <Text style={styles.cardLabel}>レベル進捗</Text>
              <Text style={styles.levelValue}>Lv.{userData.level}</Text>
            </View>
            <View style={styles.levelMeta}>
              <Text style={styles.levelNext}>次のレベルまであと {xpToNext}XP</Text>
              <Text style={styles.levelTotal}>累計 {userData.totalXp.toLocaleString()}XP</Text>
            </View>
          </View>
          <View style={styles.levelBarBg}>
            <View style={[styles.levelBarFill, { width: `${levelProgressWidth}%` }]} />
          </View>
        </View>

        {/* 今月の予算 + お小遣い */}
        <View style={styles.card}>
          <View style={styles.budgetRow}>
            <View style={styles.budgetLeft}>
              <Text style={styles.cardLabel}>今月の予算</Text>
              <CircularProgress
                percent={budgetPercent}
                size={72}
                strokeWidth={7}
                color={budgetPercent <= 10 ? '#F44336' : budgetPercent <= 30 ? '#FF9800' : '#4CAF50'}
              >
                <Text style={styles.circlePercent}>{Math.round(budgetPercent)}%</Text>
              </CircularProgress>
              <Text style={styles.budgetAmount}>残り {formatCurrency(remaining)}</Text>
              <Text style={styles.budgetGoal}>
                使用 {formatCurrency(userData.monthlyExpense)} / {formatCurrency(goals.monthlyExpenseGoal)}
              </Text>
            </View>
            <View style={styles.budgetRight}>
              <Text style={styles.allowanceLabel}>お小遣い</Text>
              <View style={styles.allowanceBarBg}>
                <View
                  style={[
                    styles.allowanceBarFill,
                    {
                      width: `${allowancePercent}%`,
                      backgroundColor: allowancePercent <= 10 ? '#F44336' : allowancePercent <= 30 ? '#FF9800' : '#4CAF50',
                    },
                  ]}
                />
              </View>
              <Text style={styles.allowanceText}>
                残り {formatCurrency(allowanceRemaining)} / {formatCurrency(goals.allowanceGoal)}
              </Text>
            </View>
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
            <Text style={styles.streakBadge}>🔥 連続{streaks.noWasteStreak}日</Text>
          </View>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.actionCard, styles.flex1, allMealsComplete && styles.actionCardDone]}
              onPress={() => !allMealsComplete && setShowCookingModal(true)}
              activeOpacity={allMealsComplete ? 1 : 0.7}
            >
              <Text style={styles.actionIcon}>🍳</Text>
              <Text style={styles.actionTitle}>自炊を記録</Text>
              <Text style={styles.actionSub}>
                {allMealsComplete ? '全食完了！' : todayMeals.length > 0 ? `${todayMeals.length}/3食 記録済み` : '未記録'}
              </Text>
              <View style={styles.pointBadge}>
                <Text style={styles.pointBadgeText}>+{COOKING_RECORD_POINTS}pt</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, styles.flex1, styles.missionCard]}
              onPress={() => router.push('/(tabs)/missions')}
            >
              <Text style={styles.actionIcon}>🚩</Text>
              <Text style={styles.actionTitle}>今日のミッション</Text>
              <Text style={styles.missionProgress}>
                {completedDaily}/{totalDaily} 完了
              </Text>
              {claimablePoints > 0 && (
                <View style={[styles.pointBadge, styles.pointBadgeOrange]}>
                  <Text style={styles.pointBadgeText}>+{claimablePoints}pt</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ガチャティザー */}
        <View style={styles.card}>
          <View style={styles.gachaRow}>
            <Text style={styles.gachaIcon}>🎰</Text>
            <View style={styles.flex1}>
              <Text style={styles.gachaTitle}>ガチャまであと {gachaPointsNeeded}pt</Text>
              <View style={styles.gachaBarBg}>
                <View style={[styles.gachaBarFill, { width: `${gachaProgress * 100}%` }]} />
              </View>
              <Text style={styles.gachaSub}>{userData.points % 100} / 100 pt</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.gachaBtn}
            onPress={() => router.push('/(tabs)/collection')}
          >
            <Text style={styles.gachaBtnText}>報酬をチェック →</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <InputModal
        key={selectedCategory ?? 'none'}
        visible={showInputModal}
        initialCategory={selectedCategory}
        onClose={() => { setShowInputModal(false); setSelectedCategory(null); }}
      />
      <CookingModal
        visible={showCookingModal}
        onClose={() => setShowCookingModal(false)}
        todayMeals={todayMeals}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 12,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    gap: 10,
  },
  cardIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardIcon: {
    fontSize: 16,
  },
  cardLabel: {
    fontSize: 12,
    color: '#757575',
    fontWeight: '500',
  },
  todayAmount: {
    fontSize: 26,
    fontWeight: '800',
    color: '#212121',
  },
  subLabel: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  circlePercent: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212121',
  },
  budgetAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212121',
  },
  budgetGoal: {
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: -6,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  levelValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2E7D32',
    marginTop: 2,
  },
  levelMeta: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 2,
  },
  levelNext: {
    fontSize: 13,
    fontWeight: '700',
    color: '#212121',
    textAlign: 'right',
  },
  levelTotal: {
    fontSize: 11,
    color: '#757575',
    textAlign: 'right',
  },
  levelBarBg: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  levelBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212121',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryBtn: {
    flexBasis: '30%',
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    gap: 4,
  },
  categoryIcon: {
    fontSize: 22,
  },
  categoryLabel: {
    fontSize: 11,
    color: '#424242',
    fontWeight: '500',
  },
  streakBadge: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
  },
  actionCard: {
    backgroundColor: '#F9FBF9',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#E8F5E9',
    position: 'relative',
  },
  missionCard: {
    backgroundColor: '#F3F8FF',
    borderColor: '#BBDEFB',
  },
  actionCardDone: {
    opacity: 0.55,
  },
  actionIcon: {
    fontSize: 28,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212121',
    textAlign: 'center',
  },
  actionSub: {
    fontSize: 11,
    color: '#9E9E9E',
  },
  missionProgress: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2196F3',
  },
  pointBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 2,
  },
  pointBadgeOrange: {
    backgroundColor: '#FF9800',
  },
  pointBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  gachaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  gachaIcon: {
    fontSize: 36,
  },
  gachaTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 6,
  },
  gachaBarBg: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  gachaBarFill: {
    height: '100%',
    backgroundColor: '#FF9800',
    borderRadius: 4,
  },
  gachaSub: {
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: 4,
  },
  gachaBtn: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  gachaBtnText: {
    color: '#E65100',
    fontSize: 14,
    fontWeight: '700',
  },
  budgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  budgetLeft: {
    alignItems: 'center',
    gap: 4,
  },
  budgetRight: {
    flex: 1,
    gap: 6,
    justifyContent: 'center',
  },
  allowanceLabel: {
    fontSize: 11,
    color: '#757575',
    fontWeight: '500',
  },
  allowanceBarBg: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  allowanceBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  allowanceText: {
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: -4,
  },
});
