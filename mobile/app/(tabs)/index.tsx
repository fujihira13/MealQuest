import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { formatCurrency } from '@/utils/formatHelpers';
import { CircularProgress } from '@/components/CircularProgress';
import { InputModal } from '@/components/InputModal';
import { CookingModal } from '@/components/CookingModal';
import type { ExpenseCategory } from '@/types';

const HOME_CATEGORIES: { key: ExpenseCategory; icon: string; label: string }[] = [
  { key: 'スーパー', icon: '🛒', label: 'スーパー' },
  { key: '自販機', icon: '🥤', label: '自販機' },
  { key: 'コンビニ', icon: '🏪', label: 'コンビニ' },
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
  const currentMonth = today.slice(0, 7);

  const todayTotal = expenses
    .filter((e) => e.date === today)
    .reduce((sum, e) => sum + e.amount, 0);

  const remaining = goals.monthlyExpenseGoal - userData.monthlyExpense;
  const budgetPercent = Math.min((userData.monthlyExpense / goals.monthlyExpenseGoal) * 100, 100);

  const dailyList = Object.values(missions.daily);
  const completedDaily = dailyList.filter((m) => m.completed).length;
  const totalDaily = dailyList.length;
  const claimablePoints = dailyList
    .filter((m) => m.completed && !m.claimed)
    .reduce((sum, m) => sum + m.reward, 0);

  const allowancePercent = Math.min(
    (userData.allowanceUsed / goals.allowanceGoal) * 100,
    100
  );

  const gachaPointsNeeded = 100 - (userData.points % 100);
  const gachaProgress = (userData.points % 100) / 100;

  const todayCookingCount = cookingRecords.filter((r) => r.date === today).length;

  const handleCategoryPress = (cat: ExpenseCategory) => {
    setSelectedCategory(cat);
    setShowInputModal(true);
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        {/* 今日の食費 + 今月の予算 */}
        <View style={styles.row}>
          <View style={[styles.card, styles.flex1]}>
            <View style={styles.cardIconRow}>
              <Text style={styles.cardIcon}>🍽️</Text>
              <Text style={styles.cardLabel}>今日の食費</Text>
            </View>
            <Text style={styles.todayAmount}>{formatCurrency(todayTotal)}</Text>
            <Text style={styles.subLabel}>残り {formatCurrency(remaining)}</Text>
          </View>

          <View style={[styles.card, styles.flex1, styles.alignCenter]}>
            <Text style={styles.cardLabel}>今月の予算</Text>
            <CircularProgress
              percent={budgetPercent}
              size={72}
              strokeWidth={7}
              color={budgetPercent >= 90 ? '#F44336' : '#4CAF50'}
            >
              <Text style={styles.circlePercent}>{Math.round(budgetPercent)}%</Text>
            </CircularProgress>
            <Text style={styles.budgetAmount}>{formatCurrency(userData.monthlyExpense)}</Text>
            <Text style={styles.budgetGoal}>/ {formatCurrency(goals.monthlyExpenseGoal)}</Text>
            <View style={styles.allowanceDivider} />
            <Text style={styles.allowanceLabel}>お小遣い</Text>
            <View style={styles.allowanceBarBg}>
              <View
                style={[
                  styles.allowanceBarFill,
                  { width: `${allowancePercent}%`, backgroundColor: allowancePercent >= 90 ? '#F44336' : '#FF9800' },
                ]}
              />
            </View>
            <Text style={styles.allowanceText}>
              {formatCurrency(userData.allowanceUsed)} / {formatCurrency(goals.allowanceGoal)}
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
            <Text style={styles.streakBadge}>🔥 連続{streaks.noWasteStreak}日</Text>
          </View>
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.actionCard, styles.flex1]}
              onPress={() => setShowCookingModal(true)}
            >
              <Text style={styles.actionIcon}>🍳</Text>
              <Text style={styles.actionTitle}>自炊を記録</Text>
              <Text style={styles.actionSub}>
                {todayCookingCount > 0 ? `今日 ${todayCookingCount}回済み` : '未記録'}
              </Text>
              <View style={styles.pointBadge}>
                <Text style={styles.pointBadgeText}>+30pt</Text>
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
            <Text style={styles.gachaBtnText}>報酬をチェック　→</Text>
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
  alignCenter: {
    alignItems: 'center',
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
  allowanceDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    alignSelf: 'stretch',
    marginVertical: 2,
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
